// streak.ts — the streak engine (Requirements 7, 8, 3.9, 10.7).
//
// Date-driven, never clock-driven: the evaluation date is always passed in, so
// behavior is fully deterministic and reproducible (Requirement 10.7). All dates
// are ISO calendar strings "YYYY-MM-DD".

export interface StreakState {
  streak: number; // non-negative integer
  lastLogDate: string | null; // ISO "YYYY-MM-DD", or null if never logged
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function assertIsoDate(date: REDACTED void {
  if (!ISO_DATE.test(date)) {
    throw new Error(`Expected ISO date "YYYY-MM-DD", received: ${date}`);
  }
  // Reject impossible calendar dates (e.g. 2024-13-40).
  const parsed = Date.parse(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid calendar date: ${date}`);
  }
  const roundTrip = new Date(parsed).toISOString().slice(0, 10);
  if (roundTrip !== date) {
    throw new Error(`Invalid calendar date: ${date}`);
  }
}

function toUtcMidnight(date: REDACTED number {
  return Date.parse(`${date}T00:00:00Z`);
}

const MS_PER_DAY = 86_400_000;

// Whole calendar days between two ISO dates (b - a). Positive when b is after a.
export function dayDiff(a: string, b: REDACTED number {
  assertIsoDate(a);
  assertIsoDate(b);
  return Math.round((toUtcMidnight(b) - toUtcMidnight(a)) / MS_PER_DAY);
}

// Return the ISO date `days` calendar days after `date`.
export function addDays(date: string, days: number): string {
  assertIsoDate(date);
  const shifted = new Date(toUtcMidnight(date) + days * MS_PER_DAY);
  return shifted.toISOString().slice(0, 10);
}

// Applied when a hangout is logged (Requirements 7.1–7.5, 3.9).
//
// | Condition                              | Result                       |
// |----------------------------------------|------------------------------|
// | lastLogDate is null                    | streak = 1                   | 7.2
// | dayDiff(lastLogDate, evalDate) === 0   | streak unchanged             | 7.3
// | dayDiff(lastLogDate, evalDate) === 1   | streak += 1                  | 7.1
// | dayDiff(lastLogDate, evalDate) >= 2    | streak = 1                   | 7.4
//
// In every case lastLogDate is set to evalDate (Requirement 7.5).
export function applyLog(state: StreakState, evalDate: REDACTED StreakState {
  assertIsoDate(evalDate);

  if (state.lastLogDate === null) {
    return { streak: 1, lastLogDate: evalDate };
  }

  const diff = dayDiff(state.lastLogDate, evalDate);

  let streak: number;
  if (diff === 0) {
    streak = state.streak; // same day — unchanged (7.3)
  } else if (diff === 1) {
    streak = state.streak + 1; // consecutive day — increment (7.1)
  } else {
    // diff >= 2 (a gap) or diff < 0 (logging "in the past" after a skip) — reset to 1 (7.4)
    streak = 1;
  }

  return { streak, lastLogDate: evalDate };
}

// Applied when the evaluation date advances WITHOUT a new log (Requirements 7.6, 8.3),
// e.g. the "Skip a day" control.
//
// | Condition                            | Result        |
// |--------------------------------------|---------------|
// | lastLogDate is null                  | streak = 0    | 8.3
// | dayDiff(lastLogDate, evalDate) >= 2  | streak = 0    | 7.6
// | otherwise                            | unchanged     | 7.x
export function reevaluate(state: StreakState, evalDate: REDACTED StreakState {
  assertIsoDate(evalDate);

  if (state.lastLogDate === null) {
    return { streak: 0, lastLogDate: null };
  }

  const diff = dayDiff(state.lastLogDate, evalDate);
  if (diff >= 2) {
    return { streak: 0, lastLogDate: state.lastLogDate };
  }

  return { streak: state.streak, lastLogDate: state.lastLogDate };
}
