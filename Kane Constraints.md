This is a strong spec, it already did the hard work of centralizing labels, testids, and a pure deterministic core, which makes Kane's job much easier. Here's the complete ruleset: what Kane should do, what it shouldn't, and how the hooks should fire, all tailored to your actual TouchGrass tasks.

Part A — Rules for what Kane should and shouldn't do
1. Kane always runs in agent mode and persists its evidence. Every Kane run uses --agent (so output is machine-readable NDJSON), --headless, and a --timeout. The NDJSON and the per-step screenshots auto-save to the session/output folder; Kiro reads the final run_end line for the verdict and the screenshots when diagnosing a failure. Use testmd tests (not one-shot run) so output lands in your project and replays cheaply.

2. Never put a raw $ in a Kane objective. Write "USD" or the number. PowerShell eats $ (it cost you the $800 in the Airbnb run). Since TouchGrass has no prices this is low-risk, but the rule stands: say "10 points," "20 USD," never "$20." Bake this into the steering file so Kiro never generates a $-containing objective.

3. Kane verifies behavior, not internal logic. Cheap checks come first. Your design has a pure deterministic core (streak.ts, score.ts, leaderboard.ts, badges.ts). That core must be tested with unit/property tests, not Kane, it's pure functions, Kane would be absurdly wasteful there. Kane only verifies the rendered, multi-step, browser behavior that unit tests can't reach.

4. For photos, Kane checks presence, not content. After logging, Kane asserts the new post's feed-post-image element exists and has a non-empty src that loaded. It never inspects what the photo depicts. (Your spec already encodes this in Req 10.4.)

5. Kane never edits tests to pass; it reports, Kiro fixes the app. On failure, Kiro reads the reason + screenshot, fixes the app code, never the test, and re-runs. Hard cap: 3 attempts, then stop and ask the human.

6. Kane runs against a known state. Because the app is real-data (Supabase) with no seed data, each Kane flow must be self-contained: sign up its own fresh user(s) with unique emails, do its actions, assert its own results. Don't rely on data a previous run left behind. (This replaces the "switch user dropdown" idea, real auth means Kane signs up real test accounts.)

Part B — Which checks use Kane vs. which use cheap tools
This is the discipline that wins "craft." Map each part of your spec to the right tool:

What's being checked  Tool  Why
Streak math (Req 7), scoring (3.8), leaderboard ordering (Req 5), badge thresholds (Req 6)  Unit/property tests on the pure core  Pure functions, deterministic, milliseconds, no browser needed
TypeScript compiles, lint, token rules (no arbitrary hex/px)  Build + ESLint  Fast, free, deterministic
Supabase config present at startup (Req 11.4)  terminal check  Just check env vars / a curl
Sign up → land on Home (Req 1)  Kane  Real rendered auth + redirect, browser-only
Log a hangout with photo → post appears with image + points + celebration (Req 3, 4)  Kane  The signature cascade, multi-step rendered behavior
Cheer increments live (Req 4.5)  Kane  Rendered state change
Leaderboard re-ranks after a score change (Req 5.6)  Kane  Multi-user, rendered re-sort
Streak increments / resets via "Skip a day" (Req 7, 8)  Kane (the rendered number) — but the math itself is unit-tested  Kane confirms the UI reflects it; the logic is proven cheaper
Badge appears on profile at milestone (Req 6)  Kane  Rendered conditional UI
The rule of thumb in one line: if the answer lives in a pure function, unit-test it; if it only exists once it's rendered in the browser after a sequence of clicks, that's Kane.

Part C — How the hooks should work
You're in spec mode, so the natural trigger is task boundaries, not file saves. Four hooks:

Hook 1 — Cheap gate on save (never calls Kane).

when: fileEdited, patterns src/**/*.{ts,tsx}
then: runCommand → npm run typecheck && npm run lint && npm run test
Purpose: catch compile/lint/logic breakage in seconds. Runs constantly. This is your fast inner loop and it keeps Kane from ever running on a broken app.
Hook 2 — Kane verify at task completion (the main loop).

when: postTaskExecution
then: askAgent →
"A spec task just completed. First confirm the app builds and unit tests pass; if not, fix those first and do NOT run Kane. If they pass, decide whether this task changed user-facing browser behavior. If it did NOT (e.g. it was pure-core logic, schema, or tokens), skip Kane and say why. If it DID, run the Kane testmd flow that matches this task's requirement (e.g. log-hangout, leaderboard, streak), headless, agent mode, with a timeout. Read the final result line. If passed, report 'Verified' with the screenshot. If failed, read the reason and the failing screenshot, fix the app code (never the test), and re-run. Stop after 3 attempts and ask me. Never put a raw $ in a Kane objective."

This encodes your point #2 (Kane per task) and the "decide if it's necessary" judgment, Kiro skips Kane for pure-logic tasks and only fires it for UI-behavior tasks.

Hook 3 — Pre-task guard (optional, keeps the loop honest).

when: preTaskExecution
then: askAgent → "Before starting, note which requirement this task implements and which Kane flow (if any) will verify it. If none exists yet and this task adds user-facing behavior, plan to author that flow."
Hook 4 — Manual full-suite verify (for the demo).

when: userTriggered (a button you press)
then: runCommand → run all testmd flows headless. Use this right before demo to confirm everything's green, and as your "break it live, hit verify, watch it fail" control on stage.
Part D — Which of your tasks get a Kane flow (mapping)
Based on your spec, here's which tasks warrant Kane and which don't:

Pure core (streak, score, leaderboard, badges) → ❌ no Kane, unit/property tests only.
Repository layer / schema / RLS → ❌ no Kane (test with the in-memory fake + a connectivity check).
Design tokens / shadcn setup → ❌ no Kane (lint enforces tokens).
Auth screen (sign up / log in / log out) → ✅ Kane flow: auth_test.md
Log dialog + hangout cascade → ✅ Kane flow: log_hangout_test.md (the signature one, includes photo-presence check)
Home feed (render, cheer, empty state, banner) → ✅ Kane flow: feed_test.md
Leaderboard (re-rank) → ✅ Kane flow: leaderboard_test.md (signs up 2 users, logs points, asserts order)
Profile + badges → ✅ Kane flow: profile_badges_test.md
Skip-a-day streak UI → ✅ Kane flow: streak_test.md
So roughly 6 Kane flows, one per user-facing requirement cluster, and zero Kane on the pure-logic tasks. That's the disciplined pyramid the judges reward.

Part E — Your three rules, confirmed and refined
✅ Kane saves screenshots + NDJSON for Kiro — yes, automatic with --agent + testmd; output lands in your project's output-<name>/ folder. Kiro reads the final line for pass/fail and the screenshots for failure diagnosis. Just commit the output folder so it's reproducible.
✅ Kane called at each spec task, with necessity decided per task — Hook 2 (postTaskExecution) does exactly this, and the prompt explicitly tells Kiro to skip Kane for pure-logic/schema/token tasks. Refinement: gate it behind the cheap checks (Hook 1) so Kane never runs on an app that doesn't build.
✅ No $ in Kane input, use USD — encoded as a hard rule in the steering file and in Hook 2's prompt.
One honest caution on the photo flow: getting Kane to set a file on the upload input is the single trickiest browser action in this whole app. Build and prove log_hangout_test.md early, don't leave it for the last hour. If it fights you, the fallback is to assert the post + image element appeared after a manual upload, but try the full automated upload first.