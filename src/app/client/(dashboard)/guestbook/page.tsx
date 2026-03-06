"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useClientEventId } from "@/components/client/ClientEventContext";
import type { GuestbookEntry } from "@/types";

export default function ClientGuestbookPage() {
  const eventId = useClientEventId();
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">(
    "pending",
  );

  const fetchEntries = useCallback(async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`/api/guestbook?event_id=${eventId}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal memuat ucapan");
      } else {
        setEntries((data.data || []) as GuestbookEntry[]);
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleStatusChange = async (
    id: string,
    status: "approved" | "rejected",
  ) => {
    try {
      const res = await fetch("/api/guestbook", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Gagal mengubah status");
      } else {
        toast.success(
          status === "approved" ? "Ucapan disetujui" : "Ucapan ditolak",
        );
        setEntries(entries.map((e) => (e.id === id ? { ...e, status } : e)));
      }
    } catch {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleDelete = async (id: string) => {
    toast("Yakin ingin menghapus ucapan ini?", {
      action: {
        label: "Hapus",
        onClick: async () => {
          try {
            const res = await fetch(`/api/guestbook?id=${id}`, {
              method: "DELETE",
            });
            const data = await res.json();
            if (!res.ok) {
              toast.error(data.error || "Gagal menghapus ucapan");
            } else {
              toast.success("Ucapan berhasil dihapus");
              setEntries((prev) => prev.filter((e) => e.id !== id));
            }
          } catch {
            toast.error("Terjadi kesalahan");
          }
        },
      },
      cancel: {
        label: "Batal",
        onClick: () => {},
      },
    });
  };

  const filterTabs = [
    { key: "pending" as const, label: "Pending" },
    { key: "approved" as const, label: "Approved" },
    { key: "rejected" as const, label: "Rejected" },
  ];

  const filtered = entries.filter((e) => e.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-body text-2xl font-semibold text-charcoal-dark">
          Ucapan
        </h1>
        <p className="font-body text-sm text-charcoal-light mt-1">
          {entries.length} ucapan masuk
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-body font-medium transition-all duration-200 ${
              filter === tab.key
                ? "bg-white text-charcoal-dark shadow-sm"
                : "text-charcoal-light hover:text-charcoal"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-[10px] opacity-60">
              ({entries.filter((e) => e.status === tab.key).length})
            </span>
          </button>
        ))}
      </div>

      {/* Entries */}
      {loading ? (
        <div className="text-center py-12">
          <p className="font-body text-sm text-charcoal-light">Memuat...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
          <p className="font-body text-sm text-charcoal-light">
            Tidak ada ucapan {filter}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-lg border border-gray-100 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                      <span className="font-body text-[10px] font-semibold text-blue-500">
                        {entry.guest_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="font-body text-sm font-semibold text-charcoal-dark">
                      {entry.guest_name}
                    </p>
                  </div>
                  <p className="font-body text-sm text-charcoal-light leading-relaxed">
                    {entry.message}
                  </p>
                  <p
                    className="font-body text-[10px] text-charcoal-light/50 mt-2"
                    suppressHydrationWarning
                  >
                    {new Date(entry.created_at).toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {filter === "pending" && (
                    <>
                      <button
                        onClick={() => handleStatusChange(entry.id, "approved")}
                        className="p-1.5 rounded text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="Setujui"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleStatusChange(entry.id, "rejected")}
                        className="p-1.5 rounded text-red-500 hover:bg-red-50 transition-colors"
                        title="Tolak"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-1.5 rounded text-charcoal-light hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Hapus"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <polyline points="3,6 5,6 21,6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
