import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthorizedSession } from "@/lib/auth-shared";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { qr_token, event_id, override } = body;

    if (!qr_token || !event_id) {
      return NextResponse.json(
        { status: "error", error: "QR Token atau Event ID tidak ditemukan" },
        { status: 400 },
      );
    }

    // New unified auth check
    const session = await getAuthorizedSession(req, event_id);
    if (!session) {
      return NextResponse.json(
        { status: "error", error: "Unauthorized" },
        { status: 401 },
      );
    }

    const supabase = createAdminClient();

    // Find the guest by qr_token and event_id
    const { data: guest, error: fetchError } = await supabase
      .from("guests")
      .select("id, name, checked_in, checked_in_at, checked_in_count, rsvp_pax, max_pax")
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

    const currentCount = guest.checked_in_count || 0;
    const totalPax = guest.rsvp_pax || guest.max_pax || 1;

    // If already fully checked in and NOT override
    if (currentCount >= totalPax && !override) {
      return NextResponse.json(
        {
          status: "already_checked_in",
          data: {
            guest_name: guest.name,
            checked_in_at: guest.checked_in_at,
            checked_in_count: currentCount,
            total_pax: totalPax,
          },
        },
        { status: 200 },
      );
    }

    // Increment checked_in_count
    const newCount = currentCount + 1;
    const isFullyCheckedIn = newCount >= totalPax;
    const newCheckedInAt = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("guests")
      .update({
        checked_in_count: newCount,
        checked_in: isFullyCheckedIn,
        checked_in_at: guest.checked_in_at || newCheckedInAt,
      })
      .eq("id", guest.id);

    if (updateError) {
      throw new Error("Gagal menyimpan data check-in ke database");
    }

    // Determine response status
    const responseStatus = override
      ? "override_success"
      : isFullyCheckedIn
        ? "success"
        : "partial_checkin";

    return NextResponse.json(
      {
        status: responseStatus,
        data: {
          guest_name: guest.name,
          checked_in_at: guest.checked_in_at || newCheckedInAt,
          checked_in_count: newCount,
          total_pax: totalPax,
        },
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
