import { notFound } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import type {
  Guest,
  EventInfo,
  StorylineItem,
  GalleryPhoto,
  GuestbookEntry,
} from "../../../../types";
import InvitationClient from "./InvitationClient";

interface PageProps {
  params: Promise<{ event_slug: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const guestName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `Wedding Invitation — ${guestName}`,
    description: `You are cordially invited to our wedding celebration. Special invitation for ${guestName}.`,
    openGraph: {
      title: `Wedding Invitation — ${guestName}`,
      description: `Special invitation for ${guestName}`,
    },
  };
}

async function getInvitationData(event_slug: string, slug: string) {
  const supabase = await createClient();

  console.log(`DEBUG: Fetching event with slug: ${event_slug}`);
  // 1. Fetch event info by slug
  const { data: eventInfo, error: eventError } = await supabase
    .from("event_info")
    .select("*")
    .eq("event_slug", event_slug)
    .single();

  if (eventError) console.error("DEBUG: Event Fetch Error:", eventError);
  if (!eventInfo) {
    console.log("DEBUG: Event not found for slug:", event_slug);
    return null;
  }

  console.log(
    `DEBUG: Found Event ID: ${eventInfo.id}. Fetching guest with slug: ${slug}`,
  );
  // 2. Fetch guest by slug AND event_id
  const { data: guest, error: guestError } = await supabase
    .from("guests")
    .select("*")
    .eq("slug", slug)
    .eq("event_id", eventInfo.id)
    .single();

  if (guestError) console.error("DEBUG: Guest Fetch Error:", guestError);
  if (!guest) {
    console.log(
      "DEBUG: Guest not found for slug:",
      slug,
      "in event:",
      eventInfo.id,
    );
    return null;
  }

  // 3. Fetch all other data related to this specific event
  const [storylineRes, galleryRes, guestbookRes] = await Promise.all([
    supabase
      .from("storyline")
      .select("*")
      .eq("event_id", eventInfo.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("gallery")
      .select("*")
      .eq("event_id", eventInfo.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("guestbook")
      .select("*")
      .eq("event_id", eventInfo.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return {
    guest: guest as Guest,
    eventInfo: eventInfo as EventInfo,
    storyline: (storylineRes.data || []) as StorylineItem[],
    gallery: (galleryRes.data || []) as GalleryPhoto[],
    guestbook: (guestbookRes.data || []) as GuestbookEntry[],
  };
}

export default async function InvitationPage({ params }: PageProps) {
  const { event_slug, slug } = await params;
  console.log("DEBUG: Page Request Params:", { event_slug, slug });
  const data = await getInvitationData(event_slug, slug);

  if (!data) {
    notFound();
  }

  return <InvitationClient {...data} />;
}
