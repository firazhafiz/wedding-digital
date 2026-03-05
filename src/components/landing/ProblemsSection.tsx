const problems = [
  {
    problem: "Undangan fisik mahal dan boros kertas",
    solution: "Digital, hemat biaya, ramah lingkungan",
    icon: "💸",
  },
  {
    problem: "Sulit mendata kehadiran tamu",
    solution: "RSVP otomatis dengan dashboard real-time",
    icon: "📋",
  },
  {
    problem: "Antrian panjang saat registrasi hari H",
    solution: "QR Code check-in instan, tanpa antri",
    icon: "⏱️",
  },
  {
    problem: "Tidak tahu berapa tamu yang datang",
    solution: "Statistik akurat kapan saja",
    icon: "📊",
  },
  {
    problem: "Amplop fisik ribet dan rawan hilang",
    solution: "Transfer digital & QRIS langsung dari undangan",
    icon: "💳",
  },
  {
    problem: "Tamu bingung lokasi acara",
    solution: "Peta lokasi terintegrasi, satu klik navigasi",
    icon: "📍",
  },
];

export default function ProblemsSection() {
  return (
    <section className="py-24 lg:py-32 px-6 bg-off-white">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <div className="text-center mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-gold mb-3">
            Solusi Nyata
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-charcoal-dark mb-4">
            Masalah yang Kami Selesaikan
          </h2>
          <p className="font-body text-charcoal-light text-sm max-w-lg mx-auto">
            Kami memahami tantangan yang dihadapi pasangan saat mempersiapkan
            pernikahan. akadigital hadir sebagai solusi all-in-one.
          </p>
        </div>

        {/* List */}
        <div className="space-y-0">
          {problems.map((p, i) => (
            <div
              key={i}
              className="group grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-8 py-7 border-b border-charcoal-dark/5 last:border-b-0"
            >
              {/* Problem */}
              <div className="flex items-start gap-4">
                <span className="text-xl md:text-2xl mt-0.5 shrink-0">
                  {p.icon}
                </span>
                <div>
                  <p className="font-body text-[10px] text-charcoal-light/60 uppercase tracking-wider font-semibold mb-1">
                    Masalah
                  </p>
                  <p className="font-body text-sm text-charcoal-dark leading-relaxed">
                    {p.problem}
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-gold group-hover:translate-x-1 transition-transform duration-300"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>

              {/* Solution */}
              <div className="flex items-start gap-3 pl-9 md:pl-0">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-emerald-500 shrink-0 mt-0.5"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22,4 12,14.01 9,11.01" />
                </svg>
                <div>
                  <p className="font-body text-[10px] text-emerald-500 uppercase tracking-wider font-semibold mb-1">
                    Solusi
                  </p>
                  <p className="font-body text-sm text-charcoal leading-relaxed">
                    {p.solution}
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
