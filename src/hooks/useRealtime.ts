"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseRealtimeOptions<T> {
  /** Supabase table name */
  table: string;
  /** Event type to listen for */
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  /** Optional filter (e.g., "status=eq.approved") */
  filter?: string;
  /** Callback when data changes */
  onData?: (payload: {
    eventType: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new: T;
    old: Partial<T>;
  }) => void;
}

/**
 * Supabase Realtime subscription hook.
 * Subscribes to postgres_changes on a table.
 */
export function useRealtime<T = Record<string, unknown>>({
  table,
  event = "*",
  filter,
  onData,
}: UseRealtimeOptions<T>) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
      setIsSubscribed(false);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`realtime-${table}-${event}`)
      .on(
        "postgres_changes" as "system",
        {
          event,
          schema: "public",
          table,
          ...(filter ? { filter } : {}),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          onData?.({
            eventType: payload.eventType,
            new: payload.new as T,
            old: (payload.old || {}) as Partial<T>,
          });
        },
      )
      .subscribe((status: string) => {
        setIsSubscribed(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    return () => {
      unsubscribe();
    };
  }, [table, event, filter]);

  return { isSubscribed, unsubscribe };
}
