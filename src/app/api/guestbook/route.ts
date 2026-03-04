import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { guestbookSchema, formatZodErrors } from "@/lib/validations";

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

    const { guestId, guestName, message } = result.data;
    const supabase = await createClient();

    // Insert guestbook entry (status: pending for moderation)
    const { data, error } = await supabase
      .from("guestbook")
      .insert({
        guest_id: guestId,
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
