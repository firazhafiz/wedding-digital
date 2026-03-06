"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Button from "@/components/ui/Button";

interface ClientUser {
  id: string;
  event_id: string;
  email: string;
  label: string;
  created_at: string;
}

interface Props {
  eventId: string;
}

export default function ClientAccessManager({ eventId }: Props) {
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formLabel, setFormLabel] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const supabase = createClient();

  const fetchClients = useCallback(async () => {
    const { data } = await supabase
      .from("client_users")
      .select("id, event_id, email, label, created_at")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    setClients(data || []);
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const resetForm = () => {
    setFormEmail("");
    setFormPassword("");
    setFormLabel("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail || (!editingId && !formPassword)) {
      toast.error("Email dan password harus diisi");
      return;
    }

    setSaving(true);
    try {
      // Hash password on server side via API route
      const res = await fetch("/api/admin/client-users", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          event_id: eventId,
          email: formEmail.toLowerCase().trim(),
          password: formPassword || undefined,
          label: formLabel.trim() || "Client",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Gagal menyimpan");
        return;
      }

      toast.success(
        editingId
          ? "Akses client diperbarui"
          : "Akses client berhasil ditambahkan",
      );
      resetForm();
      fetchClients();
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (client: ClientUser) => {
    setEditingId(client.id);
    setFormEmail(client.email);
    setFormPassword("");
    setFormLabel(client.label);
    setShowForm(true);
  };

  const handleDelete = (id: string, email: string) => {
    toast(`Hapus akses "${email}"?`, {
      action: {
        label: "Hapus",
        onClick: async () => {
          const { error } = await supabase
            .from("client_users")
            .delete()
            .eq("id", id);

          if (error) {
            toast.error("Gagal menghapus: " + error.message);
          } else {
            toast.success("Akses client dihapus");
            fetchClients();
          }
        },
      },
      cancel: {
        label: "Batal",
        onClick: () => {},
      },
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-body text-base font-semibold text-charcoal-dark">
            Akses Client
          </h3>
          <p className="font-body text-xs text-charcoal-light mt-0.5">
            Buat akun login untuk client agar bisa kelola tamu, ucapan, dan
            check-in
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Tambah
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-blue-50/50 border border-blue-100 rounded-lg p-5 space-y-4 animate-fade-in"
        >
          <p className="font-body text-xs font-semibold text-blue-700 uppercase tracking-wider">
            {editingId ? "Edit Akses Client" : "Tambah Akses Client Baru"}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-light mb-1.5">
                Email Login
              </label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="client@email.com"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/10"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-light mb-1.5">
                Password{" "}
                {editingId && (
                  <span className="text-gray-400">
                    (kosongkan jika tidak diubah)
                  </span>
                )}
              </label>
              <input
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder={editingId ? "••••••••" : "Min. 6 karakter"}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/10"
                {...(!editingId && { required: true, minLength: 6 })}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-light mb-1.5">
              Label / Nama Tampilan
            </label>
            <input
              type="text"
              value={formLabel}
              onChange={(e) => setFormLabel(e.target.value)}
              placeholder="Contoh: Koordinator, Wedding Organizer, Client"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/10"
            />
          </div>

          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={resetForm}
            >
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={saving}>
              {editingId ? "Update" : "Simpan"}
            </Button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <p className="font-body text-sm text-charcoal-light text-center py-4">
          Memuat...
        </p>
      ) : clients.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-lg">
          <p className="font-body text-sm text-charcoal-light/50">
            Belum ada akses client untuk event ini
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {clients.map((client) => (
            <div
              key={client.id}
              className="flex items-center justify-between py-3 gap-4"
            >
              <div className="min-w-0">
                <p className="font-body text-sm font-medium text-charcoal-dark truncate">
                  {client.email}
                </p>
                <p className="font-body text-[10px] text-charcoal-light/50 mt-0.5">
                  {client.label} · Dibuat{" "}
                  {new Date(client.created_at).toLocaleDateString("id-ID")}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleEdit(client)}
                  className="p-1.5 rounded text-charcoal-light hover:text-blue-500 hover:bg-blue-50 transition-colors"
                  title="Edit"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(client.id, client.email)}
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
          ))}
        </div>
      )}

      {/* Info box */}
      <div className="bg-gray-50 rounded-lg p-3 flex items-start gap-2.5">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-charcoal-light/40 shrink-0 mt-0.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <p className="font-body text-[11px] text-charcoal-light/60 leading-relaxed">
          Client login di{" "}
          <code className="bg-gray-200/50 px-1 rounded text-[10px]">
            /client/login
          </code>{" "}
          — Hanya bisa akses Dashboard, Tamu, Ucapan, dan Check-in.
        </p>
      </div>
    </div>
  );
}
