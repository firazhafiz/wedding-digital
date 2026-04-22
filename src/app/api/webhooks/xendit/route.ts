import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const xenditWebhookToken = process.env.XENDIT_WEBHOOK_TOKEN;
  const callbackToken = request.headers.get("x-callback-token");

  // 1. Verify Webhook Token
  if (xenditWebhookToken && callbackToken !== xenditWebhookToken) {
    return NextResponse.json({ error: "Invalid callback token" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status, external_id, id: paymentId } = body;

    // We only care about PAID invoices
    if (status !== "PAID") {
      return NextResponse.json({ message: "Ignoring non-PAID status" });
    }

    const supabase = await createClient();

    // 2. Find the order
    const { data: order, error: orderError } = await supabase
      .from("order_requests")
      .select("*")
      .eq("id", external_id)
      .single();

    if (orderError || !order) {
      console.error("Order not found for webhook:", external_id);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 3. Update Payment Status
    await supabase
      .from("order_requests")
      .update({ 
        payment_status: "paid",
        status: "confirmed" // Auto-confirm the request
      })
      .eq("id", order.id);

    // 4. Auto-Create Event Catalog
    // Check if event already exists for this order (optional, to prevent duplicates)
    // We'll use the groom & bride names to generate the slug
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
      // Even if this fails, we return 200 to Xendit because payment was processed
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
