import { cn } from "@/lib/utils";

interface OrnamentalDividerProps {
  className?: string;
  variant?: "simple" | "flourish" | "diamond";
}

export default function OrnamentalDivider({
  className,
  variant = "flourish",
}: OrnamentalDividerProps) {
  if (variant === "simple") {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <div className="w-full max-w-xs flex items-center gap-3">
          <div className="flex-1 h-px bg-linear-to-r from-transparent via-gold/40 to-transparent" />
        </div>
      </div>
    );
  }

  if (variant === "diamond") {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <div className="w-full max-w-sm flex items-center gap-4">
          <div className="flex-1 h-px bg-linear-to-r from-transparent to-gold/40" />
          <div className="w-2 h-2 rotate-45 bg-gold/60" />
          <div className="w-1.5 h-1.5 rotate-45 bg-gold/40" />
          <div className="w-2 h-2 rotate-45 bg-gold/60" />
          <div className="flex-1 h-px bg-linear-to-l from-transparent to-gold/40" />
        </div>
      </div>
    );
  }

  // Flourish variant (default)
  return (
    <div className={cn("flex items-center justify-center py-10", className)}>
      <svg
        width="200"
        height="30"
        viewBox="0 0 200 30"
        fill="none"
        className="text-gold/50"
      >
        {/* Left flourish */}
        <path
          d="M0 15 C20 15, 30 5, 50 5 S80 15, 85 15"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
        />
        <path
          d="M0 15 C20 15, 30 25, 50 25 S80 15, 85 15"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
        />

        {/* Center ornament */}
        <circle cx="100" cy="15" r="3" fill="currentColor" opacity="0.6" />
        <circle
          cx="100"
          cy="15"
          r="6"
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
          opacity="0.4"
        />

        {/* Right flourish */}
        <path
          d="M200 15 C180 15, 170 5, 150 5 S120 15, 115 15"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
        />
        <path
          d="M200 15 C180 15, 170 25, 150 25 S120 15, 115 15"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
        />
      </svg>
    </div>
  );
}
