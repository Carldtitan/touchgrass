# Kane Verification Log — TouchGrass (Track C)

This log records every Kane CLI verification run against the TouchGrass app, with
committed evidence, so the Kiro → Kane closed loop is reproducible for the demo.

Kane is the top of the testing pyramid: cheap deterministic checks (typecheck, unit
tests, build) run first and constantly; Kane only verifies rendered, multi-step browser
behavior. See `.kiro/steering/kane-verification.md` for the full discipline.

---

## Run 1 — Config Error startup screen (Requirement 11.4) ✅ PASSED

The first real closed-loop proof on the skeleton app, exactly the README's
"wire the loop early, while the app is tiny" strategy. Re-verified after the
design-system refactor (Tailwind tokens + shadcn primitives) — still passing.

- **Flow:** `.testmuai/tests/config_error_test.md`
- **Command:** `kane-cli testmd run .testmuai/tests/config_error_test.md --agent --headless --timeout 120`
- **Result:** `passed` — 2/2 steps (see `.testmuai/tests/output-config_error.staging/Result.md`)
- **Latest session ID:** `a0c53cb5-6450-479d-a3d5-8f246491435b`
- **What Kane confirmed (visual analysis, from the NDJSON):**
  - A page heading with the exact text "Configuration error" is visible.
  - The missing value `VITE_SUPABASE_URL` is listed on screen.
  - The missing value `VITE_SUPABASE_ANON_KEY` is listed on screen.
- **Evidence committed:**
  - `output-config_error.staging/Result.md` — verdict + per-step md5
  - `output-config_error.staging/.internal/meta.json` — session/test IDs
  - `output-config_error.staging/.internal/steps/*/flows/0/actions.ndjson` — full action records with the visual-analysis rationale

This run proves the loop end to end: Kiro built the `ConfigError` screen (Req 11.4),
Kane drove a real browser to `http://localhost:3000`, and confirmed the rendered
behavior matched the spec.

### Closed-loop moment captured (the demo gold)

During the re-verification, Kane **caught a real precondition mismatch**: after a live
`.env` (with real Supabase keys) was added, the flow failed because the app correctly
rendered "Configuration loaded" instead of the error screen. The NDJSON failure reason
read: page header "TouchGrass" / "Configuration loaded" — heading "Configuration error"
not present. The fix (per the steering rules) was NOT to weaken the assertion but to run
the flow against its true precondition (no config); it then passed. This is the closed
loop doing exactly its job — proof that the assertions are real, not vacuous.

---

## Authored, pending Track B UI (will pass once components render)

These flows are committed and ready. They are self-contained (each signs up its own
fresh user with a unique email) and assert rendered behavior. They run green once the
matching Track B components land and a live Supabase `.env` is present.

| Flow | Verifies | Status |
|---|---|---|
| `signup_test.md` | Sign up → land on Home (Req 1, 2.2) | authored |
| `login_logout_test.md` | Log in, log out, return to auth (Req 2.1, 2.5, 2.6) | authored |
| `empty_state_test.md` | New user sees empty-feed copy, no seed data (Req 4.8, 12.3) | authored |
| `log_hangout_test.md` | Log hangout w/ photo → post + image + points (Req 3, 4) | authored |
| `leaderboard_test.md` | Leaderboard ranking + highlight (Req 5) | authored |
| `profile_badges_test.md` | Profile stats + First Steps badge (Req 6) | authored |
| `streak_test.md` | Streak set + Skip-a-day reset in UI (Req 7, 8) | authored |

---

## How to reproduce

1. Start the app: `npm run dev` (serves http://localhost:3000).
2. Run a flow: `kane-cli testmd run .testmuai/tests/<flow>_test.md --agent --headless --timeout 120`.
3. Read the verdict in `output-<flow>/Result.md` and the action detail in the `.internal` NDJSON.

First run authors the flow (slow, uses credits); later runs replay from the committed
cache (fast, free, deterministic).

---

## Run 2 — Auth: Sign up → land on Home (Requirement 1, 2.2) ✅ PASSED

- **Flow:** `.testmuai/tests/auth_test.md`
- **Command:** `kane-cli testmd run .testmuai/tests/auth_test.md --agent --headless --timeout 120`
- **Result:** `passed` — 5/5 steps.
- **What Kane confirmed:** signed up a fresh unique user, landed on Home with the
  bottom navigation bar visible and the streak counter (flame, 0) rendered.
- **Evidence:** `output-auth/Result.md` + `output-auth/screenshots/*.jpg`.

## Run 3 — Log a hangout with photo → post appears (Requirements 3, 4) ✅ PASSED

The signature cascade, verified end to end in a real browser.

- **Flow:** `.testmuai/tests/log_hangout_test.md`
- **Command:** `kane-cli testmd run .testmuai/tests/log_hangout_test.md --agent --headless --timeout 300`
- **Result:** `passed` — 6/6 steps (session `cb527005`).
- **What Kane confirmed (visual + DOM analysis):**
  - Signed up a fresh unique user and reached Home.
  - Opened the Log dialog, set the file input to `.testmuai/tests/fixtures/hangout.jpg`,
    selected Gym (20 points), and clicked "Log it".
  - The dialog closed on its own after a successful submit.
  - The new feed post by "Kane Logger" rendered with `feed-post-image` having a
    non-empty `src`, and the "+20 points · Gym" label visible.
- **Evidence:** `output-log_hangout/Result.md` + `output-log_hangout/screenshots/*.jpg`.

### App fixes made so these flows pass (Kiro fixed the app, not the test)

- **Photo input testability (Req 10.2):** the file input was `display:none`; made it
  a real, visible `<input type=file>` so it is settable by a person and an agent.
- **Reachable primary action:** the "Log it" button was below the dialog scroll fold
  and unreachable; the Dialog now has a pinned sticky footer holding "Log it".
- **Post-log feed refresh (Req 4.1):** added a feed-refresh signal so a successful log
  forces the Home feed to refetch (with a short retry for read-after-write timing).

### Flow corrections (self-contained, per the steering rules)

- Each flow now signs up its own fresh unique email per run (rule #4) instead of a
  hardcoded address.
- `log_hangout` step boundaries clarified so the agent sets the photo, picks Gym,
  and clicks "Log it" rather than dismissing the dialog.
