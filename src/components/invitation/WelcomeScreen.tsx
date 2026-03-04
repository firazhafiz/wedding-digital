"use client";

import { useRef, useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { useIsMobile } from "@/hooks/useMediaQuery";
import type { EventInfo } from "@/types";
import Button from "@/components/ui/Button";

interface WelcomeScreenProps {
  guestName: string;
  eventInfo: EventInfo | null;
  isOpen: boolean;
  onOpen: () => void;
}

export default function WelcomeScreen({
  guestName,
  eventInfo,
  isOpen,
  onOpen,
}: WelcomeScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Entrance animation
  useEffect(() => {
    if (!contentRef.current) return;

    const tl = gsap.timeline({ delay: 0.5 });

    tl.fromTo(
      contentRef.current.querySelectorAll(".welcome-animate"),
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      },
    );

    return () => {
      tl.kill();
    };
  }, []);

  // Exit animation
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    gsap.to(containerRef.current, {
      yPercent: -100,
      duration: 1.2,
      ease: "power4.inOut",
      onComplete: () => {
        if (containerRef.current) {
          containerRef.current.style.display = "none";
        }
        document.body.style.overflow = "";
      },
    });
  }, [isOpen]);

  // Lock scroll before opening
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const groomName = eventInfo?.groom_name || "Mempelai Pria";
  const brideName = eventInfo?.bride_name || "Mempelai Wanita";

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
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
      <div ref={contentRef} className="relative z-10 text-center px-6 max-w-lg">
        {/* Script accent */}
        <p className="welcome-animate font-script text-gold-light text-4xl tracking-widest mb-4 opacity-0">
          The Wedding of
        </p>

        {/* Couple names */}
        <h1 className="welcome-animate font-display text-white text-7xl lg:text-8xl leading-tight mb-2 opacity-0">
          {groomName}
        </h1>

        <p className="welcome-animate font-display text-gold text-3xl md:text-4xl mb-2 opacity-0">
          &
        </p>

        <h1 className="welcome-animate font-display text-white text-7xl lg:text-8xl leading-tight mb-8 opacity-0">
          {brideName}
        </h1>

        {/* Ornamental line */}
        <div className="welcome-animate ornamental-line mx-auto mb-6 opacity-0">
          <span className="w-1.5 h-1.5 rotate-45 bg-gold/60 shrink-0" />
        </div>

        {/* Guest greeting */}
        <p className="welcome-animate font-body text-white/80 text-sm tracking-[0.2em] uppercase mb-2 opacity-0">
          Special Invitation For
        </p>
        <p className="welcome-animate font-body text-white text-lg md:text-xl font-medium mb-10 opacity-0">
          {guestName}
        </p>

        {/* Open button */}
        <div className="welcome-animate opacity-0">
          <Button
            variant="outline"
            size="lg"
            onClick={onOpen}
            className="border-gold/60 text-white hover:bg-gold/20 hover:border-gold tracking-[0.15em] text-sm"
          >
            Buka Undangan
          </Button>
        </div>
      </div>
    </div>
  );
}
