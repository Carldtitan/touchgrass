---
inclusion: always
---

# Product

TouchGrass is a small social fitness app where people log real-world "hangouts"
(gym, walk, etc.), earn points and badges, keep a daily streak, and compete on a
leaderboard. The primary flow: sign up → log a hangout with a photo → the post
appears on the feed with its image and points → friends cheer → scores and the
leaderboard update.

It is built phone-width (single column, ~430px) with a grass-green theme.

## Why this app exists

TouchGrass is the demo app for a Kane CLI hackathon. The app is the vehicle; the
real deliverable is the **closed verification loop**: Kiro builds a feature → Kane
CLI drives a real browser to verify it → results feed back into Kiro to fix and
re-verify. Keep this in mind when making changes — features should stay small,
have a clearly right/wrong rendered outcome, and run locally with no external
dependencies beyond Supabase.

## Design principles that shape the code

- **Deterministic core.** All scoring, streak, leaderboard, and badge logic lives
  in pure functions that take their inputs explicitly (e.g. the evaluation date is
  always passed in, never read from the clock). This makes behavior reproducible
  and unit/property-testable.
- **Verification discipline.** Cheap deterministic checks (typecheck, lint, unit
  tests) prove the logic; Kane (browser) is reserved only for rendered, multi-step
  behavior. See `kane-verification.md` for the full rule set.
- **Stable contracts.** UI labels, copy strings, and test IDs are centralized in
  `src/contracts/` so the app and the browser tests never drift apart.
