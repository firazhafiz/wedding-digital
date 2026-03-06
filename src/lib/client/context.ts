export const CLIENT_COOKIE_NAME = "client_session";

/**
 * Client-side only: get the raw JWT token from the cookie.
 */
export function getClientToken(): string | null {
  if (typeof document === "undefined") return null;
  const name = CLIENT_COOKIE_NAME + "=";
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

export function setClientToken(token: string) {
  if (typeof document === "undefined") return;
  const d = new Date();
  d.setTime(d.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const expires = "expires=" + d.toUTCString();
  document.cookie =
    CLIENT_COOKIE_NAME + "=" + token + ";" + expires + ";path=/";
}

export function clearClientToken() {
  if (typeof document === "undefined") return;
  document.cookie =
    CLIENT_COOKIE_NAME + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
