"use client";

import { useEffect } from "react";
import { initSmoothScroll, destroySmoothScroll } from "@/lib/lenis";
import "@/lib/gsap"; // Register GSAP plugins

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const lenis = initSmoothScroll();

    return () => {
      destroySmoothScroll();
    };
  }, []);

  return <>{children}</>;
}
