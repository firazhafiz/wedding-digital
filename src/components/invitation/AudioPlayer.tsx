"use client";

import { useEffect } from "react";
import { useAudio } from "@/hooks/useAudio";

interface AudioPlayerProps {
  src: string;
  autoPlay?: boolean;
}

export default function AudioPlayer({
  src,
  autoPlay = false,
}: AudioPlayerProps) {
  const { isPlaying, play, toggle } = useAudio({
    src,
    fadeDuration: 2,
    maxVolume: 0.5,
  });

  useEffect(() => {
    if (autoPlay) {
      play();
    }
  }, [autoPlay, play]);

  return (
    <button
      onClick={toggle}
      className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-charcoal-dark/60 backdrop-blur-md border border-gold/20 flex items-center justify-center text-white hover:bg-charcoal-dark/80 hover:border-gold/40 transition-all duration-300 group"
      aria-label={isPlaying ? "Pause musik" : "Play musik"}
    >
      {isPlaying ? (
        /* Animated equalizer bars */
        <div className="flex items-end gap-0.5 h-4">
          <span
            className="w-0.5 bg-gold animate-[equalizer_0.8s_ease-in-out_infinite] rounded-full"
            style={{ animationDelay: "0s", height: "60%" }}
          />
          <span
            className="w-0.5 bg-gold animate-[equalizer_0.8s_ease-in-out_infinite] rounded-full"
            style={{ animationDelay: "0.2s", height: "100%" }}
          />
          <span
            className="w-0.5 bg-gold animate-[equalizer_0.8s_ease-in-out_infinite] rounded-full"
            style={{ animationDelay: "0.4s", height: "40%" }}
          />
          <span
            className="w-0.5 bg-gold animate-[equalizer_0.8s_ease-in-out_infinite] rounded-full"
            style={{ animationDelay: "0.1s", height: "80%" }}
          />
        </div>
      ) : (
        /* Play icon */
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="ml-0.5 group-hover:text-gold transition-colors"
        >
          <path d="M4 2.5v11l10-5.5L4 2.5z" />
        </svg>
      )}
    </button>
  );
}
