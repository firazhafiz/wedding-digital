const testimonials = [
  {
    name: "Risa & Arya",
    quote:
      "Undangannya sangat elegan! Tamu-tamu kami kagum dengan fitur QR check-in. Terima kasih akadigital!",
    role: "Wedding · Jakarta",
  },
  {
    name: "Dinda & Farel",
    quote:
      "Proses pemesanan mudah dan cepat. Dashboard admin-nya sangat membantu kami memantau RSVP secara real-time.",
    role: "Wedding · Bandung",
  },
  {
    name: "Sari & Bima",
    quote:
      "Desainnya premium banget, belum pernah lihat undangan digital seindah ini. Fitur Gift juga sangat praktis!",
    role: "Wedding · Surabaya",
  },
  {
    name: "Maya & Rizky",
    quote:
      "Harganya sangat worth it untuk fitur selengkap ini. Kami sangat puas dengan hasilnya!",
    role: "Wedding · Yogyakarta",
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 lg:py-32 px-6 bg-off-white">
      <div className="max-w-5xl mx-auto">
        {/* Title */}
        <div className="text-center mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-gold mb-3">
            Testimoni
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-charcoal-dark mb-4">
            Apa Kata Mereka
          </h2>
          <p className="font-body text-charcoal-light text-sm max-w-lg mx-auto">
            Cerita dari pasangan yang telah mempercayakan undangan digital
            mereka kepada kami.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="p-6 rounded-xl border border-gray-100 bg-white hover:shadow-lg hover:shadow-gold/5 transition-all duration-500"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <svg
                    key={j}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-gold"
                  >
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                ))}
              </div>

              <p className="font-body text-sm text-charcoal leading-relaxed mb-6 italic">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                  <span className="font-display text-sm text-gold">
                    {t.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-body text-sm font-semibold text-charcoal-dark">
                    {t.name}
                  </p>
                  <p className="font-body text-[10px] text-charcoal-light">
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
