import type { Metadata } from "next";
import { Pinyon_Script, Urbanist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const pinyonScript = Pinyon_Script({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pinyon",
  display: "swap",
});

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-urbanist",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://akadigital.vercel.app"), // Replace with production URL when ready
  title: {
    default: "AkaDigital - Premium Digital Wedding Invitation",
    template: "%s | AkaDigital",
  },
  description:
    "Solusi undangan pernikahan digital premium. Modern, elegan, dan penuh fitur untuk hari spesial Anda.",
  keywords: [
    "undangan digital",
    "wedding invitation",
    "undangan online",
    "akadigital",
    "pernikahan",
  ],
  authors: [{ name: "AkaDigital Team" }],
  creator: "AkaDigital",
  publisher: "AkaDigital",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "AkaDigital - Premium Digital Wedding Invitation",
    description:
      "Rayakan momen spesial Anda dengan undangan digital yang elegan dan modern.",
    url: "https://akadigital.vercel.app",
    siteName: "AkaDigital",
    locale: "id_ID",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/assets/meta.svg",
    shortcut: "/assets/meta.svg",
    apple: "/assets/meta.svg",
  },
  twitter: {
    card: "summary_large_image",
    title: "AkaDigital - Premium Digital Wedding Invitation",
    description:
      "Rayakan momen spesial Anda dengan undangan digital yang elegan dan modern.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${pinyonScript.variable} ${urbanist.variable} overflow-x-hidden`}
    >
      <body className="font-body antialiased overflow-x-hidden">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: "var(--font-body)",
              borderRadius: "8px",
            },
          }}
        />
      </body>
    </html>
  );
}
