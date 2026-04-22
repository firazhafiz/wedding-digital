"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const WA_NUMBER = "6282332676848";

interface OrderData {
  id: string;
  package_type: string;
  guest_qty: number;
  total_price: number;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  groom_name: string;
  bride_name: string;
  event_date: string | null;
  event_location: string | null;
  notes: string | null;
  payment_status: string;
  payment_url: string | null;
  created_at: string;
}

function formatRp(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getPackageName(type: string) {
  const labels: Record<string, string> = {
    basic: "Basic",
    pro: "Pro",
    exclusive: "Exclusive",
    custom: "Custom",
    satuan: "Satuan (Legacy)",
    bundling: "Bundling (Legacy)",
    combine: "Combine (Legacy)",
  };
  return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const router = useRouter();

  const fetchOrder = useCallback(
    async (silent = false) => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      if (!silent) setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("order_requests")
        .select("*")
        .eq("id", orderId)
        .single();

      if (data) {
        // Fallback: If DB doesn't have payment_url yet, try local storage
        if (!data.payment_url) {
          const localUrl = localStorage.getItem("pendingPaymentUrl");
          if (localUrl) data.payment_url = localUrl;
        }

        setOrder(data);
        // Clear local storage if paid
        if (data.payment_status === "paid") {
          localStorage.removeItem("pendingOrderId");
          localStorage.removeItem("pendingPaymentUrl");
        }
      }
      if (!silent) setLoading(false);
    },
    [orderId],
  );

  useEffect(() => {
    fetchOrder();

    if (!orderId) return;

    // Auto-poll for status update if still pending
    let polls = 0;
    const maxPolls = 12; // Poll for 1 minute (12 * 5s)

    const interval = setInterval(async () => {
      if (polls >= maxPolls) {
        clearInterval(interval);
        return;
      }

      const supabase = createClient();
      const { data: statusCheck } = await supabase
        .from("order_requests")
        .select("payment_status")
        .eq("id", orderId)
        .single();

      if (statusCheck?.payment_status === "paid") {
        fetchOrder(true);
        clearInterval(interval);
      }

      polls++;
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId, fetchOrder]);

  const handleRefresh = () => fetchOrder();

  const handleCancel = async () => {
    if (
      !orderId ||
      !confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")
    )
      return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      if (res.ok) {
        localStorage.removeItem("pendingOrderId");
        localStorage.removeItem("pendingPaymentUrl");
        router.push("/");
      } else {
        const err = await res.json();
        alert(err.error || "Gagal membatalkan pesanan");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi");
    } finally {
      setCancelling(false);
    }
  };

  const waMessage = order
    ? encodeURIComponent(
        `Halo akadigital, saya telah melakukan pemesanan paket ${getPackageName(order.package_type)} untuk ${order.guest_qty || 0} undangan.\n\nDetail:\n- Nama: ${order.client_name}\n- Mempelai: ${order.groom_name} & ${order.bride_name}\n- Tanggal: ${order.event_date || "Belum ditentukan"}\n- Lokasi: ${order.event_location || "Belum ditentukan"}\n- Total Harga: ${formatRp(order.total_price || 0)}\n\nMohon konfirmasi pesanan saya. Terima kasih!`,
      )
    : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal-dark flex items-center justify-center">
        <p className="text-white/50 font-body text-sm">Memuat...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-charcoal-dark flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-body text-white/50 text-sm mb-4">
            Data pesanan tidak ditemukan.
          </p>
          <Link
            href="/"
            className="font-body text-sm text-gold hover:text-gold-light transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-charcoal-dark to-[#1a1a2e] py-20 px-6">
      <div className="max-w-lg mx-auto text-center">
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-emerald-400"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22,4 12,14.01 9,11.01" />
          </svg>
        </div>

        <h1 className="font-display text-3xl md:text-4xl text-white mb-3">
          {order.payment_status === "paid"
            ? "Pembayaran Berhasil!"
            : "Pesanan Terkirim!"}
        </h1>
        <p className="font-body text-white/50 text-sm mb-10">
          {order.payment_status === "paid"
            ? "Terima kasih, pembayaran Anda telah kami terima. Katalog undangan Anda sedang disiapkan secara otomatis."
            : `Terima kasih, ${order.client_name}. Pesanan Anda telah kami terima. Silakan selesaikan pembayaran untuk mengaktifkan fitur undangan Anda.`}
        </p>

        {/* Summary */}
        <div className="text-left bg-white/3 border border-white/10 rounded-xl p-6 mb-8">
          <p className="font-body text-xs text-gold uppercase tracking-wider font-semibold mb-4">
            Ringkasan Pesanan
          </p>

          <div className="space-y-3">
            {[
              {
                label: "Paket",
                value: `${getPackageName(order.package_type)} — ${formatRp(order.total_price || 0)}`,
              },
              {
                label: "Total Undangan",
                value: `${order.guest_qty || 0} pax`,
              },
              { label: "Nama Pemesan", value: order.client_name },
              { label: "WhatsApp", value: order.client_phone },
              ...(order.client_email
                ? [{ label: "Email", value: order.client_email }]
                : []),
              {
                label: "Mempelai",
                value: `${order.groom_name} & ${order.bride_name}`,
              },
              ...(order.event_date
                ? [{ label: "Tanggal Acara", value: order.event_date }]
                : []),
              ...(order.event_location
                ? [{ label: "Lokasi", value: order.event_location }]
                : []),
              ...(order.notes
                ? [{ label: "Catatan", value: order.notes }]
                : []),
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start justify-between gap-4"
              >
                <p className="font-body text-xs text-white/40 shrink-0">
                  {item.label}
                </p>
                <p className="font-body text-sm text-white text-right">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-5">
          {order.payment_status !== "paid" && order.payment_url ? (
            <div className="flex flex-col gap-3">
              <a
                href={order.payment_url}
                className="inline-flex items-center justify-center gap-3 font-body text-sm font-semibold text-charcoal-dark bg-gold hover:bg-gold-light px-8 py-3.5 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-gold/20"
              >
                Bayar Sekarang
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>
              <button
                onClick={() => handleRefresh()}
                className="text-[10px] font-body text-white/40 hover:text-white/60 transition-colors uppercase tracking-widest"
              >
                Sudah Bayar? Perbarui Status
              </button>
            </div>
          ) : (
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 font-body text-sm font-semibold text-white bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 px-8 py-3.5 rounded-lg transition-all duration-300"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Tanya Admin di WhatsApp
            </a>
          )}
        </div>

        <div>
          <Link
            href="/"
            className="font-body text-xs text-white/30 hover:text-white/50 transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>

        {order.payment_status !== "paid" && (
          <div className="mt-12 pt-8 border-t border-white/5">
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="font-body text-[10px] uppercase tracking-widest text-red-500 transition-colors disabled:opacity-50"
            >
              {cancelling
                ? "Membatalkan..."
                : "Batalkan Pesanan & Hapus Keranjang"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-charcoal-dark flex items-center justify-center">
          <p className="text-white/50 font-body text-sm">Memuat...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
