// Feature: touchgrass, Property 8, 17, 19, 20 + cheer counting.
// Validates Requirements 3.7, 3.8, 3.9, 3.11, 4.5, 10.5, 10.7 against in-memory fakes.
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { createFakeRepositories } from "./fakes";
import { createHangoutWithSideEffects } from "./createHangout";
import { ACTIVITIES, pointsFor, type ActivityType } from "../core/activities";
import { UploadFailedError } from "./repos";

function fakeFile(name = "photo.jpg"): File {
  return new File(["x"], name, { type: "image/jpeg" });
}

async function seedUser(displayName = "Tester") {
  const repos = createFakeRepositories();
  const user = await repos.auth.signUp(`${displayName}@example.com`, "REDACTED");
  await repos.profiles.create(user.id, displayName);
  return { repos, userId: user.id };
}

describe("Property 8: hangout record construction (3.7)", () => {
  it("preserves poster, activity, photo URL, tags and sets points", async () => {
    await fc.assert(
      fc.asyncProperty(fc.constantFrom(...ACTIVITIES), async (activity: ActivityType) => {
        const { repos, userId } = await seedUser();
        const { hangout } = await createHangoutWithSideEffects(repos, {
          userId,
          activity,
          photoFile: fakeFile(),
          taggedUserIds: [],
          evalDate: "2026-01-10",
        });
        expect(hangout.posterId).toBe(userId);
        expect(hangout.activityType).toBe(activity);
        expect(hangout.photoUrl.length).toBeGreaterThan(0);
        expect(hangout.points).toBe(pointsFor(activity));
      }),
      { numRuns: 20 },
    );
  });
});

describe("Score + streak side effects (3.8, 3.9)", () => {
  it("adds points and sets streak to 1 on first log", async () => {
    const { repos, userId } = await seedUser();
    const { profile } = await createHangoutWithSideEffects(repos, {
      userId,
      activity: "Gym",
      photoFile: fakeFile(),
      taggedUserIds: [],
      evalDate: "2026-01-10",
    });
    expect(profile.score).toBe(20);
    expect(profile.streak).toBe(1);
    expect(profile.lastLogDate).toBe("2026-01-10");
  });
});

describe("Property 19: safe rollback on failure (3.11, 10.5)", () => {
  it("upload failure leaves score, streak, and hangout count unchanged", async () => {
    const { repos, userId } = await seedUser();
    // Force upload to fail.
    repos.photos.upload = async () => {
      throw new Error("network");
    };
    await expect(
      createHangoutWithSideEffects(repos, {
        userId,
        activity: "Hike",
        photoFile: fakeFile(),
        taggedUserIds: [],
        evalDate: "2026-01-10",
      }),
    ).rejects.toBeInstanceOf(UploadFailedError);

    const profile = await repos.profiles.getById(userId);
    expect(profile?.score).toBe(0);
    expect(profile?.streak).toBe(0);
    expect(await repos.hangouts.countByUser(userId)).toBe(0);
  });

  it("image-load failure rolls back the hangout and score/streak", async () => {
    const { repos, userId } = await seedUser();
    await expect(
      createHangoutWithSideEffects(
        repos,
        {
          userId,
          activity: "Dinner",
          photoFile: fakeFile(),
          taggedUserIds: [],
          evalDate: "2026-01-10",
        },
        async () => false, // image fails to load
      ),
    ).rejects.toThrow();

    const profile = await repos.profiles.getById(userId);
    expect(profile?.score).toBe(0);
    expect(profile?.streak).toBe(0);
    expect(await repos.hangouts.countByUser(userId)).toBe(0);
  });
});

describe("Property 17: cheer count increments once per user (4.5)", () => {
  it("a second cheer by the same user does not increase the count", async () => {
    const { repos, userId } = await seedUser();
    const { hangout } = await createHangoutWithSideEffects(repos, {
      userId,
      activity: "Coffee",
      photoFile: fakeFile(),
      taggedUserIds: [],
      evalDate: "2026-01-10",
    });
    await repos.cheers.add(hangout.id, userId);
    await repos.cheers.add(hangout.id, userId);
    expect(await repos.cheers.countFor(hangout.id)).toBe(1);
  });
});

describe("Property 20: determinism of derived results (10.7)", () => {
  it("identical sequences yield identical score and streak", async () => {
    async function run() {
      const { repos, userId } = await seedUser();
      await createHangoutWithSideEffects(repos, {
        userId,
        activity: "Gym",
        photoFile: fakeFile(),
        taggedUserIds: [],
        evalDate: "2026-01-10",
      });
      await createHangoutWithSideEffects(repos, {
        userId,
        activity: "Hike",
        photoFile: fakeFile(),
        taggedUserIds: [],
        evalDate: "2026-01-11",
      });
      const p = await repos.profiles.getById(userId);
      return { score: p?.score, streak: p?.streak };
    }
    expect(await run()).toEqual(await run());
    expect(await run()).toEqual({ score: 70, streak: 2 });
  });
});
