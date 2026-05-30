// Property 20: Determinism of derived results. Validates Requirement 10.7.
//
// The same sequence of logs against the same starting state always produces the
// same derived score, streak, and badge set.
import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { ACTIVITIES, type ActivityType } from "../core/activities";
import { createHangoutWithSideEffects } from "./createHangout";
import { createInMemoryRepositories } from "./inMemory";

function fakeFile(): File {
  return new File([new Uint8Array([1, 2, 3])], "photo.jpg", { type: "image/jpeg" });
}

// One log step: an activity plus the calendar day on which it is logged.
const step = fc.record({
  activity: fc.constantFrom<ActivityType>(...ACTIVITIES),
  dayOffset: fc.integer({ min: 0, max: 3 }),
});

async function runScenario(
  steps: { activity: ActivityType; dayOffset: number }[],
): Promise<{ score: number; streak: number; badges: string[] }> {
  const repos = createInMemoryRepositories();
  const user = await repos.auth.signUp("u@example.com", "REDACTED");
  await repos.profiles.create(user.id, "Determinism");

  const base = Date.UTC(2024, 5, 1);
  let cursor = 0;
  for (const s of steps) {
    cursor += s.dayOffset;
    const evalDate = new Date(base + cursor * 86_400_000).toISOString().slice(0, 10);
    await createHangoutWithSideEffects(repos, {
      posterId: user.id,
      activity: s.activity,
      photoFile: fakeFile(),
      taggedUserIds: [],
      evalDate,
    });
  }

  const profile = await repos.profiles.getById(user.id);
  const badges = (await repos.badges.listByUser(user.id)).sort();
  return { score: profile?.score ?? 0, streak: profile?.streak ?? 0, badges };
}

describe("Property 20: determinism of derived results", () => {
  it("the same scenario produces the same score, streak, and badges", async () => {
    await fc.assert(
      fc.asyncProperty(fc.array(step, { minLength: 1, maxLength: 12 }), async (steps) => {
        const a = await runScenario(steps);
        const b = await runScenario(steps);
        expect(a).toEqual(b);
      }),
      { numRuns: 50 },
    );
  });
});
