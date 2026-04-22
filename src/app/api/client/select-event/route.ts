import { NextRequest, NextResponse } from "next/server";
import { CLIENT_COOKIE_NAME } from "@/lib/client/context";

export async function POST(req: NextRequest) {
  try {
    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID harus diisi" },
        { status: 400 },
      );
    }

    const response = NextResponse.json({ success: true });
    
    // Set active event cookie
    response.cookies.set("client_active_event", eventId, {
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
