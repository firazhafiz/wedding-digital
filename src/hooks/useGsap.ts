"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ANIMATION } from "@/lib/constants";

interface RevealOptions {
  /** Animation type */
  type?: "fade-up" | "fade-left" | "fade-right" | "scale" | "fade";
  /** Duration in seconds */
  duration?: number;
  /** Delay in seconds */
  delay?: number;
  /** ScrollTrigger start */
  start?: string;
  /** Stagger value for multiple children */
  stagger?: number;
  /** Whether to animate children instead of the element itself */
  children?: boolean;
}

/**
 * GSAP ScrollTrigger reveal animation hook.
 * Attach the returned ref to the element you want to animate.
 */
export function useGsapReveal<T extends HTMLElement = HTMLDivElement>(
  options: RevealOptions = {},
) {
  const ref = useRef<T>(null);

  const {
    type = "fade-up",
    duration = ANIMATION.revealDuration,
    delay = 0,
    start = ANIMATION.scrollStart,
    stagger = ANIMATION.staggerDelay,
    children = false,
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = children ? el.children : el;

    // Set initial state based on animation type
    const fromVars: gsap.TweenVars = {
      opacity: 0,
      duration,
      delay,
      ease: "power3.out",
      stagger: children ? stagger : 0,
      scrollTrigger: {
        trigger: el,
        start,
        toggleActions: "play none none none",
      },
    };

    switch (type) {
      case "fade-up":
        gsap.set(targets, { opacity: 0, y: 50 });
        gsap.to(targets, { ...fromVars, y: 0, opacity: 1 });
        break;
      case "fade-left":
        gsap.set(targets, { opacity: 0, x: -60 });
        gsap.to(targets, { ...fromVars, x: 0, opacity: 1 });
        break;
      case "fade-right":
        gsap.set(targets, { opacity: 0, x: 60 });
        gsap.to(targets, { ...fromVars, x: 0, opacity: 1 });
        break;
      case "scale":
        gsap.set(targets, { opacity: 0, scale: 0.85 });
        gsap.to(targets, { ...fromVars, scale: 1, opacity: 1 });
        break;
      case "fade":
        gsap.set(targets, { opacity: 0 });
        gsap.to(targets, { ...fromVars, opacity: 1 });
        break;
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, [type, duration, delay, start, stagger, children]);

  return ref;
}

/**
 * GSAP Timeline hook for complex multi-step animations.
 * Returns a ref and the timeline instance.
 */
export function useGsapTimeline<T extends HTMLElement = HTMLDivElement>(
  timelineVars?: gsap.TimelineVars,
) {
  const ref = useRef<T>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    tlRef.current = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: ANIMATION.scrollStart,
        toggleActions: "play none none none",
      },
      ...timelineVars,
    });

    return () => {
      tlRef.current?.kill();
    };
  }, []);

  return { ref, timeline: tlRef };
}
