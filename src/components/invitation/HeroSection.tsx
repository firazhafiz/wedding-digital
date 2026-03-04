"use client";

import { useRef, useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { useIsMobile } from "@/hooks/useMediaQuery";
import type { EventInfo } from "@/types";
import { formatDate } from "@/lib/utils";

interface HeroSectionProps {
  eventInfo: EventInfo | null;
  guestName: string;
}

export default function HeroSection({
  eventInfo,
  guestName,
}: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !textRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top center",
        toggleActions: "play none none none",
      },
    });

    tl.fromTo(
      textRef.current.querySelectorAll(".hero-animate"),
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
      },
    );

    return () => {
      tl.kill();
    };
  }, []);

  const groomName = eventInfo?.groom_name || "Mempelai Pria";
  const brideName = eventInfo?.bride_name || "Mempelai Wanita";
  const weddingDate = eventInfo?.akad_date
    ? formatDate(eventInfo.akad_date)
    : "Tanggal Pernikahan";

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Video Background */}
      <video
        className="video-bg"
        autoPlay
        muted
        loop
        playsInline
        poster={eventInfo?.hero_photo_url || "/images/hero-fallback.jpg"}
      >
        <source src="/videos/wedding.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="video-overlay" />

      {/* Content */}
      <div ref={textRef} className="relative z-10 text-center px-6 py-20">
        <p className="hero-animate font-body text-white/70 text-xs md:text-sm tracking-[0.3em] uppercase mb-6">
          We are getting married
        </p>

        <h2 className="hero-animate font-script text-white text-5xl md:text-7xl lg:text-8xl leading-tight mb-3">
          {groomName}
        </h2>

        <div className="hero-animate flex items-center justify-center gap-4 mb-3">
          <span className="w-16 h-px bg-linear-to-r from-transparent to-gold/60" />
          <span className="font-display text-gold text-3xl">&</span>
          <span className="w-16 h-px bg-linear-to-l from-transparent to-gold/60" />
        </div>

        <h2 className="hero-animate font-script text-white text-5xl md:text-7xl lg:text-8xl leading-tight mb-8">
          {brideName}
        </h2>

        <div className="hero-animate">
          <p className="font-body text-gold-light text-sm md:text-base tracking-[0.15em]">
            {weddingDate}
          </p>
        </div>
      </div>
    </section>
  );
}
