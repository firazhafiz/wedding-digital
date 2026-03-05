"use client";

import { useCountdown } from "@/hooks/useCountdown";
import { useGsapReveal } from "@/hooks/useGsap";
import { formatDate, formatTime, getMapsUrl } from "@/lib/utils";
import type { EventInfo } from "@/types";
import Button from "@/components/ui/Button";

interface CountdownSectionProps {
  eventInfo: EventInfo | null;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 md:w-22 md:h-22 flex items-center justify-center border border-gold/20 bg-white/50 backdrop-blur-sm rounded-sm">
        <span className="font-display text-2xl md:text-4xl text-charcoal-dark">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="mt-2 font-body text-[10px] md:text-xs text-charcoal-light tracking-[0.25em] uppercase">
        {label}
      </span>
    </div>
  );
}

export default function CountdownSection({ eventInfo }: CountdownSectionProps) {
  const targetDate = eventInfo?.akad_date || "2025-06-15T08:00:00+07:00";
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);
  const sectionRef = useGsapReveal<HTMLElement>({ type: "fade-up" });
  const scheduleRef = useGsapReveal<HTMLDivElement>({
    type: "fade-up",
    delay: 0.3,
  });

  const akadDate = eventInfo?.akad_date ? formatDate(eventInfo.akad_date) : "—";
  const akadTime = eventInfo?.akad_date ? formatTime(eventInfo.akad_date) : "—";
  const resepsiDate = eventInfo?.resepsi_date
    ? formatDate(eventInfo.resepsi_date)
    : "—";
  const resepsiTime = eventInfo?.resepsi_date
    ? formatTime(eventInfo.resepsi_date)
    : "—";

  const handleOpenMaps = (mapsUrl: string | null) => {
    if (!mapsUrl) return;
    const url = getMapsUrl(mapsUrl);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section ref={sectionRef} className="py-16 lg:py-24 px-6 bg-off-white">
      <div className="max-w-4xl mx-auto text-center">
        {/* Section title */}
        <p className="font-body text-charcoal-light text-xs tracking-[0.3em] uppercase mb-3">
          Save The Date
        </p>
        <h2 className="font-display text-3xl md:text-5xl text-charcoal-dark mb-12">
          Menghitung Hari
        </h2>

        {/* Countdown */}
        {!isExpired ? (
          <div className="flex items-center justify-center gap-3 md:gap-6 mb-16">
            <CountdownUnit value={days} label="Hari" />
            <span className="font-display text-gold text-3xl md:text-4xl mb-6">
              :
            </span>
            <CountdownUnit value={hours} label="Jam" />
            <span className="font-display text-gold text-3xl md:text-4xl mb-6">
              :
            </span>
            <CountdownUnit value={minutes} label="Menit" />
            <span className="font-display text-gold text-3xl md:text-4xl mb-6">
              :
            </span>
            <CountdownUnit value={seconds} label="Detik" />
          </div>
        ) : (
          <div className="mb-16">
            <p className="font-script text-gold text-4xl md:text-5xl">
              Hari Bahagia Telah Tiba
            </p>
          </div>
        )}

        {/* Schedule Cards */}
        <div
          ref={scheduleRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 max-w-3xl mx-auto"
        >
          {/* Akad */}
          <div className="flex flex-col items-center text-center p-4 md:p-10 md:gold-gradient-border md:rounded-sm md:bg-white/60 md:backdrop-blur-sm md:shadow-xs relative">
            <p className="font-body text-xs tracking-[0.25em] uppercase text-charcoal-light mb-3">
              Akad Nikah
            </p>
            <div className="w-12 h-px bg-gold/40 mx-auto mb-6" />
            <p className="font-display text-xl md:text-2xl text-charcoal-dark mb-2">
              {akadDate}
            </p>
            <p className="font-body text-charcoal text-sm mb-6">{akadTime}</p>
            <p className="font-body text-charcoal-light text-sm leading-relaxed mb-6">
              {eventInfo?.akad_location || "Lokasi Akad"}
            </p>
            {eventInfo?.akad_maps_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenMaps(eventInfo.akad_maps_url)}
                className="mt-auto tracking-widest text-[10px] md:text-xs"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="mr-2"
                >
                  <path d="M3 11l19-9-9 19-2-8-8-2z" />
                </svg>
                Petunjuk Lokasi
              </Button>
            )}

            {/* Mobile Divider */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-24 h-px bg-gold/20 md:hidden" />
          </div>

          {/* Resepsi */}
          <div className="flex flex-col items-center text-center p-4 md:p-10 md:gold-gradient-border md:rounded-sm md:bg-white/60 md:backdrop-blur-sm md:shadow-xs">
            <p className="font-body text-xs tracking-[0.25em] uppercase text-charcoal-light mb-3">
              Resepsi
            </p>
            <div className="w-12 h-px bg-gold/40 mx-auto mb-6" />
            <p className="font-display text-xl md:text-2xl text-charcoal-dark mb-2">
              {resepsiDate}
            </p>
            <p className="font-body text-charcoal text-sm mb-6">
              {resepsiTime}
            </p>
            <p className="font-body text-charcoal-light text-sm leading-relaxed mb-6">
              {eventInfo?.resepsi_location || "Lokasi Resepsi"}
            </p>
            {eventInfo?.resepsi_maps_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenMaps(eventInfo.resepsi_maps_url)}
                className="mt-auto tracking-widest text-[10px] md:text-xs"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="mr-2"
                >
                  <path d="M3 11l19-9-9 19-2-8-8-2z" />
                </svg>
                Petunjuk Lokasi
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
