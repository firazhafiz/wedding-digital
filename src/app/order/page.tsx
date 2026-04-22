"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const PRICE_SATUAN = 5000;
const PRICE_BUNDLING = 3000;
const BUNDLING_SIZE = 100;

function formatRp(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
const PLAN_OPTIONS = [
  { value: "basic", label: "Basic", sub: "Max 100 Tamu" },
  { value: "pro", label: "Pro", sub: "Max 500 Tamu" },
  { value: "exclusive", label: "Exclusive", sub: "Max 1.000 Tamu" },
  { value: "elite", label: "Elite", sub: "Max 2.500 Tamu" },
];

function calcPrice(plan: string, qty: number) {
  switch (plan) {
    case "basic":
      return {
        label: "Basic",
        desc: `Paket Basic (Max 100 Tamu) - Fitur Lengkap`,
        total: 299000,
        qty: Math.max(1, Math.min(qty, 100)),
      };
    case "pro":
      return {
        label: "Pro",
        desc: `Paket Pro (Max 500 Tamu) - Fitur Lengkap`,
        total: 499000,
        qty: Math.max(1, Math.min(qty, 500)),
      };
    case "exclusive":
      return {
        label: "Exclusive",
        desc: `Paket Exclusive (Max 1.000 Tamu) - Inc. WA Template Custom & Opsi Bantuan Blast`,
        total: 999000,
        qty: Math.max(1, Math.min(qty, 1000)),
      };
    case "elite":
      return {
        label: "Elite",
        desc: `Paket Elite (Max 2.500 Tamu) - Inc. WA Template Custom & Opsi Bantuan Blast`,
        total: 1499000,
        qty: Math.max(1, Math.min(qty, 2500)),
      };
    default:
      return {
        label: "Basic",
        desc: "Paket Basic",
        total: 299000,
        qty: Math.max(1, Math.min(qty, 100)),
      };
  }
}

function OrderFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Support both 'package' and old 'plan' params for backward compatibility
  const initialPlan =
    searchParams.get("package") || searchParams.get("plan") || "basic";
  const initialQty = parseInt(searchParams.get("qty") || "") || 0;

  const [plan, setPlan] = useState(initialPlan);
  const [qty, setQty] = useState(initialQty > 0 ? String(initialQty) : "");
  const qtyNum = parseInt(qty) || 0;

  // Fully dynamic auto-switch package based on qty
  useEffect(() => {
    if (qtyNum === 0) return;

    if (qtyNum > 1000) {
      if (plan !== "elite") setPlan("elite");
    } else if (qtyNum > 500) {
      if (plan !== "exclusive") setPlan("exclusive");
    } else if (qtyNum > 100) {
      if (plan !== "pro") setPlan("pro");
    } else {
      if (plan !== "basic") setPlan("basic");
    }
  }, [qtyNum, plan]);

  const priceInfo = calcPrice(plan, qtyNum);

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    client_name: "",
    client_phone: "",
    client_email: "",
    groom_name: "",
    bride_name: "",
    event_date: "",
    event_location: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.client_name ||
      !form.client_phone ||
      !form.groom_name ||
      !form.bride_name
    )
      return;
    if (qtyNum < 1) return;

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          package_type: plan,
          guest_qty: priceInfo.qty,
          total_price: priceInfo.total,
        }),
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      
      // Save pending order to localStorage
      if (data.data?.id) {
        localStorage.setItem("pendingOrderId", data.data.id);
        if (data.data.payment_url) {
          localStorage.setItem("pendingPaymentUrl", data.data.payment_url);
        }
      }

      router.push(`/order/success?id=${data.data.id}`);
    } catch {
      alert("Gagal mengirim data. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-charcoal-dark to-[#1a1a2e] py-20 px-6">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <Link
          href="/#pricing"
          className="inline-flex items-center gap-2 font-body text-sm text-white/40 hover:text-white/70 transition-colors mb-8"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Kembali ke Pricing
        </Link>

        <div className="mb-10">
          <h1 className="font-display text-3xl md:text-4xl text-white mb-2">
            Formulir Pemesanan
          </h1>
          <p className="font-body text-white/50 text-sm">
            Isi data berikut untuk memulai pembuatan undangan digital Anda.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ===== Package Selection ===== */}
          <div className="space-y-4">
            <p className="font-body text-xs text-gold uppercase tracking-wider font-semibold">
              Paket & Jumlah Undangan
            </p>

            {/* Plan selector */}
            <div className="grid grid-cols-3 gap-2">
              {PLAN_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPlan(opt.value)}
                  className={`px-3 py-3 rounded-lg border text-left transition-all ${
                    plan === opt.value
                      ? "border-gold/40 bg-gold/10"
                      : "border-white/10 bg-white/2 hover:border-white/20"
                  }`}
                >
                  <p
                    className={`font-body text-sm font-semibold ${
                      plan === opt.value ? "text-gold" : "text-white/70"
                    }`}
                  >
                    {opt.label}
                  </p>
                  <p className="font-body text-[10px] text-white/35 mt-0.5">
                    {opt.sub}
                  </p>
                </button>
              ))}
            </div>

            {/* Qty input */}
            <div>
              <label className="block font-body text-xs text-white/50 mb-1.5">
                Jumlah Undangan <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={qty}
                onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-body text-sm placeholder:text-white/20 focus:outline-none focus:border-gold/40 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="Masukkan jumlah undangan, contoh: 250"
              />
              {plan === "bundling" &&
                qtyNum > 0 &&
                qtyNum % BUNDLING_SIZE !== 0 && (
                  <p className="font-body text-[11px] text-gold/60 mt-1">
                    Bundling akan dibulatkan ke{" "}
                    {Math.ceil(qtyNum / BUNDLING_SIZE) * BUNDLING_SIZE} undangan
                  </p>
                )}
            </div>
          </div>

          {/* Price Summary */}
          {qtyNum > 0 && (
            <div className="rounded-xl border border-gold/20 bg-gold/5 p-5">
              <p className="font-body text-xs text-gold uppercase tracking-wider font-semibold mb-3">
                Rincian Harga
              </p>
              <div className="flex items-center justify-between mb-1">
                <span className="font-body text-sm text-white/70">Paket</span>
                <span className="font-body text-sm text-white font-medium">
                  {priceInfo.label}
                </span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-body text-sm text-white/70">
                  Undangan
                </span>
                <span className="font-body text-sm text-white/60">
                  {priceInfo.qty} pcs
                </span>
              </div>
              <div className="flex items-start justify-between mb-1">
                <span className="font-body text-sm text-white/70">Rincian</span>
                <span className="font-body text-sm text-white/60 text-right max-w-[200px]">
                  {priceInfo.desc}
                </span>
              </div>
              <div className="h-px bg-gold/10 my-3" />
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-white/70 font-semibold">
                  Total
                </span>
                <span className="font-display text-xl text-gold">
                  {formatRp(priceInfo.total)}
                </span>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-white/5" />

          {/* Client Info */}
          <div className="space-y-4">
            <p className="font-body text-xs text-gold uppercase tracking-wider font-semibold">
              Data Pemesan
            </p>

            <div>
              <label className="block font-body text-xs text-white/50 mb-1.5">
                Nama Lengkap <span className="text-red-400">*</span>
              </label>
              <input
                name="client_name"
                value={form.client_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-body text-sm placeholder:text-white/20 focus:outline-none focus:border-gold/40 transition-colors"
                placeholder="Nama Anda"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-body text-xs text-white/50 mb-1.5">
                  No. WhatsApp <span className="text-red-400">*</span>
                </label>
                <input
                  name="client_phone"
                  value={form.client_phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-body text-sm placeholder:text-white/20 focus:outline-none focus:border-gold/40 transition-colors"
                  placeholder="0812xxxxxxxx"
                />
              </div>
              <div>
                <label className="block font-body text-xs text-white/50 mb-1.5">
                  Email (opsional)
                </label>
                <input
                  name="client_email"
                  type="email"
                  value={form.client_email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-body text-sm placeholder:text-white/20 focus:outline-none focus:border-gold/40 transition-colors"
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/5" />

          {/* Event Info */}
          <div className="space-y-4">
            <p className="font-body text-xs text-gold uppercase tracking-wider font-semibold">
              Detail Acara
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-body text-xs text-white/50 mb-1.5">
                  Nama Mempelai Pria <span className="text-red-400">*</span>
                </label>
                <input
                  name="groom_name"
                  value={form.groom_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-body text-sm placeholder:text-white/20 focus:outline-none focus:border-gold/40 transition-colors"
                  placeholder="Nama lengkap"
                />
              </div>
              <div>
                <label className="block font-body text-xs text-white/50 mb-1.5">
                  Nama Mempelai Wanita <span className="text-red-400">*</span>
                </label>
                <input
                  name="bride_name"
                  value={form.bride_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-body text-sm placeholder:text-white/20 focus:outline-none focus:border-gold/40 transition-colors"
                  placeholder="Nama lengkap"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-body text-xs text-white/50 mb-1.5">
                  Perkiraan Tanggal Acara
                </label>
                <input
                  name="event_date"
                  type="date"
                  value={form.event_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-body text-sm placeholder:text-white/20 focus:outline-none focus:border-gold/40 transition-colors"
                />
              </div>
              <div>
                <label className="block font-body text-xs text-white/50 mb-1.5">
                  Lokasi Acara
                </label>
                <input
                  name="event_location"
                  value={form.event_location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-body text-sm placeholder:text-white/20 focus:outline-none focus:border-gold/40 transition-colors"
                  placeholder="Kota / Venue"
                />
              </div>
            </div>

            <div>
              <label className="block font-body text-xs text-white/50 mb-1.5">
                Catatan Tambahan
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-body text-sm placeholder:text-white/20 focus:outline-none focus:border-gold/40 transition-colors resize-none"
                placeholder="Ada request atau catatan khusus?"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || qtyNum < 1}
            className="w-full font-body text-sm font-semibold text-charcoal-dark bg-gold hover:bg-gold-light px-6 py-3.5 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading
              ? "Mengirim..."
              : qtyNum > 0
                ? `Kirim Pesanan — ${formatRp(priceInfo.total)}`
                : "Masukkan jumlah undangan dulu"}
          </button>

          <p className="font-body text-[10px] text-white/30 text-center">
            Setelah mengirim, Anda akan diarahkan ke halaman konfirmasi untuk
            melanjutkan via WhatsApp.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-charcoal-dark flex items-center justify-center">
          <p className="text-white/50 font-body text-sm">Memuat...</p>
        </div>
      }
    >
      <OrderFormContent />
    </Suspense>
  );
}
