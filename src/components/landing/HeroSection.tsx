import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden md:pt-0">
      {/* Background Image Optimized */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero.jpg"
          alt="AkaDigital Premium Wedding Invitation"
          fill
          priority
          quality={90}
          className="object-cover"
          sizes="100vw"
        />
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-charcoal-dark/70" />

      {/* Subtle accent glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[400px] h-[400px] rounded-full bg-gold/3 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/20 bg-gold/5 mb-8">
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          <span className="font-body text-xs text-gold/80 tracking-widest uppercase">
            Powered By{" "}
            <Link
              href="https://kylodev.netlify.app/"
              target="_blank"
              className="text-gold"
            >
              KyloDev
            </Link>
          </span>
        </div>

        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white mb-6 leading-[0.95]">
          Wujudkan Undangan
          <br />
          <span className="gold-shimmer">Impian Anda</span>
        </h1>

        <p className="font-body text-white/60 text-sm md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Buat undangan pernikahan digital yang elegan, modern, dan interaktif.
          Dilengkapi fitur RSVP, QR Check-in, Gallery, dan masih banyak lagi.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/order?plan=starter"
            className="font-body text-sm font-semibold text-charcoal-dark bg-gold hover:bg-gold-light px-8 py-3.5 rounded-md transition-all duration-300 hover:shadow-xl hover:shadow-gold/20 hover:-translate-y-0.5 w-full sm:w-auto text-center"
          >
            Mulai dari Rp 299.000
          </Link>
          <a
            href="#services"
            className="font-body text-sm text-white/70 hover:text-white border border-white/10 hover:border-white/30 px-8 py-3.5 rounded-md transition-all duration-300 w-full sm:w-auto text-center"
          >
            Lihat Fitur
          </a>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 md:gap-16 pt-8 border-t border-white/5">
          {[
            { value: "500+", label: "Undangan Dibuat" },
            { value: "98%", label: "Klien Puas" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-2xl md:text-3xl text-gold">
                {stat.value}
              </p>
              <p className="font-body text-[10px] md:text-xs text-white/40 tracking-wider uppercase mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
