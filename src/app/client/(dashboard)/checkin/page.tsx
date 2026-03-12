"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useClientEventId } from "@/components/client/ClientEventContext";
import Link from "next/link";
import type { Guest } from "@/types";
import Badge from "@/components/ui/Badge";
import StatsCard from "@/components/admin/StatsCard";

export default function ClientCheckinPage() {
  const eventId = useClientEventId();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchGuests = useCallback(async () => {
    if (!eventId) return;

    try {
      const res = await fetch(
        `/api/guests?event_id=${eventId}&rsvp_status=attending`,
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal memuat data");
      } else {
        setGuests((data.data || []) as Guest[]);
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  const handleCheckin = async (guestId: string) => {
    const checked_in_at = new Date().toISOString();
    try {
      const res = await fetch("/api/guests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: guestId,
          event_id: eventId,
          checked_in: true,
          checked_in_at,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal check-in");
      } else {
        toast.success("Tamu berhasil di-check-in!");
        setGuests((prev) =>
          prev.map((g) =>
            g.id === guestId
              ? {
                  ...g,
                  checked_in: true,
                  checked_in_at,
                }
              : g,
          ),
        );
      }
    } catch {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleUndoCheckin = async (guestId: string) => {
    try {
      const res = await fetch("/api/guests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: guestId,
          event_id: eventId,
          checked_in: false,
          checked_in_at: null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal membatalkan check-in");
      } else {
        toast.success("Check-in dibatalkan");
        setGuests((prev) =>
          prev.map((g) =>
            g.id === guestId
              ? { ...g, checked_in: false, checked_in_at: null }
              : g,
          ),
        );
      }
    } catch {
      toast.error("Terjadi kesalahan");
    }
  };

  const totalAttending = guests.length;
  const checkedIn = guests.filter((g) => g.checked_in).length;
  const totalPax = guests.reduce((sum, g) => sum + (g.rsvp_pax || 0), 0);
  const checkedInPax = guests
    .filter((g) => g.checked_in)
    .reduce((sum, g) => sum + (g.rsvp_pax || 0), 0);

  const filtered = guests.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-body text-2xl font-semibold text-charcoal-dark">
            Check-in Tamu
          </h1>
          <p className="font-body text-sm text-charcoal-light mt-1">
            Kelola kehadiran tamu di hari acara
          </p>
        </div>
        <Link
          href="/client/checkin/scanner"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-body font-medium hover:bg-blue-700 transition-colors w-fit"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          QR Scanner
        </Link>
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

      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama tamu..."
          className="flex-1 w-full px-4 py-2.5 bg-white border border-gray-100 rounded-lg text-sm font-body focus:outline-none focus:border-blue-400/30"
        />
        <button
          onClick={() => {
            const checkedInGuests = guests.filter((g) => g.checked_in);
            if (checkedInGuests.length === 0) {
              toast.error("Belum ada tamu yang check-in");
              return;
            }
            const headers = [
              "Nama",
              "Slug",
              "No HP",
              "Waktu Check-in",
              "Jumlah Hadir",
              "Pesan",
            ];
            const rows = checkedInGuests.map((g) => [
              g.name,
              g.slug,
              g.phone_number || "",
              g.checked_in_at
                ? new Date(g.checked_in_at).toLocaleString("id-ID")
                : "",
              g.rsvp_pax,
              g.rsvp_message || "",
            ]);
            const csv = [headers, ...rows]
              .map((row) => row.map((v) => `"${v}"`).join(","))
              .join("\n");
            const blob = new Blob(["\uFEFF" + csv], {
              type: "text/csv;charset=utf-8;",
            });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            // using "event" as a fallback since event_slug is not fetched directly here
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

      {/* Table */}
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
                <th className="px-4 py-3 font-body text-xs font-medium text-charcoal-light tracking-wider uppercase text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center font-body text-sm text-charcoal-light"
                  >
                    Memuat...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center font-body text-sm text-charcoal-light"
                  >
                    Tidak ada tamu
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
                      <div className="sm:hidden mt-1 flex items-center gap-2">
                        <span className="font-body text-[10px] text-charcoal-light">
                          {guest.rsvp_pax} pax
                        </span>
                        {guest.checked_in && (
                          <Badge variant="checked_in">✓</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-charcoal hidden sm:table-cell">
                      {guest.rsvp_pax}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {guest.checked_in ? (
                        <Badge variant="checked_in">✓ Checked-in</Badge>
                      ) : (
                        <span className="font-body text-xs text-charcoal-light/40">
                          Belum
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {guest.checked_in ? (
                        <button
                          onClick={() => handleUndoCheckin(guest.id)}
                          className="px-3 py-1.5 rounded-md text-xs font-body font-medium bg-gray-100 text-charcoal-light hover:bg-gray-200 transition-colors"
                        >
                          Undo
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCheckin(guest.id)}
                          className="px-3 py-1.5 rounded-md text-xs font-body font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                          Check-in
                        </button>
                      )}
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
