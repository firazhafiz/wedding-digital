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

const statusConfig = {
  pending: {
    label: "Menunggu",
    color: "bg-amber-50 text-amber-600 border-amber-200/50",
    hover: "hover:bg-amber-100",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    )
  },
  contacted: {
    label: "Dihubungi",
    color: "bg-blue-50 text-blue-600 border-blue-200/50",
    hover: "hover:bg-blue-100",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    )
  },
  confirmed: {
    label: "Dikonfirmasi",
    color: "bg-emerald-50 text-emerald-600 border-emerald-200/50",
    hover: "hover:bg-emerald-100",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )
  },
  rejected: {
    label: "Ditolak",
    color: "bg-rose-50 text-rose-600 border-rose-200/50",
    hover: "hover:bg-rose-100",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    )
  },
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

function StatusDropdown({
  request: r,
  onStatusChange,
}: {
  request: OrderRequest;
  onStatusChange: (newStatus: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const config = statusConfig[r.status as keyof typeof statusConfig] || statusConfig.pending;

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = () => setIsOpen(false);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [isOpen]);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 outline-none w-full min-w-[140px] justify-between",
          config.color,
          config.hover,
          isOpen ? "ring-2 ring-offset-1 ring-emerald-100" : "shadow-sm"
        )}
      >
        <div className="flex items-center gap-2">
          {config.icon}
          {config.label}
        </div>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className={cn("transition-transform duration-200", isOpen && "rotate-180")}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-full min-w-[160px] bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="p-1.5 flex flex-col gap-1">
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => {
                  onStatusChange(key);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 w-full text-left",
                  r.status === key
                    ? cfg.color
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <div className={cn("p-1 rounded-md", r.status === key ? "bg-white/50" : "bg-gray-100/50")}>
                  {cfg.icon}
                </div>
                {cfg.label}
                {r.status === key && (
                  <div className="ml-auto">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
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
      let slug = `${groomFirstName}-${brideFirstName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // Check for slug collision
      const { data: existingEvent } = await supabase
        .from('event_info')
        .select('id')
        .eq('event_slug', slug)
        .maybeSingle();

      if (existingEvent) {
        // Append a random 3-char suffix if collision
        const suffix = Math.random().toString(36).substring(2, 5);
        slug = `${slug}-${suffix}`;
      }

      // Determine guest limit based on package tier
      let guestLimit = req.guest_qty || 0;
      if (req.package_type === "basic") guestLimit = 100;
      else if (req.package_type === "pro") guestLimit = 300;
      else if (req.package_type === "exclusive") guestLimit = 500;
      else if (req.package_type === "custom") guestLimit = req.guest_qty || 500;

      const { data: eventData, error: eventError } = await supabase
        .from('event_info')
        .insert({
          user_id: user?.id || null,
          event_slug: slug,
          groom_name: req.groom_name,
          bride_name: req.bride_name,
          package_type: req.package_type,
          guest_limit: guestLimit,
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
          {["all", ...Object.keys(statusConfig)].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-body font-medium transition-all duration-200 whitespace-nowrap shrink-0 ${
                filter === f
                  ? "bg-white text-charcoal-dark shadow-sm"
                  : "text-charcoal-light hover:text-charcoal"
              }`}
            >
              {f === "all" ? "Semua" : (statusConfig[f as keyof typeof statusConfig]?.label || f)}
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
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                        statusConfig[r.status as keyof typeof statusConfig]?.color || "bg-gray-100 text-gray-600 border-gray-200"
                      )}
                    >
                      {statusConfig[r.status as keyof typeof statusConfig]?.icon}
                      {statusConfig[r.status as keyof typeof statusConfig]?.label || r.status}
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
                <div className="flex items-center gap-3 shrink-0">
                  <WaButton request={r} />
                  <StatusDropdown 
                    request={r} 
                    onStatusChange={(newStatus) => handleStatusChange(r, newStatus)} 
                  />
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
