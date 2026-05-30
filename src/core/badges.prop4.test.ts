// Property 4: Badge unlock thresholds. Validates Requirements 6.4, 6.5, 6.6, 6.7.
import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { unlockedBadges } from "./badges";

describe("Property 4: badge unlock thresholds", () => {
  it("First Steps iff count>=1, Weekend Warrior iff count>=5, On Fire iff streak>=7", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000 }),
        fc.integer({ min: 0, max: 1000 }),
        (hangoutCount, streak) => {
          const badges = unlockedBadges({ hangoutCount, streak });

          expect(badges.has("First Steps")).toBe(hangoutCount >= 1);
          expect(badges.has("Weekend Warrior")).toBe(hangoutCount >= 5);
          expect(badges.has("On Fire")).toBe(streak >= 7);

          // No other badges exist.
          expect(badges.size).toBe(
            (hangoutCount >= 1 ? 1 : 0) +
              (hangoutCount >= 5 ? 1 : 0) +
              (streak >= 7 ? 1 : 0),
          );
        },
      ),
      { numRuns: 300 },
    );
  });
});
