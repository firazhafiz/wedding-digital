"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const WA_NUMBER = "6282332676848";

interface OrderData {
  id: string;
  package_type: string;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  groom_name: string;
  bride_name: string;
  event_date: string | null;
  event_location: string | null;
  notes: string | null;
  created_at: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("order_requests")
        .select("*")
        .eq("id", orderId)
        .single();
      if (data) setOrder(data);
      setLoading(false);
    };
    fetchOrder();
  }, [orderId]);

  const waMessage = order
    ? encodeURIComponent(
        `Halo akadigital, saya telah melakukan pemesanan paket Starter.\n\nDetail:\n- Nama: ${order.client_name}\n- Mempelai: ${order.groom_name} & ${order.bride_name}\n- Tanggal: ${order.event_date || "Belum ditentukan"}\n- Lokasi: ${order.event_location || "Belum ditentukan"}\n\nMohon konfirmasi pesanan saya. Terima kasih!`,
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
          Pesanan Terkirim!
        </h1>
        <p className="font-body text-white/50 text-sm mb-10">
          Terima kasih, {order.client_name}. Pesanan Anda telah kami terima.
          Silakan konfirmasi melalui WhatsApp untuk proses selanjutnya.
        </p>

        {/* Summary */}
        <div className="text-left bg-white/3 border border-white/10 rounded-xl p-6 mb-8">
          <p className="font-body text-xs text-gold uppercase tracking-wider font-semibold mb-4">
            Ringkasan Pesanan
          </p>

          <div className="space-y-3">
            {[
              { label: "Paket", value: "Starter — Rp 299.000" },
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
        <a
          href={`https://wa.me/${WA_NUMBER}?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 font-body text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-8 py-3.5 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-emerald-600/20 mb-4"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Konfirmasi via WhatsApp
        </a>

        <div>
          <Link
            href="/"
            className="font-body text-xs text-white/30 hover:text-white/50 transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
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
