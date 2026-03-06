import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hashPassword } from "@/lib/client/auth";

// CREATE client user
export async function POST(req: NextRequest) {
  try {
    const { event_id, email, password, label } = await req.json();

    if (!event_id || !email || !password) {
      return NextResponse.json(
        { error: "Event ID, email, dan password wajib diisi" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(password);
    const supabase = await createClient();

    const { error } = await supabase.from("client_users").insert({
      event_id,
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      label: label || "Client",
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Email sudah digunakan" },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: "Gagal membuat akses: " + error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// UPDATE client user
export async function PUT(req: NextRequest) {
  try {
    const { id, email, password, label } = await req.json();

    if (!id || !email) {
      return NextResponse.json(
        { error: "ID dan email wajib diisi" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const updateData: Record<string, string> = {
      email: email.toLowerCase().trim(),
      label: label || "Client",
    };

    // Only update password if provided
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password minimal 6 karakter" },
          { status: 400 },
        );
      }
      updateData.password_hash = await hashPassword(password);
    }

    const { error } = await supabase
      .from("client_users")
      .update(updateData)
      .eq("id", id);

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Email sudah digunakan" },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: "Gagal memperbarui: " + error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
