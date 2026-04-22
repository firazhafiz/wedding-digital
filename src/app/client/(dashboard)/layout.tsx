import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyClientToken } from "@/lib/client/auth";
import { CLIENT_COOKIE_NAME } from "@/lib/client/context";
import ClientShell from "@/components/client/ClientShell";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(CLIENT_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/client/login");
  }

  const payload = await verifyClientToken(token);
  if (!payload) {
    redirect("/client/login");
  }

  // Determine active event logic
  const activeEventCookie = cookieStore.get("client_active_event")?.value;
  const targetEventId = activeEventCookie || payload.eventId;

  if (!targetEventId) {
    redirect("/client/events");
  }

  return (
    <ClientShell eventId={targetEventId} clientLabel={payload.label}>
      {children}
    </ClientShell>
  );
}
