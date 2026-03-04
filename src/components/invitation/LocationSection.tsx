"use client";

import { useGsapReveal } from "@/hooks/useGsap";
import { getMapsUrl } from "@/lib/utils";
import type { EventInfo } from "@/types";
import Button from "@/components/ui/Button";

interface LocationSectionProps {
  eventInfo: EventInfo | null;
}

function LocationCard({
  label,
  location,
  mapsUrl,
  delay,
}: {
  label: string;
  location: string | null;
  mapsUrl: string | null;
  delay: number;
}) {
  const ref = useGsapReveal<HTMLDivElement>({ type: "fade-up", delay });

  const handleOpenMaps = () => {
    if (!mapsUrl) return;
    const url = getMapsUrl(mapsUrl);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      ref={ref}
      className="gold-gradient-border rounded-sm p-8 md:p-10 text-center bg-white/60 backdrop-blur-sm"
    >
      {/* Icon */}
      <div className="w-14 h-14 mx-auto mb-6 flex items-center justify-center rounded-full border border-gold/20">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-gold"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      </div>

      {/* Label */}
      <p className="font-body text-xs tracking-[0.25em] uppercase text-charcoal-light mb-3">
        {label}
      </p>

      <div className="w-12 h-px bg-gold/30 mx-auto mb-4" />

      {/* Address */}
      <p className="font-body text-charcoal text-sm md:text-base leading-relaxed mb-6 max-w-sm mx-auto">
        {location || "Lokasi akan diinformasikan"}
      </p>

      {/* Maps CTA */}
      {mapsUrl && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenMaps}
          className="tracking-widest"
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
  );
}

export default function LocationSection({ eventInfo }: LocationSectionProps) {
  const titleRef = useGsapReveal<HTMLDivElement>({ type: "fade-up" });

  return (
    <section className="py-20 lg:py-32 px-6 bg-cream">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <div ref={titleRef} className="text-center mb-12 lg:mb-16">
          <p className="font-body text-charcoal-light text-xs tracking-[0.3em] uppercase mb-3">
            Wedding Venue
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-charcoal-dark">
            Lokasi Acara
          </h2>
        </div>

        {/* Location Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <LocationCard
            label="Akad Nikah"
            location={eventInfo?.akad_location || null}
            mapsUrl={eventInfo?.akad_maps_url || null}
            delay={0}
          />
          <LocationCard
            label="Resepsi"
            location={eventInfo?.resepsi_location || null}
            mapsUrl={eventInfo?.resepsi_maps_url || null}
            delay={0.2}
          />
        </div>
      </div>
    </section>
  );
}
