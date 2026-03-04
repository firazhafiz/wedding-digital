"use client";

import { useState, useEffect } from "react";

/**
 * Responsive breakpoint detection hook.
 * Uses matchMedia API for accurate breakpoint detection.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    function handler(e: MediaQueryListEvent) {
      setMatches(e.matches);
    }

    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/**
 * Convenience hooks for common breakpoints.
 */
export function useIsMobile(): boolean {
  return !useMediaQuery("(min-width: 768px)");
}

export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}
