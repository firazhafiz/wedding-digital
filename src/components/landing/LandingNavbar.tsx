"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import Image from "next/image";

const navLinks = [
  { label: "Layanan", href: "#services" },
  { label: "Tentang", href: "#about" },
  { label: "Harga", href: "#pricing" },
  { label: "Testimoni", href: "#testimonials" },
  { label: "Kontak", href: "#contact" },
];

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // GSAP Animations
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";

      const tl = gsap.timeline();

      // Reset positions
      gsap.set(menuRef.current, { display: "block" });
      gsap.set(bgRef.current, { opacity: 0 });
      gsap.set(contentRef.current, { opacity: 0 });
      gsap.set(itemsRef.current, { y: 20, opacity: 0 });

      tl.to(bgRef.current, {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
      })
        .to(contentRef.current, { opacity: 1, duration: 0.3 }, "-=0.2")
        .to(
          itemsRef.current.filter(Boolean),
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.05,
            ease: "power3.out",
          },
          "-=0.2",
        );
    } else {
      if (menuRef.current) {
        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(menuRef.current, { display: "none" });
            document.body.style.overflow = "";
          },
        });

        tl.to(contentRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        }).to(
          bgRef.current,
          {
            opacity: 0,
            duration: 0.4,
            ease: "power2.inOut",
          },
          "-=0.1",
        );
      }
    }
  }, [menuOpen]);

  const handleLinkClick = (href: string) => {
    setMenuOpen(false);
    if (href.startsWith("#")) {
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 800);
    }
  };

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-100 transition-all duration-500",
          scrolled || menuOpen
            ? "bg-charcoal-dark/60 backdrop-blur-sm py-4"
            : "bg-transparent py-6",
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative z-110">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="hidden md:block">
              <Image
                src="/assets/logo-white.svg"
                alt="Logo"
                width={35}
                height={35}
              />
            </div>
            <span className="font-display text-xl text-gold tracking-tight">
              AkaDigital
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleLinkClick(link.href)}
                className="relative font-body text-[13px] text-white/50 hover:text-white transition-colors tracking-wide cursor-pointer group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-300" />
              </button>
            ))}
            <Link
              href="/order?plan=starter"
              className="font-body text-[13px] font-medium text-charcoal-dark bg-gold px-6 py-2.5 rounded transition-all duration-300 hover:bg-gold-light"
            >
              Order Now
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center cursor-pointer group"
            aria-label="Toggle menu"
          >
            <div className="flex flex-col gap-1.5 items-end">
              <span
                className={cn(
                  "block h-0.5 bg-white transition-all duration-500 rounded-full",
                  menuOpen ? "w-8 rotate-45 translate-y-2" : "w-8",
                )}
              />
              <span
                className={cn(
                  "block h-0.5 bg-white transition-all duration-500 rounded-full",
                  menuOpen ? "w-0 opacity-0" : "w-5",
                )}
              />
              <span
                className={cn(
                  "block h-0.5 bg-white transition-all duration-500 rounded-full",
                  menuOpen ? "w-8 -rotate-45 -translate-y-2" : "w-8",
                )}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Full Screen Menu */}
      <div
        ref={menuRef}
        className="fixed inset-0 z-90 hidden md:hidden h-screen w-screen overflow-hidden"
      >
        {/* Animated Background */}
        <div ref={bgRef} className="absolute inset-0 bg-charcoal-dark" />

        {/* Unified Content Wrapper for Animation */}
        <div
          ref={contentRef}
          className="relative h-full flex flex-col px-8 pt-32 pb-12 overflow-y-auto"
        >
          <div className="flex-1 flex flex-col">
            <p className="font-body text-[10px] text-gold/70 uppercase tracking-[0.5em] mb-12">
              Menu Navigasi
            </p>

            <div className="flex flex-col gap-4">
              {navLinks.map((link, i) => (
                <div
                  key={link.href}
                  ref={(el) => {
                    itemsRef.current[i] = el;
                  }}
                  className="overflow-hidden"
                >
                  <button
                    onClick={() => handleLinkClick(link.href)}
                    className="group flex items-baseline gap-6 text-left transition-all"
                  >
                    <span className="font-body text-xs text-gold/10 group-hover:text-gold transition-colors duration-300">
                      /{String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-4xl sm:text-5xl text-white/90 group-hover:text-gold transition-all duration-500 transform group-hover:translate-x-2">
                      {link.label}
                    </span>
                  </button>
                </div>
              ))}
            </div>

            <div
              ref={(el) => {
                itemsRef.current[navLinks.length] = el;
              }}
              className="mt-16"
            >
              <Link
                href="/order?plan=starter"
                className="inline-block text-center font-body text-sm font-semibold text-charcoal-dark bg-gold px-8 py-4 rounded-sm hover:bg-gold-light transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl shadow-gold/10"
                onClick={() => setMenuOpen(false)}
              >
                Mulai Sekarang
              </Link>
            </div>
          </div>

          {/* Footer inside menu */}
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="font-body text-[10px] text-white/40 uppercase tracking-widest">
                akadigital premium invitation
              </p>
              <p className="font-body text-[10px] text-gold/40">
                Crafted by kylodev
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
