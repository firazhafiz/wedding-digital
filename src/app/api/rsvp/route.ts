import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rsvpSchema, formatZodErrors } from "@/lib/validations";
import { sendRsvpNotification } from "@/lib/notifications/resend";

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
    const phone_number = body.phone_number || null;
    const supabase = await createClient();

    // Update guest RSVP (filtered by event_id for security)
    const updatePayload: Record<string, any> = {
      rsvp_status: status,
      rsvp_pax: status === "attending" ? pax : 0,
      rsvp_message: message || null,
      updated_at: new Date().toISOString(),
    };

    // Only update phone_number if provided (don't overwrite existing with null)
    if (phone_number) {
      updatePayload.phone_number = phone_number;
    }

    const { data, error } = await supabase
      .from("guests")
      .update(updatePayload)
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

    // Send email notification (fire-and-forget, don't block the response)
    try {
      const adminClient = createAdminClient();
      const { data: eventData } = await adminClient
        .from("event_info")
        .select("groom_name, bride_name, notification_email")
        .eq("id", event_id)
        .single();

      if (eventData?.notification_email) {
        const eventTitle = `${eventData.groom_name} & ${eventData.bride_name}`;
        sendRsvpNotification({
          guestName: data.name,
          status,
          pax,
          message: message || undefined,
          eventTitle,
          notificationEmail: eventData.notification_email,
        }).catch((err) => console.error("[RSVP Notification] Error:", err));
      }
    } catch (notifErr) {
      console.error("[RSVP Notification] Lookup error:", notifErr);
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
