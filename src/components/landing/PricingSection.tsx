"use client";

import Link from "next/link";

const WA_NUMBER = "6282332676848";
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Halo akadigital, saya tertarik dengan paket Custom untuk undangan pernikahan.")}`;

const commonFeatures = [
  "Template Premium Elegan",
  "RSVP & Konfirmasi Kehadiran",
  "QR Code Check-in System",
  "Digital Gift / Angpao",
  "Gallery Foto & Video",
  "Background Music",
  "Countdown & Peta Lokasi",
  "Dashboard Pengelola Tamu",
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
            Investasi sekali untuk kenangan seumur hidup. Pilih paket yang
            paling sesuai dengan jumlah tamu Anda.
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
            features={[...commonFeatures, "Sebar Manual (Link Unik)"]}
            href="/order?package=basic"
          />

          {/* PRO - Best Seller */}
          <PricingCard
            name="Pro"
            price={525000}
            paxLimit="300"
            isPopular
            description="Pilihan favorit calon pengantin."
            features={[...commonFeatures, "Sebar Manual (Link Unik)"]}
            href="/order?package=pro"
          />

          {/* EXCLUSIVE */}
          <PricingCard
            name="Exclusive"
            price={649000}
            paxLimit="500"
            description="Sempurna untuk undangan masif."
            features={[
              ...commonFeatures,
              "Auto-Broadcast WhatsApp",
              "Laporan Scan Real-time",
            ]}
            href="/order?package=exclusive"
            iconColor="text-emerald-400"
          />

          {/* CUSTOM */}
          <PricingCard
            name="Custom"
            price="Custom"
            paxLimit="Unlimited"
            description="Solusi total tanpa batas tamu."
            features={[
              ...commonFeatures,
              "Custom Design Request",
              "WA Broadcast (Biaya API)",
              "Prioritas Support 24/7",
            ]}
            href={WA_URL}
            isExternal
            ctaText="Hubungi Kami"
          />
        </div>

        <p className="text-center font-body text-xs text-white/30 mt-12">
          *Semua paket termasuk akses dashboard admin selamanya.
        </p>
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
  isExternal = false,
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
  isExternal?: boolean;
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
            <>
              <span className="font-display text-3xl text-white">
                {formatRp(price).split(",")[0]}
              </span>
            </>
          ) : (
            <span className="font-display text-3xl text-white">{price}</span>
          )}
        </div>
        <p className="font-body text-white/40 text-xs mt-1">
          Max {paxLimit} Tamu
        </p>
        <p className="font-body text-white/50 text-[11px] mt-4 leading-relaxed italic">
          "{description}"
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
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
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
