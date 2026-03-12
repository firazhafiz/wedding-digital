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

    const { data, error } = await supabase
      .from("order_requests")
      .insert({
        package_type: package_type || "starter",
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
      })
      .select()
      .single();

    if (error) {
      console.error("Order insert error:", error);
      return NextResponse.json(
        { error: "Gagal menyimpan pesanan" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error("Order API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
