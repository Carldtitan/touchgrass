# Implementation Plan: TouchGrass

## Overview

This plan converts the TouchGrass design into incremental coding tasks, organized for a **one-day hackathon with three developers working in parallel**. The goal is a working end-to-end demo (sign up → log a hangout with photo → see it on the feed → leaderboard updates → streak/skip-a-day works) reachable as early as possible, with the Kiro→Kane closed loop proving it.

The work is split into a shared foundation that is frozen first, then three independent tracks that map to the layered architecture, then integration and demo prep:

- **Track A — Core & Data (Developer A):** pure logic core (`src/core/`), data-access/repository layer (`src/data/` + Supabase schema/migrations/RLS + in-memory fakes), and the fast-check property tests for the core.
- **Track B — UI Features (Developer B):** feature components (`src/features/`) and application hooks (`src/hooks/`).
- **Track C — Design System & Loop (Developer C):** design-system/tokens layer (`src/design-system/`), project config, and the Kane CLI verification loop (`flows/*.md`, `.kiro/hooks`, steering file).

### Parallelization & Git Workflow

- Remote: `https://github.com/Ajodo-Godson/TouchGrass`
- The **shared foundation (Phase 0) is done first by one person and merged to `main`** before the tracks fan out. Freezing the contracts (`labels.ts`, `testids.ts`, `copy.ts`), domain types, and repository interfaces up front is what lets the three tracks proceed without blocking each other or fighting over the same files.
- Each track runs on its own feature branch: `feat/core-data` (A), `feat/ui` (B), `feat/design-system-loop` (C).
- Each developer **pulls/merges `main` into their branch regularly** to stay in sync and minimize conflicts, then opens a **pull request** when their track is demo-ready.
- Integration checkpoints (Phase 4) bring the three branches together; the final task merges all pull requests, runs the full happy path through Kane, and prepares a backup recording.
- Demo-critical work is sequenced first in every track. Test sub-tasks are marked optional (`*`) and can be skipped under time pressure, but the property tests are how the deterministic core (Requirement 10.7) is proven, so keep them if time allows.

---

## Tasks

### Phase 0 — Shared Foundation (do first; one person; merge to `main` before tracks begin)

