import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ event_slug: string }>;
}

export default async function EventRootPage({ params }: PageProps) {
  const { event_slug } = await params;
  const supabase = await createClient();

  // 1. Fetch event
  const { data: eventInfo } = await supabase
    .from("event_info")
    .select("id")
    .eq("event_slug", event_slug)
    .single();

  if (!eventInfo) {
    redirect("/admin/events"); // Or a global 404
  }

  // 2. Fetch first guest to provide a working link, or use 'tamu' slug as default
  const { data: guest } = await supabase
    .from("guests")
    .select("slug")
    .eq("event_id", eventInfo.id)
    .limit(1)
    .single();

  if (guest) {
    redirect(`/${event_slug}/to/${guest.slug}`);
  }

  // If no guests exist yet, redirect to admin or show error
  redirect("/admin/events");
}
