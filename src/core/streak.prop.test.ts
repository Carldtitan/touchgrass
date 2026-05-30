// Feature: touchgrass, Property 1 & 2: streak transition on log / reevaluation.
// Validates Requirements 7.1–7.6, 8.3, 3.9.
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { applyLog, reevaluate, dayDiff, addDays, type StreakState } from "./streak";

const arbIso = fc
  .date({ min: new Date("2000-01-01"), max: new Date("2100-01-01") })
  .map((d) => d.toISOString().slice(0, 10));

const arbState: fc.Arbitrary<StreakState> = fc.record({
  streak: fc.nat({ max: 1000 }),
  lastLogDate: fc.option(arbIso, { nil: null }),
});

describe("Property 1: streak transition on log", () => {
  it("sets lastLogDate to evalDate and the correct streak", () => {
    fc.assert(
      fc.property(arbState, arbIso, (state, evalDate) => {
        const next = applyLog(state, evalDate);
        expect(next.lastLogDate).toBe(evalDate); // 7.5
        if (state.lastLogDate === null) {
          expect(next.streak).toBe(1); // 7.2
          return;
        }
        const diff = dayDiff(state.lastLogDate, evalDate);
        if (diff === 0) expect(next.streak).toBe(state.streak); // 7.3
        else if (diff === 1) expect(next.streak).toBe(state.streak + 1); // 7.1
        else expect(next.streak).toBe(1); // 7.4 (and negative diffs)
      }),
      { numRuns: 200 },
    );
  });
});

describe("Property 2: streak reevaluation on date advance", () => {
  it("resets to 0 when 2+ days passed or no last log; otherwise unchanged", () => {
    fc.assert(
      fc.property(arbState, arbIso, (state, evalDate) => {
        const next = reevaluate(state, evalDate);
        if (state.lastLogDate === null) {
          expect(next.streak).toBe(0); // 8.3
          return;
        }
        const diff = dayDiff(state.lastLogDate, evalDate);
        if (diff >= 2) expect(next.streak).toBe(0); // 7.6
        else expect(next.streak).toBe(state.streak);
      }),
      { numRuns: 200 },
    );
  });
});

describe("Property 9: skip-a-day advances exactly one calendar day", () => {
  it("addDays(date, 1) is one day after date", () => {
    fc.assert(
      fc.property(arbIso, (date) => {
        expect(dayDiff(date, addDays(date, 1))).toBe(1); // 8.2
      }),
      { numRuns: 200 },
    );
  });
});
