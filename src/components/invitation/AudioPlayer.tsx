import { useEffect, useState, useRef } from "react";
import { useAudio } from "@/hooks/useAudio";
import { isYoutubeUrl, getYoutubeId } from "@/lib/utils";

interface AudioPlayerProps {
  src: string;
  autoPlay?: boolean;
}

export default function AudioPlayer({
  src,
  autoPlay = false,
}: AudioPlayerProps) {
  const [isYoutube, setIsYoutube] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ytPlaying, setYtPlaying] = useState(false);

  const {
    isPlaying: nativePlaying,
    play: playNative,
    toggle: toggleNative,
  } = useAudio({
    src: isYoutube ? "" : src,
    fadeDuration: 4,
    maxVolume: 0.5,
  });

  useEffect(() => {
    const isYT = isYoutubeUrl(src);
    setIsYoutube(isYT);
    if (isYT) {
      setVideoId(getYoutubeId(src));
    }
  }, [src]);

  // Handle Play/Pause
  const isPlaying = isYoutube ? ytPlaying : nativePlaying;

  const handleToggle = () => {
    if (isYoutube) {
      const player = iframeRef.current?.contentWindow;
      if (ytPlaying) {
        player?.postMessage(
          '{"event":"command","func":"pauseVideo","args":""}',
          "*",
        );
        setYtPlaying(false);
      } else {
        player?.postMessage(
          '{"event":"command","func":"playVideo","args":""}',
          "*",
        );
        setYtPlaying(true);
      }
    } else {
      toggleNative();
    }
  };

  useEffect(() => {
    if (autoPlay) {
      if (isYoutube) {
        // Trigger YouTube play after interaction
        const player = iframeRef.current?.contentWindow;
        player?.postMessage(
          '{"event":"command","func":"playVideo","args":""}',
          "*",
        );
        setYtPlaying(true);
      } else {
        playNative();
      }
    }
  }, [autoPlay, isYoutube, playNative]);

  return (
    <>
      {isYoutube && videoId && (
        <div className="fixed opacity-0 pointer-events-none -z-50 overflow-hidden w-0 h-0">
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=0&loop=1&playlist=${videoId}&controls=0`}
            allow="autoplay"
          />
        </div>
      )}

      <button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-charcoal-dark/60 backdrop-blur-md border border-gold/20 flex items-center justify-center text-white hover:bg-charcoal-dark/80 hover:border-gold/40 transition-all duration-300 group"
        aria-label={isPlaying ? "Pause musik" : "Play musik"}
      >
        {isPlaying ? (
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
    </>
  );
}
