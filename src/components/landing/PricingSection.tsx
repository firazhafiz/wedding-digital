"use client";

import Link from "next/link";

const WA_NUMBER = "6282332676848";
const WA_ORDER_URL = (pkg: string) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Halo akadigital, saya tertarik dengan paket ${pkg} untuk undangan pernikahan.`)}`;
const WA_CUSTOM_URL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Halo akadigital, saya ingin konsultasi untuk paket undangan kustom / kapasitas lebih dari 2.500 tamu.")}`;

const commonFeatures = [
  "Template Premium Elegan",
  "RSVP & Konfirmasi Kehadiran",
  "QR Code Check-in (Unlimited Device)",
  "Digital Gift / Angpao",
  "Gallery Foto & Video",
  "Background Music",
  "Countdown & Peta Lokasi",
  "Dashboard Pengelola Tamu",
  "Timeline Kisah Cinta",
  "Generator Kirim WA (Link Unik)",
];

function formatRp(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function CheckIcon({ className }: { className: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <polyline points="20,6 9,17 4,12" />
    </svg>
  );
}

export default function PricingSection() {
  return (
    <section
      id="pricing"
      className="py-24 lg:py-32 px-6 bg-charcoal-dark relative overflow-hidden"
    >
      {/* Decorative background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold/3 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-gold/2 rounded-full blur-[80px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Title */}
        <div className="text-center mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-gold mb-3">
            Pricing
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-white mb-4">
            Pilih Paket Keindahan Anda
          </h2>
          <p className="font-body text-white/50 text-sm max-w-md mx-auto leading-relaxed">
            Investasi sekali untuk kenangan seumur hidup. Semua paket mendapat
            fitur undangan yang identik — perbedaan hanya di kuota tamu.
          </p>
        </div>

        {/* ===== Pricing Cards Grid ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* BASIC */}
          <PricingCard
            name="Basic"
            price={299000}
            paxLimit="100"
            description="Cocok untuk acara inti keluarga."
            features={commonFeatures}
            href="/order?package=basic"
          />

          {/* PRO - Best Seller */}
          <PricingCard
            name="Pro"
            price={499000}
            paxLimit="500"
            isPopular
            description="Pilihan favorit calon pengantin."
            features={commonFeatures}
            href="/order?package=pro"
          />

          {/* EXCLUSIVE */}
          <PricingCard
            name="Exclusive"
            price={999000}
            paxLimit="1.000"
            description="Sempurna untuk undangan skala besar."
            features={[
              ...commonFeatures,
              "Kustomisasi Template WA",
              "Bantuan Penyebaran WA",
            ]}
            href="/order?package=exclusive"
            iconColor="text-emerald-400"
          />

          {/* ELITE */}
          <PricingCard
            name="Elite"
            price={1499000}
            paxLimit="2.500"
            description="Maksimal & premium tanpa kompromi."
            features={[
              ...commonFeatures,
              "Kustomisasi Template WA",
              "Bantuan Penyebaran WA",
            ]}
            href="/order?package=elite"
            iconColor="text-purple-400"
          />
        </div>

        <p className="text-center font-body text-xs text-white/30 mt-12">
          *Semua paket mendapat fitur identik. Perbedaan hanya di kuota tamu.
        </p>

        {/* CTA Custom */}
        <div className="mt-10 text-center border border-white/10 rounded-2xl p-8 bg-white/[0.02] backdrop-blur-sm max-w-2xl mx-auto">
          <h3 className="font-display text-xl text-white mb-2">Butuh Lebih?</h3>
          <p className="font-body text-white/50 text-sm mb-6 leading-relaxed">
            Ingin desain undangan khusus atau kapasitas lebih dari 2.500 tamu?
            <br />
            Konsultasikan kebutuhan Anda langsung dengan tim kami.
          </p>
          <Link
            href={WA_CUSTOM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-charcoal-dark font-body text-sm font-bold px-8 py-3.5 rounded-lg transition-all duration-300 shadow-lg shadow-gold/20"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Konsultasi via WhatsApp
          </Link>
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  name,
  price,
  paxLimit,
  description,
  features,
  href,
  isPopular = false,
  ctaText = "Pilih Paket",
  iconColor = "text-gold",
}: {
  name: string;
  price: number | string;
  paxLimit: string;
  description: string;
  features: string[];
  href: string;
  isPopular?: boolean;
  ctaText?: string;
  iconColor?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl p-8 flex flex-col transition-all duration-300 h-full ${
        isPopular
          ? "bg-linear-to-b from-gold/15 to-transparent border-2 border-gold ring-4 ring-gold/5 scale-105 z-20 shadow-2xl shadow-gold/10"
          : "bg-white/[0.02] border border-white/10 hover:border-white/25"
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold text-charcoal-dark text-[10px] font-body font-bold uppercase tracking-widest rounded-full">
          Best Seller
        </div>
      )}

      <div className="mb-8">
        <p
          className={`font-body text-xs uppercase tracking-widest mb-2 ${isPopular ? "text-gold" : "text-white/40"}`}
        >
          {name}
        </p>
        <div className="flex items-baseline gap-1">
          {typeof price === "number" ? (
            <span className="font-display text-3xl text-white">
              {formatRp(price).split(",")[0]}
            </span>
          ) : (
            <span className="font-display text-3xl text-white">{price}</span>
          )}
        </div>
        <p className="font-body text-white/40 text-xs mt-1">
          Max {paxLimit} Tamu
        </p>
        <p className="font-body text-white/50 text-[11px] mt-4 leading-relaxed italic">
          &quot;{description}&quot;
        </p>
      </div>

      <ul className="space-y-3.5 mb-10 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3">
            <CheckIcon className={`${iconColor} shrink-0 mt-0.5`} />
            <span className="font-body text-xs text-white/70 leading-tight">
              {f}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={`block text-center font-body text-sm font-bold px-6 py-3.5 rounded-lg transition-all duration-300 ${
          isPopular
            ? "bg-gold hover:bg-gold-light text-charcoal-dark shadow-lg shadow-gold/20"
            : "border border-gold/40 text-white  hover:bg-white/5"
        }`}
      >
        {ctaText}
      </Link>
    </div>
  );
}
