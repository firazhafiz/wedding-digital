import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const xenditWebhookToken = process.env.XENDIT_WEBHOOK_TOKEN;
  const callbackToken = request.headers.get("x-callback-token");

  // 1. Verify Webhook Token
  if (xenditWebhookToken && callbackToken !== xenditWebhookToken) {
    console.error("Webhook Token Mismatch. Expected:", xenditWebhookToken, "Got:", callbackToken);
    return NextResponse.json({ error: "Invalid callback token" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status, external_id, id: paymentId } = body;
    console.log("Xendit Webhook Received:", { status, external_id, paymentId });

    // We only care about PAID invoices
    if (status !== "PAID") {
      console.log("Ignoring non-PAID status:", status);
      return NextResponse.json({ message: "Ignoring non-PAID status" });
    }

    const supabase = await createAdminClient();

    // 2. Find the order
    const { data: order, error: orderError } = await supabase
      .from("order_requests")
      .select("*")
      .eq("id", external_id)
      .single();

    if (orderError || !order) {
      console.error("Order not found for webhook external_id:", external_id, orderError);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    console.log("Found order, updating status for ID:", order.id);

    // 3. Update Payment Status
    const { error: updateError } = await supabase
      .from("order_requests")
      .update({ 
        payment_status: "paid",
        status: "confirmed" // Auto-confirm the request
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("Failed to update payment status in DB:", updateError);
      return NextResponse.json({ error: "Database update failed" }, { status: 500 });
    }

    console.log("Status updated to PAID successfully for Order:", order.id);

    // 4. Auto-Create Event Catalog
    const groomFirstName = order.groom_name.trim().split(/\s+/)[0] || "groom";
    const brideFirstName = order.bride_name.trim().split(/\s+/)[0] || "bride";
    let slug = `${groomFirstName}-${brideFirstName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Check slug collision
    const { data: existingEvent } = await supabase
      .from('event_info')
      .select('id')
      .eq('event_slug', slug)
      .maybeSingle();

    if (existingEvent) {
      const suffix = Math.random().toString(36).substring(2, 5);
      slug = `${slug}-${suffix}`;
    }

    // Map Guest Limit
    const limits = { basic: 100, pro: 500, exclusive: 1000, elite: 2500 };
    const guestLimit = limits[order.package_type as keyof typeof limits] || 100;

    console.log("Attempting to create event catalog with slug:", slug);

    // Create the event
    const { error: eventError } = await supabase
      .from('event_info')
      .insert({
        user_id: null, // Webhook runs without user context
        event_slug: slug,
        groom_name: order.groom_name,
        bride_name: order.bride_name,
        package_type: order.package_type,
        guest_limit: guestLimit,
      });

    if (eventError) {
      console.error("Auto-catalog creation failed:", eventError);
    } else {
      console.log("Event catalog created successfully for slug:", slug);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Fatal Webhook error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
