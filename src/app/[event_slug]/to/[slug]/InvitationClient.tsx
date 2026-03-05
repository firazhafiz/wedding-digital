"use client";

import { useState } from "react";
import type {
  Guest,
  EventInfo,
  StorylineItem,
  GalleryPhoto,
  GuestbookEntry,
} from "../../../../types";
import SmoothScrollProvider from "../../../../components/providers/SmoothScrollProvider";
import WelcomeScreen from "../../../../components/invitation/WelcomeScreen";
import HeroSection from "../../../../components/invitation/HeroSection";
import AudioPlayer from "../../../../components/invitation/AudioPlayer";
import CountdownSection from "../../../../components/invitation/CountdownSection";
import CoupleSection from "../../../../components/invitation/CoupleSection";
import StorylineSection from "../../../../components/invitation/StorylineSection";
import ProtocolSection from "../../../../components/invitation/ProtocolSection";
import GallerySection from "../../../../components/invitation/GallerySection";
import RsvpSection from "../../../../components/invitation/RsvpSection";
import GuestbookSection from "../../../../components/invitation/GuestbookSection";
import GiftSection from "../../../../components/invitation/GiftSection";
import FooterSection from "../../../../components/invitation/FooterSection";
import OrnamentalDivider from "../../../../components/invitation/OrnamentalDivider";

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
        style={
          {
            "--color-primary": eventInfo?.primary_color || "#D4AF37",
            "--color-secondary": eventInfo?.secondary_color || "#1A1A1A",
            "--font-display": eventInfo?.font_display || "Safira March",
          } as React.CSSProperties
        }
      >
        <SmoothScrollProvider enabled={isOpen}>
          {/* Audio player (floating) */}
          <AudioPlayer
            src={eventInfo?.audio_url || "/audio/wedding-music.mp3"}
            autoPlay={audioReady}
          />

          {/* Hero */}
          <HeroSection eventInfo={eventInfo} guestName={guest.name} />

          <OrnamentalDivider variant="flourish" />

          {/* Countdown & Schedule */}
          {eventInfo?.show_countdown !== false && (
            <>
              <CountdownSection eventInfo={eventInfo} />
              <OrnamentalDivider variant="diamond" />
            </>
          )}

          {/* Couple / Mempelai */}
          <CoupleSection eventInfo={eventInfo} />

          {/* Joint Story & Gallery Section with Background */}
          <div className="relative overflow-hidden">
            {eventInfo?.story_gallery_bg_url && (
              <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat grayscale"
                style={{
                  backgroundImage: `url(${eventInfo.story_gallery_bg_url})`,
                  backgroundAttachment: "fixed",
                }}
              />
            )}

            {/* Dark Overlay for better text readability */}
            <div className="absolute inset-0 z-0 bg-black/70" />

            <div className="relative z-10">
              {/* Divider inside background */}
              <OrnamentalDivider
                variant="flourish"
                className={eventInfo?.story_gallery_bg_url ? "opacity-100" : ""}
              />

              {/* Our Story */}
              {eventInfo?.show_storyline !== false && storyline.length > 0 && (
                <>
                  <StorylineSection
                    items={storyline}
                    isDark={!!eventInfo?.story_gallery_bg_url}
                  />
                </>
              )}

              {/* Gallery */}
              {gallery.length > 0 && (
                <>
                  <GallerySection
                    photos={gallery}
                    isDark={!!eventInfo?.story_gallery_bg_url}
                  />
                  <OrnamentalDivider
                    variant="diamond"
                    className={
                      eventInfo?.story_gallery_bg_url ? "opacity-100" : ""
                    }
                  />
                </>
              )}
            </div>
          </div>

          {/* RSVP */}
          <RsvpSection guest={guest} eventId={eventInfo?.id} />

          <OrnamentalDivider variant="flourish" />

          {/* Guestbook */}
          {eventInfo?.show_guestbook !== false && (
            <>
              <GuestbookSection
                guest={guest}
                eventId={eventInfo?.id || ""}
                initialEntries={initialGuestbook}
              />
              <OrnamentalDivider variant="diamond" />
            </>
          )}

          {/* Gift / Angpao */}
          {eventInfo?.show_gifts !== false && (
            <>
              <GiftSection guest={guest} eventInfo={eventInfo} />
            </>
          )}

          {/* Protocol Kesehatan */}
          <ProtocolSection />

          <OrnamentalDivider variant="flourish" />
          {/* Footer */}
          <FooterSection eventInfo={eventInfo} />
        </SmoothScrollProvider>
      </div>
    </>
  );
}