- [ ] 1. Bootstrap the project and freeze shared contracts
  - [ ] 1.1 Clone the repo and create the foundation branch
    - `git clone https://github.com/Ajodo-Godson/TouchGrass` and `cd` into it
    - `git checkout -b chore/shared-foundation`
    - _Requirements: 11.3_

  - [ ] 1.2 Scaffold the Vite + React + TypeScript app and install dependencies
    - Create the Vite React-TS app; install Tailwind CSS, shadcn/ui dependencies, lucide-react, `@supabase/supabase-js`, and dev deps `vitest`, `@testing-library/react`, `fast-check`, `eslint`, `prettier`
    - Configure the Vite dev server to serve on port 3000 and add the documented single start command
    - Add `.env.example` declaring `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
    - _Requirements: 11.1, 11.2_

  - [ ] 1.3 Create the shared contracts module (`src/contracts/`)
    - `labels.ts` (Sign up, Log in, Log it, Cheer, Skip a day, Log out), `testids.ts` (streak-counter, score-display, feed-post, feed-post-image, leaderboard-row, badge), and `copy.ts` (empty-feed and "haven't touched grass today" strings) exactly as in the design
    - _Requirements: 10.1, 10.3, 4.7, 4.8_

  - [ ] 1.4 Define shared domain types and the frozen activity table
    - `src/data/types.ts`: `Profile`, `Hangout`, `HangoutWithPoster`, `NewHangout`
    - `src/core/activities.ts` constants: `ActivityType`, `ACTIVITY_POINTS` (Coffee=10, Gym=20, Dinner=30, Hike=50), `ACTIVITY_EMOJI`, `ACTIVITIES`
    - _Requirements: 3.2, 3.7_

  - [ ] 1.5 Define repository interfaces and in-memory fake repositories (`src/data/`)
    - TypeScript interfaces: `ProfileRepo`, `HangoutRepo`, `CheerRepo`, `CommentRepo`, `BadgeRepo`, `PhotoStorageRepo`, `AuthRepo`
    - In-memory fake implementations of each so UI work and property tests do not block on a live Supabase project
    - _Requirements: 1.3, 3.7, 4.4, 4.5, 5.1, 6.2, 6.3, 12.1_

  - [ ] 1.6 Open a pull request to merge the foundation, then branch the three tracks
    - Commit, `git push -u origin chore/shared-foundation`, open a **pull request** into `main`, and merge it
    - From the updated `main`, create `feat/core-data`, `feat/ui`, and `feat/design-system-loop`
    - _Requirements: 11.3_

---

### Track A — Core & Data (Developer A, branch `feat/core-data`)

- [ ] 2. Implement the pure logic core (`src/core/`)
  - [ ] 2.1 Implement activity and scoring functions
    - `pointsFor` and `isActivityType` in `activities.ts`; `applyPoints(currentScore, activity)` in `score.ts`
    - _Requirements: 3.2, 3.8_

  - [ ]* 2.2 Write property test for scoring
    - **Property 7: Scoring is additive by activity**
    - **Validates: Requirements 3.8**

  - [ ] 2.3 Implement the streak engine (`streak.ts`)
    - `dayDiff`, `addDays`, `applyLog(state, evalDate)`, `reevaluate(state, evalDate)` following the transition tables in the design (date-driven, never reads the wall clock)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 8.2, 8.3, 3.9_

  - [ ]* 2.4 Write property test for streak transition on log
    - **Property 1: Streak transition on log**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 3.9**

  - [ ]* 2.5 Write property test for streak reevaluation on date advance
    - **Property 2: Streak reevaluation on date advance**
    - **Validates: Requirements 7.6, 8.3**

  - [ ]* 2.6 Write property test for skip-a-day date math
    - **Property 9: Skip-a-day advances exactly one calendar day**
    - **Validates: Requirements 8.2**

  - [ ] 2.7 Implement badge unlock rules (`badges.ts`)
    - `unlockedBadges(stats)` and `newlyUnlocked(prev, stats)` with thresholds First Steps ≥1, Weekend Warrior ≥5, On Fire streak ≥7
    - _Requirements: 6.4, 6.5, 6.6, 6.7_

  - [ ]* 2.8 Write property test for badge thresholds
    - **Property 4: Badge unlock thresholds**
    - **Validates: Requirements 6.4, 6.5, 6.6, 6.7**

  - [ ] 2.9 Implement leaderboard ordering (`leaderboard.ts`)
    - `rankUsers(entries)` sorting by score desc, streak desc, display name asc (case-insensitive), userId as final stable tiebreak
    - _Requirements: 5.1, 5.2, 5.3, 5.6_

  - [ ]* 2.10 Write property test for leaderboard ordering
    - **Property 3: Leaderboard total ordering**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.6**

  - [ ] 2.11 Implement sign-up and login validation (`validation.ts`)
    - Pure `validateSignUp` (email format, password ≥8, display name 1–50) and `validateLogin` (non-empty email/password), each returning the specific offending field
    - _Requirements: 1.2, 1.5, 1.7, 1.8, 2.4_

  - [ ]* 2.12 Write property test for sign-up validation
    - **Property 5: Sign-up validation**
    - **Validates: Requirements 1.2, 1.5, 1.7, 1.8**

  - [ ]* 2.13 Write property test for login empty-field validation
    - **Property 6: Login empty-field validation**
    - **Validates: Requirements 2.4**

- [ ] 3. Implement the data-access / repository layer (`src/data/`)
  - [ ] 3.1 Create the Supabase schema, migrations, RLS policies, and storage bucket
    - SQL for `profiles`, `hangouts`, `hangout_tags`, `cheers`, `comments`, `user_badges` with checks/indexes; RLS per the design; `hangout-photos` public-read bucket; no seed users/hangouts/comments
    - _Requirements: 1.3, 3.7, 4.4, 4.5, 12.1, 12.2, 12.3_

  - [ ] 3.2 Wire the Supabase client and startup config guard
    - Single client module reading `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`; expose a config-valid check that names the missing variable (consumed by `ConfigError` in Track C)
    - _Requirements: 11.2, 11.4_

  - [ ] 3.3 Implement the Supabase-backed repositories
    - `profileRepo`, `hangoutRepo`, `cheerRepo`, `commentRepo`, `badgeRepo`, `photoStorageRepo`, `authRepo` against the frozen interfaces; feed/profile reads newest-first; counts for cheers/comments
    - _Requirements: 1.3, 2.1, 2.6, 2.7, 3.6, 3.7, 4.1, 4.4, 4.5, 5.1, 6.2, 6.3, 12.1, 12.2, 12.4_

  - [ ] 3.4 Implement the `createHangoutWithSideEffects` use-case
    - Compose upload → compute (`applyPoints` + `applyLog` + `evaluateBadges`) → persist (hangout, profile score/streak, badges) → rollback path that deletes the hangout and restores pre-state score/streak/badges
    - _Requirements: 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 10.5_

  - [ ]* 3.5 Write property test for hangout record construction
    - **Property 8: Hangout record construction**
    - **Validates: Requirements 3.7**

  - [ ]* 3.6 Write property test for the initial profile invariant
    - **Property 16: Initial profile invariant**
    - **Validates: Requirements 1.3**

  - [ ]* 3.7 Write property test for cheer counting (against in-memory fakes)
    - **Property 17: Cheer count increments once per user**
    - **Validates: Requirements 4.5**

  - [ ]* 3.8 Write property test for safe rollback on failure (against in-memory fakes)
    - **Property 19: Safe rollback on failure**
    - **Validates: Requirements 3.11, 10.5**

  - [ ]* 3.9 Write property test for determinism of derived results (against in-memory fakes)
    - **Property 20: Determinism of derived results**
    - **Validates: Requirements 10.7**

  - [ ] 3.10 Sync and open the Track A pull request
    - `git pull origin main` and resolve any conflicts; commit; `git push -u origin feat/core-data`; open a **pull request** into `main`
    - _Requirements: 11.3_

---

### Track B — UI Features (Developer B, branch `feat/ui`)

- [ ] 4. Build authentication UI and session routing
  - [ ] 4.1 Implement `useAuth` and app routing
    - Session state with `status: "loading" | "authed" | "anon"`; sign up, log in, log out; restore existing session on load; route to Home when authed and to the auth screen otherwise
    - _Requirements: 1.6, 2.2, 2.6, 2.7, 2.8_

  - [ ] 4.2 Implement `AuthScreen`
    - "Sign up" and "Log in" controls and a "Log out" control while authed; surface core validation messages and the duplicate-email / invalid-credentials errors
    - _Requirements: 1.1, 1.4, 1.5, 1.7, 1.8, 1.9, 2.1, 2.3, 2.4, 2.5, 2.6, 10.1_

  - [ ]* 4.3 Write unit tests for auth control presence and routing reactions
    - Assert control labels render and that auth status drives Home vs auth screen
    - _Requirements: 1.1, 2.2, 2.5, 2.8_

- [ ] 5. Build the logging and feed happy path (demo-critical)
  - [ ] 5.1 Implement `BottomTabBar`
    - Home / Log / Leaderboard / Profile tabs with the center Log control that opens the `Log_Dialog`
    - _Requirements: 3.1, 9.3_

  - [ ] 5.2 Implement `useLogHangout` and `LogDialog`
    - Standard `input[type=file]`, the four activities with point values, optional tag control, "Log it" submit; upload progress disables "Log it"; calls the use-case and shows celebration on success / errors on failure
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.10, 3.11, 10.2_

  - [ ]* 5.3 Write property test for Log dialog submit validation
    - **Property 21: Log dialog submit validation**
    - **Validates: Requirements 3.3, 3.4**

  - [ ] 5.4 Implement `useFeed`, `HomeFeed`, and `FeedPost`
    - Newest-first feed with `feed-post` / `feed-post-image` test IDs, poster name + avatar + emoji + tags + points + time-ago, "Cheer" with counts, streak header (`streak-counter`), "haven't touched grass today" banner, and empty-state copy
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 10.4, 10.6_

  - [ ]* 5.5 Write property test for the "haven't touched grass today" banner
    - **Property 10: "Haven't touched grass today" banner condition**
    - **Validates: Requirements 4.7**

  - [ ]* 5.6 Write property test for newest-first rendering
    - **Property 11: Hangouts render newest-first and complete**
    - **Validates: Requirements 4.1, 4.9, 6.3**

  - [ ]* 5.7 Write property test for feed post content
    - **Property 12: Feed post content**
    - **Validates: Requirements 4.2, 4.4, 10.6**

  - [ ]* 5.8 Write property test for post image source
    - **Property 13: Post image source equals stored photo URL**
    - **Validates: Requirements 4.3, 10.4**

- [ ] 6. Build leaderboard, profile, and skip-a-day
  - [ ] 6.1 Implement `useLeaderboard`, `Leaderboard`, and `LeaderboardRow`
    - Render `rankUsers(...)` output with rank/avatar/name/score/streak, `leaderboard-row-{name}` and `score-display` test IDs, and highlight the current user's row
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 10.3_

  - [ ]* 6.2 Write property test for leaderboard row content and highlight
    - **Property 14: Leaderboard row content and single highlight**
    - **Validates: Requirements 5.4, 5.5**

  - [ ] 6.3 Implement `useProfile`, `Profile`, and `BadgeItem`
    - Avatar, display name, streak, total score, unlocked badges by name (`badge-{name}`), and the newest-first own-hangout photo grid
    - _Requirements: 6.1, 6.2, 6.3, 10.3_

  - [ ]* 6.4 Write property test for profile content
    - **Property 15: Profile content**
    - **Validates: Requirements 6.1, 6.2**

  - [ ] 6.5 Implement `useEvaluationClock`, `SkipADayButton`, and `Celebration`
    - "Skip a day" advances the evaluation date by one day and re-evaluates the streak (including reset to 0 when there is no last-log date), updating Home and Profile; celebration overlay on successful log
    - _Requirements: 3.10, 8.1, 8.2, 8.3, 8.4_

  - [ ] 6.6 Sync and open the Track B pull request
    - `git pull origin main` and resolve conflicts; commit; `git push -u origin feat/ui`; open a **pull request** into `main`
    - _Requirements: 11.3_

---

### Track C — Design System & Loop (Developer C, branch `feat/design-system-loop`)

- [ ] 7. Build the design-system / tokens layer (`src/design-system/`)
  - [ ] 7.1 Define tokens and the Tailwind theme, and enforce token-only styling
    - `tokens.css` (palette, spacing scale 4/8/12/16/24/32, Inter, accent `#22C55E`); map tokens into `tailwind.config.ts`; add an ESLint rule forbidding arbitrary hex/px in components
    - _Requirements: 9.1, 9.2, 9.4_

  - [ ] 7.2 Set up shadcn/ui primitives
    - Button, Card, Tabs, Dialog, Avatar, Badge, Input wired to the token theme
    - _Requirements: 9.5_

  - [ ] 7.3 Implement `AppShell` and `ConfigError`
    - Centered 430px column with fixed bottom bar and the global transition utility; `ConfigError` screen that names the missing Supabase config value
    - _Requirements: 9.3, 9.7, 11.4_

  - [ ] 7.4 Implement `InitialsAvatar`
    - Colored circle with initials; color derived deterministically from the display name
    - _Requirements: 9.6_

  - [ ]* 7.5 Write property test for initials avatar derivation
    - **Property 18: Initials avatar derivation**
    - **Validates: Requirements 9.6**

