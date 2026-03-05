"use client";

import { useState, useRef, useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import NextImage from "next/image";
import type { GalleryPhoto } from "@/types";
import Modal from "@/components/ui/Modal";

interface GallerySectionProps {
  photos: GalleryPhoto[];
}

interface GallerySectionProps {
  photos: GalleryPhoto[];
  isDark?: boolean;
}

export default function GallerySection({
  photos,
  isDark = false,
}: GallerySectionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !titleRef.current) return;

    // Title reveal
    gsap.fromTo(
      titleRef.current.querySelectorAll(".title-animate"),
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 85%",
        },
      },
    );

    // Gallery items stagger
    const items = sectionRef.current.querySelectorAll(".gallery-item");
    gsap.fromTo(
      items,
      { opacity: 0, y: 30, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current.querySelector(".gallery-grid"),
          start: "top 85%",
        },
      },
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [photos]);

  const handlePrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`py-12 lg:py-16 px-6 transition-colors duration-500 ${
        isDark ? "bg-transparent" : "bg-off-white"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <div ref={titleRef} className="text-center mb-12 lg:mb-16">
          <p
            className={`title-animate font-body text-xs tracking-[0.3em] uppercase mb-3 ${
              isDark ? "text-white/80" : "text-charcoal-light"
            }`}
          >
            Our Moments
          </p>
          <h2
            className={`title-animate font-display text-6xl md:text-7xl ${
              isDark ? "text-white" : "text-charcoal-dark"
            }`}
          >
            Galeri
          </h2>
        </div>

        {/* Masonry Grid */}
        <div className="gallery-grid columns-2 md:columns-3 gap-3 md:gap-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="gallery-item break-inside-avoid mb-3 md:mb-4 cursor-pointer group relative overflow-hidden rounded-sm border border-gold/5"
              onClick={() => setSelectedIndex(index)}
            >
              <NextImage
                src={photo.photo_url}
                alt={photo.caption || `Gallery photo ${index + 1}`}
                width={1920}
                height={1080}
                className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105"
              />

              {/* Hover overlay */}
              <div
                className={`absolute inset-0 transition-all duration-500 ${
                  isDark
                    ? "bg-black/0 group-hover:bg-black/40"
                    : "bg-charcoal-dark/0 group-hover:bg-charcoal-dark/20"
                }`}
              />

              {/* Gold border glow on hover */}
              <div className="absolute inset-0 border border-transparent group-hover:border-gold/30 transition-all duration-500" />

              {/* Caption */}
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <p className="font-body text-white text-xs">
                    {photo.caption}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <Modal
          isOpen={selectedIndex !== null}
          onClose={() => setSelectedIndex(null)}
          className="max-w-5xl w-full bg-charcoal-dark p-2"
        >
          <div className="relative">
            <NextImage
              src={photos[selectedIndex].photo_url}
              alt={
                photos[selectedIndex].caption ||
                `Gallery photo ${selectedIndex + 1}`
              }
              width={1200}
              height={1200}
              className="w-full h-auto max-h-[80vh] object-contain"
            />

            {/* Caption */}
            {photos[selectedIndex].caption && (
              <p className="text-center font-body text-gray-500 text-sm mt-3 pb-2">
                {photos[selectedIndex].caption}
              </p>
            )}

            {/* Navigation */}
            {selectedIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                aria-label="Previous"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M10 2L4 8L10 14" />
                </svg>
              </button>
            )}

            {selectedIndex < photos.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                aria-label="Next"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 2L12 8L6 14" />
                </svg>
              </button>
            )}

            {/* Counter */}
            <div className="absolute top-3 left-3 font-body text-white/50 text-xs">
              {selectedIndex + 1} / {photos.length}
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
