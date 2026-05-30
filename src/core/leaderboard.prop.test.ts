// Feature: touchgrass, Property 3: leaderboard total ordering.
// Validates Requirements 5.1, 5.2, 5.3, 5.6.
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { rankUsers, type LeaderboardEntry } from "./leaderboard";

const arbEntry: fc.Arbitrary<LeaderboardEntry> = fc.record({
  userId: fc.uuid(),
  displayName: fc.string({ minLength: 1, maxLength: 12 }),
  score: fc.nat({ max: 500 }),
  streak: fc.nat({ max: 50 }),
});

function inOrder(a: LeaderboardEntry, b: LeaderboardEntry): boolean {
  if (a.score !== b.score) return a.score > b.score;
  if (a.streak !== b.streak) return a.streak > b.streak;
  const n = a.displayName.localeCompare(b.displayName, undefined, {
    sensitivity: "base",
  });
  if (n !== 0) return n < 0;
  return a.userId <= b.userId;
}

describe("Property 3: leaderboard total ordering", () => {
  it("orders by score desc, streak desc, name asc, userId tiebreak", () => {
    fc.assert(
      fc.property(fc.array(arbEntry, { maxLength: 30 }), (entries) => {
        const ranked = rankUsers(entries);
        // Same multiset (permutation).
        expect(ranked.length).toBe(entries.length);
        expect([...ranked].map((e) => e.userId).sort()).toEqual(
          [...entries].map((e) => e.userId).sort(),
        );
        // Adjacent pairs respect the total order.
        for (let i = 1; i < ranked.length; i++) {
          expect(inOrder(ranked[i - 1], ranked[i])).toBe(true);
        }
      }),
      { numRuns: 200 },
    );
  });

  it("is deterministic for the same input", () => {
    fc.assert(
      fc.property(fc.array(arbEntry, { maxLength: 20 }), (entries) => {
        expect(rankUsers(entries)).toEqual(rankUsers(entries));
      }),
      { numRuns: 100 },
    );
  });
});
