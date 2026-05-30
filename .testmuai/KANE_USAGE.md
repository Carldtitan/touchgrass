# How Kane CLI Was Used in TouchGrass

Kane CLI drives a real headless Chrome from plain-English Markdown flows and emits
machine-readable NDJSON that Kiro reads to verify rendered, multi-step browser
behavior. This is the closed loop the project is built around: **Kiro builds →
Kane verifies in a real browser → results feed back to Kiro to fix and re-verify.**

## Where Kane fits (testing pyramid)

Kane is the top of the pyramid, used only for rendered, multi-step flows. Cheaper
checks run first and always:

1. `npm run typecheck` — TypeScript compiles.
2. `npm run lint` — ESLint, incl. token rules (`--max-warnings 0`).
3. `npm run test -- --run` — Vitest + fast-check (pure core: streak, scoring,
   leaderboard, badges, validation, rollback). 40 tests.
4. **Kane** — only for browser-only behavior unit tests cannot reach.

Rule of thumb: if the answer lives in a pure function, unit-test it; if it only
exists once rendered after a sequence of clicks, that is a Kane job. Kane is never
run on an app that does not build.

## How runs are invoked

```bash
kane-cli testmd run .testmuai/tests/<flow>_test.md --agent --headless --timeout <seconds>
```

- `--agent` → plain NDJSON output (no UI), parseable by Kiro.
- `--headless` → real Chrome, no window.
- `--timeout` → per-run cap in **seconds**.
- `--author` → force a fresh authored run (bypass the replay cache).

Flows live as committable `*_test.md` under `.testmuai/tests/` so later runs replay
from cache (fast, deterministic, no AI cost). Output lands in
`.testmuai/tests/output-<flow>/`.

## Reading results

- The verdict is the final `run_end` / `test_md_summary` line:
  `overall_status: passed | failed`.
- On failure, the NDJSON reason plus the matching per-step screenshot say what the
  browser actually showed.
- Evidence committed per flow:
  - `output-<flow>/Result.md` — verdict + per-step status.
  - `output-<flow>/screenshots/*.jpg` — per-step screenshots (converted from Kane's
    PNGs so they live in the repo with the run).
  - `output-<flow>/.internal/**/actions.ndjson` — full action records.

## Flows in this project

| Flow | Verifies | Status |
|---|---|---|
| `config_error_test.md` | Missing-config screen (Req 11.4) | ✅ passed |
| `auth_test.md` | Sign up → land on Home (Req 1, 2.2) | ✅ passed |
| `log_hangout_test.md` | Log w/ photo → post appears w/ image + points (Req 3, 4, 10.2, 10.4) | ✅ passed |
| `leaderboard_test.md` | Leaderboard ranking + highlight (Req 5) | authored |
| `profile_badges_test.md` | Profile stats + First Steps badge (Req 6) | authored |
| `streak_test.md` | Streak set + Skip-a-day reset (Req 7, 8) | authored |

## Hard rules followed

1. **Kane reports; Kiro fixes the app — never the test.** On failure, fix
   application code so real behavior matches the spec. Flows only change when a
   contract (`src/contracts/`) legitimately changes, or to keep flows
   self-contained.
2. **Cap retries at 3** per failing flow, then stop and ask the human.
3. **No raw `$`** in a Kane objective (PowerShell consumes it) — write the number
   or "USD".
4. **Each flow is self-contained:** it signs up its own fresh user with a unique
   email and asserts its own results. No reliance on data from a previous run (the
   app uses real Supabase data with no seed data).
5. **Photos: presence, not content.** Assert `feed-post-image` exists with a
   non-empty `src` that loaded; never inspect what the photo depicts (Req 10.4).

## Stable contracts Kane depends on

Flows and components share one source of truth in `src/contracts/`:
- `labels.ts` — "Sign up", "Log in", "Log it", "Cheer", "Skip a day", "Log out".
- `testids.ts` — `streak-counter`, `score-display`, `feed-post`, `feed-post-image`,
  `leaderboard-row-{name}`, `badge-{name}`.
- `copy.ts` — empty-feed and "You haven't touched grass today." strings.

If any of these change, every referencing flow is updated in the same change.

## What Kane caught (and the app fixes it drove)

Running Kane against the real app surfaced genuine defects that unit tests could
not — each fixed in the app, not the test:

- **Photo input not settable (Req 10.2):** the file input was `display:none`; Kane
  could not target it. Changed to a real, visible `<input type=file>`.
- **Primary action unreachable:** "Log it" sat below the dialog scroll fold, so the
  hangout was never submitted. The Dialog now has a pinned sticky footer holding
  "Log it".
- **Feed not refreshing after a log (Req 4.1):** a successful log now signals the
  Home feed to refetch (with a short retry for read-after-write timing) so the new
  post appears.

It also exposed environment/flow issues handled outside the app: transient Kane
provider outages and replay-cache reuse (re-run / clear cache / `--author`), a stale
Vite error overlay (restart dev server), and hardcoded flow emails (made unique per
run).

## Automation hooks (`.kiro/hooks/`)

- **Cheap gate on save** — typecheck + tests on every `src/**/*.{ts,tsx}` save, so
  Kane never runs on a broken build.
- **Kane verify after task** (`postTaskExecution`) — runs the matching flow for the
  task that changed user-facing behavior, reads the verdict, fixes app code on
  failure, caps at 3 retries.
- **Pre-task guard** — notes which requirement and which Kane flow apply before a task.
- **Contract drift guard** — realigns flows when a label/test id/copy string changes.
- **Replay-cache commit reminder** — ensures `output-*` evidence is committed.
- **Full suite verify** (manual) — runs every flow before a demo.

## Reproducing a run

1. `npm run dev` (serves http://localhost:3000 with a valid Supabase `.env`).
2. `kane-cli testmd run .testmuai/tests/<flow>_test.md --agent --headless --timeout 300`
3. Read `output-<flow>/Result.md` for the verdict and `screenshots/` for evidence.

First run authors the flow (slower, uses credits); later runs replay from the
committed cache (fast, free, deterministic).
