const services = [
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    title: "RSVP Digital",
    desc: "Konfirmasi kehadiran langsung dari undangan. Tamu bisa memilih hadir atau tidak, jumlah tamu, dan mengirim pesan.",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M7 7h.01M7 12h.01M12 7h.01M12 12h.01M17 7h.01M17 12h.01M7 17h.01M12 17h.01" />
      </svg>
    ),
    title: "QR Code Check-in",
    desc: "Setiap tamu mendapat QR code unik. Scan langsung di hari H untuk proses check-in yang cepat dan modern.",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    ),
    title: "Gallery Foto",
    desc: "Tampilkan foto-foto prewedding terbaik Anda dalam gallery yang elegan dengan efek lightbox interaktif.",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "Buku Tamu Digital",
    desc: "Tamu dapat mengirimkan ucapan dan doa secara digital. Semua ucapan dimoderasi oleh admin sebelum tampil.",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
    title: "Digital Gift / Angpao",
    desc: "Fitur amplop digital dengan dukungan transfer bank dan QRIS. Praktis untuk tamu yang tidak bisa hadir.",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
    ),
    title: "Countdown & Jadwal",
    desc: "Hitung mundur ke hari H secara real-time. Tampilkan jadwal akad dan resepsi lengkap dengan peta lokasi.",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
    title: "Background Music",
    desc: "Tambahkan lagu pilihan Anda sebagai music latar. Support link YouTube agar lebih fleksibel.",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: "Peta Lokasi",
    desc: "Integrasi Google Maps untuk petunjuk arah ke lokasi akad dan resepsi. Satu klik langsung navigasi.",
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-24 lg:py-32 px-6 bg-off-white">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <div className="text-center mb-16 lg:mb-20">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-gold mb-3">
            Fitur Lengkap
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-charcoal-dark mb-4">
            Semua yang Anda Butuhkan
          </h2>
          <p className="font-body text-charcoal-light text-sm md:text-base max-w-xl mx-auto">
            Dari RSVP hingga check-in, semua fitur premium tersedia untuk
            membuat hari spesial Anda sempurna.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <div
              key={i}
              className="group p-6 rounded-xl border border-gray-100 bg-white hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all duration-500 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-lg bg-gold/10 text-gold flex items-center justify-center mb-4 group-hover:bg-gold group-hover:text-charcoal-dark transition-all duration-500">
                {s.icon}
              </div>
              <h3 className="font-body text-sm font-semibold text-charcoal-dark mb-2">
                {s.title}
              </h3>
              <p className="font-body text-xs text-charcoal-light leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
