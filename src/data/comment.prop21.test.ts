// Property 21: Comment count and thread integrity. Validates Requirement 4.4.
// Each added comment increments the count by exactly one (comments are NOT
// deduplicated per user, unlike cheers), and listFor returns every added body
// in insertion order with the author resolved.
import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { InMemoryCommentRepo, InMemoryProfileRepo } from "./inMemory";

describe("Property 21: comment count grows one-per-add and thread preserves order", () => {
  it("count equals the number of comments added (no per-user dedup)", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        fc.array(fc.string({ minLength: 1, maxLength: 40 }), {
          minLength: 1,
          maxLength: 10,
        }),
        async (hangoutId, userId, bodies) => {
          const profiles = new InMemoryProfileRepo();
          await profiles.create(userId, "Commenter");
          const repo = new InMemoryCommentRepo(profiles);

          for (const body of bodies) {
            await repo.add(hangoutId, userId, body);
          }

          // Same user can comment many times — count tracks total comments.
          expect(await repo.countFor(hangoutId)).toBe(bodies.length);
        },
      ),
      { numRuns: 200 },
    );
  });

  it("listFor returns bodies in insertion order with the author display name", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        fc.array(fc.string({ minLength: 1, maxLength: 40 }), {
          minLength: 1,
          maxLength: 8,
        }),
        async (hangoutId, userId, bodies) => {
          const profiles = new InMemoryProfileRepo();
          await profiles.create(userId, "Ada");
          const repo = new InMemoryCommentRepo(profiles);

          for (const body of bodies) {
            await repo.add(hangoutId, userId, body);
          }

          const thread = await repo.listFor(hangoutId);
          expect(thread.map((c) => c.body)).toEqual(bodies);
          expect(thread.every((c) => c.authorDisplayName === "Ada")).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("add returns the created comment with its author resolved", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 40 }),
        async (hangoutId, userId, body) => {
          const profiles = new InMemoryProfileRepo();
          await profiles.create(userId, "Grace");
          const repo = new InMemoryCommentRepo(profiles);

          const created = await repo.add(hangoutId, userId, body);
          expect(created.body).toBe(body);
          expect(created.authorId).toBe(userId);
          expect(created.authorDisplayName).toBe("Grace");
          expect(created.hangoutId).toBe(hangoutId);
        },
      ),
      { numRuns: 100 },
    );
  });
});
