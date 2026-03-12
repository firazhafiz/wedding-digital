"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const WA_NUMBER = "6282332676848";
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Halo akadigital, saya tertarik dengan paket Custom untuk undangan pernikahan.")}`;

const PRICE_SATUAN = 5000;
const PRICE_BUNDLING = 3000;
const BUNDLING_SIZE = 100;

const satuanFeatures = [
  "Template premium siap pakai",
  "Kustomisasi warna & foto",
  "RSVP & Konfirmasi Kehadiran",
  "QR Code Check-in",
  "Gallery Foto & Buku Tamu",
  "Digital Gift / Angpao",
  "Countdown, Jadwal & Peta Lokasi",
  "Background Music",
  "Dashboard Pengelola",
];

const bundlingFeatures = [
  "Semua fitur Satuan",
  "Hemat 40% per undangan",
  "Paket kelipatan 100 undangan",
  "Bonus: Panduan setup lengkap",
];

const customFeatures = [
  "Semua fitur Bundling",
  "Desain eksklusif dari nol",
  "Animasi & interaksi khusus",
  "Template WA Broadcast",
  "Konsultasi desain personal",
  "Unlimited revisi & Custom domain",
  "Prioritas support",
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
  const [guestCount, setGuestCount] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const count = parseInt(guestCount) || 0;

  // Calculate pricing options
  const satuanTotal = count * PRICE_SATUAN;
  const bundlingPacks = Math.ceil(count / BUNDLING_SIZE);
  const bundlingTotal = bundlingPacks * BUNDLING_SIZE * PRICE_BUNDLING;
  const combineFullPacks = Math.floor(count / BUNDLING_SIZE);
  const combineRemainder = count - combineFullPacks * BUNDLING_SIZE;
  const combineTotal =
    combineFullPacks * BUNDLING_SIZE * PRICE_BUNDLING +
    combineRemainder * PRICE_SATUAN;

  const validOptions = [
    { key: "satuan", total: satuanTotal },
    { key: "bundling", total: bundlingTotal },
    { key: "combine", total: combineTotal },
  ].filter((o) => o.total > 0);
  const cheapest =
    validOptions.length > 0 ? Math.min(...validOptions.map((o) => o.total)) : 0;

  const handleCalculate = () => {
    if (count > 0) {
      setShowResults(true);
      setAnimateIn(false);
      setTimeout(() => setAnimateIn(true), 50);
    }
  };

  useEffect(() => {
    if (showResults && resultsRef.current) {
      resultsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [showResults]);

  return (
    <section
      id="pricing"
      className="py-24 lg:py-32 px-6 bg-charcoal-dark relative overflow-hidden"
    >
      {/* Decorative background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold/[0.03] rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-gold/[0.02] rounded-full blur-[80px]" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Title */}
        <div className="text-center mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-gold mb-3">
            Pricing
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-white mb-4">
            Pilih Paket Anda
          </h2>
          <p className="font-body text-white/50 text-sm max-w-md mx-auto leading-relaxed">
            Temukan paket yang tepat sesuai kebutuhan acara Anda.
          </p>
        </div>

        {/* ===== Smart Calculator ===== */}
        <div className="relative mb-16">
          {/* Glow accent behind */}
          <div className="absolute -inset-1 rounded-3xl blur-sm" />

          <div className="relative rounded-2xl border border-gold/15 overflow-hidden">
            {/* Top bar */}
            <div className="px-6 py-3 bg-gold/[0.04] border-b border-gold/10 flex items-center gap-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gold/60"
              >
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="8" y1="6" x2="16" y2="6" />
                <line x1="8" y1="10" x2="16" y2="10" />
                <line x1="8" y1="14" x2="12" y2="14" />
              </svg>
              <span className="font-body text-[11px] text-gold/50 uppercase tracking-wider font-semibold">
                Kalkulator Undangan
              </span>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              <p className="font-body text-sm text-white/60 mb-5 text-center">
                Berapa jumlah tamu yang akan Anda undang?
              </p>

              {/* Input group */}
              <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
                <div className="relative flex-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="250"
                    value={guestCount}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      setGuestCount(v);
                      setShowResults(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCalculate();
                    }}
                    className="w-full h-[52px] px-16 bg-white/[0.04] border border-white/10 rounded-md text-white font-body text-2xl font-medium tracking-wide text-center placeholder:text-white/15 focus:outline-none focus:border-gold/40 focus:bg-white/[0.06] transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 font-body text-sm text-white/30 pointer-events-none">
                    orang
                  </span>
                </div>
                <button
                  onClick={handleCalculate}
                  disabled={count < 1}
                  className="h-[52px] px-7 flex items-center justify-center bg-gold hover:bg-gold-light text-charcoal-dark font-body font-bold text-sm rounded-md transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-gold/20 shrink-0"
                >
                  Hitung
                </button>
              </div>

              {/* Results */}
              {showResults && count > 0 && (
                <div
                  ref={resultsRef}
                  className={`mt-8 pt-7 border-t border-white/5 transition-all duration-500 ${
                    animateIn
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                >
                  <p className="font-body text-[11px] text-white/30 uppercase tracking-wider text-center mb-4">
                    Perbandingan Harga untuk {count} Undangan
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <ResultCard
                      label="Satuan"
                      total={satuanTotal}
                      isCheapest={satuanTotal === cheapest}
                      detail={`${count} × ${formatRp(PRICE_SATUAN)}`}
                      savings={0}
                      href={`/order?plan=satuan&qty=${count}`}
                    />
                    <ResultCard
                      label="Bundling"
                      total={bundlingTotal}
                      isCheapest={bundlingTotal === cheapest}
                      detail={
                        `${bundlingPacks} paket × 100` +
                        (bundlingPacks * BUNDLING_SIZE > count
                          ? ` (+${bundlingPacks * BUNDLING_SIZE - count} bonus)`
                          : "")
                      }
                      savings={
                        satuanTotal > 0
                          ? Math.round(
                              ((satuanTotal - bundlingTotal) / satuanTotal) *
                                100,
                            )
                          : 0
                      }
                      href={`/order?plan=bundling&qty=${bundlingPacks * BUNDLING_SIZE}`}
                    />
                    <ResultCard
                      label="Combine"
                      total={combineTotal}
                      isCheapest={
                        combineTotal === cheapest &&
                        combineTotal !== satuanTotal
                      }
                      detail={
                        (combineFullPacks > 0
                          ? `${combineFullPacks}×100 bundling`
                          : "") +
                        (combineFullPacks > 0 && combineRemainder > 0
                          ? " + "
                          : "") +
                        (combineRemainder > 0
                          ? `${combineRemainder} satuan`
                          : "")
                      }
                      savings={
                        satuanTotal > combineTotal
                          ? Math.round(
                              ((satuanTotal - combineTotal) / satuanTotal) *
                                100,
                            )
                          : 0
                      }
                      href={`/order?plan=combine&qty=${count}`}
                    />
                  </div>

                  <p className="text-center font-body text-[10px] text-white/20 mt-4">
                    Klik &ldquo;Pilih Paket&rdquo; untuk melanjutkan pemesanan
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== Pricing Cards ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Satuan */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 flex flex-col">
            <p className="font-body text-xs text-white/60 uppercase tracking-wider mb-2">
              Satuan
            </p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-display text-4xl text-white">Rp 5</span>
              <span className="font-body text-white/50 text-sm">.000</span>
            </div>
            <p className="font-body text-white/40 text-xs mb-8">Per undangan</p>
            <ul className="space-y-3 mb-8 flex-1">
              {satuanFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <CheckIcon className="text-white/40 shrink-0" />
                  <span className="font-body text-sm text-white/70">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/order?plan=satuan"
              className="block text-center font-body text-sm font-semibold text-white border border-white/20 hover:border-white/40 hover:bg-white/5 px-6 py-3.5 rounded-lg transition-all duration-300"
            >
              Pesan Sekarang
            </Link>
          </div>

          {/* Bundling */}
          <div className="relative rounded-2xl border border-gold/30 bg-linear-to-b from-gold/10 to-transparent p-8 flex flex-col">
            <div className="absolute -top-3 left-8 px-3 py-1 bg-gold text-charcoal-dark text-[10px] font-body font-bold uppercase tracking-wider rounded-full">
              Paling Populer
            </div>
            <p className="font-body text-xs text-gold uppercase tracking-wider mb-2">
              Bundling
            </p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-display text-4xl text-white">Rp 3</span>
              <span className="font-body text-white/50 text-sm">.000</span>
            </div>
            <p className="font-body text-white/40 text-xs mb-1">
              Per undangan (min. 100)
            </p>
            <p className="font-body text-gold/60 text-[10px] mb-8">
              Hemat 40% dari harga satuan
            </p>
            <ul className="space-y-3 mb-8 flex-1">
              {bundlingFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <CheckIcon className="text-gold shrink-0" />
                  <span className="font-body text-sm text-white/70">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/order?plan=bundling"
              className="block text-center font-body text-sm font-semibold text-charcoal-dark bg-gold hover:bg-gold-light px-6 py-3.5 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-gold/20"
            >
              Pesan Sekarang
            </Link>
          </div>

          {/* Custom */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 flex flex-col">
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
                  <CheckIcon className="text-emerald-400 shrink-0" />
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

/* ---- Result Card ---- */
function ResultCard({
  label,
  total,
  isCheapest,
  detail,
  savings,
  href,
}: {
  label: string;
  total: number;
  isCheapest: boolean;
  detail: string;
  savings: number;
  href: string;
}) {
  return (
    <div
      className={`rounded-xl p-5 border transition-all flex flex-col ${
        isCheapest
          ? "border-gold/40 bg-gold/[0.06] ring-1 ring-gold/20"
          : "border-white/8 bg-white/[0.02]"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="font-body text-xs text-white/50 uppercase tracking-wider">
          {label}
        </p>
        {isCheapest && (
          <span className="px-2 py-0.5 bg-gold text-charcoal-dark text-[9px] font-body font-bold uppercase tracking-wider rounded-full">
            Paling Hemat
          </span>
        )}
      </div>
      <p className="font-display text-xl text-white mb-1">{formatRp(total)}</p>
      <p className="font-body text-[11px] text-white/35 mb-1">{detail}</p>
      {savings > 0 && (
        <p className="font-body text-[11px] text-emerald-400/80">
          Hemat {savings}%
        </p>
      )}
      <div className="mt-auto pt-3">
        <Link
          href={href}
          className={`block text-center font-body text-xs font-semibold px-4 py-2.5 rounded-lg transition-all duration-300 ${
            isCheapest
              ? "bg-gold hover:bg-gold-light text-charcoal-dark"
              : "border border-white/15 text-white/60 hover:border-white/30 hover:bg-white/5"
          }`}
        >
          Pilih Paket
        </Link>
      </div>
    </div>
  );
}
