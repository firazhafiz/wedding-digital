"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeScanType } from "html5-qrcode";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getActiveEventId } from "@/lib/admin/context";

export default function ScannerComponent() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const qrCodeInstanceRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);
  const lastScannedRef = useRef<{ token: string; time: number } | null>(null);
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
    isProcessingRef.current = true;
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
      isProcessingRef.current = false;
      setIsScanning(true);
    }
  };

  const playBeep = (frequency: number, duration: number) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration / 1000);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      setTimeout(() => oscillator.stop(), duration);
    } catch (e) {
      console.warn("Audio Context failed", e);
    }
  };

  const handleScanSuccess = useCallback(async (decodedText: string) => {
    const now = Date.now();
    // Synchronous lock using Refs to prevent race conditions (multi-scan bug)
    if (isProcessingRef.current || overrideData) return;
    
    // Triple-check: prevent scanning the same token within 3 seconds
    if (lastScannedRef.current && 
        lastScannedRef.current.token === decodedText && 
        now - lastScannedRef.current.time < 3000) {
      return;
    }

    isProcessingRef.current = true;
    lastScannedRef.current = { token: decodedText, time: now };
    
    setProcessing(true);
    setIsScanning(false);

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
          `Scan ${result.data?.checked_in_count}/${result.data?.total_pax}: ${result.data?.guest_name}`,
          { duration: 3000 },
        );
        playBeep(600, 150);
      } else if (result.status === "already_checked_in") {
        toast.warning(
          `Sudah penuh: ${result.data?.guest_name}`,
          { duration: 5000 },
        );
        playBeep(400, 400);
        setOverrideData({
          qr_token: decodedText,
          guest_name: result.data?.guest_name,
          checked_in_count: result.data?.checked_in_count,
          total_pax: result.data?.total_pax,
        });
        return; 
      }
    } catch (err: any) {
      toast.error(err.message || "QR Code tidak valid", { duration: 3000 });
      playBeep(200, 300);
    } finally {
      // Keep isProcessingRef true until the timeout to ensure no double scans
      if (!overrideData) {
        setTimeout(() => {
          setProcessing(false);
          isProcessingRef.current = false;
          setIsScanning(true);
        }, 2500);
      }
    }
  }, [overrideData, eventId]);

  useEffect(() => {
    if (!eventId) {
      toast.error("Tidak ada event aktif");
      router.push("/admin/events");
      return;
    }

    const scannerId = "qr-reader";
    const html5QrCode = new Html5Qrcode(scannerId);
    qrCodeInstanceRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          handleScanSuccess,
          () => {} // Ignored error
        );
        setIsScanning(true);
      } catch (err) {
        console.error("Scanner start error:", err);
        toast.error("Gagal mengakses kamera");
      }
    };

    startScanner();

    return () => {
      if (qrCodeInstanceRef.current?.isScanning) {
        qrCodeInstanceRef.current.stop()
          .then(() => qrCodeInstanceRef.current?.clear())
          .catch(console.error);
      }
    };
  }, [eventId, router, handleScanSuccess]);

  return (
    <div className="w-full max-w-md mx-auto relative rounded-lg overflow-hidden bg-black shadow-2xl aspect-square">
      <div id="qr-reader" className="w-full h-full border-none [&_video]:object-cover"></div>

      {/* Overlay Status */}
      <div
        className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-300 ${isScanning ? "opacity-0" : processing && !overrideData ? "opacity-100 bg-black/40" : "opacity-0"} flex items-center justify-center`}
      >
        {processing && !overrideData && (
          <div className="bg-white px-6 py-3 rounded-full font-body text-sm font-medium text-charcoal shadow-lg flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
            Memproses...
          </div>
        )}
      </div>

      {/* Scan Frame (Visual Aid) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[250px] h-[250px] border-2 border-white/30 rounded-lg relative">
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-gold rounded-tl"></div>
          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-gold rounded-tr"></div>
          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-gold rounded-bl"></div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-gold rounded-br"></div>
          
          <div className="absolute inset-0 bg-gold/10 animate-pulse"></div>
        </div>
      </div>

      {/* Override Dialog */}
      {overrideData && (
        <div className="absolute inset-0 z-20 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-200">
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
            <p className="font-body text-sm text-charcoal-light mb-1 font-semibold">
              {overrideData.guest_name}
            </p>
            <p className="font-body text-xs text-charcoal-light mb-4">
              {overrideData.total_pax} orang, sudah {overrideData.checked_in_count}× scan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setOverrideData(null);
                  setProcessing(false);
                  setIsScanning(true);
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
