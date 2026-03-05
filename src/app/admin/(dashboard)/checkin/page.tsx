"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { getActiveEventId } from "@/lib/admin/context";
import type { Guest } from "@/types";
import Badge from "@/components/ui/Badge";
import StatsCard from "@/components/admin/StatsCard";

export default function CheckinTrackerPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const handleToggleCheckin = async (guest: Guest) => {
    const newStatus = !guest.checked_in;

    const supabase = createClient();
    const { error } = await supabase
      .from("guests")
      .update({
        checked_in: newStatus,
        checked_in_at: newStatus ? new Date().toISOString() : null,
      })
      .eq("id", guest.id);

    if (error) {
      toast.error("Gagal mengubah status");
    } else {
      toast.success(
        newStatus
          ? `${guest.name} checked-in`
          : `${guest.name} check-in dibatalkan`,
      );
      setGuests(
        guests.map((g) =>
          g.id === guest.id
            ? {
                ...g,
                checked_in: newStatus,
                checked_in_at: newStatus ? new Date().toISOString() : null,
              }
            : g,
        ),
      );
    }
  };

  const checkedIn = guests.filter((g) => g.checked_in).length;
  const totalAttending = guests.length;
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

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari nama tamu..."
        className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-lg text-sm font-body focus:outline-none focus:border-gold/30"
      />

      {/* Guest List */}
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 font-body text-xs font-medium text-charcoal-light tracking-wider uppercase">
                  Nama
                </th>
                <th className="px-4 py-3 font-body text-xs font-medium text-charcoal-light tracking-wider uppercase">
                  Pax
                </th>
                <th className="px-4 py-3 font-body text-xs font-medium text-charcoal-light tracking-wider uppercase">
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
                    <td className="px-4 py-3 font-body text-sm font-medium text-charcoal-dark">
                      {guest.name}
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-charcoal">
                      {guest.rsvp_pax}
                    </td>
                    <td className="px-4 py-3">
                      {guest.checked_in ? (
                        <Badge variant="checked_in">Checked-in</Badge>
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
                      <button
                        onClick={() => handleToggleCheckin(guest)}
                        className={`px-3 py-1 text-xs font-body rounded-md transition-all duration-200 ${
                          guest.checked_in
                            ? "bg-red-50 text-red-500 hover:bg-red-100"
                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        }`}
                      >
                        {guest.checked_in ? "Batalkan" : "Check-in"}
                      </button>
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
