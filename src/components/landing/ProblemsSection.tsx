const problems = [
  {
    problem: "Undangan fisik mahal & boros kertas",
    solution: "Digital, hemat biaya, dan ramah lingkungan",
  },
  {
    problem: "Sulit mendata kehadiran tamu",
    solution: "RSVP otomatis dengan dashboard real-time",
  },
  {
    problem: "Antrian panjang registrasi di hari H",
    solution: "QR Code check-in instan, tanpa antri",
  },
  {
    problem: "Tidak tahu berapa tamu yang datang",
    solution: "Statistik akurat, kapan saja, di mana saja",
  },
  {
    problem: "Amplop fisik ribet dan rawan hilang",
    solution: "Transfer digital & QRIS langsung dari undangan",
  },
  {
    problem: "Tamu bingung menemukan lokasi acara",
    solution: "Peta terintegrasi, satu klik langsung navigasi",
  },
];

export default function ProblemsSection() {
  return (
    <section className="py-24 lg:py-36 px-6 bg-off-white overflow-hidden">
      <div className="max-w-5xl mx-auto">

        {/* Header — editorial, left-aligned */}
        <div className="mb-16 md:mb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="font-body text-[10px] tracking-[0.35em] uppercase text-gold mb-4">
              Mengapa Digital?
            </p>
            <h2 className="font-display text-4xl md:text-6xl text-charcoal-dark leading-tight max-w-sm">
              Masalah<br />
              <span className="italic font-light text-charcoal-light">yang kami</span>{" "}
              selesaikan
            </h2>
          </div>
          <p className="font-body text-sm text-charcoal-light leading-relaxed max-w-xs md:text-right">
            Setiap tantangan dalam momen terpenting hidupmu
            layak mendapat solusi yang cerdas.
          </p>
        </div>

        {/* List */}
        <div className="divide-y divide-charcoal-dark/[0.07]">
          {problems.map((p, i) => (
            <div
              key={i}
              className="group py-6 md:py-7 flex flex-col md:flex-row md:items-center gap-3 md:gap-0"
            >
              {/* Index */}
              <span className="font-display text-[11px] text-charcoal-light/30 tracking-widest w-10 shrink-0 select-none">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Problem */}
              <div className="flex-1 md:pr-12">
                <p className="font-body text-base md:text-lg text-charcoal-dark/60 line-through decoration-charcoal-dark/20 group-hover:decoration-charcoal-dark/40 transition-all duration-300">
                  {p.problem}
                </p>
              </div>

              {/* Divider arrow — desktop only */}
              <div className="hidden md:block shrink-0 text-gold/40 group-hover:text-gold transition-colors duration-300 pr-12">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>

              {/* Solution */}
              <div className="flex-1 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-gold shrink-0 mt-px" />
                <p className="font-body text-sm md:text-base text-charcoal font-medium group-hover:text-charcoal-dark transition-colors duration-300">
                  {p.solution}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-12 font-body text-xs text-charcoal-light/40 text-right tracking-wide">
          Semua fitur tersedia dalam satu platform.
        </p>
      </div>
    </section>
  );
}
