"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useGsapReveal } from "@/hooks/useGsap";
import { useRealtime } from "@/hooks/useRealtime";
import type { Guest, GuestbookEntry } from "@/types";
import Button from "@/components/ui/Button";

interface GuestbookSectionProps {
  guest: Guest;
  initialEntries: GuestbookEntry[];
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 30) return `${days} hari lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID");
}

export default function GuestbookSection({
  guest,
  initialEntries,
}: GuestbookSectionProps) {
  const [entries, setEntries] = useState<GuestbookEntry[]>(initialEntries);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sectionRef = useGsapReveal<HTMLElement>({ type: "fade-up" });

  // Realtime: listen for newly approved messages
  useRealtime<GuestbookEntry>({
    table: "guestbook",
    event: "UPDATE",
    filter: "status=eq.approved",
    onData: useCallback(
      ({
        new: newEntry,
      }: {
        new: GuestbookEntry;
        old: Partial<GuestbookEntry>;
        eventType: string;
      }) => {
        setEntries((prev) => {
          // Avoid duplicates
          if (prev.some((e) => e.id === newEntry.id)) return prev;
          return [newEntry, ...prev];
        });
      },
      [],
    ),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Ucapan tidak boleh kosong");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId: guest.id,
          guestName: guest.name,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal mengirim ucapan");
        return;
      }

      setMessage("");
      toast.success("Ucapan terkirim! Menunggu persetujuan.");
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section ref={sectionRef} className="py-20 lg:py-32 px-6 bg-off-white">
      <div className="max-w-3xl mx-auto">
        {/* Title */}
        <div className="text-center mb-12">
          <p className="font-body text-charcoal-light text-xs tracking-[0.3em] uppercase mb-3">
            Wishes & Prayers
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-charcoal-dark mb-3">
            Ucapan & Doa
          </h2>
          <p className="font-body text-charcoal-light text-sm">
            Kirimkan doa dan ucapan terbaik untuk kedua mempelai
          </p>
        </div>

        {/* Write form */}
        <form
          onSubmit={handleSubmit}
          className="gold-gradient-border rounded-sm p-6 md:p-8 bg-white/60 backdrop-blur-sm mb-10"
        >
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Tulis ucapan dan doa untuk mempelai..."
            className="w-full px-4 py-3 bg-transparent border border-gold/20 rounded-sm text-charcoal font-body placeholder:text-charcoal-light/40 focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20 transition-all duration-300 resize-none mb-4"
          />
          <div className="flex items-center justify-between">
            <p className="font-body text-xs text-charcoal-light/50">
              {message.length}/1000
            </p>
            <Button type="submit" variant="primary" size="sm" loading={loading}>
              Kirim Ucapan
            </Button>
          </div>
        </form>

        {/* Entries */}
        {entries.length > 0 && (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="p-5 border border-gold/10 rounded-sm bg-white/40"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {/* Avatar initial */}
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                      <span className="font-body text-xs font-semibold text-gold">
                        {entry.guest_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="font-body text-sm font-medium text-charcoal-dark">
                      {entry.guest_name}
                    </p>
                  </div>
                  <p className="font-body text-[10px] text-charcoal-light/50">
                    {formatTimeAgo(entry.created_at)}
                  </p>
                </div>
                <p className="font-body text-sm text-charcoal leading-relaxed pl-10">
                  {entry.message}
                </p>
              </div>
            ))}
          </div>
        )}

        {entries.length === 0 && (
          <div className="text-center py-10">
            <p className="font-body text-charcoal-light/50 text-sm">
              Belum ada ucapan. Jadilah yang pertama!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
