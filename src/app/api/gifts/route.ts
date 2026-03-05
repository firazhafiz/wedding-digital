import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { giftSchema, formatZodErrors } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate
    const result = giftSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: formatZodErrors(result.error) },
        { status: 400 },
      );
    }

    const { guestId, senderName, bankName, amount, notes, event_id } =
      result.data;
    const supabase = await createClient();

    // Insert gift record
    const { data, error } = await supabase
      .from("gifts")
      .insert({
        guest_id: guestId || null,
        event_id,
        sender_name: senderName,
        bank_name: bankName || null,
        amount: amount || null,
        proof_url: body.proofUrl || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Gagal menyimpan konfirmasi hadiah" },
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
