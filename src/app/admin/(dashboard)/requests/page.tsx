"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface OrderRequest {
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
  status: string;
  payment_status: string;
  payment_url: string | null;
  created_at: string;
}

// Removed statusConfig as we now rely on payment_status logic

function formatRp(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getPackageLabel(type: string) {
  const labels: Record<string, string> = {
    basic: "Basic",
    pro: "Pro",
    exclusive: "Exclusive",
    elite: "Elite",
    custom: "Custom (Legacy)",
    satuan: "Satuan (Legacy)",
    bundling: "Bundling (Legacy)",
    combine: "Combine (Legacy)",
  };
  return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
}

function WaButton({ request: r }: { request: OrderRequest }) {
  return (
    <a
      href={`https://wa.me/62${r.client_phone.replace(/^0/, "")}?text=${encodeURIComponent(`Halo ${r.client_name}, terima kasih telah memesan undangan digital di akadigital. Saya ingin mengkonfirmasi pesanan Anda untuk undangan ${r.groom_name} & ${r.bride_name}.`)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-body font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-all active:scale-[0.98]"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.877 1.215 3.076.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
      WA Client
    </a>
  );
}

// Removed StatusDropdown as it's no longer needed with automated payments

export default function AdminRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<OrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  
  // Modal State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("order_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter === "paid") {
      query = query.eq("payment_status", "paid");
    } else if (filter === "pending") {
      query = query.eq("payment_status", "pending");
    }

    const { data, error } = await query;
    if (error) {
      toast.error("Gagal memuat data request");
    } else {
      setRequests((data || []) as OrderRequest[]);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const deleteRequest = async () => {
    if (!deleteId) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("order_requests")
      .delete()
      .eq("id", deleteId);

    if (error) {
      toast.error("Gagal menghapus data");
    } else {
      toast.success("Data berhasil dihapus");
      fetchRequests();
    }
    setDeleteId(null);
  };

  const filtered = requests;

  return (
    <div className="space-y-6 w-full relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-charcoal-dark">Request</h1>
          <p className="font-body text-sm text-charcoal-light mt-1">
            {filtered.length} pesanan masuk
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto hide-scrollbar w-full sm:w-fit">
          {[
            { id: "all", label: "Semua" },
            { id: "pending", label: "Belum Bayar" },
            { id: "paid", label: "Sudah Bayar" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-1.5 rounded-md text-sm font-body font-medium transition-all duration-200 whitespace-nowrap shrink-0 ${
                filter === f.id
                  ? "bg-white text-charcoal-dark shadow-sm"
                  : "text-charcoal-light hover:text-charcoal"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="font-body text-sm text-charcoal-light">Memuat...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
          <p className="font-body text-sm text-charcoal-light">
            Belum ada request masuk.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-lg border border-gray-100 p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                {/* Info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-body text-sm font-semibold text-charcoal-dark">
                      {r.groom_name} & {r.bride_name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold/10 text-gold">
                      {getPackageLabel(r.package_type)}
                    </span>
                    {r.payment_status === "paid" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-sm shadow-emerald-100 flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        LUNAS
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-600 border border-amber-200">
                        PENDING PAYMENT
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col gap-2 w-full min-w-0">
                    <p className="font-body text-xs text-charcoal-light flex items-start gap-2 w-full">
                      <span className="text-charcoal/60 w-[80px] shrink-0">
                        Paket:
                      </span>
                      <span className="flex-1 min-w-0 break-all font-medium text-gold-dark">
                        {getPackageLabel(r.package_type)}
                      </span>
                    </p>
                    <p className="font-body text-xs text-charcoal-light flex items-start gap-2 w-full">
                      <span className="text-charcoal/60 w-[80px] shrink-0">
                        Undangan:
                      </span>
                      <span className="flex-1 min-w-0 break-all font-medium">
                        {r.guest_qty > 0 ? `${r.guest_qty} orang (pax)` : "-"}
                      </span>
                    </p>
                    <p className="font-body text-xs text-charcoal-light flex items-start gap-2 w-full">
                      <span className="text-charcoal/60 w-[80px] shrink-0">
                        Total Harga:
                      </span>
                      <span className="flex-1 min-w-0 break-all font-medium text-emerald-600">
                        {r.total_price > 0 ? formatRp(r.total_price) : "-"}
                      </span>
                    </p>
                    <p className="font-body text-xs text-charcoal-light flex items-start gap-2 w-full mt-2">
                      <span className="text-charcoal/60 w-[80px] shrink-0">
                        Pemesan:
                      </span>
                      <span className="flex-1 min-w-0 break-all">
                        {r.client_name}
                      </span>
                    </p>
                    <p className="font-body text-xs text-charcoal-light flex items-start gap-2 w-full">
                      <span className="text-charcoal/60 w-[80px] shrink-0">
                        WA:
                      </span>
                      <span className="flex-1 min-w-0 break-all">
                        {r.client_phone}
                      </span>
                    </p>
                    {r.client_email && (
                      <p className="font-body text-xs text-charcoal-light flex items-start gap-2 w-full">
                        <span className="text-charcoal/60 w-[80px] shrink-0">
                          Email:
                        </span>
                        <span className="flex-1 min-w-0 break-all">
                          {r.client_email}
                        </span>
                      </p>
                    )}
                    {r.event_date && (
                      <p className="font-body text-xs text-charcoal-light flex items-start gap-2 w-full">
                        <span className="text-charcoal/60 w-[80px] shrink-0">
                          Tanggal:
                        </span>
                        <span className="flex-1 min-w-0 break-all">
                          {r.event_date}
                        </span>
                      </p>
                    )}
                    {r.event_location && (
                      <p className="font-body text-xs text-charcoal-light flex items-start gap-2 w-full">
                        <span className="text-charcoal/60 w-[80px] shrink-0">
                          Lokasi:
                        </span>
                        <span className="flex-1 min-w-0 break-all">
                          {r.event_location}
                        </span>
                      </p>
                    )}
                  </div>

                  {r.notes && (
                    <p className="font-body text-xs text-charcoal-light italic">
                      &ldquo;{r.notes}&rdquo;
                    </p>
                  )}

                  <p className="font-body text-[10px] text-charcoal-light/50">
                    {new Date(r.created_at).toLocaleString("id-ID")}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setDeleteId(r.id)}
                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Hapus Request"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                  <WaButton request={r} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-600">
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </div>
            <h3 className="font-display text-xl text-charcoal-dark mb-2">
              Hapus Pesanan?
            </h3>
            <p className="font-body text-sm text-charcoal-light mb-6">
              Tindakan ini tidak dapat dibatalkan. Data pesanan akan dihapus secara permanen dari sistem.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 px-4 rounded-xl font-body text-sm font-semibold text-charcoal-light bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={deleteRequest}
                className="flex-1 py-2.5 px-4 rounded-xl font-body text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
