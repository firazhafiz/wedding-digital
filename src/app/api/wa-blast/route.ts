import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthorizedSession } from "@/lib/auth-shared";

const DELAY_MIN_MS = 30000; // 30 seconds minimum between messages
const DELAY_MAX_MS = 60000; // 60 seconds maximum
const DAILY_LIMIT = 50; // Max messages per day per event

function randomDelay() {
  return Math.floor(Math.random() * (DELAY_MAX_MS - DELAY_MIN_MS + 1)) + DELAY_MIN_MS;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  try {
    // Auth check — only admin can trigger batch blast
    const session = await getAuthorizedSession(req);
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Hanya admin yang dapat menjalankan broadcast." }, { status: 403 });
    }

    const { eventId, guestIds } = await req.json();

    if (!eventId || !guestIds || !Array.isArray(guestIds) || guestIds.length === 0) {
      return NextResponse.json({ error: "Event ID dan daftar tamu harus diisi." }, { status: 400 });
    }

    // Enforce daily limit
    if (guestIds.length > DAILY_LIMIT) {
      return NextResponse.json({
        error: `Maksimal ${DAILY_LIMIT} pesan per sesi. Anda memilih ${guestIds.length} tamu.`,
      }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch event info for template and slug
    const { data: eventInfo, error: eventError } = await supabase
      .from("event_info")
      .select("event_slug, wa_template, wa_gateway_url, wa_api_key, guest_limit")
      .eq("id", eventId)
      .single();

    if (eventError || !eventInfo) {
      return NextResponse.json({ error: "Event tidak ditemukan." }, { status: 404 });
    }

    // Only Exclusive/Elite (>= 1000) can use blast
    if ((eventInfo.guest_limit || 0) < 1000) {
      return NextResponse.json({
        error: "Fitur broadcast hanya tersedia untuk paket Exclusive dan Elite.",
      }, { status: 403 });
    }

    if (!eventInfo.wa_gateway_url || !eventInfo.wa_api_key) {
      return NextResponse.json({
        error: "Gateway WA (Fonnté) belum dikonfigurasi. Silakan isi di Pengaturan Admin.",
      }, { status: 400 });
    }

    if (!eventInfo.wa_template) {
      return NextResponse.json({
        error: "Template pesan WhatsApp belum diisi. Silakan isi di Pengaturan.",
      }, { status: 400 });
    }

    // Fetch selected guests
    const { data: guests, error: guestError } = await supabase
      .from("guests")
      .select("id, name, slug, phone_number")
      .eq("event_id", eventId)
      .in("id", guestIds);

    if (guestError || !guests) {
      return NextResponse.json({ error: "Gagal memuat data tamu." }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://akadigital.vercel.app";
    const results: { guestId: string; name: string; status: "sent" | "failed" | "no_phone"; error?: string }[] = [];

    for (const guest of guests) {
      // Skip guests without phone number
      if (!guest.phone_number) {
        results.push({ guestId: guest.id, name: guest.name, status: "no_phone" });
        continue;
      }

      // Build personalized message
      const link = `${baseUrl}/${eventInfo.event_slug}/to/${guest.slug}`;
      const message = eventInfo.wa_template
        .replace(/\{\{nama\}\}/g, guest.name)
        .replace(/\{\{link\}\}/g, link);

      // Normalize phone number
      let phone = guest.phone_number.replace(/[^0-9]/g, "");
      if (phone.startsWith("0")) {
        phone = "62" + phone.slice(1);
      }

      try {
        // Send via Fonnté API
        const response = await fetch(eventInfo.wa_gateway_url, {
          method: "POST",
          headers: {
            Authorization: eventInfo.wa_api_key,
          },
          body: new URLSearchParams({
            target: phone,
            message: message,
            countryCode: "62",
          }),
        });

        const data = await response.json();

        if (response.ok && data.status) {
          results.push({ guestId: guest.id, name: guest.name, status: "sent" });
        } else {
          results.push({
            guestId: guest.id,
            name: guest.name,
            status: "failed",
            error: data.reason || data.message || "Unknown error",
          });
        }
      } catch (sendError) {
        results.push({
          guestId: guest.id,
          name: guest.name,
          status: "failed",
          error: sendError instanceof Error ? sendError.message : "Network error",
        });
      }

      // CRITICAL: Random delay between 30-60 seconds to avoid WhatsApp ban
      if (guests.indexOf(guest) < guests.length - 1) {
        const delay = randomDelay();
        await sleep(delay);
      }
    }

    const sent = results.filter((r) => r.status === "sent").length;
    const failed = results.filter((r) => r.status === "failed").length;
    const noPhone = results.filter((r) => r.status === "no_phone").length;

    return NextResponse.json({
      success: true,
      summary: { total: results.length, sent, failed, noPhone },
      results,
    });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
