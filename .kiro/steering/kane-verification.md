---
inclusion: always
---

# Kane CLI Verification Guide

This is the standing knowledge Kiro uses whenever it verifies TouchGrass with Kane CLI.
It backs the `.kiro/hooks` (especially `kane-verify-post-task` and `full-suite-verify`).
Read it before running, reading, or fixing anything related to Kane.

## What Kane is for

Kane CLI drives a real browser from a plain-English flow and returns a pass/fail with
evidence. Use it ONLY to verify rendered, multi-step browser behavior that unit tests
cannot reach. If the answer to a check lives in a pure function, it is NOT a Kane job.

## The testing pyramid (cheap checks first)

Always verify in this order. Never run Kane on an app that does not build.

1. **Typecheck + lint** — `npm run typecheck && npm run lint`. Catches compile errors and
   token violations (no arbitrary hex/px) in seconds.
2. **Unit / property tests** — `npm run test -- --run`. This is where the pure core is
   proven: streak math (Req 7), scoring (3.8), leaderboard ordering (Req 5), badge
   thresholds (Req 6). Kane must NEVER be used for these — it would be wasteful and slow.
3. **Kane (browser)** — only for rendered, multi-step flows: sign up and land on Home,
   log a hangout and see the post appear, cheer increments, leaderboard re-ranks, streak
   updates via "Skip a day", badge appears on profile.

If steps 1 or 2 fail, fix those first and do NOT run Kane.

## How to run Kane

- Always run with `--agent` (machine-readable NDJSON), `--headless`, and a `--timeout`
  (60000 ms is the default for these flows).
- Use `testmd` flows committed under `.testmuai/tests/`, not one-shot `run` commands, so
  output lands in the project and replays cheaply from cache.
- Example: `kane-cli testmd .testmuai/tests/log_hangout_test.md --agent --headless --timeout 60000`

## How to read Kane's output

- Kane writes NDJSON plus per-step screenshots to `.testmuai/tests/output-<name>/`.
- The verdict is on the final `run_end` line of the NDJSON. Read that line first to get
  pass or fail.
- On failure, read the failure reason in the NDJSON and open the matching step screenshot
  in the same output folder to diagnose what the browser actually showed.
- Commit the `output-*` folder so the run is reproducible for the demo.

## Hard rules

1. **Kane reports; Kiro fixes the app — never the test.** On a failure, fix the
   application code so the real behavior matches the spec. Do not edit the flow to make it
   pass. The only time a flow changes is when a label, test ID, or copy string in
   `src/contracts/` legitimately changed.
2. **Cap retries at 3.** After 3 failed fix-and-rerun attempts, stop and ask the human.
3. **Never put a raw `$` in a Kane objective.** PowerShell consumes a raw dollar sign
   (this once turned an "$800" objective into garbage). Write "USD" or the plain number —
   e.g. "10 points", "20 USD", never "$20". TouchGrass has no prices, but the rule stands.
4. **Each flow runs against a known state.** The app uses real Supabase data with no seed
   data, so every flow must be self-contained: sign up its own fresh user(s) with unique
   emails, perform its actions, and assert its own results. Never rely on data left behind
   by a previous run.
5. **Photos: check presence, not content.** After logging, assert the new post's
   `feed-post-image` element exists and has a non-empty `src` that loaded. Never inspect
   what the photo depicts (Req 10.4).

## Stable contracts Kane depends on

Kane flows and components share a single source of truth in `src/contracts/`:
- `labels.ts` — "Sign up", "Log in", "Log it", "Cheer", "Skip a day", "Log out" (Req 10.1)
- `testids.ts` — `streak-counter`, `score-display`, `feed-post`, `feed-post-image`,
  `leaderboard-row-{name}`, `badge-{name}` (Req 10.3)
- `copy.ts` — the empty-feed and "You haven't touched grass today." strings

If any of these change, every Kane flow referencing the old value must be updated in the
same change so flows and components stay in lockstep.

## Which checks map to which tool

| Check | Tool |
|---|---|
| Streak math, scoring, leaderboard order, badge thresholds | Unit / property tests |
| TypeScript compiles, lint, token rules | Build + ESLint |
| Supabase config present at startup (Req 11.4) | Terminal check (env vars) |
| Sign up → land on Home (Req 1) | Kane (`auth_test.md`) |
| Log hangout with photo → post appears with image + points (Req 3, 4) | Kane (`log_hangout_test.md`) |
| Cheer increments live (Req 4.5) | Kane (`feed_test.md`) |
| Leaderboard re-ranks after score change (Req 5.6) | Kane (`leaderboard_test.md`) |
| Streak increments / resets via "Skip a day" (Req 7, 8) | Kane for the rendered number; math is unit-tested |
| Badge appears on profile at milestone (Req 6) | Kane (`profile_badges_test.md`) |

Rule of thumb: if it lives in a pure function, unit-test it; if it only exists once it is
rendered after a sequence of clicks, that is Kane.

## Known sharp edge

Setting a file on the upload input is the single trickiest browser action in this app.
Prove `log_hangout_test.md` early — do not leave it for the last hour. If the automated
upload fights you, the fallback is to assert the post and image element appeared after a
manual upload, but try the full automated upload first.
