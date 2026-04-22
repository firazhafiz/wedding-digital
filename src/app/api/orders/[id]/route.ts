import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: Check order status
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("order_requests")
    .select("id, payment_status")
    .eq("id", id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: order });
}

// DELETE: Cancel order
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Only allowed to delete if strictly pending
  const { data: order } = await supabase
    .from("order_requests")
    .select("payment_status")
    .eq("id", id)
    .single();

  if (!order || order.payment_status === "paid") {
    return NextResponse.json({ error: "Cannot cancel a paid order" }, { status: 400 });
  }

  const { error } = await supabase
    .from("order_requests")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Order cancelled successfully" });
}
