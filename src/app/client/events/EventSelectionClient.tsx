"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import NextImage from "next/image";

interface EventItem {
  id: string;
  event_slug: string;
  bride_name: string;
  groom_name: string;
  akad_date: string | null;
  hero_photo_url: string | null;
}

export default function EventSelectionClient({
  events,
}: {
  events: EventItem[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSelectEvent = async (eventId: string) => {
    setLoadingId(eventId);
    try {
      const res = await fetch("/api/client/select-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });

      if (!res.ok) {
        throw new Error("Gagal memilih event");
      }

      router.push("/client/guests");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
      setLoadingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((ev) => (
        <div
          key={ev.id}
          onClick={() => handleSelectEvent(ev.id)}
          className={`group relative flex flex-col bg-charcoal border border-white/10 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-500/40 ${
            loadingId === ev.id ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          {/* Card Image */}
          <div className="w-full h-48 relative bg-charcoal-dark overflow-hidden">
            {ev.hero_photo_url ? (
              <NextImage
                src={ev.hero_photo_url}
                alt={`${ev.bride_name} & ${ev.groom_name}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-charcoal font-display text-2xl text-white/20">
                {ev.bride_name[0]}&{ev.groom_name[0]}
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-charcoal to-transparent" />
          </div>

          <div className="p-6 relative z-10 flex flex-col flex-1 -mt-8">
            <h3 className="font-display text-2xl text-off-white mb-1 shadow-black/50 drop-shadow-md">
              {ev.bride_name} & {ev.groom_name}
            </h3>
            <p className="font-body text-xs text-blue-300 font-medium tracking-wide uppercase mb-4">
              /{ev.event_slug}
            </p>

            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-white/5 font-body text-xs text-white/50">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {ev.akad_date
                ? new Date(ev.akad_date).toLocaleDateString("id-ID", {
                    dateStyle: "long",
                  })
                : "Tanggal Belum Diatur"}
            </div>

            {/* Loading Indicator */}
            {loadingId === ev.id && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-charcoal-dark/60 backdrop-blur-sm">
                <div className="w-8 h-8 border-2 border-t-blue-500 border-white/20 rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
