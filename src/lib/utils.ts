import { type ClassValue, clsx } from "clsx";

// ============================================
// Classname Merge (Tailwind-friendly)
// ============================================

/**
 * Simple className merge utility.
 * Combines conditional classnames into a single string.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

// ============================================
// Slug Generation
// ============================================

/**
 * Generates a URL-safe slug from a name.
 * "Budi Santoso" → "budi-santoso"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Spaces to hyphens
    .replace(/-+/g, "-") // Deduplicate hyphens
    .replace(/^-|-$/g, ""); // Trim hyphens
}

// ============================================
// OS Detection (for Maps CTA)
// ============================================

export type OSType = "ios" | "android" | "other";

/**
 * Detects the user's OS for Maps link routing.
 * iOS → Apple Maps, Android/other → Google Maps.
 */
export function detectOS(): OSType {
  if (typeof navigator === "undefined") return "other";

  const ua = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "other";
}

/**
 * Returns the appropriate maps URL based on user's OS.
 */
export function getMapsUrl(
  googleMapsUrl: string,
  appleMapsUrl?: string,
): string {
  const os = detectOS();
  if (os === "ios" && appleMapsUrl) return appleMapsUrl;
  return googleMapsUrl;
}

// ============================================
// Date Formatting
// ============================================

/**
 * Formats a date string to Indonesian locale.
 * "2025-06-15T10:00:00" → "Minggu, 15 Juni 2025"
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Formats a date string to time only.
 * "2025-06-15T10:00:00" → "10:00 WIB"
 */
export function formatTime(dateStr: string, timezone = "WIB"): string {
  const date = new Date(dateStr);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes} ${timezone}`;
}

// ============================================
// QR Token Generation
// ============================================

/**
 * Generates a unique QR token for a guest.
 * Uses crypto.randomUUID() with a prefix.
 */
export function generateQrToken(): string {
  return `wdg-${crypto.randomUUID()}`;
}

// ============================================
// Clipboard Copy
// ============================================

/**
 * Copies text to clipboard with fallback.
 * Returns true if successful.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

// ============================================
// Debounce
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
