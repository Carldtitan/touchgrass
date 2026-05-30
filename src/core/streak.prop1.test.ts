// Property 1: Streak transition on log.
// Validates Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 3.9.
import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { addDays, applyLog, type StreakState } from "./streak";

// Generate an ISO calendar date in a bounded range.
const isoDate = fc
  .date({ min: new Date("2000-01-01T00:00:00Z"), max: new Date("2100-12-31T00:00:00Z") })
  .map((d) => d.toISOString().slice(0, 10));

describe("Property 1: streak transition on log", () => {
  it("null lastLogDate -> streak becomes 1 and lastLogDate = evalDate (7.2, 7.5)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 999 }), isoDate, (streak, evalDate) => {
        const next = applyLog({ streak, lastLogDate: null }, evalDate);
        expect(next).toEqual({ streak: 1, lastLogDate: evalDate });
      }),
      { numRuns: 200 },
    );
  });

  it("same day -> streak unchanged, lastLogDate = evalDate (7.3, 7.5)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 999 }), isoDate, (streak, date) => {
        const next = applyLog({ streak, lastLogDate: date }, date);
        expect(next).toEqual({ streak, lastLogDate: date });
      }),
      { numRuns: 200 },
    );
  });

  it("exactly one day later -> streak + 1 (7.1, 7.5)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 999 }), isoDate, (streak, last) => {
        const evalDate = addDays(last, 1);
        const next = applyLog({ streak, lastLogDate: last }, evalDate);
        expect(next).toEqual({ streak: streak + 1, lastLogDate: evalDate });
      }),
      { numRuns: 200 },
    );
  });

  it("two or more days later -> streak resets to 1 (7.4, 7.5)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 999 }),
        isoDate,
        fc.integer({ min: 2, max: 5000 }),
        (streak, last, gap) => {
          const evalDate = addDays(last, gap);
          const next = applyLog({ streak, lastLogDate: last }, evalDate);
          expect(next).toEqual({ streak: 1, lastLogDate: evalDate });
        },
      ),
      { numRuns: 200 },
    );
  });

  it("always sets lastLogDate to evalDate, regardless of branch (7.5)", () => {
    const startStates: StreakState[] = [
      { streak: 0, lastLogDate: null },
      { streak: 3, lastLogDate: "2024-06-01" },
    ];
    fc.assert(
      fc.property(fc.constantFrom(...startStates), isoDate, (state, evalDate) => {
        expect(applyLog(state, evalDate).lastLogDate).toBe(evalDate);
      }),
      { numRuns: 200 },
    );
  });
});