- [ ] 8. Build the Kane CLI verification loop
  - [ ] 8.1 Author the steering file and `.kiro/hooks` self-heal hook
    - Steering file teaching Kiro how to read Kane `--agent` output and the tiered "cheap checks first, Kane only for rendered flows" discipline; a `postTaskExecution` `askAgent` hook that runs the matching flow, reads the final result line, fixes app code on failure, and caps retries at 3
    - _Requirements: 10.1, 10.3, 10.7_

  - [ ] 8.2 Author the early skeleton Kane flows (`flows/*.md`)
    - `signup_test.md`, `login_logout_test.md`, `empty_state_test.md` as committable `testmd` flows using the shared labels/test IDs so they replay from cache
    - _Requirements: 1.2, 1.6, 2.1, 2.5, 2.6, 4.8, 12.3_

  - [ ] 8.3 Author the core-path Kane flows (`flows/*.md`)
    - `log_hangout_test.md`, `streak_skip_test.md`, `leaderboard_test.md`, `badges_test.md` asserting the rendered happy path (new `feed-post` with non-empty `feed-post-image`, `score-display` increases, `streak-counter` increments/resets, ordered rows, badge appears)
    - _Requirements: 3.6, 3.7, 5.1, 5.4, 6.4, 7.1, 8.2, 10.2, 10.4_

  - [ ] 8.4 Sync and open the Track C pull request
    - `git pull origin main` and resolve conflicts; commit; `git push -u origin feat/design-system-loop`; open a **pull request** into `main`
    - _Requirements: 11.3_

