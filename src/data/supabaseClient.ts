// supabaseClient.ts — the single Supabase client (Requirement 11.2).
// The ONLY module besides the repositories that touches Supabase. Reads config
// from the environment; the startup guard in config.ts decides whether the app
// renders or shows ConfigError before this is ever used.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    // Should be unreachable: App renders ConfigError when config is missing.
    throw new Error("Supabase configuration is missing");
  }
  client = createClient(url, anonKey);
  return client;
}

export const PHOTO_BUCKET = "hangout-photos";
