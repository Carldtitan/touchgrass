// Feature: touchgrass, Property 7: scoring is additive by activity.
// Validates Requirement 3.8.
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { applyPoints } from "./score";
import { ACTIVITIES, ACTIVITY_POINTS, pointsFor } from "./activities";

describe("Property 7: scoring is additive by activity", () => {
  it("applyPoints(score, activity) === score + pointsFor(activity)", () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 1_000_000 }),
        fc.constantFrom(...ACTIVITIES),
        (score, activity) => {
          expect(applyPoints(score, activity)).toBe(score + pointsFor(activity));
        },
      ),
      { numRuns: 200 },
    );
  });

  it("uses the fixed point table", () => {
    expect(ACTIVITY_POINTS).toEqual({ Coffee: 10, Gym: 20, Dinner: 30, Hike: 50 });
  });
});