---

### Phase 4 — Integration & Demo

- [ ] 9. Integrate the tracks into a runnable happy-path build
  - [ ] 9.1 Merge the track pull requests and wire the layers together
    - Merge `feat/core-data`, `feat/ui`, and `feat/design-system-loop` into `main` (resolve conflicts); replace in-memory fakes with the Supabase repositories in the hooks; mount `AppShell`, `BottomTabBar`, tabs, and the config guard → `ConfigError`
    - _Requirements: 1.6, 2.2, 3.1, 4.1, 5.1, 6.1, 9.3, 11.4, 12.4_

  - [ ]* 9.2 Write integration tests against a Supabase test project
    - 1–3 cases each for account creation, session establishment/restoration/logout, photo upload returning a URL, and persistence/sourcing
    - _Requirements: 1.2, 1.4, 2.1, 2.3, 2.6, 2.7, 3.6, 12.1, 12.2, 12.4_

  - [ ] 9.3 Run the skeleton Kane flows on the integrated app and self-heal
    - Run `signup`, `login_logout`, and `empty_state` flows headless via the hook; fix app code (never the test) until green, capped at 3 retries; commit cached `output-*` results
    - _Requirements: 10.1, 10.4, 10.7_

- [ ] 10. Checkpoint — ensure all tests pass
  - Ensure all unit, property, and skeleton Kane flows pass; ask the user if questions arise.

