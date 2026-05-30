# Kane CLI Hack Day — Strategy & Reference

Working reference for Kane CLI Hack Day (May 30, 2026, TestMu AI, SF). The focus is
the **Kiro ↔ Kane loop**, the highest-scoring part of the event.

## The one thing to remember

You're not shipping "an app" or "a test." You're shipping **the loop**:
Kiro builds → Kane verifies in a real browser → Kiro fixes → repeat — running on a
small app, demoed live, with a backup recording ready. Hooks fire the loop; a
steering file teaches Kiro how to read Kane; discipline about *when* Kane runs is
what earns "craft."

## Mental model

- **Kiro** — an AI code editor (VS Code fork by AWS). Describe what to build; it
  writes the code. Two modes: **vibe** (freeform) and **spec** (requirements →
  design → tasks).
- **Kane CLI** — a terminal tool that opens real Chrome, runs plain-English flows,
  and returns pass/fail plus a screenshot trace and machine-readable NDJSON.
- **The integration** — there is no special bridge. Kiro runs `kane-cli` (via a
  hook) and reacts to its output (because a steering file taught it how).

## What the judges score (equal weight)

1. **Ships** — real app, primary flow works end to end, runs in <30s via URL or one command.
2. **Verified** — Kane meaningfully exercised the app (not installed-but-unused).
3. **Closed loop** — Kiro built → Kane verified → result fed back to Kiro. Tighter = higher.
4. **Craft** — feels like something a developer would install tonight.

**Submit by 5 PM:** public GitHub repo + README/setup, a one-paragraph writeup
(what/who/what Kane does), and a live URL or one-command run. App and integration
must be substantially built during the day. Kane CLI is the only required dependency.

## Build order (don't reorder)

1. **Skeleton app** that loads at `localhost:PORT`. Kane needs something to point at.
2. **Wire the loop early**, while the app is tiny — hook + steering + one Kane flow.
3. **Build the real app** with the loop already running, so every change is verified
   as it lands.

Interleave build → verify → build → verify. Do **not** bolt Kane on at the end.

## Hooks — the core of the integration

A hook says **"when EVENT happens, do ACTION."** It lives in `.kiro/hooks/`.

```json
{
  "name": "string (required)",
  "version": "string (required)",
  "description": "string (optional)",
  "when": {
    "type": "fileEdited | fileCreated | fileDeleted | userTriggered | promptSubmit | agentStop | preToolUse | postToolUse | preTaskExecution | postTaskExecution",
    "patterns": ["required for file events, e.g. src/**/*.js"],
    "toolTypes": ["required for pre/postToolUse: read, write, shell, web, spec, * or regex"]
  },
  "then": {
    "type": "askAgent | runCommand",
    "prompt": "required for askAgent",
    "command": "required for runCommand"
  }
}
```

### Triggers (`when`)

| Event | Fires when... | Best for |
|---|---|---|
| `fileEdited` | a matching file is saved | vibe-mode inner loop |
| `fileCreated` / `fileDeleted` | files added/removed | structural changes |
| `userTriggered` | you click a button | manual "Verify now" checkpoints |
| `agentStop` | Kiro finishes a chunk | rough vibe-mode boundary |
| `preTaskExecution` | just before a spec task runs | spec-mode setup/guard |
| `postTaskExecution` | just after a spec task completes | **best Kane trigger (spec mode)** |
| `preToolUse` / `postToolUse` | before/after a tool runs | access control / review |

### Actions (`then`)

- **`runCommand`** — runs a terminal command. Kane runs; nothing reacts.
- **`askAgent`** — sends Kiro a prompt. Kiro reacts (reads result, fixes code).
  **This is what closes the loop.**

### The money hook — self-healing on save

```json
{
  "name": "Verify and self-heal with Kane",
  "version": "1.0.0",
  "when": { "type": "fileEdited", "patterns": ["src/**/*.js", "index.html"] },
  "then": {
    "type": "askAgent",
    "prompt": "Run: kane-cli testmd run flows/main_test.md --agent --headless --timeout 90. Read the final result line. If it passed, reply 'Verified' and stop. If it failed, read the reason, fix the app code (NEVER edit the test), and save. Stop after 3 attempts and ask me."
  }
}
```

In spec mode, prefer `postTaskExecution` so Kane runs once per completed feature,
with each flow tied to a requirement.

### Loop-safety rules

- A fix-and-save re-triggers the hook → a genuine loop. **Always cap retries (~3).**
- "passed" / exit code 0 = stop.
- **Never let Kiro edit the test to force a pass — fix the app.**
- Watch for circular hook patterns.

