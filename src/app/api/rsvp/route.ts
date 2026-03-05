import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rsvpSchema, formatZodErrors } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate
    const result = rsvpSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: formatZodErrors(result.error) },
        { status: 400 },
      );
    }

    const { guestId, status, pax, message, event_id } = result.data;
    const supabase = await createClient();

    // Update guest RSVP (filtered by event_id for security)
    const { data, error } = await supabase
      .from("guests")
      .update({
        rsvp_status: status,
        rsvp_pax: status === "attending" ? pax : 0,
        rsvp_message: message || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", guestId)
      .eq("event_id", event_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Gagal menyimpan RSVP" },
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
