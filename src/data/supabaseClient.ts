// supabaseClient.ts — the single Supabase client module (design: Repository layer is
// the only code that talks to Supabase). Nothing outside src/data should import this.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { checkSupabaseConfig } from "./config";

let client: SupabaseClient | null = null;

// Lazily construct one shared client. Throws a clear error if config is missing so
// callers (and the startup guard) can surface Requirement 11.4.
export function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  const check = checkSupabaseConfig();
  if (!check.ok) {
    throw new Error(
      `Missing Supabase configuration: ${check.missing.join(", ")}`,
    );
  }

  client = createClient(check.config.url, check.config.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return client;
}

// Test/CLI seam: inject a pre-built client (used by the connectivity script).
export function setSupabaseClient(injected: SupabaseClient): void {
  client = injected;
}

export const HANGOUT_PHOTOS_BUCKET = "hangout-photos";