## When to call Kane (the discipline that wins "craft")

Use the cheapest tool that can catch the bug. **Kane is the top of a pyramid, used
sparingly** — it's slow, costs credits, and is non-deterministic. A false failure
fed into an auto-loop makes Kiro "fix" code that was never broken.

**Use cheap checks instead of Kane for:** compiles/typechecks (`build`/`tsc`),
lint, pure logic (unit/property tests), server-up (`curl`), API 200/JSON (`curl`),
static HTML text (`curl`).

**Use Kane only for:** rendered interactive flows, multi-step journeys, behavior
that only exists when JS runs, and the final "a human can complete the primary flow"
assertion.

**Tiered gate:** on save → run cheap checks first → if they fail, stop and fix those
(don't run Kane on a broken app) → only escalate to Kane if cheap checks pass and the
change touched a user-facing flow.

**Cost control:** use saved `testmd` flows (later runs replay from cache, free and
deterministic) not one-shot `run`; scope to what changed; fire at behavior
boundaries, not every keystroke.

> Demo line: "We treated Kane as the top of a testing pyramid. Cheap deterministic
> checks run on every save; Kane only fires when a complete user-facing behavior
> changes — fast, cheap, and trustworthy."

## Spec vs vibe mode

- **Vibe:** no tasks. Triggers are `fileEdited` (noisy), `agentStop` (rough), or
  `userTriggered` (often the most efficient).
- **Spec:** work is split into tasks emitting `pre/postTaskExecution`.
  `postTaskExecution` is the ideal Kane trigger, and each flow can map to a
  requirement so spec → task → flow → verification all align.

## Commands

```bash
# Install / check
npm install -g @testmuai/kane-cli
kane-cli --version
kane-cli whoami

# Login
kane-cli login --username <USER> --access-key <KEY>   # dashboard > Settings > Keys
kane-cli login --oauth

# One-shot (ephemeral — saves to home folder, NOT the project)
kane-cli run "Go to http://localhost:3000 and verify the heading says 'Hello'" --agent

# Saved / replayable (saves to project as output-<name>/ — USE THIS for the loop)
kane-cli testmd run flows/main_test.md --agent --headless --timeout 90
kane-cli testmd list
kane-cli testmd export flows/main_test.md --language js
```

**Useful flags:** `--agent` (NDJSON, required for Kiro to read) · `--headless` ·
`--timeout <s>` · `--max-steps <n>` (default 30) · `--variables` /
`--variables-file` · `--name <name>` · `--mode action|testing` · `--code-export`.

**Exit codes:** `0` passed · `1` failed · `2` error (auth/setup/Chrome) · `3` timeout/cancelled.

## Where Kane stores things

- `run` → home folder, not the project: `~/.testmuai/kaneai/sessions/<id>/`.
- `testmd run` → next to the test file: `output-<name>/` (has `Result.md` + cached
  recordings; **commit-safe**).
- Per run: `screenshots/`, `actions.ndjson`, `session.json`, optional `code-export/`.
- Credentials in `.testmuai/kaneai/profiles/<profile>/<env>/` — **never commit.**

**Reading results:** with `--agent`, each line is a JSON object; the **last line** is
the verdict (`status`, `summary`, `reason`, `final_state`, `test_url`, `run_dir`).
Automate on that line plus the exit code.

## testmd replay rule

First run **authors** each step (slow, costs credits); later runs **replay** the
recording (fast, free, deterministic). **Editing step N re-authors step N and every
step after it.** So edit late, not early; `--author` forces a fresh recording;
deleting `output-<stem>/` wipes the cache.

## Gotchas

- **PowerShell eats `$`.** `$800` silently vanishes. Escape as `'$800'` or write the
  plain number / "USD".
- **Avoid automation-hostile sites** (Airbnb, banks, CAPTCHAs). Test your own app —
  it's cooperative and the loop is far more reliable.
- Kane is **v0.3.5, brand new** — trust `kane-cli --help` over any blog/doc.
- A **TestMu account** is required (sign up at testmuai.com; keys under Settings → Keys).

## Reference links

- Kane CLI docs: https://www.testmuai.com/support/docs/kane-cli-introduction/
- Kane agent instructions: https://www.testmuai.com/kane-cli/agents.md
- Kane CLI GitHub: https://github.com/LambdaTest/kane-cli/
- Kiro hooks: https://kiro.dev/docs/hooks/
- Kiro specs: https://kiro.dev/docs/specs/
- Hack rules: https://kane-cli-hack-day.devpost.com/rules
