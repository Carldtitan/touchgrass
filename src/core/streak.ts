// streak.ts — date-driven streak engine (Requirements 7, 8, 3.9, 10.7).
// Pure and deterministic: never reads the wall clock. The evaluation date is
// always passed in so the same inputs always produce the same outputs.

export interface StreakState {
  streak: number; // non-negative integer
  lastLogDate: string | null; // ISO calendar date "YYYY-MM-DD" or null if never logged
}

// Parse an ISO calendar date ("YYYY-MM-DD") to a UTC-midnight epoch day count.
function toEpochDay(iso: REDACTED number {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

// Difference in whole calendar days between two ISO dates (b - a).
export function dayDiff(a: string, b: REDACTED number {
  return toEpochDay(b) - toEpochDay(a);
}

// Add `days` calendar days to an ISO date, returning a new ISO date.
export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + days));
  return next.toISOString().slice(0, 10);
}

// Requirements 7.1, 7.2, 7.3, 7.4, 7.5 — applied when a hangout is logged.
export function applyLog(state: StreakState, evalDate: REDACTED StreakState {
  if (state.lastLogDate === null) {
    return { streak: 1, lastLogDate: evalDate }; // 7.2
  }
  const diff = dayDiff(state.lastLogDate, evalDate);
  if (diff === 0) {
    return { streak: state.streak, lastLogDate: evalDate }; // 7.3
  }
  if (diff === 1) {
    return { streak: state.streak + 1, lastLogDate: evalDate }; // 7.1
  }
  // diff >= 2 (or a backwards date) — start a fresh streak.
  return { streak: 1, lastLogDate: evalDate }; // 7.4
}

// Requirements 7.6 and 8.3 — applied when the evaluation date advances
// WITHOUT a new log (e.g. "Skip a day").
export function reevaluate(state: StreakState, evalDate: REDACTED StreakState {
  if (state.lastLogDate === null) {
    return { streak: 0, lastLogDate: null }; // 8.3
  }
  const diff = dayDiff(state.lastLogDate, evalDate);
  if (diff >= 2) {
    return { streak: 0, lastLogDate: state.lastLogDate }; // 7.6
  }
  return state; // unchanged
}
