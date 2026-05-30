---
inclusion: always
---

# Tech Stack

## Stack

- **Language:** TypeScript (strict, ES modules — `"type": "module"`).
- **UI:** React 18 (`react`, `react-dom`) with `StrictMode`.
- **Build/dev:** Vite 5 (`@vitejs/plugin-react`), dev server on fixed port 3000
  (`--strictPort`).
- **Backend:** Supabase (`@supabase/supabase-js`) for auth, data, and photo
  storage. The app is real-data with **no seed data**.
- **Testing:** Vitest + fast-check for property-based testing.
- **Linting:** ESLint with `@typescript-eslint`.
- **Browser verification:** Kane CLI (`kane-cli testmd`) driving real Chrome.

## Common commands

```bash
npm run dev             # Vite dev server on http://localhost:3000
npm run build           # tsc --noEmit, then vite build
npm run typecheck       # tsc --noEmit
npm run lint            # eslint . --ext .ts,.tsx --max-warnings 0
npm run test            # vitest (watch). Use -- --run for a single pass
npm run check:supabase  # zero-row connectivity check against Supabase (no writes)

# Browser verification (only for rendered, multi-step flows)
kane-cli testmd .testmuai/tests/<flow>_test.md --agent --headless --timeout 60000
```

Do not run watch-mode commands (`npm run dev`, `npm run test` without `--run`) in
automation — they block. Use `npm run test -- --run` for a single test pass.

## Configuration

- Supabase config comes from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in
  `.env` (copy from `.env.example`). Missing config renders the `ConfigError`
  screen rather than crashing — never assume config exists.
- Only ever use the Supabase **anon/publishable** key in `VITE_*` vars; anything
  `VITE_`-prefixed is bundled into the shipped frontend. Never put the service key
  there.
- Config reading (`src/data/config.ts`) works in both browser (`import.meta.env`)
  and Node (`process.env`) so the same logic serves the app and CLI scripts.

## Conventions

- **Pure core, no side effects.** Modules in `src/core/` are deterministic pure
  functions. Pass dates/inputs in explicitly; never read `Date.now()` or random.
  Dates are ISO calendar strings `"YYYY-MM-DD"`.
- **Property-based tests** live next to their module as `*.propN.test.ts` and
  reference the requirements they validate. Add/extend these when touching core
  logic rather than relying on browser tests.
- **Styling uses design tokens only.** Reference the CSS variables in
  `src/design-system/tokens.css` (e.g. `var(--color-accent)`, `var(--space-4)`).
  Never hard-code arbitrary hex colors or px values.
- **Contracts are the single source of truth.** Import UI labels, copy, and test
  IDs from `src/contracts/` in both components and tests. Changing a value there
  means updating every dependent Kane flow in the same change.
- **Repository pattern for data.** UI/use-cases depend only on the interfaces in
  `src/data/repositories.ts`. There are two implementations: Supabase-backed
  (production) and in-memory fakes (tests + offline UI dev). Keep code repo-agnostic.
