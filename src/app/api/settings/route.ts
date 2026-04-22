import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthorizedSession } from "@/lib/auth-shared";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventData, storyline, gallery } = body;

    // Validate request structure
    if (!eventData || !eventData.id) {
      return NextResponse.json(
        { error: "Data event tidak lengkap" },
        { status: 400 }
      );
    }

    const eventId = eventData.id;

    // 🔴 SECURITY CHECK: Verify Client JWT or Admin Auth
    const session = await getAuthorizedSession(request, eventId);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Bypass RLS using Admin Client since auth is manually verified above
    const supabase = createAdminClient();

    // 1. Update Core Event Info
    // Sanitize internal fields from payload
    const { id, user_id, created_at, updated_at, ...updatePayload } = eventData as any;

    const { error: eventError } = await supabase
      .from("event_info")
      .update(updatePayload)
      .eq("id", eventId);

    if (eventError) {
      console.error("Event update error:", eventError);
      throw new Error("Gagal memperbarui info event");
    }

    // 2. Sync Storyline
    // Delete existing records to sync cleanly
    await supabase.from("storyline").delete().eq("event_id", eventId);
    if (storyline && storyline.length > 0) {
      const { error: storyError } = await supabase.from("storyline").insert(
        storyline.map(({ id, created_at, ...rest }: any, idx: number) => ({
          ...rest,
          event_id: eventId, // force injection of verified eventId
          sort_order: idx,
        }))
      );
      if (storyError) {
        console.error("Storyline sync error:", storyError);
        throw new Error("Gagal menyinkronkan cerita perjalanan");
      }
    }

    // 3. Sync Gallery
    await supabase.from("gallery").delete().eq("event_id", eventId);
    if (gallery && gallery.length > 0) {
      const { error: galleryError } = await supabase.from("gallery").insert(
        gallery.map(({ id, created_at, ...rest }: any, idx: number) => ({
          ...rest,
          event_id: eventId, // force injection of verified eventId
          sort_order: idx,
        }))
      );
      if (galleryError) {
        console.error("Gallery sync error:", galleryError);
        throw new Error("Gagal menyinkronkan galeri foto");
      }
    }

    return NextResponse.json(
      { success: true, message: "Pengaturan berhasil disimpan!" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Settings API Error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan server saat menyimpan" },
      { status: 500 }
    );
  }
}
