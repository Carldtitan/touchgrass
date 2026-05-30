# Kane CLI Hack Day — Prep & Strategy Notes

A working reference for the Kane CLI Hack Day (May 30, 2026, TestMu AI office, SF).
Captures everything worked out in prep, with heavy focus on **hooks**, since the
Kiro ↔ Kane loop is the highest-scoring part of the event.

---

## 1. The 60-second mental model

- **Kiro** = an AI code editor (VS Code fork by AWS). You describe what to build; it writes the code. Has two modes: **vibe** (freeform chat) and **spec** (structured requirements → design → tasks).
- **Kane CLI** = a terminal tool that opens a real Chrome browser and runs plain-English test flows, returns pass/fail + a video/screenshot trace + machine-readable output.
- **The hack** = build a working web app in Kiro, have Kane verify it, and wire the two so they talk **automatically** (the "closed loop"). The tighter the loop, the higher the score.
- **There is NO special connection between them.** Kiro can type terminal commands and read their output. "Integration" = Kiro runs the `kane-cli` command (via a hook) and reacts to what it prints (because a steering file taught it how).

---

## 2. What the hack actually expects (the three bars)

1. **Ships** — a real app, primary flow works end to end, runnable in <30s via live URL or one command.
2. **Verified** — Kane actually exercised the app and caught or confirmed something meaningful (not installed-but-unused, not one trivial flow tacked on).
3. **Closed loop** — Kiro built → Kane verified → result fed back into Kiro. This is weighted highest and is what the judges most want to see.
4. **Craft** — does it feel like something a developer would want to install tonight.

### Submission by 5 PM
- Public **GitHub repo** with a README + setup steps.
- **One paragraph**: what you built, who it's for, what Kane does in the flow.
- **Live URL or runnable command** (judges see it work in <30s).
- dev.to writeup optional but encouraged.

### Rules that matter
- App **and** the Kane integration must be **substantially built during the day**. A scaffold/starter is OK if you're honest about what existed before 10 AM.
- Any AI agent, any stack. **Kane CLI is the only required dependency.**
- Hand judges working credentials if there's a login.
- Prize amount is inconsistent across pages ($3,000 header vs $5,000 breakdown) — confirm with organizers, don't bank on a number.

---

## 3. The build order (do NOT get this wrong)

Three beats, in this order:

1. **Skeleton app first.** A page that loads at `localhost:PORT`. No features. Kane needs *something* to point at.
2. **Wire the loop early**, while the app is tiny. Set up the hook + steering file + one Kane flow. Prove the loop works on the skeleton.
3. **Build the real app** with the loop already running, so every meaningful change gets verified as it lands.

> Do NOT build the whole app then bolt Kane on at the end — that's the approach the judges said *loses*. Interleave: build a bit → verify → build a bit → verify.

---

## 4. HOOKS — the core of the integration

### 4.1 What a hook is

