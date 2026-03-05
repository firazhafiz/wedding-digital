const WA_NUMBER = "6282332676848";
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Halo akadigital, saya ingin bertanya tentang undangan digital.")}`;

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="py-24 lg:py-32 px-6 bg-charcoal-dark relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-linear-to-b from-charcoal-dark via-[#1a1a2e] to-charcoal-dark" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-3xl" />

      <div className="max-w-3xl mx-auto relative z-10 text-center">
        <p className="font-body text-xs tracking-[0.3em] uppercase text-gold mb-3">
          Kontak
        </p>
        <h2 className="font-display text-3xl md:text-5xl text-white mb-4">
          Hubungi Kami
        </h2>
        <p className="font-body text-white/50 text-sm max-w-md mx-auto mb-10">
          Punya pertanyaan? Ingin konsultasi? Kami siap membantu Anda mewujudkan
          undangan digital impian.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 font-body text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-8 py-3.5 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-emerald-600/20"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chat via WhatsApp
          </a>
          <a
            href="mailto:hello@akadigital.id"
            className="inline-flex items-center gap-2 font-body text-sm text-white/70 hover:text-white border border-white/10 hover:border-white/30 px-8 py-3.5 rounded-lg transition-all duration-300"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            kylodevcode@gmail.com
          </a>
        </div>

        {/* Phone display */}
        <p className="font-body text-white/30 text-xs">
          WhatsApp: 0823-3267-6848
        </p>
      </div>
    </section>
  );
}
