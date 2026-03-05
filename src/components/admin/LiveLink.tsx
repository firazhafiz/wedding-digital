"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

interface LiveLinkProps {
  slug: string;
  label?: string;
  className?: string;
}

export default function LiveLink({
  slug,
  label = "Lihat Undangan (Live)",
  className,
}: LiveLinkProps) {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined" && slug) {
      setUrl(`${window.location.origin}/${slug}`);
    }
  }, [slug]);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <a href={url || "#"} onClick={handleOpen} className={className}>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="shrink-0"
      >
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15,3 21,3 21,9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
      {label}
    </a>
  );
}
