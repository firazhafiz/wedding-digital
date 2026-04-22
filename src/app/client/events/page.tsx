import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyClientToken } from "@/lib/client/auth";
import { CLIENT_COOKIE_NAME } from "@/lib/client/context";
import { createAdminClient } from "@/lib/supabase/admin";
import EventSelectionClient from "./EventSelectionClient";

export default async function ClientEventsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CLIENT_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/client/login");
  }

  const payload = await verifyClientToken(token);
  if (!payload) {
    redirect("/client/login");
  }

  const supabase = createAdminClient();

  // Find all events that belong to this client's email OR match the legacy eventId
  // Fallback if client has no email in token but has eventId
  let query = supabase.from("event_info").select("id, event_slug, bride_name, groom_name, akad_date, hero_photo_url");
  
  if (payload.email) {
    query = query.eq("client_email", payload.email);
  } else if (payload.eventId) {
    query = query.eq("id", payload.eventId);
  } else {
    // If neither exists, we have an invalid token state
    query = query.eq("id", "invalid-id-match");
  }

  const { data: events, error } = await query;

  if (error) {
    console.error("Error fetching client events:", error);
  }

  // If there's literally only 1 event, we could auto-select it. 
  // However, going to the selection screen gives better UX for consistent navigation.

  return (
    <div className="min-h-screen bg-[#0f1a2e] flex flex-col items-center px-4 py-20">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl text-off-white mb-3">
            Pilih Event
          </h1>
          <p className="font-body text-sm text-white/50 tracking-wider">
            Akun Anda terhubung dengan {events?.length || 0} project
          </p>
        </div>

        {(!events || events.length === 0) ? (
          <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
            <p className="text-white/40 font-body">Belum ada project / event yang di-assign ke email Anda ({payload.email}).</p>
            <p className="text-white/30 text-xs mt-2">Silakan hubungi administrator Aka Digital.</p>
          </div>
        ) : (
          <EventSelectionClient events={events} />
        )}
      </div>
    </div>
  );
}
