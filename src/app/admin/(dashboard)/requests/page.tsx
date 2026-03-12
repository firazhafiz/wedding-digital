"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { setActiveEventId } from "@/lib/admin/context";

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
  created_at: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Menunggu", color: "bg-yellow-100 text-yellow-700" },
  contacted: { label: "Dihubungi", color: "bg-blue-100 text-blue-700" },
  confirmed: {
    label: "Dikonfirmasi",
    color: "bg-emerald-100 text-emerald-700",
  },
  rejected: { label: "Ditolak", color: "bg-red-100 text-red-700" },
};

function formatRp(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getPackageLabel(type: string) {
  if (type === "satuan") return "Satuan";
  if (type === "bundling") return "Bundling";
  if (type === "combine") return "Combine";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export default function AdminRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<OrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  
  // Modal State
  const [confirmModal, setConfirmModal] = useState<{ id: string; req: OrderRequest } | null>(null);
  const [creatingEvent, setCreatingEvent] = useState(false);

  const fetchRequests = useCallback(async () => {
    const supabase = createClient();
    let query = supabase
      .from("order_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
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

  const updateStatus = async (id: string, newStatus: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("order_requests")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast.error("Gagal update status");
      return false;
    } else {
      toast.success("Status berhasil diupdate");
      fetchRequests();
      return true;
    }
  };

  const handleStatusChange = (req: OrderRequest, newStatus: string) => {
    if (newStatus === "confirmed" && req.status !== "confirmed") {
      setConfirmModal({ id: req.id, req });
    } else {
      updateStatus(req.id, newStatus);
    }
  };

  const handleConfirmAction = async (createCatalog: boolean) => {
    if (!confirmModal) return;
    const { id, req } = confirmModal;

    setCreatingEvent(true);
    
    // 1. Update status to confirmed
    const success = await updateStatus(id, "confirmed");
    
    if (success && createCatalog) {
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const groomFirstName = req.groom_name.trim().split(/\s+/)[0] || "groom";
      const brideFirstName = req.bride_name.trim().split(/\s+/)[0] || "bride";
      const slug = `${groomFirstName}-${brideFirstName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      const { data: eventData, error: eventError } = await supabase
        .from('event_info')
        .insert({
          user_id: user?.id || null,
          event_slug: slug,
          groom_name: req.groom_name,
          bride_name: req.bride_name,
        })
        .select()
        .single();
        
      if (eventError) {
        toast.error("Status dikonfirmasi, tapi gagal membuat katalog otomatis.");
        console.error(eventError);
      } else {
        toast.success("Katalog undangan berhasil dibuat!");
        setActiveEventId(eventData.id);
        router.push(`/admin/settings`);
        router.refresh();
        return;
      }
    }
    
    setConfirmModal(null);
    setCreatingEvent(false);
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
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto hide-scrollbar w-full sm:w-fit sm:flex-wrap">
          {["all", ...Object.keys(statusLabels)].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-body font-medium transition-all duration-200 whitespace-nowrap shrink-0 ${
                filter === f
                  ? "bg-white text-charcoal-dark shadow-sm"
                  : "text-charcoal-light hover:text-charcoal"
              }`}
            >
              {f === "all" ? "Semua" : statusLabels[f]?.label || f}
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
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusLabels[r.status]?.color || "bg-gray-100 text-gray-600"}`}
                    >
                      {statusLabels[r.status]?.label || r.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold/10 text-gold">
                      {getPackageLabel(r.package_type)}
                    </span>
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
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`https://wa.me/62${r.client_phone.replace(/^0/, "")}?text=${encodeURIComponent(`Halo ${r.client_name}, terima kasih telah memesan undangan digital di akadigital. Saya ingin mengkonfirmasi pesanan Anda untuk undangan ${r.groom_name} & ${r.bride_name}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-md text-xs font-body font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                  >
                    WA Client
                  </a>
                  <div className="relative group/select min-w-[130px]">
                    <select
                      value={r.status}
                      onChange={(e) => handleStatusChange(r, e.target.value)}
                      className={cn(
                        "appearance-none w-full px-3 py-1.5 pr-8 rounded-md text-[11px] font-body font-semibold border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all",
                        statusLabels[r.status]?.color ||
                          "bg-gray-100 text-gray-700",
                      )}
                    >
                      <option value="pending">Menunggu</option>
                      <option value="contacted">Dihubungi</option>
                      <option value="confirmed">Dikonfirmasi</option>
                      <option value="rejected">Ditolak</option>
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-60">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <h3 className="font-display text-xl text-charcoal-dark mb-2">
              Pesanan Dikonfirmasi
            </h3>
            <p className="font-body text-sm text-charcoal-light mb-6 leading-relaxed">
              Anda mengubah status pesanan menjadi <span className="font-semibold text-emerald-600">Dikonfirmasi</span>. 
              Apakah Anda ingin otomatis membuat <b>Katalog Event</b> baru dengan nama mempelai <b>{confirmModal.req.groom_name} & {confirmModal.req.bride_name}</b>?
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleConfirmAction(true)}
                disabled={creatingEvent}
                className="w-full py-3 px-4 rounded-xl font-body text-sm font-semibold bg-charcoal-dark text-white hover:bg-charcoal transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creatingEvent ? (
                  "Memproses..."
                ) : (
                  <>
                    Ya, Buat Katalog Sekarang
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
              
              <button
                onClick={() => handleConfirmAction(false)}
                disabled={creatingEvent}
                className="w-full py-3 px-4 rounded-xl font-body text-sm font-semibold text-charcoal-dark bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Tidak, Hanya Update Status Saja
              </button>

              <button
                onClick={() => setConfirmModal(null)}
                disabled={creatingEvent}
                className="w-full py-2 px-4 rounded-xl font-body text-xs font-medium text-charcoal-light hover:text-charcoal transition-colors disabled:opacity-50 mt-1"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
