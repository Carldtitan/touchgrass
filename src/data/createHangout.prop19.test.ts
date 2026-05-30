// Property 19: Safe rollback on failure. Validates Requirements 3.11, 10.5.
import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { ACTIVITIES, type ActivityType } from "../core/activities";
import { createHangoutWithSideEffects } from "./createHangout";
import { createInMemoryRepositories, InMemoryPhotoStorageRepo } from "./inMemory";

function fakeFile(): File {
  return new File([new Uint8Array([1, 2, 3])], "photo.jpg", { type: "image/jpeg" });
}

describe("Property 19: safe rollback on failure", () => {
  it("upload failure writes nothing: no hangout, score/streak unchanged", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.constantFrom<ActivityType>(...ACTIVITIES),
        async (displayName, activity) => {
          const repos = createInMemoryRepositories();
          const user = await repos.auth.signUp("u@example.com", "REDACTED");
          await repos.profiles.create(user.id, displayName);

          (repos.photos as InMemoryPhotoStorageRepo).failNext = true;

          const result = await createHangoutWithSideEffects(repos, {
            posterId: user.id,
            activity,
            photoFile: fakeFile(),
            taggedUserIds: [],
            evalDate: "2024-06-01",
          });

          expect(result.ok).toBe(false);
          if (!result.ok) expect(result.reason).toBe("upload-failed");

          const profile = await repos.profiles.getById(user.id);
          expect(profile?.score).toBe(0);
          expect(profile?.streak).toBe(0);
          expect(profile?.lastLogDate).toBeNull();
          expect(await repos.hangouts.countByUser(user.id)).toBe(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("persist failure rolls back to pre-state score/streak and removes the hangout", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<ActivityType>(...ACTIVITIES),
        async (activity) => {
          const repos = createInMemoryRepositories();
          const user = await repos.auth.signUp("u@example.com", "REDACTED");
          await repos.profiles.create(user.id, "Roller");

          // Log once successfully to build up state.
          const first = await createHangoutWithSideEffects(repos, {
            posterId: user.id,
            activity,
            photoFile: fakeFile(),
            taggedUserIds: [],
            evalDate: "2024-06-01",
          });
          expect(first.ok).toBe(true);

          const mid = await repos.profiles.getById(user.id);
          const midScore = mid?.score ?? 0;
          const midStreak = mid?.streak ?? 0;
          const midCount = await repos.hangouts.countByUser(user.id);

          // Force the profile update to throw on the next log.
          const original = repos.profiles.update.bind(repos.profiles);
          let calls = 0;
          repos.profiles.update = async (id, patch) => {
            calls++;
            if (calls === 1) throw new Error("Simulated persist failure");
            return original(id, patch);
          };

          const second = await createHangoutWithSideEffects(repos, {
            posterId: user.id,
            activity,
            photoFile: fakeFile(),
            taggedUserIds: [],
            evalDate: "2024-06-02",
          });

          expect(second.ok).toBe(false);

          // State restored: score/streak back to the mid values, count unchanged.
          const after = await repos.profiles.getById(user.id);
          expect(after?.score).toBe(midScore);
          expect(after?.streak).toBe(midStreak);
          expect(await repos.hangouts.countByUser(user.id)).toBe(midCount);
        },
      ),
      { numRuns: 50 },
    );
  });
});
