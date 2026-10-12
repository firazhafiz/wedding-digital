import { notFound } from "next/navigation";
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
    notFound();
  }

  // Prevent guest enumeration / privacy leak:
  // Root event URL should not leak any individual guest link
  notFound();
}
