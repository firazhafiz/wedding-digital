"use client";

import { useEffect } from "react";
import { initSmoothScroll, destroySmoothScroll } from "@/lib/lenis";
import "@/lib/gsap"; // Register GSAP plugins

export default function SmoothScrollProvider({
  children,
  enabled = true,
}: {
  children: React.ReactNode;
  enabled?: boolean;
}) {
  useEffect(() => {
    if (!enabled) {
      destroySmoothScroll();
      return;
    }

    const lenis = initSmoothScroll();

    return () => {
      destroySmoothScroll();
    };
  }, [enabled]);

  return <>{children}</>;
}
