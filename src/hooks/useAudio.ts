"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { ANIMATION } from "@/lib/constants";

interface UseAudioOptions {
  /** Audio source URL */
  src: string;
  /** Fade-in duration in seconds */
  fadeDuration?: number;
  /** Max volume (0-1) */
  maxVolume?: number;
  /** Auto-play on mount (needs user interaction first) */
  autoPlay?: boolean;
}

interface UseAudioReturn {
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Start playing with fade-in */
  play: () => void;
  /** Pause audio */
  pause: () => void;
  /** Toggle play/pause */
  toggle: () => void;
  /** Audio ref for attaching to <audio> element */
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export function useAudio({
  src,
  fadeDuration = ANIMATION.audioFadeDuration,
  maxVolume = 0.6,
}: UseAudioOptions): UseAudioReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const fadeIn = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0;
    const startTime = performance.now();
    const duration = fadeDuration * 1000;

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      if (audio) {
        audio.volume = eased * maxVolume;
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [fadeDuration, maxVolume]);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      // Create audio element if not attached
      const el = new Audio(src);
      el.loop = true;
      el.volume = 0;
      audioRef.current = el;
    }

    const a = audioRef.current!;
    a.play()
      .then(() => {
        setIsPlaying(true);
        fadeIn();
      })
      .catch(() => {
        // Browser blocked autoplay — user interaction needed
        setIsPlaying(false);
      });
  }, [src, fadeIn]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    audio.pause();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  return { isPlaying, play, pause, toggle, audioRef };
}
