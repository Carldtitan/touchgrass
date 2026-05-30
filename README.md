# TouchGrass

TouchGrass is a mobile-first social app that turns real-world hangouts into a game.
Sign up, log an in-person activity with a photo, earn points, keep a daily streak,
unlock badges, and climb the leaderboard with everyone else.

Logging is honor-system — the app doesn't check that you actually went outside — and
it ships with no seed data. Everything you see is real, persisted activity from real
accounts.

## Features

- **Email auth** — sign up and log in with email + password; sessions persist.
- **Log a hangout** — pick an activity (Coffee, Gym, Dinner, Hike), attach a photo,
  optionally tag friends, and post it. Each activity is worth fixed points
  (Coffee 10, Gym 20, Dinner 30, Hike 50).
- **Home feed** — every hangout from every user, newest first, with its photo and
  points.
- **Cheers & comments** — react to and comment on hangouts in the feed.
- **Daily streak** — a running count of consecutive days you've logged something.
- **Badges** — milestone awards (First Steps, Weekend Warrior, On Fire) shown on
  your profile.
- **Leaderboard** — all users ranked by total score.
- **Four tabs** — Home, Log, Leaderboard, Profile, in a fixed bottom nav.

## Tech stack

- **Frontend:** React 18, Vite 5, TypeScript (strict, ES modules)
- **Styling:** Tailwind CSS + shadcn/ui, lucide-react icons, design tokens
- **Backend:** Supabase — authentication, Postgres database, and photo storage
- **Testing:** Vitest + fast-check (property-based) for the core logic

## Getting started

### Prerequisites

- Node.js 20+ and npm
- A Supabase project (free tier is fine)

### 1. Install

```bash
npm install
```

### 2. Configure Supabase

Copy the example env file and fill in your project's values:

```bash
cp .env.example .env
```

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Use the **anon/publishable** key only — anything prefixed `VITE_` is bundled into the
shipped frontend, so never put a service/secret key here. Without these variables the
app renders a configuration-error screen instead of crashing.

Apply the database schema in `supabase/schema.sql` to your Supabase project (via the
SQL editor or CLI), and confirm connectivity with:

```bash
npm run check:supabase
```

### 3. Run

```bash
npm run dev
```

The app runs at http://localhost:3000.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server on port 3000 |
| `npm run build` | Type-check, then build for production |
| `npm run typecheck` | Type-check only (`tsc --noEmit`) |
| `npm run lint` | Lint with ESLint (zero warnings allowed) |
| `npm run test` | Run the test suite (add `-- --run` for a single pass) |
| `npm run check:supabase` | Verify Supabase connectivity (read-only, no writes) |

## Project structure

```
src/
├── main.tsx            React root
├── App.tsx             Top-level shell; shows config-error screen if env is missing
├── contracts/          Shared UI labels, copy strings, and test IDs
├── core/               Pure domain logic — streak, score, leaderboard, badges, validation
├── data/               Repository interfaces + Supabase and in-memory implementations
├── design-system/      Tokens, layout shell, and shadcn/ui components
├── features/           Screens: auth, feed, log, leaderboard, profile, nav
└── hooks/              React context providers and data hooks
```

A few design choices worth knowing:

- **The core is pure and deterministic.** All scoring, streak, leaderboard, and badge
  logic lives in `src/core/` as pure functions. Inputs (including the evaluation date)
  are always passed in explicitly rather than read from the clock, which makes the
  rules reproducible and easy to test. Property-based tests live next to each module
  as `*.propN.test.ts`.

- **Data goes through a repository layer.** The UI depends only on the interfaces in
  `src/data/repositories.ts`. There are two implementations: a Supabase-backed one for
  production and an in-memory one for tests and offline UI work.

- **Styling uses design tokens.** Colors and spacing come from the CSS variables in
  `src/design-system/tokens.css` rather than hard-coded values.

## Testing

```bash
npm run test -- --run
```

The pure core logic (streak math, scoring, ranking, badge thresholds) is covered by
fast-check property tests so the rules hold across a wide range of inputs, not just a
few hand-picked cases.
