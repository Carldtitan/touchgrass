---
inclusion: always
---

# Project Structure

```
Touchgrass/
├── index.html                 # Vite entry HTML
├── package.json               # scripts + deps
├── .env / .env.example        # Supabase config (VITE_ vars)
├── scripts/
│   └── check-supabase.mjs      # Node connectivity check (no writes)
├── src/
│   ├── main.tsx                # React root; imports design-system/tokens.css
│   ├── App.tsx                 # Top-level shell; renders ConfigError if config invalid
│   ├── contracts/              # SINGLE SOURCE OF TRUTH shared by app + Kane tests
│   │   ├── labels.ts           #   interactive control strings ("Sign up", "Log it"…)
│   │   ├── copy.ts             #   static copy strings (empty feed, banner…)
│   │   └── testids.ts          #   data-testid values (feed-post, streak-counter…)
│   ├── core/                   # PURE deterministic domain logic + property tests
│   │   ├── activities.ts       #   activity types and point values
│   │   ├── streak.ts           #   streak engine (date-driven, never clock-driven)
│   │   ├── score.ts            #   scoring
│   │   ├── leaderboard.ts      #   ranking/ordering
│   │   ├── badges.ts           #   badge thresholds
│   │   ├── validation.ts       #   input validation
│   │   └── *.propN.test.ts     #   fast-check property tests, one file per property
│   ├── data/                   # Data-access / repository layer
│   │   ├── repositories.ts     #   interfaces the rest of the app depends on
│   │   ├── types.ts            #   shared domain types (Profile, Hangout…)
│   │   ├── config.ts           #   Supabase config + startup guard
│   │   ├── inMemory.ts         #   in-memory fake repos (tests + offline UI dev)
│   │   ├── supabaseClient.ts   #   Supabase client setup
│   │   ├── supabaseRepositories.ts # production repo implementations
│   │   ├── createHangout.ts    #   hangout use-case (orchestrates repos)
│   │   └── *.propN.test.ts     #   property tests for data behaviors
│   └── design-system/          # Presentation layer
│       ├── tokens.css          #   design tokens (the ONLY source of colors/spacing)
│       ├── AppShell.tsx        #   phone-width layout wrapper
│       ├── ConfigError.tsx     #   shown when Supabase config is missing
│       └── InitialsAvatar.tsx
├── .testmuai/
│   └── tests/                  # Kane CLI flows (plain-English *_test.md) + output-*/
└── .kiro/
    ├── steering/               # this guidance (product, tech, structure, kane-verification)
    ├── specs/touchgrass/       # requirements.md, design.md, tasks.md driving the build
    └── hooks/                  # automation: cheap-gate on save, Kane verify per task, etc.
```

## Layering rules

Dependencies flow one direction. Keep these boundaries intact:

- `core/` — depends on nothing else in the app. Pure functions only. No React, no
  network, no I/O.
- `data/` — defines repository interfaces and domain types; may use `core/` types.
  UI talks to the interfaces in `repositories.ts`, not to Supabase directly.
- `design-system/` and components — depend on `data/` interfaces and `contracts/`.
- `contracts/` — depended on by everything (components and Kane tests); depends on
  nothing.

## Where things go

- New domain rule with a clearly correct answer → `src/core/` + a `*.propN.test.ts`.
- New persisted entity or query → extend `repositories.ts`, then both `inMemory.ts`
  and `supabaseRepositories.ts`.
- New UI string, button label, or test id → add to `src/contracts/`, never inline.
- New browser-verifiable flow → a `*_test.md` under `.testmuai/tests/`.
- The spec under `.kiro/specs/touchgrass/` is the source of intent; requirement
  numbers (e.g. `Req 7.4`) are referenced throughout the code in comments.
