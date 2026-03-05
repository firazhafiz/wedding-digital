"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface OrderRequest {
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

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<OrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

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
    } else {
      toast.success("Status berhasil diupdate");
      fetchRequests();
    }
  };

  const filtered = requests;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-charcoal-dark">Request</h1>
          <p className="font-body text-sm text-charcoal-light mt-1">
            {filtered.length} pesanan masuk
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          {["all", "pending", "contacted", "confirmed", "rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-body font-medium transition-colors cursor-pointer ${
                filter === f
                  ? "bg-charcoal-dark text-white"
                  : "bg-gray-100 text-charcoal-light hover:bg-gray-200"
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
        <div className="space-y-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-lg border border-gray-100 p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
                      {r.package_type === "starter" ? "Starter" : "Custom"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-1">
                    <p className="font-body text-xs text-charcoal-light">
                      <span className="text-charcoal/60">Pemesan:</span>{" "}
                      {r.client_name}
                    </p>
                    <p className="font-body text-xs text-charcoal-light">
                      <span className="text-charcoal/60">WA:</span>{" "}
                      {r.client_phone}
                    </p>
                    {r.client_email && (
                      <p className="font-body text-xs text-charcoal-light">
                        <span className="text-charcoal/60">Email:</span>{" "}
                        {r.client_email}
                      </p>
                    )}
                    {r.event_date && (
                      <p className="font-body text-xs text-charcoal-light">
                        <span className="text-charcoal/60">Tanggal:</span>{" "}
                        {r.event_date}
                      </p>
                    )}
                    {r.event_location && (
                      <p className="font-body text-xs text-charcoal-light">
                        <span className="text-charcoal/60">Lokasi:</span>{" "}
                        {r.event_location}
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
                      onChange={(e) => updateStatus(r.id, e.target.value)}
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
    </div>
  );
}
