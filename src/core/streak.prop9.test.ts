// Property 9: Skip-a-day advances exactly one calendar day. Validates Requirement 8.2.
import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { addDays, dayDiff } from "./streak";

const isoDate = fc
  .date({ min: new Date("2000-01-01T00:00:00Z"), max: new Date("2100-12-31T00:00:00Z") })
  .map((d) => d.toISOString().slice(0, 10));

describe("Property 9: skip-a-day advances exactly one calendar day", () => {
  it("addDays(date, 1) is exactly one calendar day after date", () => {
    fc.assert(
      fc.property(isoDate, (date) => {
        const advanced = addDays(date, 1);
        expect(dayDiff(date, advanced)).toBe(1);
      }),
      { numRuns: 300 },
    );
  });

  it("advancing one day at a time across month/year boundaries stays consistent", () => {
    fc.assert(
      fc.property(isoDate, fc.integer({ min: 1, max: 400 }), (date, n) => {
        let cursor = date;
        for (let i = 0; i < n; i++) cursor = addDays(cursor, 1);
        expect(dayDiff(date, cursor)).toBe(n);
      }),
      { numRuns: 100 },
    );
  });
});
