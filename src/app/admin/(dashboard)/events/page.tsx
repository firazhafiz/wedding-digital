"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  setActiveEventId,
  getActiveEventId,
  clearActiveEventId,
} from "@/lib/admin/context";
import type { EventInfo } from "@/types";

export default function AdminEventsPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventInfo[]>([]);
  const [eventStats, setEventStats] = useState<
    Record<string, { total: number; attending: number }>
  >({});
  const [showCreate, setShowCreate] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newPackage, setNewPackage] = useState("basic");
  const [showPackageDropdown, setShowPackageDropdown] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const packageOptions = [
    { value: "basic", label: "Basic", desc: "Maksimal 100 Tamu" },
    { value: "pro", label: "Pro", desc: "Maksimal 300 Tamu" },
    { value: "exclusive", label: "Exclusive", desc: "Maksimal 500 Tamu" },
    { value: "custom", label: "Custom", desc: "Tamu Tanpa Batas / Unlimited" },
  ];
  const router = useRouter();
  const supabase = createClient();

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("event_info")
      .select("*")
      .order("updated_at", { ascending: false });

    if (data) {
      setEvents(data);

      // Fetch stats for all events
      const stats: Record<string, { total: number; attending: number }> = {};
      await Promise.all(
        data.map(async (event) => {
          const [totalRes, attendingRes] = await Promise.all([
            supabase
              .from("guests")
              .select("id", { count: "exact", head: true })
              .eq("event_id", event.id),
            supabase
              .from("guests")
              .select("id", { count: "exact", head: true })
              .eq("event_id", event.id)
              .eq("rsvp_status", "attending"),
          ]);
          stats[event.id] = {
            total: totalRes.count || 0,
            attending: attendingRes.count || 0,
          };
        }),
      );
      setEventStats(stats);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, [supabase]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlug || !newTitle) return;

    // Get current user for RLS
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Sesi Anda berakhir. Silakan login kembali.");
      return;
    }

      const limits = { basic: 100, pro: 300, exclusive: 500, custom: 9999 };
      const guestLimit = limits[newPackage as keyof typeof limits] || 100;

      const { data, error } = await supabase
        .from("event_info")
        .insert({
          user_id: user.id, // Important for RLS
          event_slug: newSlug.toLowerCase().replace(/\s+/g, "-"),
          groom_name: newTitle.split("&")[0]?.trim() || "Groom",
          bride_name: newTitle.split("&")[1]?.trim() || "Bride",
          package_type: newPackage,
          guest_limit: guestLimit,
        })
      .select()
      .single();

    if (error) {
      toast.error("Gagal membuat event: " + error.message);
    } else {
      toast.success("Event baru berhasil dibuat!");
      setActiveEventId(data.id);
      router.push("/admin/settings");
      router.refresh();
    }
  };

  const handleDelete = async (eventId: string, eventName: string) => {
    toast(`Hapus event "${eventName}"?`, {
      description:
        "Semua data tamu, buku tamu, dll. akan ikut terhapus permanen.",
      action: {
        label: "Hapus",
        onClick: async () => {
          setDeletingId(eventId);

          await supabase.from("guests").delete().eq("event_id", eventId);
          await supabase.from("guestbook").delete().eq("event_id", eventId);

          const { error } = await supabase
            .from("event_info")
            .delete()
            .eq("id", eventId);

          if (error) {
            toast.error("Gagal menghapus event: " + error.message);
          } else {
            toast.success("Event berhasil dihapus!");
            if (getActiveEventId() === eventId) {
              clearActiveEventId();
            }
            fetchEvents();
          }
          setDeletingId(null);
        },
      },
      cancel: {
        label: "Batal",
        onClick: () => {},
      },
    });
  };

  if (loading)
    return (
      <div className="p-8 text-center text-charcoal-light">
        Memuat daftar event...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row items-start justify-between gap-2 mb-8">
        <div>
          <h1 className="font-body text-2xl font-semibold text-charcoal-dark uppercase tracking-widest">
            Katalog Undangan
          </h1>
          <p className="font-body text-sm text-charcoal-light mt-1">
            Daftar semua project undangan yang Anda kelola
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="shadow-none!">
          Buat Undangan
        </Button>
      </div>

      {showCreate && (
        <div className="mb-10 p-8 bg-gold/5 border border-gold/10 rounded-xl animate-fade-in">
          <h2 className="font-display text-xl text-charcoal-dark mb-4 italic">
            Setup Undangan Baru
          </h2>
          <form
            onSubmit={handleCreate}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div>
              <label className="block text-xs font-semibold text-charcoal-light mb-1.5 uppercase tracking-tighter">
                Judul Event (e.g. Nama Pria & Wanita)
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Anies & Cak Imin"
                className="cms-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-light mb-1.5 uppercase tracking-tighter">
                Event Slug (Untuk URL)
              </label>
              <div className="flex items-center">
                <span className="bg-gray-100 px-3 py-3 border border-r-0 border-gray-200 rounded-l-lg text-xs text-charcoal-light/60">
                  /
                </span>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="anies-imin"
                  className="cms-input w-full rounded-l-none"
                />
              </div>
            </div>
            <div className="relative">
              <label className="block text-xs font-semibold text-charcoal-light mb-1.5 uppercase tracking-tighter">
                Paket Event
              </label>
              
              <div 
                onClick={() => setShowPackageDropdown(!showPackageDropdown)}
                className="cms-input w-full flex justify-between items-center cursor-pointer bg-white group hover:border-gold/30"
              >
                <span>
                  {packageOptions.find(p => p.value === newPackage)?.label}
                  <span className="text-gray-400 text-xs ml-2 font-normal">
                    ({packageOptions.find(p => p.value === newPackage)?.desc})
                  </span>
                </span>
                <svg 
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" 
                  className={`text-gray-400 transition-transform duration-200 group-hover:text-gold ${showPackageDropdown ? "rotate-180 text-gold" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              {showPackageDropdown && (
                <>
                  {/* Invisible Overlay for click-outside */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowPackageDropdown(false)} />
                  
                  {/* Dropdown Menu */}
                  <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 rounded-lg shadow-xl shadow-gray-200/50 z-50 overflow-hidden py-1 animate-fade-in origin-top">
                    {packageOptions.map((opt) => (
                      <div
                        key={opt.value}
                        onClick={() => {
                          setNewPackage(opt.value);
                          setShowPackageDropdown(false);
                        }}
                        className={`px-4 py-3 cursor-pointer transition-colors flex flex-col ${
                          newPackage === opt.value 
                            ? "bg-gold/5 text-gold-dark border-l-2 border-gold" 
                            : "hover:bg-gray-50 text-charcoal-dark border-l-2 border-transparent"
                        }`}
                      >
                        <span className="font-semibold text-sm">{opt.label}</span>
                        <span className="text-[10px] text-gray-400 mt-1">{opt.desc}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="md:col-span-2 flex gap-3 justify-end mt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowCreate(false)}
              >
                Batal
              </Button>
              <Button type="submit">Konfirmasi & Buat</Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group overflow-hidden relative"
          >
            {/* Delete button */}
            <button
              onClick={() =>
                handleDelete(
                  event.id,
                  `${event.groom_name} & ${event.bride_name}`,
                )
              }
              disabled={deletingId === event.id}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-md bg-gray-100/80 text-red-500 hover:bg-red-50 transition-all cursor-pointer"
              title="Hapus event"
            >
              {deletingId === event.id ? (
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    strokeDasharray="32"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <polyline points="3,6 5,6 21,6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              )}
            </button>

            <div className="h-24 bg-gold/5 flex items-center justify-center border-b border-gray-50">
              <span className="font-display text-lg text-gold italic">
                {event.groom_name.split(" ")[0]} &{" "}
                {event.bride_name.split(" ")[0]}
              </span>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase text-charcoal-light/40 tracking-widest">
                    Slug (URL)
                  </p>
                  <code className="text-xs font-mono text-gold bg-gold/5 px-2 py-1 rounded">
                    /{event.event_slug}
                  </code>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <p className="text-[10px] font-bold uppercase text-charcoal-light/40 tracking-widest">
                    Status
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] bg-gold/10 text-gold-dark px-2 py-0.5 rounded-full font-bold uppercase">
                      {event.package_type || "basic"}
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold uppercase">
                      LIVE
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Badges */}
              {eventStats[event.id] && (
                <div className="flex gap-3 py-3">
                  <div className="flex-1 text-center px-2 py-1.5 bg-gray-50 rounded-lg">
                    <p className="text-[10px] font-bold uppercase text-charcoal-light/40 tracking-widest">
                      Total Tamu
                    </p>
                    <p className="text-lg font-bold text-charcoal-dark">
                      {eventStats[event.id].total}
                    </p>
                  </div>
                  <div className="flex-1 text-center px-2 py-1.5 bg-emerald-50 rounded-lg">
                    <p className="text-[10px] font-bold uppercase text-emerald-500/60 tracking-widest">
                      Hadir
                    </p>
                    <p className="text-lg font-bold text-emerald-600">
                      {eventStats[event.id].attending}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-50 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-[10px] cursor-pointer shadow-none!"
                  onClick={() =>
                    window.open(`/${event.event_slug}/to/demo`, "_blank")
                  }
                >
                  Lihat Live
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1 text-[10px] cursor-pointer shadow-none!"
                  onClick={() => {
                    setActiveEventId(event.id);
                    router.push("/admin");
                    router.refresh();
                  }}
                >
                  Pilih & Kelola
                </Button>
              </div>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="col-span-full py-20 text-center text-charcoal-light/50 border-2 border-dashed border-gray-100 rounded-xl">
            Belum ada event. Klik "Buat Undangan Baru" untuk memulai.
          </div>
        )}
      </div>

      <style jsx>{`
        .cms-input {
          @apply px-4 py-3 border border-gray-200 rounded-lg text-sm font-body text-charcoal-dark 
              bg-white shadow-sm transition-all duration-200 outline-none
              focus:border-gold/50 focus:ring-4 focus:ring-gold/5;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
