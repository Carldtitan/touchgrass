// Property 3: Leaderboard total ordering. Validates Requirements 5.1, 5.2, 5.3, 5.6.
import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { rankUsers, type LeaderboardEntry } from "./leaderboard";

const entry = fc.record<LeaderboardEntry>({
  userId: fc.uuid(),
  displayName: fc.string({ minLength: 1, maxLength: 12 }),
  score: fc.integer({ min: 0, max: 500 }),
  streak: fc.integer({ min: 0, max: 100 }),
});

function inOrder(a: LeaderboardEntry, b: LeaderboardEntry): boolean {
  if (a.score !== b.score) return a.score > b.score;
  if (a.streak !== b.streak) return a.streak > b.streak;
  const byName = a.displayName.localeCompare(b.displayName, undefined, {
    sensitivity: "base",
  });
  if (byName !== 0) return byName < 0;
  return a.userId.localeCompare(b.userId) <= 0;
}

describe("Property 3: leaderboard total ordering", () => {
  it("orders by score desc, streak desc, name asc, with a total deterministic order", () => {
    fc.assert(
      fc.property(fc.array(entry, { maxLength: 30 }), (entries) => {
        // Unique userIds so the final tiebreak is well-defined.
        const unique = Array.from(
          new Map(entries.map((e) => [e.userId, e])).values(),
        );
        const ranked = rankUsers(unique);

        // Same multiset (a permutation).
        expect(ranked.length).toBe(unique.length);
        expect(new Set(ranked.map((e) => e.userId))).toEqual(
          new Set(unique.map((e) => e.userId)),
        );

        // Adjacent pairs respect the ordering relation.
        for (let i = 0; i + 1 < ranked.length; i++) {
          expect(inOrder(ranked[i], ranked[i + 1])).toBe(true);
        }
      }),
      { numRuns: 200 },
    );
  });

  it("is stable for the same input regardless of call (5.3, 5.6)", () => {
    fc.assert(
      fc.property(fc.array(entry, { maxLength: 30 }), (entries) => {
        const unique = Array.from(
          new Map(entries.map((e) => [e.userId, e])).values(),
        );
        const a = rankUsers(unique).map((e) => e.userId);
        const b = rankUsers([...unique].reverse()).map((e) => e.userId);
        expect(a).toEqual(b);
      }),
      { numRuns: 200 },
    );
  });
});
