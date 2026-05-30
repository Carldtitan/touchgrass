// Property 2: Streak reevaluation on date advance. Validates Requirements 7.6, 8.3.
import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { addDays, reevaluate } from "./streak";

const isoDate = fc
  .date({ min: new Date("2000-01-01T00:00:00Z"), max: new Date("2100-12-31T00:00:00Z") })
  .map((d) => d.toISOString().slice(0, 10));

describe("Property 2: streak reevaluation on date advance", () => {
  it("null lastLogDate -> streak 0 (8.3)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 999 }), isoDate, (streak, evalDate) => {
        expect(reevaluate({ streak, lastLogDate: null }, evalDate).streak).toBe(0);
      }),
      { numRuns: 200 },
    );
  });

  it("gap of two or more days -> streak 0 (7.6)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 999 }),
        isoDate,
        fc.integer({ min: 2, max: 5000 }),
        (streak, last, gap) => {
          const evalDate = addDays(last, gap);
          expect(reevaluate({ streak, lastLogDate: last }, evalDate).streak).toBe(0);
        },
      ),
      { numRuns: 200 },
    );
  });

  it("same day or exactly one day later -> streak unchanged (7.x)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 999 }),
        isoDate,
        fc.integer({ min: 0, max: 1 }),
        (streak, last, gap) => {
          const evalDate = addDays(last, gap);
          const next = reevaluate({ streak, lastLogDate: last }, evalDate);
          expect(next).toEqual({ streak, lastLogDate: last });
        },
      ),
      { numRuns: 200 },
    );
  });
});
