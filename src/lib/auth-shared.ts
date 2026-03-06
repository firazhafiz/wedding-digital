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
      if (payload && payload.eventId) {
        // If a targetEventId is provided, ensure the client's token matches it
        if (targetEventId && payload.eventId !== targetEventId) {
          return null;
        }
        return {
          isAdmin: false,
          isClient: true,
          eventId: payload.eventId as string,
          email: payload.email as string,
        };
      }
    } catch (e) {
      console.error("Client JWT verification failed:", e);
    }
  }

  return null;
}
