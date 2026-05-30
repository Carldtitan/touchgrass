# Kane Verification Log — TouchGrass (Track C)

This log records every Kane CLI verification run against the TouchGrass app, with
committed evidence, so the Kiro → Kane closed loop is reproducible for the demo.

Kane is the top of the testing pyramid: cheap deterministic checks (typecheck, unit
tests, build) run first and constantly; Kane only verifies rendered, multi-step browser
behavior. See `.kiro/steering/kane-verification.md` for the full discipline.

---

## Run 1 — Config Error startup screen (Requirement 11.4) ✅ PASSED

The first real closed-loop proof on the skeleton app, exactly the README's
"wire the loop early, while the app is tiny" strategy.

- **Flow:** `.testmuai/tests/config_error_test.md`
- **Command:** `kane-cli testmd run .testmuai/tests/config_error_test.md --agent --headless --timeout 120`
- **Result:** `passed` — 2/2 steps (see `.testmuai/tests/output-config_error.staging/Result.md`)
- **Session ID:** `07861c83-add5-405c-bf92-75518cf3061e`
- **What Kane confirmed (visual analysis, from the NDJSON):**
  - A red page heading with the exact text "Configuration error" is visible.
  - The missing value `VITE_SUPABASE_URL` is listed on screen.
  - The missing value `VITE_SUPABASE_ANON_KEY` is listed on screen.
- **Evidence committed:**
  - `output-config_error.staging/Result.md` — verdict + per-step md5
  - `output-config_error.staging/.internal/meta.json` — session/test IDs
  - `output-config_error.staging/.internal/steps/*/flows/0/actions.ndjson` — full action records with the visual-analysis rationale

This run proves the loop end to end: Kiro built the `ConfigError` screen (Req 11.4),
Kane drove a real browser to `http://localhost:3000`, and confirmed the rendered
behavior matched the spec.

---

## Authored, pending Track B UI (will pass once components render)

These flows are committed and ready. They are self-contained (each signs up its own
fresh user with a unique email) and assert rendered behavior. They run green once the
matching Track B components land and a live Supabase `.env` is present.

| Flow | Verifies | Status |
|---|---|---|
| `auth_test.md` | Sign up → land on Home (Req 1, 2.2) | authored |
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
