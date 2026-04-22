import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyClientToken } from "@/lib/client/auth";

export interface AuthSession {
  isAdmin: boolean;
  isClient: boolean;
  eventId?: string;
  email?: string;
}

/**
 * Validates if the request is from an authorized Admin or Client.
 * For Clients, it also verifies that they are accessing the correct event.
 */
export async function getAuthorizedSession(
  req: NextRequest,
  targetEventId?: string,
): Promise<AuthSession | null> {
  const supabase = await createClient();

  // 1. Check for Supabase Admin Session
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    return { isAdmin: true, isClient: false, email: user.email };
  }

  // 2. Check for Client JWT Session
  const token = req.cookies.get("client_session")?.value;
  if (token) {
    try {
      const payload = await verifyClientToken(token);
      if (payload) {
        // If a targetEventId is provided, we must verify ownership!
        if (targetEventId) {
          // If token has legacy strict eventId match
          if (payload.eventId === targetEventId) {
            return {
              isAdmin: false,
              isClient: true,
              eventId: targetEventId,
              email: payload.email as string,
            };
          }

          // Otherwise, check if this email owns the target event
          if (payload.email) {
            const { data: eventOwner } = await supabase
              .from("event_info")
              .select("client_email")
              .eq("id", targetEventId)
              .single();

            if (eventOwner && eventOwner.client_email === payload.email) {
              return {
                isAdmin: false,
                isClient: true,
                eventId: targetEventId,
                email: payload.email as string,
              };
            }
          }
          return null; // Denied: event doesn't belong to this email
        }

        // If no targetEventId requested, just return the authenticated state
        return {
          isAdmin: false,
          isClient: true,
          email: payload.email as string,
        };
      }
    } catch (e) {
      console.error("Client JWT verification failed:", e);
    }
  }

  return null;
}
