import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkinSchema, formatZodErrors } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = checkinSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: formatZodErrors(result.error) },
        { status: 400 },
      );
    }

    const { qrToken } = result.data;
    const supabase = await createClient();

    // Find guest by QR token
    const { data: guest, error: findError } = await supabase
      .from("guests")
      .select("*")
      .eq("qr_token", qrToken)
      .single();

    if (findError || !guest) {
      return NextResponse.json(
        { error: "QR code tidak valid" },
        { status: 404 },
      );
    }

    // Check if already checked in
    if (guest.checked_in) {
      return NextResponse.json(
        {
          error: "Tamu sudah check-in sebelumnya",
          data: guest,
        },
        { status: 409 },
      );
    }

    // Update check-in status
    const { data: updated, error: updateError } = await supabase
      .from("guests")
      .update({
        checked_in: true,
        checked_in_at: new Date().toISOString(),
      })
      .eq("id", guest.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Gagal melakukan check-in" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: updated,
      message: `${guest.name} berhasil check-in`,
    });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
