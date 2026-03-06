"use client";

import { useGsapReveal } from "@/hooks/useGsap";
import NextImage from "next/image";
import type { EventInfo } from "@/types";

interface CoupleSectionProps {
  eventInfo: EventInfo | null;
}

function CoupleCard({
  name,
  fatherName,
  motherName,
  instagram,
  photoUrl,
  direction,
}: {
  name: string;
  fatherName: string | null;
  motherName: string | null;
  instagram: string | null;
  photoUrl: string | null;
  direction: "left" | "right";
}) {
  const ref = useGsapReveal<HTMLDivElement>({
    type: direction === "left" ? "fade-left" : "fade-right",
  });

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      {/* Photo with ornamental frame */}
      <div className="relative mb-8">
        {/* Ornamental corner frames */}
        <div className="absolute -top-3 -left-3 w-8 h-8 border-t border-l border-gold/40" />
        <div className="absolute -top-3 -right-3 w-8 h-8 border-t border-r border-gold/40" />
        <div className="absolute -bottom-3 -left-3 w-8 h-8 border-b border-l border-gold/40" />
        <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b border-r border-gold/40" />

        {/* Photo */}
        <div className="w-54 h-70 md:w-56 md:h-72 lg:w-64 lg:h-80 overflow-hidden relative">
          {photoUrl ? (
            <NextImage
              src={photoUrl}
              alt={name}
              fill
              className="object-cover grayscale-20 hover:grayscale-0 transition-all duration-700"
              sizes="(max-width: 768px) 192px, (max-width: 1024px) 224px, 256px"
            />
          ) : (
            <div className="w-full h-full bg-cream flex items-center justify-center">
              <span className="font-script text-gold/40 text-6xl">
                {name.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Name */}
      <h3 className="font-display text-3xl md:text-4xl text-charcoal-dark mb-4">
        {name
          .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, "")
          .replace(/\s+/g, " ")
          .trim()}
      </h3>

      {/* Parents */}
      <div className="space-y-0.5 mb-4">
        {fatherName && (
          <p className="font-body text-sm text-charcoal-light">
            Putra/Putri dari Bapak {fatherName}
          </p>
        )}
        {motherName && (
          <p className="font-body text-sm text-charcoal-light">
            & Ibu {motherName}
          </p>
        )}
      </div>

      {/* Instagram */}
      {instagram && (
        <a
          href={`https://instagram.com/${instagram.replace("@", "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-body text-sm text-charcoal-light hover:text-gold transition-colors duration-300 group"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="group-hover:text-gold transition-colors"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="18" cy="6" r="1.5" fill="currentColor" stroke="none" />
          </svg>
          {instagram.startsWith("@") ? instagram : `@${instagram}`}
        </a>
      )}
    </div>
  );
}

export default function CoupleSection({ eventInfo }: CoupleSectionProps) {
  const titleRef = useGsapReveal<HTMLDivElement>({ type: "fade-up" });

  return (
    <section className="py-14 lg:py-20 px-6 bg-cream">
      <div className="max-w-5xl mx-auto">
        {/* Section Title */}
        <div ref={titleRef} className="text-center mb-16 lg:mb-20">
          <p className="font-body text-charcoal-light text-xs tracking-[0.3em] uppercase mb-3">
            The Bride & Groom
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-charcoal-dark mb-4">
            Mempelai
          </h2>
          <p className="font-script text-gold text-lg md:text-xl">
            Bismillahirrahmanirrahim
          </p>
        </div>

        {/* Couple Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Groom */}
          <CoupleCard
            name={eventInfo?.groom_name || "Mempelai Pria"}
            fatherName={eventInfo?.groom_father || null}
            motherName={eventInfo?.groom_mother || null}
            instagram={eventInfo?.groom_instagram || null}
            photoUrl={eventInfo?.groom_photo_url || null}
            direction="left"
          />

          {/* Bride */}
          <CoupleCard
            name={eventInfo?.bride_name || "Mempelai Wanita"}
            fatherName={eventInfo?.bride_father || null}
            motherName={eventInfo?.bride_mother || null}
            instagram={eventInfo?.bride_instagram || null}
            photoUrl={eventInfo?.bride_photo_url || null}
            direction="right"
          />
        </div>
      </div>
    </section>
  );
}
