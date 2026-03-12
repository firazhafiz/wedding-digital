"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Html5QrcodeScanner,
  Html5QrcodeScanType,
  Html5Qrcode,
} from "html5-qrcode";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getActiveEventId } from "@/lib/admin/context";

export default function ScannerComponent() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(true);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [overrideData, setOverrideData] = useState<{
    qr_token: string;
    guest_name: string;
    checked_in_count: number;
    total_pax: number;
  } | null>(null);

  const eventId = getActiveEventId();

  const handleOverride = async () => {
    if (!overrideData || !eventId) return;
    setProcessing(true);
    try {
      const response = await fetch("/api/admin/checkin/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qr_token: overrideData.qr_token,
          event_id: eventId,
          override: true,
        }),
      });
      const result = await response.json();
      if (result.status === "override_success") {
        toast.success(
          `Override berhasil: ${result.data?.guest_name} (${result.data?.checked_in_count}/${result.data?.total_pax})`,
          { duration: 3000 },
        );
        playBeep(600, 300);
      }
    } catch {
      toast.error("Gagal melakukan override");
    } finally {
      setOverrideData(null);
      setProcessing(false);
      setLastScanned(null);
      setIsScanning(true);
      if (scannerRef.current) {
        scannerRef.current.resume();
      }
    }
  };

  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      // Prevent double scanning the same QR too quickly
      if (processing || decodedText === lastScanned) return;

      setProcessing(true);
      setLastScanned(decodedText);
      setIsScanning(false);

      // Stop scanner temporarily
      if (scannerRef.current) {
        scannerRef.current.pause(true);
      }

      try {
        const response = await fetch("/api/admin/checkin/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            qr_token: decodedText,
            event_id: eventId,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Gagal memproses QR code");
        }

        if (result.status === "success") {
          toast.success(
            `Check-in Lengkap: ${result.data?.guest_name} (${result.data?.checked_in_count}/${result.data?.total_pax} pax)`,
            { duration: 3000 },
          );
          playBeep(800, 200);
        } else if (result.status === "partial_checkin") {
          toast.info(
            `Scan ${result.data?.checked_in_count}/${result.data?.total_pax}: ${result.data?.guest_name} — masih tersisa ${result.data?.total_pax - result.data?.checked_in_count} pax`,
            { duration: 3000 },
          );
          playBeep(600, 150);
        } else if (result.status === "already_checked_in") {
          toast.warning(
            `Sudah penuh: ${result.data?.guest_name} (${result.data?.checked_in_count}/${result.data?.total_pax} pax)`,
            { duration: 5000 },
          );
          playBeep(400, 400);
          // Show override option
          setOverrideData({
            qr_token: decodedText,
            guest_name: result.data?.guest_name,
            checked_in_count: result.data?.checked_in_count,
            total_pax: result.data?.total_pax,
          });
          return; // Don't auto-resume, wait for override decision
        }
      } catch (err: any) {
        toast.error(err.message || "QR Code tidak valid", { duration: 3000 });
        playBeep(200, 300); // error beep
      } finally {
        // Resume scanning after 2 seconds (unless override dialog shown)
        if (!overrideData) {
          setTimeout(() => {
            setLastScanned(null);
            setProcessing(false);
            setIsScanning(true);
            if (scannerRef.current) {
              scannerRef.current.resume();
            }
          }, 2000);
        }
      }
    },
    [processing, lastScanned, eventId],
  );

  const handleScanError = (errorMessage: string) => {
    // html5-qrcode triggers error frequently when no code is visible. We ignore it.
  };

  // Stable references for handlers to avoid re-initializing scanner
  const onScanSuccessRef = useRef(handleScanSuccess);
  onScanSuccessRef.current = handleScanSuccess;
  const onScanErrorRef = useRef(handleScanError);
  onScanErrorRef.current = handleScanError;

  useEffect(() => {
    if (!eventId) {
      toast.error("Tidak ada event aktif");
      router.push("/admin/events");
      return;
    }

    const scannerId = "qr-reader";

    // Initialize html5-qrcode scanner
    const html5QrcodeScanner = new Html5QrcodeScanner(
      scannerId,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: true,
      },
      /* verbose= */ false,
    );

    scannerRef.current = html5QrcodeScanner;

    // Use stable wrappers that call the latest ref
    html5QrcodeScanner.render(
      (text) => onScanSuccessRef.current(text),
      (err) => onScanErrorRef.current(err),
    );

    return () => {
      html5QrcodeScanner.clear().catch(console.error);
    };
  }, [eventId, router]); // handleScanSuccess is no longer a dependency

  // Simple web audio beep synthesis
  const playBeep = (frequency: number, duration: number) => {
    try {
      const audioCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioCtx.currentTime + duration / 1000,
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      setTimeout(() => oscillator.stop(), duration);
    } catch (e) {
      console.warn("Audio Context failed", e);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative rounded-lg overflow-hidden bg-black shadow-2xl">
      <div id="qr-reader" className="w-full border-none"></div>

      {/* Overlay status */}
      <div
        className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-300 ${isScanning ? "opacity-0" : "opacity-100 bg-black/60"} flex items-center justify-center`}
      >
        {processing && !overrideData && (
          <div className="bg-white px-6 py-3 rounded-full font-body text-sm font-medium text-charcoal shadow-lg flex items-center gap-3">
            <svg
              className="animate-spin h-5 w-5 text-gold"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Memproses...
          </div>
        )}
      </div>

      {/* Override Dialog */}
      {overrideData && (
        <div className="absolute inset-0 z-20 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-amber-100">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3 className="font-body font-semibold text-charcoal-dark text-base mb-1">
              Undangan Sudah Penuh
            </h3>
            <p className="font-body text-sm text-charcoal-light mb-1">
              <span className="font-semibold">{overrideData.guest_name}</span>
            </p>
            <p className="font-body text-xs text-charcoal-light mb-4">
              Undangan untuk {overrideData.total_pax} orang, sudah {overrideData.checked_in_count}× scan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setOverrideData(null);
                  setProcessing(false);
                  setLastScanned(null);
                  setIsScanning(true);
                  if (scannerRef.current) scannerRef.current.resume();
                }}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg font-body text-sm text-charcoal-light hover:bg-gray-50 transition-colors"
              >
                Lewati
              </button>
              <button
                onClick={handleOverride}
                className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-body text-sm font-semibold transition-colors"
              >
                Izinkan Masuk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
