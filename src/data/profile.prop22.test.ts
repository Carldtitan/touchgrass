// Property 22: Display names are unique, case-insensitively.
// Mirrors the DB unique index on lower(display_name): two profiles can never
// share a display name regardless of case, and distinct names always succeed.
import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { InMemoryProfileRepo } from "./inMemory";

describe("Property 22: display-name uniqueness (case-insensitive)", () => {
  it("a second profile with the same name (any case) is rejected", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 50 }),
        async (firstId, secondId, displayName) => {
          fc.pre(firstId !== secondId);
          const repo = new InMemoryProfileRepo();
          await repo.create(firstId, displayName);

          // Same name in swapped case must still collide.
          const swapped = swapCase(displayName);
          await expect(repo.create(secondId, swapped)).rejects.toThrow();
          // Original casing collides too.
          await expect(repo.create(secondId, displayName)).rejects.toThrow();
        },
      ),
      { numRuns: 200 },
    );
  });

  it("distinct display names are all accepted", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 20 }), {
          minLength: 1,
          maxLength: 8,
          // de-duplicate case-insensitively so the inputs themselves are distinct
          selector: (s) => s.toLowerCase(),
        }),
        async (names) => {
          const repo = new InMemoryProfileRepo();
          for (let i = 0; i < names.length; i++) {
            await repo.create(`user_${i}`, names[i]);
          }
          expect((await repo.list()).length).toBe(names.length);
        },
      ),
      { numRuns: 100 },
    );
  });
});

function swapCase(s: REDACTED string {
  return s
    .split("")
    .map((c) =>
      c === c.toLowerCase() ? c.toUpperCase() : c.toLowerCase(),
    )
    .join("");
}