- [ ] 11. Final integration and demo prep
  - [ ] 11.1 Lock in the full happy path on `main`
    - Confirm all pull requests are merged; run the end-to-end happy path (sign up → log hangout with photo → feed → leaderboard updates → streak/skip-a-day) and fix any breaks
    - _Requirements: 10.7_

  - [ ] 11.2 Run the complete Kane flow suite and commit the cached results
    - Run all `flows/*.md` headless, confirm green, and commit the `output-*` replay caches
    - _Requirements: 10.1, 10.4, 10.7_

  - [ ] 11.3 Finalize the README setup docs and record the backup demo
    - Document the single start command, Supabase setup, and `.env` values; record a backup walkthrough of the closed loop as a fallback for the live demo
    - _Requirements: 11.1, 11.3_

## Notes

- Tasks marked with `*` are optional test sub-tasks and can be skipped to hit the demo deadline; the fast-check property tests are what prove the deterministic core (Requirement 10.7), so keep them if time allows.
- Each task references the specific requirements it implements for traceability.
- The shared foundation (Phase 0) freezes the contracts/interfaces all three tracks depend on; it MUST be merged to `main` before the tracks fan out.
- Within each track, demo-critical implementation is ordered before optional tests so the integrated happy path is reachable early.
- Each track works on its own branch, pulls `main` regularly to stay in sync, and ends with a **pull request**; integration (Phase 4) merges them and proves the loop with Kane.

## Task Dependency Graph

Tasks in the same wave are independent and can run concurrently (including across Tracks A/B/C). Waves 5–9 are the parallel three-developer window. Tasks in wave N run only after every task in waves 0..N-1 completes. Each property test is authored in its own file (e.g. `streak.prop1.test.ts`) so co-waved test tasks never write the same file.

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3", "1.4"] },
    { "id": 3, "tasks": ["1.5"] },
    { "id": 4, "tasks": ["1.6"] },
    { "id": 5, "tasks": ["2.1", "2.3", "2.7", "2.9", "2.11", "3.1", "4.1", "5.1", "7.1", "7.2", "8.1"] },
    { "id": 6, "tasks": ["2.2", "2.4", "2.5", "2.6", "2.8", "2.10", "2.12", "2.13", "3.2", "3.3", "4.2", "5.2", "7.3", "7.4", "8.2"] },
    { "id": 7, "tasks": ["3.4", "4.3", "5.3", "5.4", "6.1", "6.3", "6.5", "7.5", "8.3"] },
    { "id": 8, "tasks": ["3.5", "3.6", "3.7", "3.8", "3.9", "5.5", "5.6", "5.7", "5.8", "6.2", "6.4", "8.4"] },
    { "id": 9, "tasks": ["3.10", "6.6"] },
    { "id": 10, "tasks": ["9.1"] },
    { "id": 11, "tasks": ["9.2", "9.3"] },
    { "id": 12, "tasks": ["11.1"] },
    { "id": 13, "tasks": ["11.2", "11.3"] }
  ]
}
```
