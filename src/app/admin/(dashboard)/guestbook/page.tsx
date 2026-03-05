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
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 rounded-md text-xs font-body font-medium transition-all duration-200 ${
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
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
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

                  <p className="font-body text-[10px] text-charcoal-light/50 mt-2 pl-9">
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
                {entry.status === "pending" && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleModerate(entry.id, "approved")}
                      className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      ✓ Setuju
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleModerate(entry.id, "rejected")}
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      ✕ Tolak
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
