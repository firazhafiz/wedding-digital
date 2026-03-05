"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useGsapReveal } from "@/hooks/useGsap";
import NextImage from "next/image";
import { copyToClipboard } from "@/lib/utils";
import type { Guest, EventInfo } from "@/types";
import Button from "@/components/ui/Button";

interface GiftSectionProps {
  guest: Guest;
  eventInfo: EventInfo | null;
}

export default function GiftSection({ guest, eventInfo }: GiftSectionProps) {
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [senderName, setSenderName] = useState(guest.name);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const sectionRef = useGsapReveal<HTMLElement>({ type: "fade-up" });

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success(`${label} berhasil disalin`);
    } else {
      toast.error("Gagal menyalin");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      // Upload proof if exists
      let proofUrl: string | undefined;
      if (proofFile) {
        const formData = new FormData();
        formData.append("file", proofFile);
        formData.append("bucket", "gifts");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
          proofUrl = uploadData.data?.url;
        }
      }

      const res = await fetch("/api/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventInfo?.id,
          guestId: guest.id,
          senderName,
          bankName: eventInfo?.bank_name,
          amount: amount ? Number(amount) : undefined,
          notes: notes || undefined,
          proofUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal mengirim konfirmasi");
        return;
      }

      setSubmitted(true);
      toast.success("Konfirmasi hadiah terkirim!");
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const bankName = eventInfo?.bank_name || "—";
  const accountNumber = eventInfo?.bank_account_number || "—";
  const accountHolder = eventInfo?.bank_account_holder || "—";

  return (
    <section ref={sectionRef} className="py-20 lg:py-32 px-6 bg-cream">
      <div className="max-w-3xl mx-auto">
        {/* Title */}
        <div className="text-center mb-12">
          <p className="font-body text-charcoal-light text-xs tracking-[0.3em] uppercase mb-3">
            Wedding Gift
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-charcoal-dark mb-3">
            Hadiah & Angpao
          </h2>
          <p className="font-body text-charcoal-light text-sm max-w-md mx-auto leading-relaxed">
            Tanpa mengurangi rasa hormat, bagi Anda yang ingin memberikan tanda
            kasih
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bank Transfer */}
          <div className="gold-gradient-border rounded-sm p-6 md:p-8 bg-white/60 backdrop-blur-sm text-center">
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full border border-gold/20">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-gold"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </div>

            <p className="font-body text-xs tracking-[0.2em] uppercase text-charcoal-light mb-4">
              Transfer Bank
            </p>

            <div className="space-y-6">
              {eventInfo?.bank_accounts &&
              eventInfo.bank_accounts.length > 0 ? (
                eventInfo.bank_accounts.map((acc: any, i: number) => (
                  <div
                    key={i}
                    className="space-y-3 pb-4 border-b border-gold/5 last:border-0 last:pb-0"
                  >
                    <p className="font-body text-xs text-gold uppercase tracking-tighter">
                      {acc.bank}
                    </p>
                    <p className="font-body text-xl font-semibold text-charcoal-dark tracking-wider">
                      {acc.account}
                    </p>
                    <p className="font-body text-xs text-charcoal/60">
                      a.n. {acc.holder}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(acc.account, "Nomor rekening")}
                      className="text-[10px] h-8 px-3"
                    >
                      Salin Rekening
                    </Button>
                  </div>
                ))
              ) : (
                <div className="space-y-3">
                  <p className="font-body text-sm text-charcoal-light">
                    {bankName}
                  </p>
                  <p className="font-body text-xl font-semibold text-charcoal-dark tracking-wider">
                    {accountNumber}
                  </p>
                  <p className="font-body text-sm text-charcoal">
                    a.n. {accountHolder}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(accountNumber, "Nomor rekening")}
                    className="tracking-widest"
                  >
                    Salin Rekening
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* QRIS */}
          {eventInfo?.qris_image_url && (
            <div className="gold-gradient-border rounded-sm p-6 md:p-8 bg-white/60 backdrop-blur-sm text-center">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full border border-gold/20">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-gold"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="3" height="3" />
                  <rect x="18" y="18" width="3" height="3" />
                </svg>
              </div>

              <p className="font-body text-xs tracking-[0.2em] uppercase text-charcoal-light mb-4">
                QRIS
              </p>

              <div className="bg-white p-4 rounded-sm inline-block mb-4">
                <NextImage
                  src={eventInfo.qris_image_url}
                  alt="QRIS Payment"
                  width={200}
                  height={200}
                  className="w-48 h-48 object-contain mx-auto"
                />
              </div>

              <p className="font-body text-xs text-charcoal-light">
                Scan QR di atas menggunakan aplikasi e-wallet
              </p>
            </div>
          )}
        </div>

        {/* Confirmation form */}
        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="mt-8 gold-gradient-border rounded-sm p-6 md:p-8 bg-white/60 backdrop-blur-sm"
          >
            <p className="font-body text-xs tracking-[0.2em] uppercase text-charcoal-light mb-6 text-center">
              Konfirmasi Pengiriman (Opsional)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-body text-xs text-charcoal-light mb-1.5">
                  Nama Pengirim
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-gold/20 rounded-sm text-sm font-body focus:outline-none focus:border-gold/40 transition-colors"
                />
              </div>
              <div>
                <label className="block font-body text-xs text-charcoal-light mb-1.5">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Opsional"
                  className="w-full px-3 py-2 bg-transparent border border-gold/20 rounded-sm text-sm font-body focus:outline-none focus:border-gold/40 transition-colors"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block font-body text-xs text-charcoal-light mb-1.5">
                Upload Bukti Transfer
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                className="w-full text-sm font-body text-charcoal-light file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border file:border-gold/20 file:text-xs file:font-body file:bg-transparent file:text-charcoal hover:file:border-gold/40 file:transition-colors file:cursor-pointer"
              />
            </div>

            <div className="mb-6">
              <label className="block font-body text-xs text-charcoal-light mb-1.5">
                Catatan
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan opsional"
                className="w-full px-3 py-2 bg-transparent border border-gold/20 rounded-sm text-sm font-body focus:outline-none focus:border-gold/40 transition-colors"
              />
            </div>

            <Button
              type="submit"
              variant="outline"
              size="md"
              loading={loading}
              className="w-full"
            >
              Konfirmasi Hadiah
            </Button>
          </form>
        ) : (
          <div className="mt-8 text-center gold-gradient-border rounded-sm p-8 bg-white/60 backdrop-blur-sm">
            <p className="font-display text-lg text-charcoal-dark mb-2">
              Terima Kasih
            </p>
            <p className="font-body text-sm text-charcoal-light">
              Konfirmasi hadiah Anda telah diterima.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
