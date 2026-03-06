import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPassword, createClientToken } from "@/lib/client/auth";
import { CLIENT_COOKIE_NAME } from "@/lib/client/context";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password harus diisi" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    // Find client user by email
    const { data: clientUser, error } = await supabase
      .from("client_users")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (error || !clientUser) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 },
      );
    }

    // Verify password
    const valid = await verifyPassword(password, clientUser.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 },
      );
    }

    // Create JWT token
    const token = await createClientToken({
      clientId: clientUser.id,
      eventId: clientUser.event_id,
      email: clientUser.email,
      label: clientUser.label || "Client",
    });

    // Set cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set(CLIENT_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
