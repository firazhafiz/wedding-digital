"use client";

import { useEffect, useRef, useState } from "react";
import { useGsapReveal } from "@/hooks/useGsap";
import type { Guest } from "@/types";
import QRCode from "qrcode";

interface QrSectionProps {
  guest: Guest;
}

export default function QrSection({ guest }: QrSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrReady, setQrReady] = useState(false);
  const sectionRef = useGsapReveal<HTMLElement>({ type: "scale" });

  useEffect(() => {
    if (!canvasRef.current || !guest.qr_token) return;

    QRCode.toCanvas(
      canvasRef.current,
      guest.qr_token,
      {
        width: 200,
        margin: 2,
        color: {
          dark: "#1A1A1A",
          light: "#FAF9F6",
        },
      },
      (err) => {
        if (!err) setQrReady(true);
      },
    );
  }, [guest.qr_token]);

  return (
    <section ref={sectionRef} className="py-20 lg:py-32 px-6 bg-off-white">
      <div className="max-w-md mx-auto text-center">
        {/* Title */}
        <p className="font-body text-charcoal-light text-xs tracking-[0.3em] uppercase mb-3">
          Check-In Code
        </p>
        <h2 className="font-display text-3xl md:text-4xl text-charcoal-dark mb-3">
          QR Code Anda
        </h2>
        <p className="font-body text-charcoal-light text-sm mb-8 leading-relaxed">
          Tunjukkan QR code ini di lokasi acara untuk check-in
        </p>

        {/* QR Code */}
        <div className="gold-gradient-border rounded-sm p-8 bg-white/60 backdrop-blur-sm inline-block">
          <div className="bg-off-white p-4 rounded-sm">
            <canvas
              ref={canvasRef}
              className={`mx-auto transition-opacity duration-500 ${
                qrReady ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>

          <p className="font-body text-sm text-charcoal-dark mt-4 font-medium">
            {guest.name}
          </p>
          <p className="font-body text-[10px] text-charcoal-light/50 mt-1 font-mono">
            {guest.qr_token}
          </p>
        </div>
      </div>
    </section>
  );
}
