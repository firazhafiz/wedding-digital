import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client with the Service Role Key.
 * This client bypasses Row Level Security (RLS).
 * ! ONLY USE ON THE SERVER !
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase Admin Environment Variables");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
