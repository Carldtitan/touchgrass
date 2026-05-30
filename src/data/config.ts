// config.ts — Supabase configuration + startup guard (Requirements 11.2, 11.4).
//
// Reads VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY and names any missing variable
// so Track C's ConfigError screen can display it (11.4).
//
// Two consumer-facing shapes share one implementation:
//   - checkSupabaseConfig() : structured result used by the repository client and
//                             the Node CLI connectivity script (browser + Node).
//   - checkConfig()         : the { valid, missing } shape consumed by App.tsx.

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export type ConfigCheckResult =
  | { ok: true; config: SupabaseConfig }
  | { ok: false; missing: ("VITE_SUPABASE_URL" | "VITE_SUPABASE_ANON_KEY")[] };

// Read raw env from Vite (import.meta.env) or Node (process.env), whichever exists,
// so the same function works in the browser app and in the CLI connectivity script.
function readEnv(name: REDACTED string | undefined {
  // Vite browser/build context.
  const viteEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
  if (viteEnv && typeof viteEnv[name] === "string") return viteEnv[name];

  // Node context (scripts, tests).
  if (typeof process !== "undefined" && process.env && name in process.env) {
    return process.env[name];
  }
  return undefined;
}

export function checkSupabaseConfig(): ConfigCheckResult {
  const url = (readEnv("VITE_SUPABASE_URL") ?? "").trim();
  const anonKey = (readEnv("VITE_SUPABASE_ANON_KEY") ?? "").trim();

  const missing: ("VITE_SUPABASE_URL" | "VITE_SUPABASE_ANON_KEY")[] = [];
  if (url.length === 0) missing.push("VITE_SUPABASE_URL");
  if (anonKey.length === 0) missing.push("VITE_SUPABASE_ANON_KEY");

  if (missing.length > 0) return { ok: false, missing };
  return { ok: true, config: { url, anonKey } };
}

// Adapter for App.tsx / ConfigError (Track C). Backed by checkSupabaseConfig so
// there is a single source of truth for the validation logic.
export interface ConfigCheck {
  valid: boolean;
  missing: string[];
}

export function checkConfig(): ConfigCheck {
  const result = checkSupabaseConfig();
  return result.ok
    ? { valid: true, missing: [] }
    : { valid: false, missing: result.missing };
}
