import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { verifyClientToken } from "@/lib/client/auth";
import { CLIENT_COOKIE_NAME } from "@/lib/client/context";
import StatsCard from "@/components/admin/StatsCard";
import type { GuestbookEntry } from "@/types";

async function getClientDashboardData() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CLIENT_COOKIE_NAME)?.value;

  if (!token) redirect("/client/login");
  const payload = await verifyClientToken(token);
  if (!payload) redirect("/client/login");

  const supabase = await createClient();

  const { data: eventInfo } = await supabase
    .from("event_info")
    .select("id, event_slug, groom_name, bride_name")
    .eq("id", payload.eventId)
    .single();

  if (!eventInfo) redirect("/client/login");

  const { data: guests } = await supabase
    .from("guests")
    .select("*")
    .eq("event_id", eventInfo.id);

  const { data: recentGuestbook } = await supabase
    .from("guestbook")
    .select("*")
    .eq("event_id", eventInfo.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const guestList = guests || [];

  return {
    totalGuests: guestList.length,
    attending: guestList.filter((g) => g.rsvp_status === "attending").length,
    notAttending: guestList.filter((g) => g.rsvp_status === "not_attending")
      .length,
    pending: guestList.filter((g) => g.rsvp_status === "pending").length,
    checkedIn: guestList.filter((g) => g.checked_in).length,
    totalPax: guestList.reduce(
      (sum, g) => sum + (g.rsvp_status === "attending" ? g.rsvp_pax || 0 : 0),
      0,
    ),
    recentGuestbook: (recentGuestbook || []) as GuestbookEntry[],
    eventSlug: eventInfo.event_slug,
  };
}

export default async function ClientDashboardPage() {
  const stats = await getClientDashboardData();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-body text-2xl font-semibold text-charcoal-dark">
          Dashboard
        </h1>
        <p className="font-body text-sm text-charcoal-light mt-1">
          Ringkasan undangan dan kehadiran
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Tamu"
          value={stats.totalGuests}
          color="gold"
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatsCard
          label="Hadir"
          value={`${stats.attending} (${stats.totalPax} pax)`}
          color="emerald"
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22,4 12,14.01 9,11.01" />
            </svg>
          }
        />
        <StatsCard
          label="Tidak Hadir"
          value={stats.notAttending}
          color="red"
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          }
        />
        <StatsCard
          label="Checked-in"
          value={stats.checkedIn}
          color="blue"
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          }
        />
      </div>

      {/* RSVP Breakdown + Recent Guestbook */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RSVP Bar */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <h3 className="font-body text-sm font-semibold text-charcoal-dark mb-4">
            Status RSVP
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-body text-xs text-charcoal-light">
                  Hadir
                </span>
                <span className="font-body text-xs font-medium text-charcoal">
                  {stats.attending}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.totalGuests ? (stats.attending / stats.totalGuests) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-body text-xs text-charcoal-light">
                  Tidak Hadir
                </span>
                <span className="font-body text-xs font-medium text-charcoal">
                  {stats.notAttending}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.totalGuests ? (stats.notAttending / stats.totalGuests) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-body text-xs text-charcoal-light">
                  Pending
                </span>
                <span className="font-body text-xs font-medium text-charcoal">
                  {stats.pending}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.totalGuests ? (stats.pending / stats.totalGuests) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Guestbook */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <h3 className="font-body text-sm font-semibold text-charcoal-dark mb-4">
            Ucapan Terbaru
          </h3>
          {stats.recentGuestbook.length > 0 ? (
            <div className="space-y-3">
              {stats.recentGuestbook.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 p-3 rounded-md bg-gray-50"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <span className="font-body text-[10px] font-semibold text-blue-500">
                      {entry.guest_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-body text-xs font-medium text-charcoal-dark truncate">
                        {entry.guest_name}
                      </p>
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                          entry.status === "approved"
                            ? "bg-emerald-400"
                            : entry.status === "rejected"
                              ? "bg-red-400"
                              : "bg-amber-400"
                        }`}
                      />
                    </div>
                    <p className="font-body text-xs text-charcoal-light line-clamp-2 mt-0.5">
                      {entry.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-body text-sm text-charcoal-light/50 text-center py-6">
              Belum ada ucapan
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
