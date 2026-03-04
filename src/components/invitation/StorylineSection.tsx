"use client";

import { useRef, useEffect } from "react";
import NextImage from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { StorylineItem } from "@/types";

interface StorylineSectionProps {
  items: StorylineItem[];
}

export default function StorylineSection({ items }: StorylineSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !titleRef.current) return;

    // Title animation
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

    // Timeline items sequential reveal
    const timelineItems = sectionRef.current.querySelectorAll(".timeline-item");
    timelineItems.forEach((item, index) => {
      gsap.fromTo(
        item,
        {
          opacity: 0,
          x: index % 2 === 0 ? -40 : 40,
          y: 20,
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
          },
        },
      );
    });

    // Center line grow
    const line = sectionRef.current.querySelector(".timeline-line");
    if (line) {
      gsap.fromTo(
        line,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            end: "bottom 40%",
            scrub: 1,
          },
        },
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [items]);

  return (
    <section ref={sectionRef} className="py-12 lg:py-16 px-6 bg-off-white">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <div ref={titleRef} className="text-center mb-16 lg:mb-20">
          <p className="title-animate font-body text-charcoal-light text-xs tracking-[0.3em] uppercase mb-3">
            Our Journey
          </p>
          <h2 className="title-animate font-display text-3xl md:text-5xl text-charcoal-dark">
            Cerita Kami
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Center line */}
          <div className="timeline-line absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gold/20 origin-top hidden md:block" />

          {/* Mobile center line */}
          <div className="timeline-line absolute left-6 top-0 bottom-0 w-px bg-gold/20 origin-top md:hidden" />

          {/* Items */}
          <div className="space-y-12 md:space-y-16">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`timeline-item relative flex items-start gap-6 md:gap-0 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Dot */}
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gold border-2 border-off-white z-10" />

                {/* Content */}
                <div
                  className={`ml-14 md:ml-0 md:w-[calc(50%-2rem)] ${
                    index % 2 === 0 ? "md:pr-8 md:text-right" : "md:pl-8"
                  }`}
                >
                  {/* Year */}
                  <span className="inline-block font-display text-lg text-gold mb-2">
                    {item.year}
                  </span>

                  {/* Title */}
                  <h3 className="font-body font-semibold text-lg text-charcoal-dark mb-2">
                    {item.title}
                  </h3>

                  {/* Description */}
                  {item.description && (
                    <p className="font-body text-sm text-charcoal-light leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Photo */}
                  {item.photo_url && (
                    <div className="mt-4 overflow-hidden rounded-sm relative w-full">
                      <NextImage
                        src={item.photo_url}
                        alt={item.title}
                        width={600}
                        height={400}
                        className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  )}
                </div>

                {/* Empty spacer for alternating side */}
                <div className="hidden md:block md:w-[calc(50%-2rem)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
