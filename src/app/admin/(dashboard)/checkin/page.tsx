"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { getActiveEventId } from "@/lib/admin/context";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Guest } from "@/types";
import Badge from "@/components/ui/Badge";
import StatsCard from "@/components/admin/StatsCard";

export default function CheckinTrackerPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingPaxId, setEditingPaxId] = useState<string | null>(null);
  const [tempPax, setTempPax] = useState<number>(0);

  const fetchGuests = useCallback(async () => {
    const eventId = getActiveEventId();
    if (!eventId) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .eq("event_id", eventId)
      .eq("rsvp_status", "attending")
      .order("name", { ascending: true });

    if (error) {
      toast.error("Gagal memuat data");
    } else {
      setGuests((data || []) as Guest[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  const handleIncrement = async (guest: Guest) => {
    const currentCount = guest.checked_in_count || 0;
    const totalPax = guest.rsvp_pax || 1;
    
    if (currentCount >= totalPax) {
      toast.info("Undangan sudah penuh");
      return;
    }

    const newCount = currentCount + 1;
    const isFinished = newCount >= totalPax;
    const now = new Date().toISOString();

    const supabase = createClient();
    const { error } = await supabase
      .from("guests")
      .update({
        checked_in_count: newCount,
        checked_in: isFinished,
        checked_in_at: guest.checked_in_at || now,
      })
      .eq("id", guest.id);

    if (error) {
      toast.error("Gagal melakukan check-in");
    } else {
      setGuests((prev) =>
        prev.map((g) =>
          g.id === guest.id
            ? {
                ...g,
                checked_in_count: newCount,
                checked_in: isFinished,
                checked_in_at: g.checked_in_at || now,
              }
            : g,
        ),
      );
      toast.success(`${guest.name}: ${newCount}/${totalPax} hadir`);
    }
  };

  const handleDecrement = async (guest: Guest) => {
    const currentCount = guest.checked_in_count || 0;
    if (currentCount <= 0) return;

    const newCount = currentCount - 1;
    const isFinished = false; // Decrementing usually means it's not finished anymore

    const supabase = createClient();
    const { error } = await supabase
      .from("guests")
      .update({
        checked_in_count: newCount,
        checked_in: isFinished,
        checked_in_at: newCount === 0 ? null : guest.checked_in_at,
      })
      .eq("id", guest.id);

    if (error) {
      toast.error("Gagal membatalkan check-in");
    } else {
      setGuests((prev) =>
        prev.map((g) =>
          g.id === guest.id
            ? {
                ...g,
                checked_in_count: newCount,
                checked_in: isFinished,
                checked_in_at: newCount === 0 ? null : g.checked_in_at,
              }
            : g,
        ),
      );
      toast.success(`${guest.name}: Undo check-in (${newCount}/${guest.rsvp_pax})`);
    }
  };

  const handleUpdatePax = async (guest: Guest, newPax: number) => {
    if (newPax < 1) {
      toast.error("Minimal 1 pax");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("guests")
      .update({
        rsvp_pax: newPax,
        max_pax: newPax, // Sync max_pax too
        // If they already checked in more than newPax, we might need to cap it,
        // but usually we just let the count be.
        checked_in: (guest.checked_in_count || 0) >= newPax,
      })
      .eq("id", guest.id);

    if (error) {
      toast.error("Gagal memperbarui pax");
    } else {
      setGuests((prev) =>
        prev.map((g) =>
          g.id === guest.id
            ? {
                ...g,
                rsvp_pax: newPax,
                max_pax: newPax,
                checked_in: (g.checked_in_count || 0) >= newPax,
              }
            : g,
        ),
      );
      toast.success(`${guest.name}: Pax diperbarui ke ${newPax}`);
      setEditingPaxId(null);
    }
  };

  const checkedIn = guests.filter((g) => g.checked_in).length;
  const totalAttending = guests.length;
  const totalPax = guests.reduce((sum, g) => sum + (g.rsvp_pax || 0), 0);
  const checkedInPax = guests.reduce(
    (sum, g) => sum + (g.checked_in_count || 0),
    0,
  );

  const filtered = guests.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-body text-2xl font-semibold text-charcoal-dark">
          Check-in Tracker
        </h1>
        <p className="font-body text-sm text-charcoal-light mt-1">
          Kelola kehadiran tamu di lokasi acara
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total RSVP Hadir"
          value={totalAttending}
          color="gold"
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          }
        />
        <StatsCard
          label="Checked-in"
          value={checkedIn}
          color="emerald"
          trend={`${totalAttending ? Math.round((checkedIn / totalAttending) * 100) : 0}%`}
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          }
        />
        <StatsCard
          label="Total Pax (RSVP)"
          value={totalPax}
          color="blue"
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatsCard
          label="Pax Hadir"
          value={checkedInPax}
          color="emerald"
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22,4 12,14.01 9,11.01" />
            </svg>
          }
        />
      </div>

      {/* Search & Scan Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama tamu..."
          className="flex-1 px-4 py-2.5 bg-white border border-gray-100 rounded-lg text-sm font-body focus:outline-none focus:border-gold/30"
        />
        <Link
          href="/admin/checkin/scanner"
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-charcoal-dark text-white rounded-lg hover:bg-charcoal transition-colors font-body text-sm font-medium whitespace-nowrap"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
            <rect x="7" y="7" width="10" height="10" rx="1" />
          </svg>
          Scan QR Code
        </Link>
        <button
          onClick={() => {
            const checkedInGuests = guests.filter((g) => g.checked_in);
            if (checkedInGuests.length === 0) {
              toast.error("Belum ada tamu yang check-in");
              return;
            }
            const headers = [
              "No",
              "Nama Tamu",
              "No HP",
              "Alokasi Pax",
              "Total Hadir",
              "Status Tamu",
              "Waktu Check-in",
            ];
            const rows = checkedInGuests.map((g, i) => [
              i + 1,
              g.name,
              g.phone_number || "-",
              g.max_pax || 2,
              `${g.checked_in_count || 1} / ${g.rsvp_pax || 0}`,
              g.rsvp_status === "attending" ? "Hadir" : "Pending",
              g.checked_in_at
                ? new Date(g.checked_in_at).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "-",
            ]);
            const csv = [headers, ...rows]
              .map((row) => row.map((v) => `"${v}"`).join(","))
              .join("\n");
            const blob = new Blob(["\uFEFF" + csv], {
              type: "text/csv;charset=utf-8;",
            });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `rekap-checkin-tamu.csv`;
            link.click();
            URL.revokeObjectURL(link.href);
            toast.success("Rekap check-in berhasil di-export!");
          }}
          className="flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-200 text-charcoal rounded-lg hover:bg-gray-50 transition-colors font-body text-sm font-medium whitespace-nowrap"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Guest List */}
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 font-body text-xs font-medium text-charcoal-light tracking-wider uppercase">
                  Nama
                </th>
                <th className="px-4 py-3 font-body text-xs font-medium text-charcoal-light tracking-wider uppercase hidden sm:table-cell">
                  Pax
                </th>
                <th className="px-4 py-3 font-body text-xs font-medium text-charcoal-light tracking-wider uppercase hidden sm:table-cell">
                  Status
                </th>
                <th className="px-4 py-3 font-body text-xs font-medium text-charcoal-light tracking-wider uppercase hidden sm:table-cell">
                  Waktu
                </th>
                <th className="px-4 py-3 font-body text-xs font-medium text-charcoal-light tracking-wider uppercase text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center font-body text-sm text-charcoal-light"
                  >
                    Memuat...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center font-body text-sm text-charcoal-light"
                  >
                    Tidak ada tamu ditemukan
                  </td>
                </tr>
              ) : (
                filtered.map((guest) => (
                  <tr
                    key={guest.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-body text-sm font-medium text-charcoal-dark">
                        {guest.name}
                      </p>

                       {/* Mobile Only: Stacked Info */}
                      <div className="flex items-center gap-2 mt-1 sm:hidden">
                        {editingPaxId === guest.id ? (
                           <div className="flex items-center gap-1.5 py-1">
                            <input
                              type="number"
                              min={1}
                              max={20}
                              value={tempPax}
                              onChange={(e) => setTempPax(Number(e.target.value))}
                              className="w-10 px-1 py-0.5 text-[10px] border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                              autoFocus
                            />
                            <button
                              onClick={() => handleUpdatePax(guest, tempPax)}
                              className="p-1 rounded bg-emerald-50 text-emerald-600"
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setEditingPaxId(null)}
                              className="p-1 rounded bg-red-50 text-red-400"
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <span 
                            onClick={() => {
                              setEditingPaxId(guest.id);
                              setTempPax(guest.rsvp_pax || 0);
                            }}
                            className="font-body text-[10px] text-charcoal-light flex items-center gap-1 cursor-pointer active:bg-gray-100 p-0.5 rounded transition-colors"
                          >
                            <svg
                              className="w-3 h-3"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                            </svg>
                            {guest.checked_in_count || 0} / {guest.rsvp_pax} Pax
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1 opacity-50">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </span>
                        )}
                        
                        {(guest.checked_in_count || 0) > 0 && (
                          <Badge variant={(guest.checked_in_count || 0) >= (guest.rsvp_pax || 0) ? "checked_in" : "pending"}>
                            {(guest.checked_in_count || 0) >= (guest.rsvp_pax || 0) ? "✓" : "..."}
                          </Badge>
                        )}
                      </div>

                    </td>
                    <td className="px-4 py-3 font-body text-sm text-charcoal hidden sm:table-cell">
                      {editingPaxId === guest.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={tempPax}
                            onChange={(e) => setTempPax(Number(e.target.value))}
                            className="w-12 px-1.5 py-0.5 text-xs border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdatePax(guest, tempPax)}
                            className="p-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            title="Simpan"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setEditingPaxId(null)}
                            className="p-1 rounded bg-red-50 text-red-400 hover:bg-red-100"
                            title="Batal"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => {
                            setEditingPaxId(guest.id);
                            setTempPax(guest.rsvp_pax || 0);
                          }}
                          className="group flex items-center gap-2 cursor-pointer hover:text-blue-600"
                          title="Klik untuk edit pax"
                        >
                          <span className="font-semibold">{guest.rsvp_pax}</span>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {guest.checked_in_count && guest.checked_in_count >= (guest.rsvp_pax || 0) ? (
                        <Badge variant="checked_in">Lengkap</Badge>
                      ) : guest.checked_in_count && guest.checked_in_count > 0 ? (
                        <Badge variant="pending">Hadir {guest.checked_in_count}/{guest.rsvp_pax}</Badge>
                      ) : (
                        <span className="font-body text-xs text-charcoal-light">
                          Belum hadir
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {guest.checked_in_at ? (
                        <span className="font-body text-xs text-charcoal-light">
                          {new Date(guest.checked_in_at).toLocaleTimeString(
                            "id-ID",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      ) : (
                        <span className="font-body text-xs text-charcoal-light/30">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Undo button */}
                        <button
                          onClick={() => handleDecrement(guest)}
                          disabled={(guest.checked_in_count || 0) <= 0}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-100 text-charcoal-light hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors disabled:opacity-20 disabled:hover:bg-transparent"
                          title="Undo / Kurangi"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </button>
                        
                        {/* Progress */}
                        <div className="min-w-[40px] text-center">
                          <span className={cn(
                            "font-body text-sm font-semibold",
                            (guest.checked_in_count || 0) > 0 ? "text-emerald-600" : "text-charcoal-light/40"
                          )}>
                            {guest.checked_in_count || 0}
                          </span>
                          <span className="text-charcoal-light/30 mx-0.5">/</span>
                          <span className="font-body text-xs text-charcoal-light">
                            {guest.rsvp_pax}
                          </span>
                        </div>

                        {/* Add button */}
                        <button
                          onClick={() => handleIncrement(guest)}
                          disabled={(guest.checked_in_count || 0) >= (guest.rsvp_pax || 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-colors disabled:opacity-20 disabled:hover:bg-emerald-50"
                          title="Check-in / Tambah"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
