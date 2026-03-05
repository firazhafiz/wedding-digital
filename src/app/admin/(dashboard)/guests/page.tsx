"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { getActiveEventId } from "@/lib/admin/context";
import type { Guest } from "@/types";
import { generateSlug, generateQrToken } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/constants";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Papa from "papaparse";

export default function GuestManagementPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newMaxPax, setNewMaxPax] = useState(2);
  const [addLoading, setAddLoading] = useState(false);
  const [eventSlug, setEventSlug] = useState("");

  const fetchGuests = useCallback(async () => {
    const eventId = getActiveEventId();
    if (!eventId) return;

    const supabase = createClient();

    // Fetch event slug if not already set
    if (!eventSlug) {
      const { data: eventData } = await supabase
        .from("event_info")
        .select("event_slug")
        .eq("id", eventId)
        .single();
      if (eventData) setEventSlug(eventData.event_slug);
    }

    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Gagal memuat data tamu");
    } else {
      setGuests((data || []) as Guest[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setAddLoading(true);
    try {
      const eventId = getActiveEventId();
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          max_pax: newMaxPax,
          event_id: eventId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal menambah tamu");
        return;
      }

      toast.success("Tamu berhasil ditambahkan");
      setNewName("");
      setNewMaxPax(2);
      setShowAddForm(false);
      fetchGuests();
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setAddLoading(false);
    }
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse<{ name: string; max_pax?: string }>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data;
        if (!rows.length) {
          toast.error("CSV kosong");
          return;
        }

        const eventId = getActiveEventId();
        const guestsToInsert = rows
          .filter((row) => row.name?.trim())
          .map((row) => ({
            name: row.name.trim(),
            slug: generateSlug(row.name.trim()),
            max_pax: row.max_pax ? parseInt(row.max_pax) || 2 : 2,
            qr_token: generateQrToken(),
            event_id: eventId,
          }));

        const supabase = createClient();
        const { error } = await supabase.from("guests").insert(guestsToInsert);

        if (error) {
          toast.error("Gagal import CSV: " + error.message);
        } else {
          toast.success(`${guestsToInsert.length} tamu berhasil diimport`);
          fetchGuests();
        }
      },
      error: () => {
        toast.error("Gagal membaca file CSV");
      },
    });

    e.target.value = "";
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus tamu ini?")) return;

    const supabase = createClient();
    const { error } = await supabase.from("guests").delete().eq("id", id);

    if (error) {
      toast.error("Gagal menghapus tamu");
    } else {
      toast.success("Tamu dihapus");
      setGuests(guests.filter((g) => g.id !== id));
    }
  };

  const handleCopyLink = (slug: string) => {
    const link = `${SITE_CONFIG.baseUrl}/${eventSlug}/to/${slug}`;
    navigator.clipboard.writeText(link);
    toast.success("Link disalin");
  };

  const filtered = guests.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-body text-2xl font-semibold text-charcoal-dark">
            Daftar Tamu
          </h1>
          <p className="font-body text-sm text-charcoal-light mt-1">
            {guests.length} tamu terdaftar
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* CSV Import */}
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvImport}
              className="hidden"
            />
            <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-body border border-gray-200 rounded-md text-charcoal hover:bg-gray-50 transition-colors">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17,8 12,3 7,8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Import CSV
            </span>
          </label>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            + Tambah Tamu
          </Button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddGuest}
          className="bg-white rounded-lg border border-gray-100 p-5 flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nama lengkap tamu"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm font-body focus:outline-none focus:border-gold/40"
          />
          <select
            value={newMaxPax}
            onChange={(e) => setNewMaxPax(Number(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-md text-sm font-body focus:outline-none focus:border-gold/40"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                Max {n} pax
              </option>
            ))}
          </select>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={addLoading}
          >
            Simpan
          </Button>
        </form>
      )}

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari nama tamu..."
        className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-lg text-sm font-body focus:outline-none focus:border-gold/30"
      />

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
                  Status
                </th>
                <th className="px-4 py-3 font-body text-xs font-medium text-charcoal-light tracking-wider uppercase hidden md:table-cell">
                  Pax
                </th>
                <th className="px-4 py-3 font-body text-xs font-medium text-charcoal-light tracking-wider uppercase hidden lg:table-cell">
                  Check-in
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
                    Belum ada tamu
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
                      <p className="font-body text-[10px] text-charcoal-light/50 sm:hidden">
                        <Badge
                          variant={
                            guest.rsvp_status === "attending"
                              ? "attending"
                              : guest.rsvp_status === "not_attending"
                                ? "not_attending"
                                : "pending"
                          }
                        >
                          {guest.rsvp_status}
                        </Badge>
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge
                        variant={
                          guest.rsvp_status === "attending"
                            ? "attending"
                            : guest.rsvp_status === "not_attending"
                              ? "not_attending"
                              : "pending"
                        }
                      >
                        {guest.rsvp_status === "attending"
                          ? "Hadir"
                          : guest.rsvp_status === "not_attending"
                            ? "Tidak Hadir"
                            : "Pending"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-charcoal hidden md:table-cell">
                      {guest.rsvp_pax} / {guest.max_pax}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {guest.checked_in ? (
                        <Badge variant="checked_in">✓ Checked-in</Badge>
                      ) : (
                        <span className="font-body text-xs text-charcoal-light/40">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleCopyLink(guest.slug)}
                          className="p-1.5 rounded text-charcoal-light hover:text-gold hover:bg-gold/5 transition-colors"
                          title="Salin link"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(guest.id)}
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
