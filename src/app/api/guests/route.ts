import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createGuestSchema, formatZodErrors } from "@/lib/validations";
import { generateSlug, generateQrToken } from "@/lib/utils";

// GET: Fetch all guests for an event
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("event_id");

    if (!eventId) {
      return NextResponse.json(
        { error: "ID event diperlukan" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

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

// POST: Create a new guest
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = createGuestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: formatZodErrors(result.error) },
        { status: 400 },
      );
    }

    const { name, max_pax, event_id } = result.data;
    const supabase = await createClient();

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
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID tamu diperlukan" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.from("guests").delete().eq("id", id);

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
