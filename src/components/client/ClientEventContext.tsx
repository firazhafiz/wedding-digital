"use client";

import { createContext, useContext } from "react";

const ClientEventContext = createContext<string>("");

export function ClientEventProvider({
  eventId,
  children,
}: {
  eventId: string;
  children: React.ReactNode;
}) {
  return (
    <ClientEventContext.Provider value={eventId}>
      {children}
    </ClientEventContext.Provider>
  );
}

/**
 * Hook to get the event ID bound to the current client session.
 * Must be used inside ClientEventProvider.
 */
export function useClientEventId(): string {
  const eventId = useContext(ClientEventContext);
  if (!eventId) {
    throw new Error("useClientEventId must be used within ClientEventProvider");
  }
  return eventId;
}
