"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { getActiveEventId } from "@/lib/admin/context";
import type { GuestbookEntry } from "@/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export default function GuestbookModerationPage() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");

  const fetchEntries = useCallback(async () => {
    const eventId = getActiveEventId();
    if (!eventId) return;

    const supabase = createClient();
    let query = supabase
      .from("guestbook")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Gagal memuat ucapan");
    } else {
      setEntries((data || []) as GuestbookEntry[]);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchEntries();
  }, [fetchEntries]);

  const handleModerate = async (
    id: string,
    status: "approved" | "rejected",
  ) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("guestbook")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Gagal mengubah status");
    } else {
      toast.success(
        status === "approved" ? "Ucapan disetujui" : "Ucapan ditolak",
      );
      setEntries(entries.map((e) => (e.id === id ? { ...e, status } : e)));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus ucapan ini secara permanen?")) return;

    const supabase = createClient();
    const { error } = await supabase.from("guestbook").delete().eq("id", id);

    if (error) {
      toast.error("Gagal menghapus ucapan");
    } else {
      toast.success("Ucapan berhasil dihapus");
      setEntries(entries.filter((e) => e.id !== id));
    }
  };

  const filterTabs = [
    { key: "pending" as const, label: "Pending" },
    { key: "approved" as const, label: "Approved" },
    { key: "rejected" as const, label: "Rejected" },
    { key: "all" as const, label: "Semua" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-body text-2xl font-semibold text-charcoal-dark">
          Moderasi Ucapan
        </h1>
        <p className="font-body text-sm text-charcoal-light mt-1">
          Kelola ucapan dan doa dari tamu undangan
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto hide-scrollbar sm:flex-wrap">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 rounded-md text-xs font-body font-medium transition-all duration-200 whitespace-nowrap shrink-0 ${
              filter === tab.key
                ? "bg-white text-charcoal-dark shadow-sm"
                : "text-charcoal-light hover:text-charcoal"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-100 p-10 text-center">
            <p className="font-body text-sm text-charcoal-light">Memuat...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-100 p-10 text-center">
            <p className="font-body text-sm text-charcoal-light">
              Tidak ada ucapan{" "}
              {filter !== "all" ? `dengan status "${filter}"` : ""}
            </p>
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-lg border border-gray-100 p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                      <span className="font-body text-[10px] font-semibold text-gold">
                        {entry.guest_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="font-body text-sm font-medium text-charcoal-dark">
                      {entry.guest_name}
                    </p>
                    <Badge variant={entry.status}>{entry.status}</Badge>
                  </div>

                  <p className="font-body text-sm text-charcoal leading-relaxed pl-9">
                    {entry.message}
                  </p>

                  <p
                    className="font-body text-[10px] text-charcoal-light/50 mt-2 pl-9"
                    suppressHydrationWarning
                  >
                    {new Date(entry.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 border-t border-gray-100 pt-3 sm:border-0 sm:pt-0 mt-2 sm:mt-0">
                  {entry.status === "pending" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleModerate(entry.id, "approved")}
                        className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-body"
                      >
                        ✓ Setuju
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleModerate(entry.id, "rejected")}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 font-body"
                      >
                        ✕ Tolak
                      </Button>
                    </>
                  )}
                  {entry.status === "approved" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-500 hover:bg-red-50 hover:text-red-600 font-body"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="mr-1"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      Hapus
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
