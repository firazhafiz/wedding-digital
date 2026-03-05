export default function AboutSection() {
  return (
    <section
      id="about"
      className="py-24 lg:py-32 px-6 bg-charcoal-dark relative overflow-hidden"
    >
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gold/3 rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Text */}
          <div>
            <p className="font-body text-xs tracking-[0.3em] uppercase text-gold mb-3">
              Tentang Kami
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-white mb-6">
              Lebih dari Sekadar Undangan
            </h2>
            <p className="font-body text-white/60 text-sm leading-relaxed mb-6">
              <strong className="text-white">akadigital</strong> adalah platform
              undangan digital premium yang dirancang khusus untuk pasangan
              modern. Kami menggabungkan desain elegan dengan teknologi terkini
              untuk menciptakan pengalaman undangan yang tak terlupakan.
            </p>
            <p className="font-body text-white/60 text-sm leading-relaxed mb-8">
              Setiap undangan dilengkapi dengan fitur interaktif seperti RSVP,
              QR Check-in, Gallery, dan Guestbook — semua dalam satu platform
              yang mudah dikelola melalui dashboard admin.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-8">
              {[
                { value: "100%", label: "Responsive" },
                { value: "∞", label: "Tamu" },
                { value: "1x", label: "Bayar" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-display text-2xl text-gold">{s.value}</p>
                  <p className="font-body text-[10px] text-white/40 tracking-wider uppercase mt-0.5">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Feature highlights */}
          <div className="space-y-4">
            {[
              {
                title: "Dashboard Admin",
                desc: "Kelola tamu, ucapan, dan check-in dari satu tempat.",
              },
              {
                title: "Desain Premium",
                desc: "Template elegan dengan animasi halus dan tipografi mewah.",
              },
              {
                title: "Kustomisasi Penuh",
                desc: "Ubah warna, font, foto, dan fitur sesuai keinginan Anda.",
              },
              {
                title: "Multi-Event Support",
                desc: "Satu akun untuk mengelola banyak acara pernikahan.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 hover:border-gold/20 transition-all duration-500 group"
              >
                <h3 className="font-body text-sm font-semibold text-white mb-1 group-hover:text-gold transition-colors">
                  {item.title}
                </h3>
                <p className="font-body text-xs text-white/50 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
