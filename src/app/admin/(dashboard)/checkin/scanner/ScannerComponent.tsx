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

  const eventId = getActiveEventId();

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
          toast.success(`Check-in Berhasil: ${result.data?.guest_name}`, {
            duration: 3000,
          });
          // Play success beep using standard web audio
          playBeep(800, 200);
        } else if (result.status === "already_checked_in") {
          toast.warning(
            `Sudah Check-in: ${result.data?.guest_name} (pada ${new Date(result.data?.checked_in_at).toLocaleTimeString()})`,
            { duration: 4000 },
          );
          playBeep(400, 400); // lower tone for warning
        }
      } catch (err: any) {
        toast.error(err.message || "QR Code tidak valid", { duration: 3000 });
        playBeep(200, 300); // error beep
      } finally {
        // Resume scanning after 2 seconds
        setTimeout(() => {
          setLastScanned(null);
          setProcessing(false);
          setIsScanning(true);
          if (scannerRef.current) {
            scannerRef.current.resume();
          }
        }, 2000);
      }
    },
    [processing, lastScanned, eventId],
  );

  const handleScanError = (errorMessage: string) => {
    // html5-qrcode triggers error frequently when no code is visible. We ignore it.
  };

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

    html5QrcodeScanner.render(handleScanSuccess, handleScanError);

    return () => {
      html5QrcodeScanner.clear().catch(console.error);
    };
  }, [handleScanSuccess, eventId, router]);

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
        {processing && (
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
    </div>
  );
}
