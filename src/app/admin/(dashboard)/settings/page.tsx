"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { getActiveEventId } from "@/lib/admin/context";
import Button from "@/components/ui/Button";
import type { EventInfo, StorylineItem, GalleryPhoto } from "@/types";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eventData, setEventData] = useState<Partial<EventInfo>>({});
  const [storyline, setStoryline] = useState<StorylineItem[]>([]);
  const [gallery, setGallery] = useState<GalleryPhoto[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchSettings() {
      const eventId = getActiveEventId();
      if (!eventId) {
        router.push("/admin/events");
        return;
      }

      const { data, error } = await supabase
        .from("event_info")
        .select("*")
        .eq("id", eventId)
        .single();

      if (data) {
        setEventData(data);

        // Fetch collections
        const [storyRes, galleryRes] = await Promise.all([
          supabase
            .from("storyline")
            .select("*")
            .eq("event_id", data.id)
            .order("sort_order", { ascending: true }),
          supabase
            .from("gallery")
            .select("*")
            .eq("event_id", data.id)
            .order("sort_order", { ascending: true }),
        ]);

        if (storyRes.data) setStoryline(storyRes.data);
        if (galleryRes.data) setGallery(galleryRes.data);
      }
      setLoading(false);
    }
    fetchSettings();
  }, [supabase]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 1. Update Core Event Info
      // SANITIZE: Remove internal Supabase fields that cause 400 Bad Request
      const { id, user_id, created_at, updated_at, ...updatePayload } =
        eventData as any;

      const { error: eventError } = await supabase
        .from("event_info")
        .update(updatePayload)
        .eq("id", id);

      if (eventError) throw eventError;

      // 2. Simple Sync for Collections (Delete & Re-insert for brevity in this demo)
      // In production, use UPSERT or specific CRUD APIs
      await supabase.from("storyline").delete().eq("event_id", eventData.id);
      if (storyline.length > 0) {
        const { error: storyError } = await supabase.from("storyline").insert(
          storyline.map(({ id, created_at, ...rest }, idx) => ({
            ...rest,
            sort_order: idx,
          })),
        );
        if (storyError) throw storyError;
      }

      await supabase.from("gallery").delete().eq("event_id", eventData.id);
      if (gallery.length > 0) {
        const { error: galleryError } = await supabase.from("gallery").insert(
          gallery.map(({ id, created_at, ...rest }, idx) => ({
            ...rest,
            sort_order: idx,
          })),
        );
        if (galleryError) throw galleryError;
      }

      toast.success("Semua perubahan berhasil disimpan!");
    } catch (error: any) {
      toast.error("Gagal menyimpan: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Helper to format date to local YYYY-MM-DDThh:mm for datetime-local input
  const toLocalISOString = (dateStr: string | null | undefined) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const offset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  };

  if (loading)
    return (
      <div className="p-8 text-center text-charcoal-light uppercase tracking-widest text-xs">
        Memuat konfigurasi CMS...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto pb-4">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-10 border-b border-gray-100 gap-4">
        <div className="flex flex-col items-center">
          <h1 className="font-display text-3xl text-charcoal-dark italic">
            Wedding CMS Pro
          </h1>
          <p className="font-body text-sm text-charcoal-light mt-1 tracking-wide uppercase text-[10px] font-bold">
            Kelola setiap detail undangan Anda secara eksklusif
          </p>
        </div>
      </div>

      <form className="space-y-12" onSubmit={handleUpdate}>
        {/* SECTION 1: IDENTITAS MEMPELAI */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/5 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-display text-lg text-charcoal-dark italic flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
              Identitas Mempelai
            </h2>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Groom Detail */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold italic">
                Mempelai Pria
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="cms-label">Nama Lengkap</label>
                  <input
                    type="text"
                    value={eventData.groom_name || ""}
                    onChange={(e) =>
                      setEventData({ ...eventData, groom_name: e.target.value })
                    }
                    className="cms-input w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="cms-label">Nama Ayah</label>
                    <input
                      type="text"
                      value={eventData.groom_father || ""}
                      onChange={(e) =>
                        setEventData({
                          ...eventData,
                          groom_father: e.target.value,
                        })
                      }
                      className="cms-input w-full"
                    />
                  </div>
                  <div>
                    <label className="cms-label">Nama Ibu</label>
                    <input
                      type="text"
                      value={eventData.groom_mother || ""}
                      onChange={(e) =>
                        setEventData({
                          ...eventData,
                          groom_mother: e.target.value,
                        })
                      }
                      className="cms-input w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="cms-label">Username Instagram (@...)</label>
                  <input
                    type="text"
                    value={eventData.groom_instagram || ""}
                    onChange={(e) =>
                      setEventData({
                        ...eventData,
                        groom_instagram: e.target.value,
                      })
                    }
                    className="cms-input w-full"
                  />
                </div>
                <div>
                  <label className="cms-label">URL Foto Mempelai Pria</label>
                  <input
                    type="text"
                    value={eventData.groom_photo_url || ""}
                    onChange={(e) =>
                      setEventData({
                        ...eventData,
                        groom_photo_url: e.target.value,
                      })
                    }
                    className="cms-input w-full"
                    placeholder="https://..."
                  />
                  {eventData.groom_photo_url && (
                    <img
                      src={eventData.groom_photo_url}
                      className="mt-2 w-20 h-20 object-cover rounded-lg border border-gray-100"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Bride Detail */}
            <div className="space-y-6 border-t md:border-t-0 md:border-l border-gray-100 pt-8 md:pt-0 md:pl-12">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold italic">
                Mempelai Wanita
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="cms-label">Nama Lengkap</label>
                  <input
                    type="text"
                    value={eventData.bride_name || ""}
                    onChange={(e) =>
                      setEventData({ ...eventData, bride_name: e.target.value })
                    }
                    className="cms-input w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="cms-label">Nama Ayah</label>
                    <input
                      type="text"
                      value={eventData.bride_father || ""}
                      onChange={(e) =>
                        setEventData({
                          ...eventData,
                          bride_father: e.target.value,
                        })
                      }
                      className="cms-input w-full"
                    />
                  </div>
                  <div>
                    <label className="cms-label">Nama Ibu</label>
                    <input
                      type="text"
                      value={eventData.bride_mother || ""}
                      onChange={(e) =>
                        setEventData({
                          ...eventData,
                          bride_mother: e.target.value,
                        })
                      }
                      className="cms-input w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="cms-label">Username Instagram (@...)</label>
                  <input
                    type="text"
                    value={eventData.bride_instagram || ""}
                    onChange={(e) =>
                      setEventData({
                        ...eventData,
                        bride_instagram: e.target.value,
                      })
                    }
                    className="cms-input w-full"
                  />
                </div>
                <div>
                  <label className="cms-label">URL Foto Mempelai Wanita</label>
                  <input
                    type="text"
                    value={eventData.bride_photo_url || ""}
                    onChange={(e) =>
                      setEventData({
                        ...eventData,
                        bride_photo_url: e.target.value,
                      })
                    }
                    className="cms-input w-full"
                    placeholder="https://..."
                  />
                  {eventData.bride_photo_url && (
                    <img
                      src={eventData.bride_photo_url}
                      className="mt-2 w-20 h-20 object-cover rounded-lg border border-gray-100"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: JADWAL ACARA */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/5 px-6 py-4 border-b border-gray-100">
            <h2 className="font-display text-lg text-charcoal-dark italic flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
              Jadwal & Lokasi Acara
            </h2>
          </div>
          <div className="p-8 space-y-12">
            {/* Akad Nikah */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold italic">
                  Bagian 1: Akad Nikah
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-charcoal-light">
                    Tampilkan Seksi ini
                  </span>
                  <input
                    type="checkbox"
                    checked={eventData.show_akad ?? true}
                    onChange={(e) =>
                      setEventData({
                        ...eventData,
                        show_akad: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-gold cursor-pointer"
                  />
                </div>
              </div>
              {(eventData.show_akad ?? true) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                  <div>
                    <label className="cms-label">Tanggal & Waktu</label>
                    <input
                      type="datetime-local"
                      value={toLocalISOString(eventData.akad_date)}
                      onChange={(e) =>
                        setEventData({
                          ...eventData,
                          akad_date: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : null,
                        })
                      }
                      className="cms-input w-full"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="cms-label">Nama Lokasi</label>
                    <input
                      type="text"
                      value={eventData.akad_location || ""}
                      onChange={(e) =>
                        setEventData({
                          ...eventData,
                          akad_location: e.target.value,
                        })
                      }
                      className="cms-input w-full"
                    />
                  </div>
                  <div>
                    <label className="cms-label">
                      Maps URL (Gedung/Masjid)
                    </label>
                    <input
                      type="text"
                      value={eventData.akad_maps_url || ""}
                      onChange={(e) =>
                        setEventData({
                          ...eventData,
                          akad_maps_url: e.target.value,
                        })
                      }
                      className="cms-input w-full"
                      placeholder="https://maps.app.goo.gl/..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Resepsi */}
            <div className="space-y-6 pt-8 border-t border-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold italic">
                  Bagian 2: Resepsi
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-charcoal-light">
                    Tampilkan Seksi ini
                  </span>
                  <input
                    type="checkbox"
                    checked={eventData.show_resepsi ?? true}
                    onChange={(e) =>
                      setEventData({
                        ...eventData,
                        show_resepsi: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-gold cursor-pointer"
                  />
                </div>
              </div>
              {(eventData.show_resepsi ?? true) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                  <div>
                    <label className="cms-label">Tanggal & Waktu</label>
                    <input
                      type="datetime-local"
                      value={toLocalISOString(eventData.resepsi_date)}
                      onChange={(e) =>
                        setEventData({
                          ...eventData,
                          resepsi_date: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : null,
                        })
                      }
                      className="cms-input w-full"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="cms-label">Nama Lokasi</label>
                    <input
                      type="text"
                      value={eventData.resepsi_location || ""}
                      onChange={(e) =>
                        setEventData({
                          ...eventData,
                          resepsi_location: e.target.value,
                        })
                      }
                      className="cms-input w-full"
                    />
                  </div>
                  <div>
                    <label className="cms-label">Maps URL (Hotel/Venue)</label>
                    <input
                      type="text"
                      value={eventData.resepsi_maps_url || ""}
                      onChange={(e) =>
                        setEventData({
                          ...eventData,
                          resepsi_maps_url: e.target.value,
                        })
                      }
                      className="cms-input w-full"
                      placeholder="https://maps.app.goo.gl/..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 3: GALLERY & STORYLINE */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/5 px-6 py-4 border-b border-gray-100">
            <h2 className="font-display text-lg text-charcoal-dark italic flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
              Koleksi Foto & Cerita
            </h2>
          </div>
          <div className="p-8 space-y-12">
            {/* Gallery Management */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold italic">
                  Data Galeri Foto
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setGallery([
                      ...gallery,
                      {
                        id: crypto.randomUUID(),
                        event_id: eventData.id!,
                        photo_url: "",
                        caption: "",
                        sort_order: gallery.length,
                        created_at: "",
                      },
                    ])
                  }
                >
                  + Tambah Foto
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gallery.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 border border-gray-100 rounded-lg bg-gray-50/30 flex gap-4 items-start group"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                      {item.photo_url ? (
                        <img
                          src={item.photo_url}
                          className="w-full h-full object-cover"
                          alt="Preview"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400 uppercase font-bold">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={item.photo_url}
                        onChange={(e) => {
                          const newGallery = [...gallery];
                          newGallery[idx].photo_url = e.target.value;
                          setGallery(newGallery);
                        }}
                        className="cms-input w-full py-1 text-xs"
                        placeholder="URL Foto..."
                      />
                      <input
                        type="text"
                        value={item.caption || ""}
                        onChange={(e) => {
                          const newGallery = [...gallery];
                          newGallery[idx].caption = e.target.value;
                          setGallery(newGallery);
                        }}
                        className="cms-input w-full py-1 text-xs"
                        placeholder="Keterangan..."
                      />
                    </div>
                    <button
                      onClick={() =>
                        setGallery(gallery.filter((_, i) => i !== idx))
                      }
                      className="text-red-300 hover:text-red-500 transition-colors p-1 mt-1"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}
                {gallery.length === 0 && (
                  <p className="col-span-full text-center py-4 text-[10px] text-gray-300 italic">
                    Belum ada foto galeri.
                  </p>
                )}
              </div>
            </div>

            {/* Storyline Management */}
            <div className="space-y-6 pt-8 border-t border-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold italic">
                  Timeline Journey
                </h3>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-charcoal-light">
                      Tampilkan Seksi ini
                    </span>
                    <input
                      type="checkbox"
                      checked={eventData.show_storyline ?? true}
                      onChange={(e) =>
                        setEventData({
                          ...eventData,
                          show_storyline: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-gold cursor-pointer"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setStoryline([
                        ...storyline,
                        {
                          id: crypto.randomUUID(),
                          event_id: eventData.id!,
                          year: "",
                          title: "",
                          description: "",
                          photo_url: "",
                          sort_order: storyline.length,
                          created_at: "",
                        },
                      ])
                    }
                  >
                    + Tambah Momen
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                {storyline.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-6 border border-gray-100 rounded-lg bg-gray-50/30 flex gap-6 items-start"
                  >
                    <div className="w-20 shrink-0">
                      <label className="cms-label-xs">Tahun</label>
                      <input
                        type="text"
                        value={item.year}
                        onChange={(e) => {
                          const newStory = [...storyline];
                          newStory[idx].year = e.target.value;
                          setStoryline(newStory);
                        }}
                        className="cms-input w-full py-1 text-xs"
                        placeholder="2024"
                      />
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="cms-label-xs">Judul Momen</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const newStory = [...storyline];
                            newStory[idx].title = e.target.value;
                            setStoryline(newStory);
                          }}
                          className="cms-input w-full py-1 text-xs"
                          placeholder="First Meet..."
                        />
                      </div>
                      <div>
                        <label className="cms-label-xs">Deskripsi</label>
                        <textarea
                          value={item.description || ""}
                          onChange={(e) => {
                            const newStory = [...storyline];
                            newStory[idx].description = e.target.value;
                            setStoryline(newStory);
                          }}
                          className="cms-input w-full py-1 text-xs h-8 resize-none"
                          placeholder="Ceritakan detailnya..."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="cms-label-xs">URL Foto Momen</label>
                        <input
                          type="text"
                          value={item.photo_url || ""}
                          onChange={(e) => {
                            const newStory = [...storyline];
                            newStory[idx].photo_url = e.target.value;
                            setStoryline(newStory);
                          }}
                          className="cms-input w-full py-1 text-xs"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setStoryline(storyline.filter((_, i) => i !== idx))
                      }
                      className="text-red-300 hover:text-red-500 transition-colors p-1 mt-5"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}
                {storyline.length === 0 && (
                  <p className="text-center py-4 text-[10px] text-gray-300 italic">
                    Belum ada cerita perjalanan.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: KADO DIGITAL */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/5 px-6 py-4 border-b border-gray-100">
            <h2 className="font-display text-lg text-charcoal-dark italic flex items-center justify-between gap-2 w-full">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                Kado Nikah & QRIS
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase text-charcoal-light">
                  Tampilkan Seksi ini
                </span>
                <input
                  type="checkbox"
                  checked={eventData.show_gifts ?? true}
                  onChange={(e) =>
                    setEventData({
                      ...eventData,
                      show_gifts: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-gold cursor-pointer"
                />
              </div>
            </h2>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="cms-label">Bank</label>
                  <input
                    type="text"
                    value={eventData.bank_name || ""}
                    onChange={(e) =>
                      setEventData({ ...eventData, bank_name: e.target.value })
                    }
                    className="cms-input w-full"
                    placeholder="BCA"
                  />
                </div>
                <div className="col-span-2">
                  <label className="cms-label">Nomor Rekening</label>
                  <input
                    type="text"
                    value={eventData.bank_account_number || ""}
                    onChange={(e) =>
                      setEventData({
                        ...eventData,
                        bank_account_number: e.target.value,
                      })
                    }
                    className="cms-input w-full"
                  />
                </div>
              </div>
              <div>
                <label className="cms-label">Atas Nama</label>
                <input
                  type="text"
                  value={eventData.bank_account_holder || ""}
                  onChange={(e) =>
                    setEventData({
                      ...eventData,
                      bank_account_holder: e.target.value,
                    })
                  }
                  className="cms-input w-full"
                />
              </div>
            </div>
            <div>
              <label className="cms-label">Upload QRIS (URL Foto)</label>
              <input
                type="text"
                value={eventData.qris_image_url || ""}
                onChange={(e) =>
                  setEventData({ ...eventData, qris_image_url: e.target.value })
                }
                className="cms-input w-full"
                placeholder="https://supabase.../qris.jpg"
              />
              <p className="text-[10px] text-charcoal-light/40 mt-3 italic">
                *Tampil sebagai alternatif pembayaran dompet digital.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5: FOOTER & BRANDING */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/5 px-6 py-4 border-b border-gray-100">
            <h2 className="font-display text-lg text-charcoal-dark italic flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
              Footer & Branding
            </h2>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="cms-label">Custom Footer Credit</label>
              <input
                type="text"
                value={eventData.footer_text || ""}
                onChange={(e) =>
                  setEventData({ ...eventData, footer_text: e.target.value })
                }
                className="cms-input w-full"
                placeholder="© 2026. Created with Love by Kylo"
              />
            </div>
            <div>
              <label className="cms-label">Background Music (MP3 URL)</label>
              <input
                type="text"
                value={eventData.audio_url || ""}
                onChange={(e) =>
                  setEventData({ ...eventData, audio_url: e.target.value })
                }
                className="cms-input w-full"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="cms-label">Hero Video</label>
              <input
                type="text"
                value={eventData.hero_photo_url || ""}
                onChange={(e) =>
                  setEventData({ ...eventData, hero_photo_url: e.target.value })
                }
                className="cms-input w-full"
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-gray-50/20">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-dark">
                    Countdown Timer
                  </span>
                  <span className="text-[9px] text-charcoal-light/60">
                    Tampilkan hitung mundur acara
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={eventData.show_countdown ?? true}
                  onChange={(e) =>
                    setEventData({
                      ...eventData,
                      show_countdown: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-gold cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-gray-50/20">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-dark">
                    Guestbook / Ucapan
                  </span>
                  <span className="text-[9px] text-charcoal-light/60">
                    Izinkan tamu mengirim ucapan
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={eventData.show_guestbook ?? true}
                  onChange={(e) =>
                    setEventData({
                      ...eventData,
                      show_guestbook: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-gold cursor-pointer"
                />
              </div>
            </div>
            <div>
              <label className="cms-label">Welcome Video</label>
              <input
                type="text"
                value={eventData.welcome_video_url || ""}
                onChange={(e) =>
                  setEventData({
                    ...eventData,
                    welcome_video_url: e.target.value,
                  })
                }
                className="cms-input w-full"
                placeholder="/videos/wedding.mp4"
              />
            </div>
            <div>
              <label className="cms-label">Story & Gallery Background</label>
              <input
                type="text"
                value={eventData.story_gallery_bg_url || ""}
                onChange={(e) =>
                  setEventData({
                    ...eventData,
                    story_gallery_bg_url: e.target.value,
                  })
                }
                className="cms-input w-full"
                placeholder="URL foto background untuk seksi Journey & Galleri"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="cms-label">Warna Utama</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={eventData.primary_color || "#D4AF37"}
                    onChange={(e) =>
                      setEventData({
                        ...eventData,
                        primary_color: e.target.value,
                      })
                    }
                    className="w-10 h-10 border-0 p-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={eventData.primary_color || "#D4AF37"}
                    onChange={(e) =>
                      setEventData({
                        ...eventData,
                        primary_color: e.target.value,
                      })
                    }
                    className="cms-input flex-1 px-2 py-1 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="cms-label">Warna Sekunder</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={eventData.secondary_color || "#1A1A1A"}
                    onChange={(e) =>
                      setEventData({
                        ...eventData,
                        secondary_color: e.target.value,
                      })
                    }
                    className="w-10 h-10 border-0 p-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={eventData.secondary_color || "#1A1A1A"}
                    onChange={(e) =>
                      setEventData({
                        ...eventData,
                        secondary_color: e.target.value,
                      })
                    }
                    className="cms-input flex-1 px-2 py-1 text-xs"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="cms-label">Pilihan Font Display</label>
              <select
                value={eventData.font_display || "Safira March"}
                onChange={(e) =>
                  setEventData({ ...eventData, font_display: e.target.value })
                }
                className="cms-input w-full"
              >
                <option value="Safira March">
                  Safira March (Premium Serif)
                </option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Cormorant Garamond">Cormorant Garamond</option>
              </select>
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-6">
          <Button
            type="submit"
            loading={saving}
            size="lg"
            className="px-16 font-bold tracking-widest uppercase text-xs"
          >
            Simpan & Aktifkan Perubahan
          </Button>
        </div>
      </form>

      <style jsx>{`
        .cms-label {
          @apply block text-[10px] font-bold uppercase tracking-wider text-charcoal-light mb-2;
        }
        .cms-label-xs {
          @apply block text-[10px] font-bold uppercase text-gray-400 mb-1;
        }
        .cms-input {
          @apply px-4 py-3 border border-gray-200 rounded-lg text-sm font-body text-charcoal-dark 
            bg-white shadow-sm transition-all duration-200 outline-none
            focus:border-gold/50 focus:ring-4 focus:ring-gold/5 focus:shadow-md;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
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
