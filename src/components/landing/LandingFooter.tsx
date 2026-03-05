import Link from "next/link";
import Image from "next/image";

export default function LandingFooter() {
  return (
    <footer className="py-12 px-6 bg-charcoal-dark border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/assets/logo-white.svg"
              alt="Logo"
              width={40}
              height={40}
            />
            <span className="font-display text-2xl text-gold tracking-tight">
              AkaDigital
            </span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link
              href="#services"
              className="font-body text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Layanan
            </Link>
            <Link
              href="#pricing"
              className="font-body text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Harga
            </Link>
            <Link
              href="#contact"
              className="font-body text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Kontak
            </Link>
            <Link
              href="/admin/login"
              className="font-body text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 my-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-[10px] text-white/30">
            © {new Date().getFullYear()} AkaDigital. All rights reserved.
          </p>
          <p className="font-body text-[10px] text-white/20">
            Powered by{" "}
            <span className="text-white/40 font-semibold">kylodev</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
