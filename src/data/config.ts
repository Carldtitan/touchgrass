// config.ts — startup config guard (Requirement 11.2, 11.4).
// Reads Supabase config from the environment and names any missing variable.
export interface ConfigCheck {
  valid: boolean;
  missing: string[];
}

export function checkConfig(): ConfigCheck {
  const env = import.meta.env;
  const missing: string[] = [];
  if (!env.VITE_SUPABASE_URL) missing.push("VITE_SUPABASE_URL");
  if (!env.VITE_SUPABASE_ANON_KEY) missing.push("VITE_SUPABASE_ANON_KEY");
  return { valid: missing.length === 0, missing };
}