A hook is a small config that says **"when EVENT happens, do ACTION."** It lives as a file in `.kiro/hooks/` (or created via Kiro's hook UI). Three parts:

- **name/description** — what it's called
- **`when`** — the trigger event
- **`then`** — what happens

### 4.2 Hook schema (follow this exactly)

```json
{
  "name": "string (required)",
  "version": "string (required)",
  "description": "string (optional)",
  "when": {
    "type": "fileEdited | fileCreated | fileDeleted | userTriggered | promptSubmit | agentStop | preToolUse | postToolUse | preTaskExecution | postTaskExecution",
    "patterns": ["required for file events only, e.g. src/**/*.js"],
    "toolTypes": ["required for preToolUse/postToolUse: read, write, shell, web, spec, * or regex"]
  },
  "then": {
    "type": "askAgent | runCommand",
    "prompt": "required for askAgent",
    "command": "required for runCommand"
  }
}
```

### 4.3 Trigger events (the `when`)

| Event | Fires when... | Best for |
|---|---|---|
| `fileEdited` | a matching file is saved | vibe mode inner loop |
| `fileCreated` / `fileDeleted` | files added/removed | structural changes |
| `userTriggered` | you click a button | manual "Verify now" checkpoints |
| `agentStop` | Kiro finishes a chunk of work | rough vibe-mode boundary |
| `preTaskExecution` | right before a spec task runs | spec mode setup/guard |
| `postTaskExecution` | right after a spec task completes | **best Kane trigger in spec mode** |
| `preToolUse` / `postToolUse` | before/after Kiro uses a tool | access control / review |

### 4.4 Actions (the `then`)

- **`runCommand`** — runs a terminal command. Use to just *run* Kane (reports result, no reaction).
- **`askAgent`** — sends Kiro a prompt. Use to make Kiro *react* (read result, fix code). **This is what closes the loop.**

> The difference between `runCommand` and `askAgent` is the difference between "Kane runs" and "the loop closes." The loop needs `askAgent`.

### 4.5 Example hook — run Kane on save (report only)

```json
{
  "name": "Verify on save with Kane",
  "version": "1.0.0",
  "when": {
    "type": "fileEdited",
    "patterns": ["src/**/*.js", "index.html"]
  },
  "then": {
    "type": "runCommand",
    "command": "kane-cli testmd run flows/main_test.md --agent --headless --timeout 90"
  }
}
```

### 4.6 Example hook — self-healing loop (the money hook)

```json
{
  "name": "Verify and self-heal with Kane",
  "version": "1.0.0",
  "when": {
    "type": "fileEdited",
    "patterns": ["src/**/*.js", "index.html"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Run: kane-cli testmd run flows/main_test.md --agent --headless --timeout 90. Read the final result line. If it passed, reply 'Verified' and stop. If it failed, read the reason, fix the app code (NEVER edit the test), and save. Stop after 3 attempts and ask me."
  }
}
```

### 4.7 Example hook — spec mode, verify each completed task

```json
{
  "name": "Verify each completed task with Kane",
  "version": "1.0.0",
  "when": {
    "type": "postTaskExecution"
  },
  "then": {
    "type": "askAgent",
    "prompt": "A spec task just completed. Run the Kane flow that corresponds to this task's requirement. If it fails, read the reason, fix the code, and re-verify. Stop after 3 attempts."
  }
}
```

### 4.8 IMPORTANT loop-safety rules

- A fix-and-save re-triggers the save hook → genuine loop. **Always cap retries (~3)** so a flaky failure can't spin forever or corrupt working code.
- "passed" / exit code 0 = stop. Don't keep going on green.
- **Never let Kiro edit the test to force a pass.** Fix the app, not the test.
- Watch for circular hook patterns (a hook that triggers itself indirectly).

---

## 5. WHEN to call Kane (the discipline that wins "craft")

**Core principle: use the cheapest tool that can catch the bug. Kane is the TOP of a pyramid, used sparingly.**

Kane is **slow** (real browser + AI reasoning), **costs credits**, and is **non-deterministic** (can misclick/flake). A false failure fed into an auto-loop makes Kiro "fix" code that was never broken — so over-use doesn't just waste time, it can *corrupt the codebase*.

### Do NOT call Kane for (use terminal/unit checks instead):
- Compiles / typechecks → `build` / `tsc`
- Lint / formatting → `eslint`
- Pure function logic (the math) → **unit test** (vitest/jest)
- Server up / port listening → `curl` / `Invoke-WebRequest`
- API returns 200 / right JSON → `curl`
- Static HTML contains text → `curl` + `findstr`

### DO call Kane for:
- The real **rendered, interactive** flow ("type 90, click, the screen shows 30")
- Multi-step user journeys (login → dashboard → action → result)
- Behavior that only exists when JS runs (toggles, redirects, dynamic UI)
- The final "a human can complete the primary flow" assertion

> Cheap checks verify the app is *built correctly*; Kane verifies it *behaves correctly for a user*. Different questions.

### The "good hook" pattern — tiered gate
1. On save → run cheap checks first (build + typecheck + unit tests). Seconds, free.
2. If those fail → **stop, fix those first. Do NOT run Kane** on a broken app.
3. Only if cheap checks pass AND the change touched a user-facing flow → escalate to Kane.

### Cost-cutting tactics
- Use **`testmd`** (saved tests) not `run` — later runs replay from cache, fast + deterministic, no AI cost. Only the authored run is slow.
- **Scope to what changed** — run the checkout flow when checkout changed, not the whole suite.
- Fire Kane at **behavior boundaries** (task complete / manual checkpoint), not every keystroke.

**Demo line that scores with testing engineers:** "We treated Kane as the top of a testing pyramid. Cheap deterministic checks run on every save; Kane only fires when a complete user-facing behavior changes. That keeps the loop fast, cheap, and trustworthy."

---

## 6. Vibe mode vs Spec mode (how it changes hook timing)

- **Vibe mode**: no tasks. Triggers = `fileEdited` (noisy — fires mid-thought), `agentStop` (rough boundary), or `userTriggered` (manual "Verify" button — often the most efficient in vibe).
- **Spec mode**: work split into discrete tasks. Emits `preTaskExecution` / `postTaskExecution`. **`postTaskExecution` is the ideal Kane trigger** — a completed task is a clean "a whole feature just landed" boundary, so Kane runs once per meaningful feature, not per save.
- Spec mode also enables the strongest design: each Kane flow corresponds to a requirement, so spec → task → Kane flow → verification all align.

---

## 7. "A spec that compiles down to Kane flows"

Means: **write requirements once, and the Kane tests are generated automatically from them.** The spec is the single source of truth; the Kane flows are output, not hand-written. Change a requirement → the flow regenerates → verification updates. Intent and verification can never drift apart.

In practice it's not a real compiler — it's Kiro reading `requirements.md` and writing a `_test.md` Kane flow per requirement (an `askAgent` step or a hook on `requirements.md` save). This is the purest expression of the event's thesis: "specs describe intent, Kane proves it."

---

## 8. Idea directions considered

### From the hack's own list
- **Apps that verify themselves** (self-healing checkout, prompt-to-feature playground, etc.)
- **Verification baked into your workflow** (kane-watch on save, gh kane on PRs, MCP `verify_with_kane` tool, pre-commit hooks, drift detectors)
- **Browser agents in the wild** (job-application autopilot, subscription killer, travel booking, etc.)

### The three-workstream experiment (strong if framed right)
Build the **same tiny app** three ways as a **controlled comparison**:
- **Arm 3 — No Kane** (baseline): build blind, then run Kane at the END to reveal bugs that shipped.
- **Arm 1 — Vibe + Kane**: verification bolted onto freeform; observe noisy triggers / over-use.
- **Arm 2 — Spec + Kane**: disciplined; Kane fires at task boundaries, tied to requirements; cleanest loop.

The **finding** is the pitch. Splits cleanly across teammates IF the app spec is tiny and frozen so method is the only variable.

### The unique idea (not on their list): Kane as a CLARITY / agent-readiness tester
Instead of testing *correctness* ("does it work"), test *understandability*: give Kane only the **goal**, never the steps ("split a $90 bill among 3 people — accomplish it"). Measure how hard it struggles (steps vs minimum, wrong clicks, backtracks, getting stuck). A confusing UI makes a capable agent flail. Kiro reads *where* it got lost and redesigns those parts → re-test → agent glides through. Loop = build → measure confusion → reduce confusion → re-measure. Forward-looking framing: "is your app ready for the agent web."
- Caveats: non-deterministic (run 2–3x, look at big gaps not small ones); it's agent-comprehension not a human guarantee (frame as a lower bound / first-pass signal); keep tasks tiny.

### On converting Kane to an MCP — medium verdict
- Feasible and on-brief, but **TestMu already ships MCP servers**, so a plain wrapper risks being predictable.
- An MCP hands the *when to verify* decision to the model's **fragile** tool-selection (it picks tools by reading text descriptions — unreliable). That undercuts the disciplined gating that's the strong idea.
- If done: pair MCP (on-demand path) WITH hooks (deterministic backbone), and make the *insight* "we wrote the tool description + guardrails so the agent verifies in the browser ONLY when cheaper checks can't answer" — i.e. solving the over-use problem.

---

## 9. How a model decides to use a tool / MCP

The model reads each tool's **name + text description + input schema** (injected into its context) and **semantically matches** them to the user's intent. There is no magic. Consequences:
- Tool selection is **fragile** — can call the wrong tool with valid syntax (silent, no error), or over-call a broadly-worded tool.
- Too many tools confuse it (advanced setups retrieve only 3–5 relevant tools).
- **Precise descriptions are everything.** Vague "verify the app" → over-called. Precise "full browser E2E of a rendered flow; slow + costly; use ONLY when behavior needs a real browser; NOT for compile/lint/unit/API" → sparing, correct use.

---

## 10. What kind of app to build

The app is NOT the point — **the loop is.** Pick an app that makes the loop visible and reliable. Four tests:
1. Its core feature has a **clearly right/wrong answer** (a number, a redirect, an on/off state) — easy for Kane to assert.
2. You can **break it in one line** for the live self-heal demo.
3. The main flow is **short** (<15 steps) — long flows make Kane flake.
4. It runs **locally, no external dependencies** (no third-party logins/payments/APIs that can be down).

Good shapes: a bill splitter, a small cart/total page, a signup form with real validation rules. Give it a **specific fun theme** (not generic) for craft — but keep the logic simple. Avoid: todo apps (pre-labeled boring), long multi-step flows, taste-based "looks nice" outcomes, automation-hostile real sites (Airbnb fought back hard).

---

## 11. Team split (by ROLE, not by slicing the app)

The loop runs on ONE machine. Don't have 4 people fighting over it.
- **Person 1 — Loop owner** (strongest builder): owns the loop machine, hooks, steering, gets Kane firing + Kiro reacting. **Single owner — non-negotiable.**
- **Person 2 — App builder**: builds features, hands to loop owner to verify.
- **Person 3 — Test author**: writes Kane flows (plain-English `.md`), designs the break-it-on-purpose demo scenario.
- **Person 4 — Demo & narrative**: README, submission paragraph, **backup recording**, demo script, dev.to post.

Parallelizes well: app features, Kane test authoring, demo/submission prep. Does NOT parallelize: the integration itself (one owner), live-editing the same tiny app simultaneously.

---

## 12. Setup status & commands

### Installed / done
- Kane CLI installed (`kane-cli --version` → 0.3.5) ✅
- Logged in (`kane-cli whoami` → user `carluni`, profile `Carldtytan`) ✅
- One practice run done (Airbnb monthly-stays search, passed, 27 steps) ✅

### Key commands
```bash
# Install / check
npm install -g @testmuai/kane-cli
kane-cli --version
kane-cli whoami

# Login
kane-cli login --username <USER> --access-key <KEY>     # from dashboard Settings > Keys
kane-cli login --oauth                                  # browser sign-in

# One-shot run (ephemeral — saves to home folder, NOT project)
kane-cli run "Go to http://localhost:3000 and verify the heading says 'Hello'" --agent

# Saved/replayable test (saves to project as output-<name>/ — USE THIS for the loop)
kane-cli testmd run flows/main_test.md --agent --headless --timeout 90
kane-cli testmd list
kane-cli testmd export flows/main_test.md --language js   # Playwright export
```

### Useful flags
`--agent` (machine-readable NDJSON — required when Kiro reads it) ·
`--headless` (no window) · `--timeout <s>` · `--max-steps <n>` (default 30) ·
`--variables '<json>'` / `--variables-file <path>` · `--name <name>` (persist a run) ·
`--mode action|testing` · `--code-export --code-language py|js`

### Exit codes
`0` passed · `1` failed · `2` error (auth/setup/Chrome) · `3` timeout/cancelled

---

## 13. Where Kane stores things (verified)

- **`run` command** → home folder, NOT your project:
  `C:\Users\<you>\.testmuai\kaneai\sessions\<id>\`
- **`testmd run`** → your project, next to the test file: `output-<name>/`
  (contains `Result.md` + cached recordings; **commit-safe, commit it to git**)
- Inside a run: `screenshots/` (PNG per step), `actions.ndjson` (full step record),
  `session.json` (summary), `code-export/` (generated Playwright if enabled)
- Credentials live in `.testmuai\kaneai\profiles\<profile>\<env>\` — **keep private, never commit.**

### Reading results
With `--agent`, Kane prints one JSON object per line; the **last line** is the verdict
(`status`, `summary`, `reason`, `final_state`, `test_url`, `session_dir`/`run_dir`).
Build automation on that final line + the exit code.

---

## 14. testmd replay/cascade rule (don't get surprised)

- First run **authors** (AI figures out + records each step — slow, costs credits).
- Later runs **replay** the recording (fast, free, deterministic).
- **Editing step N re-authors step N and every step after it** (each step depends on the state the previous one left). So a change near the top of a 20-step test re-runs almost all of it.
- Practical: edit late not early when possible; `--author` forces a full fresh recording; deleting `output-<stem>/` wipes the cache.

---

## 15. Gotchas

- **PowerShell eats `$`.** `$800` becomes an empty variable and silently vanishes (this bit the Airbnb run — the price disappeared). Escape it: `'$800'` or `` `$800 ``.
- **Hard/automation-hostile sites** (Airbnb, banks, CAPTCHAs/logins) are bad targets. Test your **own** app — it's cooperative and the loop is far more reliable.
- **Kane is v0.3.5, brand new.** Trust `kane-cli --help` on the day over any blog/doc.
- **Need a TestMu account** even with free Pro for the day — sign up at testmuai.com, keys under Settings → Keys.
- Confirm with organizers whether practicing the integration on a **throwaway** project beforehand is OK (rules say the submission's integration must be built during the day — practice ≠ submission, but get it on record via the #kane-hackday-sf Discord).

---

## 16. The night-before checklist

- [ ] Kiro installed + signed in + one vibe chat run
- [ ] Kane CLI installed (`--version` works) ✅
- [ ] `kane-cli whoami` shows your account ✅
- [ ] One clean CLI run completed ✅
- [ ] Skimmed Kane's agent guide: testmuai.com/kane-cli/agents.md (the §4 "Writing Objectives" + "store as" extraction is the key part)
- [ ] (Allowed) practiced the hook + steering loop on a throwaway app so it's muscle memory
- [ ] Decided rough app idea (small, clearly-correct core, breakable in one line, local-only)
- [ ] Laptop, charger, AWS account logged in

---

## 17. Reference links

- Kane CLI docs: https://www.testmuai.com/support/docs/kane-cli-introduction/
- Kane agent instructions (point Kiro at this): https://www.testmuai.com/kane-cli/agents.md
- Kane CLI GitHub: https://github.com/LambdaTest/kane-cli/
- Kiro hooks docs: https://kiro.dev/docs/hooks/
- Kiro specs docs: https://kiro.dev/docs/specs/
- Hack rules: https://kane-cli-hack-day.devpost.com/rules

---

## The one sentence to remember

You're not delivering "an app" or "a Kane test" — you're delivering **the loop**:
Kiro builds → Kane verifies → Kiro fixes → repeat, running on a small app you made,
demoed live, with a backup recording in your pocket. Hooks are how the loop fires;
the steering file is how Kiro understands Kane; discipline about *when* Kane runs is
what makes it fast, trustworthy, and worth "craft" points.
