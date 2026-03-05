"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function OrderFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get("plan") || "starter";

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
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, package_type: plan }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      // Redirect to success with order ID
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
          href="/"
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
          Kembali
        </Link>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/20 bg-gold/5 mb-4">
            <span className="font-body text-[10px] text-gold uppercase tracking-wider font-semibold">
              Paket Starter
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-white mb-2">
            Formulir Pemesanan
          </h1>
          <p className="font-body text-white/50 text-sm">
            Isi data berikut untuk memulai pembuatan undangan digital Anda.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
            disabled={loading}
            className="w-full font-body text-sm font-semibold text-charcoal-dark bg-gold hover:bg-gold-light px-6 py-3.5 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Mengirim..." : "Kirim Pesanan — Rp 299.000"}
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
