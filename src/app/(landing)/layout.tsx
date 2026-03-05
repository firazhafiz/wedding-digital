import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AkaDigital — Undangan Digital Premium",
  description:
    "Buat undangan pernikahan digital premium dengan fitur RSVP, QR Check-in, Gallery, Guestbook, dan lainnya. Powered by kylodev.",
  openGraph: {
    title: "AkaDigital — Undangan Digital Premium",
    description:
      "Buat undangan pernikahan digital premium. RSVP, QR Check-in, Gallery, dan fitur lengkap lainnya.",
    type: "website",
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
