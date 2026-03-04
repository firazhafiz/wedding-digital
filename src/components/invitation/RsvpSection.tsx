"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useGsapReveal } from "@/hooks/useGsap";
import type { Guest } from "@/types";
import QRCode from "qrcode";
import Button from "@/components/ui/Button";

interface RsvpSectionProps {
  guest: Guest;
  onRsvpSuccess?: (status: "attending" | "not_attending") => void;
}

export default function RsvpSection({
  guest,
  onRsvpSuccess,
}: RsvpSectionProps) {
  const [status, setStatus] = useState<"attending" | "not_attending" | "">(
    guest.rsvp_status !== "pending" && guest.rsvp_status !== null
      ? (guest.rsvp_status as "attending" | "not_attending")
      : "",
  );
  const [pax, setPax] = useState(guest.rsvp_pax || 1);
  const [message, setMessage] = useState(guest.rsvp_message || "");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(guest.rsvp_status !== "pending");

  const sectionRef = useGsapReveal<HTMLElement>({ type: "fade-up" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) {
      toast.error("Silakan pilih status kehadiran");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId: guest.id,
          status,
          pax: status === "attending" ? pax : 0,
          message: message || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal mengirim RSVP");
        return;
      }

      setSubmitted(true);
      toast.success("RSVP berhasil dikirim!");
      if (onRsvpSuccess && status) {
        onRsvpSuccess(status as "attending" | "not_attending");
      }
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section ref={sectionRef} className="py-20 lg:py-32 px-6 bg-cream">
      <div className="max-w-xl mx-auto">
        {/* Title */}
        <div className="text-center mb-12">
          <p className="font-body text-charcoal-light text-xs tracking-[0.3em] uppercase mb-3">
            Konfirmasi Kehadiran
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-charcoal-dark mb-3">
            RSVP
          </h2>
          <p className="font-body text-charcoal-light text-sm">
            Mohon konfirmasi kehadiran Anda
          </p>
        </div>

        {submitted ? (
          /* Success state */
          <div className="text-center gold-gradient-border rounded-sm p-10 bg-white/60 backdrop-blur-sm">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full border border-gold/30">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-gold"
              >
                <path
                  d="M20 6L9 17L4 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="font-display text-xl text-charcoal-dark mb-2">
              Terima Kasih
            </p>
            <p className="font-body text-charcoal-light text-sm">
              {status === "attending"
                ? `RSVP Anda telah dikonfirmasi (${pax} orang)`
                : "Kami mengerti. Terima kasih atas konfirmasinya."}
            </p>

            {/* Injected QR Code for Attending Guests */}
            {status === "attending" && guest.qr_token && (
              <div className="mt-8 pt-8 border-t border-gold/20 flex flex-col items-center">
                <p className="font-body text-charcoal-light text-xs tracking-[0.2em] uppercase mb-4">
                  Check-In Code Anda
                </p>

                <InlineQrCode token={guest.qr_token} />

                <p className="text-[10px] text-charcoal-light/60 mt-3 font-mono">
                  {guest.qr_token}
                </p>
                <p className="font-body text-xs text-charcoal-light mt-1">
                  Tunjukkan QR ini di lokasi acara
                </p>
              </div>
            )}
          </div>
        ) : (
          /* RSVP Form */
          <form
            onSubmit={handleSubmit}
            className="gold-gradient-border rounded-sm p-8 md:p-10 bg-white/60 backdrop-blur-sm space-y-8"
          >
            {/* Guest name (read-only) */}
            <div>
              <label className="block font-body text-xs tracking-[0.2em] uppercase text-charcoal-light mb-2">
                Nama Tamu
              </label>
              <p className="font-body text-charcoal-dark font-medium">
                {guest.name}
              </p>
            </div>

            {/* Attendance status */}
            <div>
              <label className="block font-body text-xs tracking-[0.2em] uppercase text-charcoal-light mb-4">
                Apakah Anda akan hadir?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus("attending")}
                  className={`py-3 px-4 rounded-sm border text-sm font-body transition-all duration-300 ${
                    status === "attending"
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-charcoal/10 text-charcoal-light hover:border-gold/30"
                  }`}
                >
                  Ya, Saya Hadir
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("not_attending")}
                  className={`py-3 px-4 rounded-sm border text-sm font-body transition-all duration-300 ${
                    status === "not_attending"
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-charcoal/10 text-charcoal-light hover:border-gold/30"
                  }`}
                >
                  Maaf, Tidak Hadir
                </button>
              </div>
            </div>

            {/* Jumlah tamu */}
            {status === "attending" && (
              <div>
                <label className="block font-body text-xs tracking-[0.2em] uppercase text-charcoal-light mb-2">
                  Jumlah Tamu ({guest.max_pax} maks.)
                </label>
                <select
                  value={pax}
                  onChange={(e) => setPax(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-transparent border border-gold/30 rounded-sm text-charcoal font-body focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-300"
                >
                  {Array.from({ length: guest.max_pax }, (_, i) => i + 1).map(
                    (n) => (
                      <option key={n} value={n}>
                        {n} Orang
                      </option>
                    ),
                  )}
                </select>
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block font-body text-xs tracking-[0.2em] uppercase text-charcoal-light mb-2">
                Pesan (opsional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Sampaikan pesan untuk mempelai..."
                className="w-full px-4 py-3 bg-transparent border border-gold/30 rounded-sm text-charcoal font-body placeholder:text-charcoal-light/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-300 resize-none"
              />
              <p className="text-right font-body text-xs text-charcoal-light/50 mt-1">
                {message.length}/500
              </p>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Kirim RSVP
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}

// ==========================================
// Helper Component: Inline QR Code Renderer
// ==========================================
function InlineQrCode({ token }: { token: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrReady, setQrReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !token) return;

    QRCode.toCanvas(
      canvasRef.current,
      token,
      {
        width: 180,
        margin: 2,
        color: {
          dark: "#1A1A1A",
          light: "#00000000",
        },
      },
      (err) => {
        if (!err) setQrReady(true);
      },
    );
  }, [token]);

  return (
    <canvas
      ref={canvasRef}
      className={`mx-auto transition-opacity duration-500 ${
        qrReady ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
