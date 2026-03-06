import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createGuestSchema, formatZodErrors } from "@/lib/validations";
import { generateSlug, generateQrToken } from "@/lib/utils";
import { getAuthorizedSession } from "@/lib/auth-shared";

// GET: Fetch all guests for an event
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

    // Unified auth check
    const session = await getAuthorizedSession(request, eventId);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    let query = supabase
      .from("guests")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    const rsvpStatus = searchParams.get("rsvp_status");
    if (rsvpStatus) {
      query = query.eq("rsvp_status", rsvpStatus);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Gagal memuat data tamu" },
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

// POST: Create a new guest or bulk insert
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if bulk insert (array)
    if (Array.isArray(body)) {
      if (body.length === 0) {
        return NextResponse.json({ error: "Data kosong" }, { status: 400 });
      }

      const eventId = body[0].event_id;
      if (!eventId) {
        return NextResponse.json(
          { error: "event_id diperlukan" },
          { status: 400 },
        );
      }

      // Unified auth check for the batch
      const session = await getAuthorizedSession(request, eventId);
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Validate all items (simplified validation for batch)
      const guestsToInsert = body.map((item: any) => ({
        name: item.name,
        slug: item.slug || generateSlug(item.name),
        max_pax: item.max_pax || 2,
        qr_token: item.qr_token || generateQrToken(),
        event_id: eventId,
      }));

      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("guests")
        .insert(guestsToInsert)
        .select();

      if (error) {
        return NextResponse.json(
          { error: "Gagal bulk insert: " + error.message },
          { status: 500 },
        );
      }

      return NextResponse.json({ data }, { status: 201 });
    }

    // Single insert logic (existing)
    const result = createGuestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: formatZodErrors(result.error) },
        { status: 400 },
      );
    }

    const { name, max_pax, event_id } = result.data;

    // Unified auth check
    const session = await getAuthorizedSession(request, event_id);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    const slug = generateSlug(name);
    const qrToken = generateQrToken();

    const { data, error } = await supabase
      .from("guests")
      .insert({
        name,
        slug,
        max_pax,
        qr_token: qrToken,
        event_id,
      })
      .select()
      .single();

    if (error) {
      // Handle duplicate slug
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Tamu dengan nama ini sudah ada" },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: "Gagal menambahkan tamu" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// DELETE: Remove a guest
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const eventId = searchParams.get("event_id"); // Ideally provided for client validation

    if (!id) {
      return NextResponse.json(
        { error: "ID tamu diperlukan" },
        { status: 400 },
      );
    }

    // Unified auth check (if eventId is provided, use it for strict client check)
    const session = await getAuthorizedSession(request, eventId || undefined);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    // For clients, we add an extra filter on event_id if we have it in session
    let query = supabase.from("guests").delete().eq("id", id);
    if (session.isClient && session.eventId) {
      query = query.eq("event_id", session.eventId);
    }

    const { error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Gagal menghapus tamu" },
        { status: 500 },
      );
    }

    if (error) {
      return NextResponse.json(
        { error: "Gagal menghapus tamu" },
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

// PATCH: Update guest data (e.g. check-in status)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, event_id, ...updateData } = body;

    if (!id || !event_id) {
      return NextResponse.json(
        { error: "ID tamu dan ID event diperlukan" },
        { status: 400 },
      );
    }

    // Auth check
    const session = await getAuthorizedSession(request, event_id);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("guests")
      .update(updateData)
      .eq("id", id)
      .eq("event_id", event_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Gagal memperbarui data tamu" },
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
