"use client";

import { useState } from "react";
import type {
  Guest,
  EventInfo,
  StorylineItem,
  GalleryPhoto,
  GuestbookEntry,
} from "@/types";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import WelcomeScreen from "@/components/invitation/WelcomeScreen";
import HeroSection from "@/components/invitation/HeroSection";
import AudioPlayer from "@/components/invitation/AudioPlayer";
import CountdownSection from "@/components/invitation/CountdownSection";
import CoupleSection from "@/components/invitation/CoupleSection";
import StorylineSection from "@/components/invitation/StorylineSection";
import LocationSection from "@/components/invitation/LocationSection";
import GallerySection from "@/components/invitation/GallerySection";
import RsvpSection from "@/components/invitation/RsvpSection";
import GuestbookSection from "@/components/invitation/GuestbookSection";
import GiftSection from "@/components/invitation/GiftSection";
import FooterSection from "@/components/invitation/FooterSection";
import OrnamentalDivider from "@/components/invitation/OrnamentalDivider";

interface InvitationClientProps {
  guest: Guest;
  eventInfo: EventInfo | null;
  storyline: StorylineItem[];
  gallery: GalleryPhoto[];
  guestbook: GuestbookEntry[];
}

export default function InvitationClient({
  guest,
  eventInfo,
  storyline,
  gallery,
  guestbook: initialGuestbook,
}: InvitationClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setAudioReady(true);
  };

  return (
    <>
      {/* Welcome Screen — locks scroll until opened */}
      <WelcomeScreen
        guestName={guest.name}
        eventInfo={eventInfo}
        isOpen={isOpen}
        onOpen={handleOpen}
      />

      {/* Main invitation content — revealed after opening */}
      <div
        className={`transition-opacity duration-1000 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <SmoothScrollProvider>
          {/* Audio player (floating) */}
          <AudioPlayer
            src={eventInfo?.audio_url || "/audio/wedding-music.mp3"}
            autoPlay={audioReady}
          />

          {/* Hero */}
          <HeroSection eventInfo={eventInfo} guestName={guest.name} />

          <OrnamentalDivider variant="flourish" />

          {/* Countdown & Schedule */}
          <CountdownSection eventInfo={eventInfo} />

          <OrnamentalDivider variant="diamond" />

          {/* Couple / Mempelai */}
          <CoupleSection eventInfo={eventInfo} />

          <OrnamentalDivider variant="flourish" />

          {/* Our Story */}
          {storyline.length > 0 && (
            <>
              <StorylineSection items={storyline} />
              <OrnamentalDivider variant="diamond" />
            </>
          )}

          {/* Location */}
          <LocationSection eventInfo={eventInfo} />

          <OrnamentalDivider variant="flourish" />

          {/* Gallery */}
          {gallery.length > 0 && (
            <>
              <GallerySection photos={gallery} />
              <OrnamentalDivider variant="diamond" />
            </>
          )}

          {/* RSVP */}
          <RsvpSection guest={guest} />

          <OrnamentalDivider variant="flourish" />

          {/* Guestbook */}
          <GuestbookSection guest={guest} initialEntries={initialGuestbook} />

          <OrnamentalDivider variant="diamond" />

          {/* Gift / Angpao */}
          <GiftSection guest={guest} eventInfo={eventInfo} />

          <OrnamentalDivider variant="flourish" />

          {/* Footer */}
          <FooterSection eventInfo={eventInfo} />
        </SmoothScrollProvider>
      </div>
    </>
  );
}
