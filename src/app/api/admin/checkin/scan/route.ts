import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { qr_token, event_id } = body;

    if (!qr_token || !event_id) {
      return NextResponse.json(
        { status: "error", error: "QR Token atau Event ID tidak ditemukan" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Verify admin is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { status: "error", error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Find the guest by qr_token and event_id
    const { data: guest, error: fetchError } = await supabase
      .from("guests")
      .select("id, name, checked_in, checked_in_at")
      .eq("qr_token", qr_token)
      .eq("event_id", event_id)
      .single();

    if (fetchError || !guest) {
      return NextResponse.json(
        {
          status: "error",
          error: "QR Code tidak valid atau bukan tamu acara ini",
        },
        { status: 404 },
      );
    }

    // Check if already checked in
    if (guest.checked_in) {
      return NextResponse.json(
        {
          status: "already_checked_in",
          data: { guest_name: guest.name, checked_in_at: guest.checked_in_at },
        },
        { status: 200 },
      );
    }

    // Perform Check-in
    const newCheckedInAt = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("guests")
      .update({
        checked_in: true,
        checked_in_at: newCheckedInAt,
      })
      .eq("id", guest.id);

    if (updateError) {
      throw new Error("Gagal menyimpan data check-in ke database");
    }

    return NextResponse.json(
      {
        status: "success",
        data: { guest_name: guest.name, checked_in_at: newCheckedInAt },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("QR Scan Error:", error);
    return NextResponse.json(
      { status: "error", error: error.message || "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
