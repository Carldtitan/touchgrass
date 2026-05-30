// Property 17: Cheer count increments once per user. Validates Requirement 4.5.
import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { InMemoryCheerRepo } from "./inMemory";

describe("Property 17: cheer count increments once per user", () => {
  it("a user's first cheer increments by one; repeats do not increase further", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        fc.integer({ min: 1, max: 5 }),
        async (hangoutId, userId, repeats) => {
          const repo = new InMemoryCheerRepo();
          const before = await repo.countFor(hangoutId);

          for (let i = 0; i < repeats; i++) {
            await repo.add(hangoutId, userId);
          }

          const after = await repo.countFor(hangoutId);
          expect(after).toBe(before + 1);
        },
      ),
      { numRuns: 200 },
    );
  });

  it("distinct users each add one", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uniqueArray(fc.uuid(), { minLength: 1, maxLength: 10 }),
        async (hangoutId, userIds) => {
          const repo = new InMemoryCheerRepo();
          for (const u of userIds) await repo.add(hangoutId, u);
          expect(await repo.countFor(hangoutId)).toBe(userIds.length);
        },
      ),
      { numRuns: 100 },
    );
  });
});
