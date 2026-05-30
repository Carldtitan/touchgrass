// Property 8: Hangout record construction. Validates Requirement 3.7.
import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { ACTIVITIES, pointsFor, type ActivityType } from "../core/activities";
import { InMemoryHangoutRepo, InMemoryProfileRepo } from "./inMemory";

describe("Property 8: hangout record construction", () => {
  it("preserves poster, activity, photo URL, tags; points = pointsFor(activity)", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.constantFrom<ActivityType>(...ACTIVITIES),
        fc.webUrl(),
        fc.array(fc.uuid(), { maxLength: 5 }),
        async (posterId, activity, photoUrl, taggedUserIds) => {
          const profiles = new InMemoryProfileRepo();
          const repo = new InMemoryHangoutRepo(profiles);

          const created = await repo.create({
            posterId,
            activityType: activity,
            photoUrl,
            points: pointsFor(activity),
            taggedUserIds,
          });

          expect(created.posterId).toBe(posterId);
          expect(created.activityType).toBe(activity);
          expect(created.photoUrl).toBe(photoUrl);
          expect(created.taggedUserIds).toEqual(taggedUserIds);
          expect(created.points).toBe(pointsFor(activity));
        },
      ),
      { numRuns: 200 },
    );
  });
});
