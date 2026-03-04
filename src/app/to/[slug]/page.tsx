import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  Guest,
  EventInfo,
  StorylineItem,
  GalleryPhoto,
  GuestbookEntry,
} from "@/types";
import InvitationClient from "./InvitationClient";

interface PageProps {
  params: Promise<{ slug: string }>;
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

async function getGuestData(slug: string) {
  const supabase = await createClient();

  // Fetch guest by slug
  const { data: guest } = await supabase
    .from("guests")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!guest) return null;

  // Fetch event info
  const { data: eventInfo } = await supabase
    .from("event_info")
    .select("*")
    .limit(1)
    .single();

  // Fetch storyline items
  const { data: storyline } = await supabase
    .from("storyline")
    .select("*")
    .order("sort_order", { ascending: true });

  // Fetch gallery photos
  const { data: gallery } = await supabase
    .from("gallery")
    .select("*")
    .order("sort_order", { ascending: true });

  // Fetch approved guestbook entries
  const { data: guestbook } = await supabase
    .from("guestbook")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(50);

  return {
    guest: guest as Guest,
    eventInfo: eventInfo as EventInfo | null,
    storyline: (storyline || []) as StorylineItem[],
    gallery: (gallery || []) as GalleryPhoto[],
    guestbook: (guestbook || []) as GuestbookEntry[],
  };
}

export default async function InvitationPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getGuestData(slug);

  if (!data) {
    notFound();
  }

  return <InvitationClient {...data} />;
}
