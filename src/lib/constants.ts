import type { EventInfo } from "@/types";

/**
 * Fallback event data used when Supabase is not yet configured
 * or data hasn't been loaded. Replace these with actual data.
 */
export const FALLBACK_EVENT: Partial<EventInfo> = {
  groom_name: "Nama Mempelai Pria",
  groom_father: "Bapak Ayah Pria",
  groom_mother: "Ibu Pria",
  bride_name: "Nama Mempelai Wanita",
  bride_father: "Bapak Ayah Wanita",
  bride_mother: "Ibu Wanita",
  akad_date: "2025-06-15T08:00:00+07:00",
  akad_location: "Masjid Istiqlal, Jakarta",
  resepsi_date: "2025-06-15T11:00:00+07:00",
  resepsi_location: "Hotel Grand Ballroom, Jakarta",
};

/**
 * Site-wide constants
 */
export const SITE_CONFIG = {
  name: "Wedding Invitation",
  description: "You are cordially invited to celebrate our special day.",
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
} as const;

/**
 * Animation constants
 */
export const ANIMATION = {
  /** Duration for section reveal (seconds) */
  revealDuration: 0.8,
  /** Stagger delay between elements */
  staggerDelay: 0.15,
  /** Audio fade-in duration (seconds) */
  audioFadeDuration: 2,
  /** ScrollTrigger start threshold */
  scrollStart: "top 85%",
  /** ScrollTrigger end threshold */
  scrollEnd: "bottom 15%",
} as const;
