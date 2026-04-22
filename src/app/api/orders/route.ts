import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      package_type,
      guest_qty,
      total_price,
      client_name,
      client_phone,
      client_email,
      groom_name,
      bride_name,
      event_date,
      event_location,
      notes,
    } = body;

    if (!client_name || !client_phone || !groom_name || !bride_name) {
      return NextResponse.json(
        { error: "Field wajib belum lengkap" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // 1. Save initial order to database
    const { data: order, error: insertError } = await supabase
      .from("order_requests")
      .insert({
        package_type: package_type || "basic",
        guest_qty: guest_qty || 1,
        total_price: total_price || 0,
        client_name,
        client_phone,
        client_email: client_email || null,
        groom_name,
        bride_name,
        event_date: event_date || null,
        event_location: event_location || null,
        notes: notes || null,
        payment_status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Order insert error:", insertError);
      return NextResponse.json(
        { error: "Gagal menyimpan pesanan" },
        { status: 500 },
      );
    }

    // 2. Create Xendit Invoice if Secret Key is available
    let paymentUrl = null;
    let paymentId = null;

    if (process.env.XENDIT_SECRET_KEY) {
      try {
        const xenditAuth = Buffer.from(`${process.env.XENDIT_SECRET_KEY}:`).toString("base64");
        const xenditRes = await fetch("https://api.xendit.co/v2/invoices", {
          method: "POST",
          headers: {
            "Authorization": `Basic ${xenditAuth}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            external_id: order.id,
            amount: total_price,
            description: `Pembayaran Undangan Digital - Paket ${package_type}`,
            customer: {
              given_names: client_name,
              email: client_email || undefined,
              mobile_number: client_phone,
            },
            success_redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order/success?id=${order.id}`,
            failure_redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order?package=${package_type}`,
            currency: "IDR",
            reminder_time: 1,
          }),
        });

        const xenditData = await xenditRes.json();
        if (xenditRes.ok) {
          paymentUrl = xenditData.invoice_url;
          paymentId = xenditData.id;

          // Update order with payment info
          await supabase
            .from("order_requests")
            .update({
              payment_url: paymentUrl,
              payment_id: paymentId,
            })
            .eq("id", order.id);
        }
      } catch (err) {
        console.error("Xendit API error:", err);
        // We continue even if Xendit fails, user can still be followed up manually
      }
    }

    return NextResponse.json({ 
      data: { 
        ...order, 
        payment_url: paymentUrl 
      } 
    }, { status: 201 });
  } catch (err) {
    console.error("Order API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
