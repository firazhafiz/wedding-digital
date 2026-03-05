import type { Metadata } from "next";

export const metadata: Metadata = {
  description:
    "Platform undangan pernikahan digital nomor satu di Indonesia. Fitur lengkap: RSVP, QR Check-in, Guestbook, Gallery, dan desain yang sangat elegan. Coba sekarang!",
  openGraph: {
    title: "AkaDigital — Undangan Digital Premium & Elegant",
    description:
      "Buat undangan pernikahan digital impianmu dengan fitur terlengkap dan desain eksklusif.",
    url: "https://akadigital.vercel.app",
    siteName: "AkaDigital",
    images: [
      {
        url: "/images/banner-meta.png", // Ensure this exists or fallback
        width: 1200,
        height: 630,
        alt: "AkaDigital Preview",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AkaDigital — Undangan Digital Premium & Elegant",
    description:
      "Buat undangan pernikahan digital impianmu dengan fitur terlengkap dan desain eksklusif.",
    images: ["/images/banner-meta.png"],
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
