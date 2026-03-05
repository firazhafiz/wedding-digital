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
  title: "AkaDigital - Your DIgital Wedding Invitation",
  description:
    "You are cordially invited to celebrate our special day. Open your personal invitation to RSVP.",
  openGraph: {
    title: "Wedding Invitation",
    description: "You are cordially invited to celebrate our special day.",
    type: "website",
  },
  icons: {
    icon: "/assets/meta.svg",
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
