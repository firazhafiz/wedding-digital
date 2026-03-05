export const COOKIE_NAME = "active_event_id";

export function getActiveEventId(): string | null {
  if (typeof document === "undefined") return null;
  const name = COOKIE_NAME + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}

export function setActiveEventId(id: string) {
  if (typeof document === "undefined") return;
  const d = new Date();
  d.setTime(d.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const expires = "expires=" + d.toUTCString();
  document.cookie = COOKIE_NAME + "=" + id + ";" + expires + ";path=/";
}

export function clearActiveEventId() {
  if (typeof document === "undefined") return;
  document.cookie =
    COOKIE_NAME + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
