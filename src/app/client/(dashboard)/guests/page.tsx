"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useClientEventId } from "@/components/client/ClientEventContext";
import type { Guest } from "@/types";
import { generateSlug, generateQrToken } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Papa from "papaparse";
import * as XLSX from "xlsx";

export default function ClientGuestPage() {
  const eventId = useClientEventId();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newMaxPax, setNewMaxPax] = useState(2);
  const [newPhone, setNewPhone] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [eventSlug, setEventSlug] = useState("");
  const [waTemplate, setWaTemplate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editMaxPax, setEditMaxPax] = useState(2);
  const [editLoading, setEditLoading] = useState(false);

  const handleStartEdit = (guest: Guest) => {
    setEditingId(guest.id);
    setEditName(guest.name);
    setEditPhone(guest.phone_number || "");
    setEditMaxPax(guest.max_pax);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) {
      toast.error("Nama tamu tidak boleh kosong");
      return;
    }
    if (!eventId) return;
    setEditLoading(true);
    try {
      const res = await fetch("/api/guests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          event_id: eventId,
          name: editName.trim(),
          phone_number: editPhone.trim() || null,
          max_pax: editMaxPax,
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      toast.success("Data tamu berhasil diperbarui");
      setEditingId(null);
      fetchGuests();
    } catch {
      toast.error("Gagal memperbarui data tamu");
    } finally {
      setEditLoading(false);
    }
  };

  const fetchGuests = useCallback(async () => {
    if (!eventId) return;

    try {
      const res = await fetch(`/api/guests?event_id=${eventId}`);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Gagal memuat data tamu");
      } else {
        setGuests((data.data || []) as Guest[]);
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const fetchEventSlug = useCallback(async () => {
    if (!eventId) return;
    const supabase = createClient();
    const { data: eventData } = await supabase
      .from("event_info")
      .select("event_slug, wa_template")
      .eq("id", eventId)
      .single();
    if (eventData) {
      setEventSlug(eventData.event_slug);
      setWaTemplate(eventData.wa_template || "");
    }
  }, [eventId]);

  useEffect(() => {
    fetchGuests();
    fetchEventSlug();
  }, [fetchGuests, fetchEventSlug]);

  const processImportData = async (rows: any[]) => {
    if (!rows.length) {
      toast.error("File kosong atau format tidak sesuai");
      return;
    }

    const guestsToInsert = rows
      .filter((row) => row.name?.trim())
      .map((row) => ({
        name: row.name.toString().trim(),
        slug: generateSlug(row.name.toString().trim()),
        max_pax: row.max_pax ? parseInt(row.max_pax.toString()) || 2 : 2,
        phone_number: row.phone_number?.toString().trim() || null,
        qr_token: generateQrToken(),
        event_id: eventId,
      }));

    if (guestsToInsert.length === 0) {
      toast.error("Tidak ada data tamu yang valid (kolom 'name' wajib ada)");
      return;
    }

    setAddLoading(true);
    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guestsToInsert),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal import data");
      } else {
        toast.success(`${guestsToInsert.length} tamu berhasil diimport`);
        fetchGuests();
      }
    } catch {
      toast.error("Terjadi kesalahan saat import");
    } finally {
      setAddLoading(false);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop()?.toLowerCase();

    if (fileExt === "csv") {
      Papa.parse<{ name: string; max_pax?: string }>(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          await processImportData(results.data);
        },
        error: () => {
          toast.error("Gagal membaca file CSV");
        },
      });
    } else if (fileExt === "xlsx" || fileExt === "xls") {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: "binary" });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          await processImportData(data);
        } catch (err) {
          toast.error("Gagal membaca file Excel");
          console.error(err);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      toast.error("Format file tidak didukung. Gunakan CSV atau Excel.");
    }

    e.target.value = "";
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setAddLoading(true);
    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          max_pax: newMaxPax,
          phone_number: newPhone.trim() || null,
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
      setNewPhone("");
      setShowAddForm(false);
      fetchGuests();
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    toast("Yakin ingin menghapus tamu ini?", {
      action: {
        label: "Hapus",
        onClick: async () => {
          try {
            const res = await fetch(
              `/api/guests?id=${id}&event_id=${eventId}`,
              {
                method: "DELETE",
              },
            );
            const data = await res.json();
            if (!res.ok) {
              toast.error(data.error || "Gagal menghapus tamu");
            } else {
              toast.success("Tamu dihapus");
              setGuests((prev) => prev.filter((g) => g.id !== id));
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

  const handleCopyLink = (slug: string) => {
    const baseUrl =
      typeof window !== "undefined" && window.location.hostname !== "localhost"
        ? window.location.origin
        : "https://akadigital.vercel.app";

    const link = `${baseUrl}/${eventSlug}/to/${slug}`;
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

        <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 w-full sm:w-auto justify-start sm:justify-end">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileImport}
              className="hidden"
            />
            <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-body border border-gray-200 rounded-md text-charcoal hover:bg-gray-50 transition-colors whitespace-nowrap">
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
              Import
            </span>
          </label>

          {/* Download Template */}
          <button
            onClick={() => {
              const templateData = [
                { name: "Contoh Nama Tamu", max_pax: 2, phone_number: "081234567890" },
                { name: "Budi Santoso", max_pax: 3, phone_number: "" },
              ];
              const ws = XLSX.utils.json_to_sheet(templateData);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "Daftar Tamu");
              XLSX.writeFile(wb, "template-daftar-tamu.xlsx");
              toast.success("Template berhasil diunduh!");
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-body border border-gray-200 rounded-md text-charcoal hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Template
          </button>

          {/* CSV Export */}
          <button
            onClick={() => {
              if (guests.length === 0) {
                toast.error("Tidak ada data tamu untuk di-export");
                return;
              }
              const headers = [
                "Nama",
                "Slug",
                "No HP",
                "Status RSVP",
                "Jumlah Hadir",
                "Pesan",
                "Checked In",
              ];
              const rows = guests.map((g) => [
                g.name,
                g.slug,
                g.phone_number || "",
                g.rsvp_status,
                g.rsvp_pax,
                g.rsvp_message || "",
                g.checked_in ? "Ya" : "Tidak",
              ]);
              const csv = [headers, ...rows]
                .map((row) => row.map((v) => `"${v}"`).join(","))
                .join("\n");
              const blob = new Blob(["\uFEFF" + csv], {
                type: "text/csv;charset=utf-8;",
              });
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = `daftar-tamu-${eventSlug || "event"}.csv`;
              link.click();
              URL.revokeObjectURL(link.href);
              toast.success("Data tamu berhasil di-export!");
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-body border border-gray-200 rounded-md text-charcoal hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="shadow-none! py-2.5!"
          >
            + Tambah Tamu
          </Button>
        </div>
      </div>

      {/* CSV Info Alert */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-blue-500 shrink-0 mt-0.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <div className="font-body text-xs text-blue-700 leading-relaxed">
          <p className="font-semibold mb-1">Panduan Import CSV / Excel:</p>
          <p>
            Pastikan file memiliki kolom header:{" "}
            <code className="bg-blue-100 px-1 rounded">name</code> (wajib),{" "}
            <code className="bg-blue-100 px-1 rounded">max_pax</code> (opsional,
            default 2), dan{" "}
            <code className="bg-blue-100 px-1 rounded">phone_number</code>{" "}
            (opsional, format 08xxx).
          </p>
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
            className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm font-body focus:outline-none focus:border-blue-400/40"
          />
          <input
            type="tel"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="No WA (opsional)"
            className="w-36 px-3 py-2 border border-gray-200 rounded-md text-sm font-body focus:outline-none focus:border-blue-400/40"
          />
          <select
            value={newMaxPax}
            onChange={(e) => setNewMaxPax(Number(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-md text-sm font-body focus:outline-none focus:border-blue-400/40"
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
        className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-lg text-sm font-body focus:outline-none focus:border-blue-400/30"
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
                  No WA
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
                    colSpan={6}
                    className="px-4 py-10 text-center font-body text-sm text-charcoal-light"
                  >
                    Memuat...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center font-body text-sm text-charcoal-light"
                  >
                    Belum ada tamu
                  </td>
                </tr>
              ) : (
                filtered.map((guest) => {
                  const isEditing = editingId === guest.id;
                  return (
                  <tr
                    key={guest.id}
                    className={`border-b border-gray-50 transition-colors ${isEditing ? 'bg-blue-50/30' : 'hover:bg-gray-50/50'}`}
                  >
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-2 py-1 text-sm font-body border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      ) : (
                        <>
                          <p className="font-body text-sm font-medium text-charcoal-dark">
                            {guest.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1 sm:hidden">
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
                          </div>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {isEditing ? (
                        <input
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="08xxx"
                          className="w-full px-2 py-1 text-xs font-body border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      ) : (
                        <span className="font-body text-xs text-charcoal-light">
                          {guest.phone_number || (
                            <span className="text-charcoal-light/30">—</span>
                          )}
                        </span>
                      )}
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
                      {isEditing ? (
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={editMaxPax}
                          onChange={(e) => setEditMaxPax(Number(e.target.value))}
                          className="w-16 px-2 py-1 text-sm font-body border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      ) : guest.rsvp_status === "attending" ? (
                        <span className="font-semibold text-charcoal-dark">
                          {guest.rsvp_pax}
                        </span>
                      ) : (
                        <span className="text-charcoal-light">
                          Max {guest.max_pax}
                        </span>
                      )}
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
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              disabled={editLoading}
                              className="p-1.5 rounded text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Simpan"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20,6 9,17 4,12" />
                              </svg>
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1.5 rounded text-red-400 hover:bg-red-50 transition-colors"
                              title="Batal"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEdit(guest)}
                              className="p-1.5 rounded text-charcoal-light hover:text-blue-500 hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleCopyLink(guest.slug)}
                              className="p-1.5 rounded text-charcoal-light hover:text-blue-500 hover:bg-blue-50 transition-colors"
                              title="Salin link"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                              </svg>
                            </button>
                            {/* WA One-Click Send */}
                            <button
                              onClick={() => {
                                const baseUrl =
                                  typeof window !== "undefined" &&
                                  window.location.hostname !== "localhost"
                                    ? window.location.origin
                                    : "https://akadigital.vercel.app";
                                const link = `${baseUrl}/${eventSlug}/to/${guest.slug}`;
                                const defaultMsg = `Assalamualaikum ${guest.name},\n\nKami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami.\n\nBuka undangan: ${link}\n\nMohon konfirmasi kehadiran Anda. Terima kasih 🙏`;
                                const msg = waTemplate
                                  ? waTemplate
                                      .replace(/\{\{nama\}\}/g, guest.name)
                                      .replace(/\{\{link\}\}/g, link)
                                  : defaultMsg;
                                let phone = guest.phone_number
                                  ? guest.phone_number.replace(/[^0-9]/g, "")
                                  : "";
                                if (phone.startsWith("0")) {
                                  phone = "62" + phone.slice(1);
                                }
                                const waUrl = phone
                                  ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
                                  : `https://wa.me/?text=${encodeURIComponent(msg)}`;
                                window.open(waUrl, "_blank", "noopener,noreferrer");
                              }}
                              className={`p-1.5 rounded transition-colors ${
                                guest.phone_number
                                  ? "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                                  : "text-charcoal-light/30 hover:text-emerald-500 hover:bg-emerald-50"
                              }`}
                              title={guest.phone_number ? `Kirim WA ke ${guest.phone_number}` : "Kirim WA (No HP belum diisi)"}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(guest.id)}
                              className="p-1.5 rounded text-charcoal-light hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Hapus"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <polyline points="3,6 5,6 21,6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
