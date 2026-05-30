// Feature: touchgrass, Property 4: badge unlock thresholds.
// Validates Requirements 6.4, 6.5, 6.6, 6.7.
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { unlockedBadges } from "./badges";

describe("Property 4: badge unlock thresholds", () => {
  it("unlocks each badge exactly at its threshold and no others", () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 100 }),
        fc.nat({ max: 100 }),
        (hangoutCount, streak) => {
          const set = unlockedBadges({ hangoutCount, streak });
          expect(set.has("First Steps")).toBe(hangoutCount >= 1);
          expect(set.has("Weekend Warrior")).toBe(hangoutCount >= 5);
          expect(set.has("On Fire")).toBe(streak >= 7);
          expect(set.size).toBe(
            (hangoutCount >= 1 ? 1 : 0) +
              (hangoutCount >= 5 ? 1 : 0) +
              (streak >= 7 ? 1 : 0),
          );
        },
      ),
      { numRuns: 200 },
    );
  });
});
