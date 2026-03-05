import Link from "next/link";

const WA_NUMBER = "6282332676848";
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Halo akadigital, saya tertarik dengan paket Custom untuk undangan pernikahan.")}`;

const starterFeatures = [
  "Template premium siap pakai",
  "Kustomisasi warna & foto",
  "RSVP & Konfirmasi Kehadiran",
  "QR Code Check-in",
  "Gallery Foto",
  "Buku Tamu Digital",
  "Digital Gift / Angpao",
  "Countdown & Jadwal",
  "Background Music",
  "Peta Lokasi",
  "Dashboard Admin",
  "Unlimited Tamu",
];

const customFeatures = [
  "Semua fitur Starter",
  "Desain eksklusif dari nol",
  "Animasi & interaksi khusus",
  "Konsultasi desain personal",
  "Unlimited revisi",
  "Prioritas support",
  "Custom domain",
  "Integrasi tambahan",
];

export default function PricingSection() {
  return (
    <section
      id="pricing"
      className="py-24 lg:py-32 px-6 bg-charcoal-dark relative overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Title */}
        <div className="text-center mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-gold mb-3">
            Pricing
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-white mb-4">
            Pilih Paket Anda
          </h2>
          <p className="font-body text-white/50 text-sm max-w-lg mx-auto">
            Dua pilihan paket yang fleksibel untuk memenuhi kebutuhan Anda.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Starter */}
          <div className="relative rounded-2xl border border-gold/30 bg-linear-to-b from-gold/10 to-transparent p-8 flex flex-col">
            {/* Badge */}
            <div className="absolute -top-3 left-8 px-3 py-1 bg-gold text-charcoal-dark text-[10px] font-body font-bold uppercase tracking-wider rounded-full">
              Populer
            </div>

            <p className="font-body text-xs text-gold uppercase tracking-wider mb-2">
              Starter
            </p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-display text-4xl text-white">Rp 299</span>
              <span className="font-body text-white/50 text-sm">.000</span>
            </div>
            <p className="font-body text-white/40 text-xs mb-8">
              Sekali bayar, selamanya
            </p>

            <ul className="space-y-3 mb-8 flex-1">
              {starterFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-gold shrink-0"
                  >
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                  <span className="font-body text-sm text-white/70">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/order?plan=starter"
              className="block text-center font-body text-sm font-semibold text-charcoal-dark bg-gold hover:bg-gold-light px-6 py-3.5 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-gold/20"
            >
              Pesan Sekarang
            </Link>
          </div>

          {/* Custom */}
          <div className="rounded-2xl border border-white/10 bg-white/3 p-8 flex flex-col">
            <p className="font-body text-xs text-white/60 uppercase tracking-wider mb-2">
              Custom
            </p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-display text-4xl text-white">Custom</span>
            </div>
            <p className="font-body text-white/40 text-xs mb-8">
              Hubungi kami untuk konsultasi
            </p>

            <ul className="space-y-3 mb-8 flex-1">
              {customFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-emerald-400 shrink-0"
                  >
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                  <span className="font-body text-sm text-white/70">{f}</span>
                </li>
              ))}
            </ul>

            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center font-body text-sm font-semibold text-white border border-white/20 hover:border-white/40 hover:bg-white/5 px-6 py-3.5 rounded-lg transition-all duration-300"
            >
              Hubungi via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
