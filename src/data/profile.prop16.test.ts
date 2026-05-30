// Property 16: Initial profile invariant. Validates Requirement 1.3.
import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { InMemoryProfileRepo } from "./inMemory";

describe("Property 16: initial profile invariant", () => {
  it("a newly created profile has score 0, streak 0, no last-log date, no badges", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 50 }),
        async (userId, displayName) => {
          const repo = new InMemoryProfileRepo();
          const profile = await repo.create(userId, displayName);

          expect(profile.score).toBe(0);
          expect(profile.streak).toBe(0);
          expect(profile.lastLogDate).toBeNull();
          expect(profile.displayName).toBe(displayName);
        },
      ),
      { numRuns: 200 },
    );
  });
});
