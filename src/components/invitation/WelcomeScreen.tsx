"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useIsMobile } from "@/hooks/useMediaQuery";
import type { EventInfo } from "@/types";
import Button from "@/components/ui/Button";
import NextImage from "next/image";

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
  const [mounted, setMounted] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Entrance animation
  useEffect(() => {
    if (!mounted || !contentRef.current || hasAnimated.current || isOpen)
      return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.5 });
      hasAnimated.current = true;

      tl.fromTo(
        ".welcome-animate",
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
          clearProps: "transform", // Clear Y transform but keep opacity 1
        },
      );
    }, contentRef);

    return () => ctx.revert();
  }, [mounted, isOpen]);

  // Exit animation
  useEffect(() => {
    if (!isOpen || !containerRef.current || !contentRef.current) return;

    const tl = gsap.timeline({
      onComplete: () => {
        if (containerRef.current) {
          containerRef.current.style.display = "none";
        }
      },
    });

    // Content fade & scale out
    tl.to(contentRef.current, {
      opacity: 0,
      scale: 0.9,
      duration: 1,
      ease: "power2.inOut",
    });

    // Background slide up
    tl.to(
      containerRef.current,
      {
        yPercent: -100,
        duration: 1.5,
        ease: "power4.inOut",
      },
      "<0.2", // Start shortly after content starts fading
    );
  }, [isOpen]);

  // Robust scroll lock before opening
  useEffect(() => {
    const lock = () => {
      document.body.style.overflow = "hidden";
      document.body.style.height = "100dvh";
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.height = "100dvh";
    };

    const unlock = () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
    };

    if (!isOpen) {
      lock();
    } else {
      // Keep locked during the 1.5s slide-up animation
      const timer = setTimeout(unlock, 1500);
      return () => {
        clearTimeout(timer);
        unlock();
      };
    }
    return unlock;
  }, [isOpen]);

  const groomName = eventInfo?.groom_name || "Mempelai Pria";
  const brideName = eventInfo?.bride_name || "Mempelai Wanita";

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-dark touch-none select-none overscroll-none"
    >
      {/* Optimized HD Background Layer (Instant Render) */}
      <div className="absolute inset-0 z-0 bg-charcoal-dark overflow-hidden">
        <NextImage
          src={eventInfo?.hero_photo_url || "/images/hero-fallback.jpg"}
          alt="Welcome background"
          fill
          priority
          quality={85}
          className="object-cover opacity-80"
          sizes="100vw"
        />
      </div>

      {/* Video Background (Loads asynchronously) */}
      <video
        className="video-bg relative z-10 mix-blend-screen"
        autoPlay
        muted
        loop
        playsInline
      >
        <source
          src={eventInfo?.welcome_video_url || "/videos/wedding.mp4"}
          type="video/mp4"
        />
      </video>

      {/* Overlay */}
      <div className="video-overlay" />

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 text-center px-6 max-w-8xl"
      >
        {/* Script accent */}
        <p className="welcome-animate font-script text-gold-light text-3xl tracking-widest mb-4">
          The Wedding of
        </p>

        {/* Couple names */}
        <h1 className="welcome-animate font-display text-white text-3xl lg:text-6xl leading-tight mb-2">
          {groomName}
        </h1>

        <p className="welcome-animate font-display text-gold text-xl md:text-3xl mb-2">
          &
        </p>

        <h1 className="welcome-animate font-display text-white text-3xl lg:text-6xl leading-tight mb-8">
          {brideName}
        </h1>

        {/* Ornamental line */}
        <div className="welcome-animate ornamental-line mx-auto mb-6">
          <span className="w-1.5 h-1.5 rotate-45 bg-gold/60 shrink-0" />
        </div>

        {/* Guest greeting */}
        <p className="welcome-animate font-body text-white/80 text-sm tracking-[0.2em] uppercase mb-2">
          Special Invitation For
        </p>
        <p className="welcome-animate font-body text-white text-lg md:text-xl font-medium mb-10">
          {guestName}
        </p>

        {/* Open button */}
        <div className="welcome-animate">
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
