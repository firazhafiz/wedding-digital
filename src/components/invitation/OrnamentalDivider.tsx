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
    <div className={cn("flex items-center justify-center py-12", className)}>
      <div className="relative flex items-center gap-6 text-gold/60">
        <div className="w-16 md:w-24 h-px bg-linear-to-r from-transparent to-current" />
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="opacity-90"
        >
          <path d="M12 2C12 2 14 8 20 8M12 2C12 2 10 8 4 8M12 22C12 22 14 16 20 16M12 22C12 22 10 16 4 16M2 12C2 12 8 10 8 4M2 12C2 12 8 14 8 20M22 12C22 12 16 10 16 4M22 12C22 12 16 14 16 20" />
        </svg>
        <div className="w-16 md:w-24 h-px bg-linear-to-l from-transparent to-current" />
      </div>
    </div>
  );
}
