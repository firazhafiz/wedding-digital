import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  guestbookSchema,
  formatZodErrors,
  moderateGuestbookSchema,
} from "@/lib/validations";
import { getAuthorizedSession } from "@/lib/auth-shared";

// GET: Fetch all guestbook entries for an event
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("event_id");

    if (!eventId) {
      return NextResponse.json(
        { error: "ID event diperlukan" },
        { status: 400 },
      );
    }

    // Auth check
    const session = await getAuthorizedSession(request, eventId);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("guestbook")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Gagal memuat ucapan" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// POST: Create a new guestbook entry (Public)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate
    const result = guestbookSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: formatZodErrors(result.error) },
        { status: 400 },
      );
    }

    const { guestId, guestName, message, event_id } = result.data;
    const supabase = await createClient();

    // Insert guestbook entry (status: pending for moderation)
    const { data, error } = await supabase
      .from("guestbook")
      .insert({
        guest_id: guestId,
        event_id,
        guest_name: guestName,
        message,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Gagal menyimpan ucapan" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// PATCH: Moderate a guestbook entry
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const result = moderateGuestbookSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Validasi gagal" }, { status: 400 });
    }

    const { id, status } = result.data;

    const supabase = createAdminClient();

    // Get entry first to check event_id for auth
    const { data: entry } = await supabase
      .from("guestbook")
      .select("event_id")
      .eq("id", id)
      .single();
    if (!entry) {
      return NextResponse.json(
        { error: "Ucapan tidak ditemukan" },
        { status: 404 },
      );
    }

    // Auth check
    const session = await getAuthorizedSession(request, entry.event_id);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("guestbook")
      .update({ status })
      .eq("id", id);
    if (error) {
      return NextResponse.json(
        { error: "Gagal memperbarui status" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// DELETE: Remove a guestbook entry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID ucapan diperlukan" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const { data: entry } = await supabase
      .from("guestbook")
      .select("event_id")
      .eq("id", id)
      .single();

    if (!entry) {
      return NextResponse.json(
        { error: "Ucapan tidak ditemukan" },
        { status: 404 },
      );
    }

    // Auth check
    const session = await getAuthorizedSession(request, entry.event_id);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase.from("guestbook").delete().eq("id", id);
    if (error) {
      return NextResponse.json(
        { error: "Gagal menghapus ucapan" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
