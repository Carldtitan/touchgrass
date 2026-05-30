// check-supabase.mjs — Developer A connectivity check (Requirements 11.4, 12.3).
//
// Invoked by the "Supabase Connectivity Check (Manual)" hook and `npm run
// check:supabase`. Confirms the env vars are present and the database is reachable
// with a ZERO-ROW read against public.profiles. It never writes or seeds data.
//
// Reads VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY from the environment or a local
// .env file (simple parse; no extra dependency).
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadDotEnv() {
  try {
    const raw = readFileSync(new URL("../.env", import.meta.url), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // No .env file — rely on the ambient environment.
  }
}

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

async function main() {
  loadDotEnv();

  const url = (process.env.VITE_SUPABASE_URL ?? "").trim();
  const anonKey = (process.env.VITE_SUPABASE_ANON_KEY ?? "").trim();

  const missing = [];
  if (!url) missing.push("VITE_SUPABASE_URL");
  if (!anonKey) missing.push("VITE_SUPABASE_ANON_KEY");
  if (missing.length > 0) {
    fail(`Missing Supabase configuration: ${missing.join(", ")} (set them in .env)`);
  }

  console.log(`• Config present. Connecting to ${url} ...`);

  const client = createClient(url, anonKey, {
    auth: { persistSession: false },
  });

  // Zero-row read: { count, head:true } returns only the count, no rows, no writes.
  const { error, count } = await client
    .from("profiles")
    .select("id", { count: "exact", head: true });

  if (error) {
    fail(`Reachable but query failed: ${error.message}. ` +
      `Check that schema.sql has been applied and RLS allows an authenticated read.`);
  }

  console.log(`✓ Connected. public.profiles is reachable (rows: ${count ?? 0}).`);
  console.log("✓ No data was written or seeded.");
  process.exit(0);
}

main().catch((err) => fail(err instanceof Error ? err.message : String(err)));
