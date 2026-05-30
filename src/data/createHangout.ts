// createHangout.ts — the logging use-case (Requirement 3.6–3.11, 10.5).
// Composes upload -> compute (pure core) -> verify image -> persist -> rollback.
// Pure orchestration with no React, so it is testable against the in-memory fakes.
import { pointsFor, type ActivityType } from "../core/activities";
import { newlyUnlocked, type BadgeName } from "../core/badges";
import { applyPoints } from "../core/score";
import { applyLog, type StreakState } from "../core/streak";
import type { Hangout, Profile } from "./types";
import { UploadFailedError, type Repositories } from "./repos";

export interface CreateHangoutInput {
  userId: string;
  activity: ActivityType;
  photoFile: File;
  taggedUserIds: string[];
  evalDate: string; // ISO "YYYY-MM-DD" from the evaluation clock
}

export interface CreateHangoutResult {
  hangout: Hangout;
  profile: Profile;
  newBadges: BadgeName[];
}

// Verifies the uploaded image actually loads (Requirement 10.5). Injected so it
// can be stubbed in tests / non-browser environments.
export type ImageVerifier = (url: string) => Promise<boolean>;

export async function createHangoutWithSideEffects(
  repos: Repositories,
  input: CreateHangoutInput,
  verifyImage?: ImageVerifier,
): Promise<CreateHangoutResult> {
  const { userId, activity, photoFile, taggedUserIds, evalDate } = input;

  const before = await repos.profiles.getById(userId);
  if (!before) throw new Error("No profile for current user");
  const prevBadges = new Set<BadgeName>(await repos.badges.listByUser(userId));
  const prevStreak: StreakState = {
    streak: before.streak,
    lastLogDate: before.lastLogDate,
  };

  // 1. Upload first — no DB state yet, so a failure leaves nothing to undo (3.11).
  let photoUrl: string;
  try {
    photoUrl = await repos.photos.upload(photoFile, userId);
  } catch {
    throw new UploadFailedError();
  }
  if (!photoUrl) throw new UploadFailedError();

  // 2. Create the hangout row.
  const points = pointsFor(activity);
  const hangout = await repos.hangouts.create({
    posterId: userId,
    activityType: activity,
    photoUrl,
    points,
    taggedUserIds,
  });

  // 3. Verify the rendered image source loads BEFORE touching score/streak/badges.
  //    If it fails, the only state to undo is the hangout row itself (10.5).
  if (verifyImage) {
    let ok = false;
    try {
      ok = await verifyImage(photoUrl);
    } catch {
      ok = false;
    }
    if (!ok) {
      await safeDeleteHangout(repos, hangout.id);
      throw new Error("Image failed to load");
    }
  }

  try {
    // 4. Compute derived results with the pure core.
    const nextScore = applyPoints(before.score, activity);
    const nextStreak = applyLog(prevStreak, evalDate);
    const hangoutCount = await repos.hangouts.countByUser(userId);
    const earned = newlyUnlocked(prevBadges, {
      hangoutCount,
      streak: nextStreak.streak,
    });

    // 5. Persist profile + badges.
    const profile = await repos.profiles.update(userId, {
      score: nextScore,
      streak: nextStreak.streak,
      lastLogDate: nextStreak.lastLogDate,
    });
    for (const badge of earned) {
      await repos.badges.unlock(userId, badge);
    }

    return { hangout, profile, newBadges: [...earned] };
  } catch (err) {
    // A persistence failure after the row exists: undo the hangout and restore
    // the pre-write score/streak so totals match the starting state (10.5).
    await safeDeleteHangout(repos, hangout.id);
    try {
      await repos.profiles.update(userId, {
        score: before.score,
        streak: prevStreak.streak,
        lastLogDate: prevStreak.lastLogDate,
      });
    } catch {
      // Best-effort; the original error is more informative.
    }
    throw err;
  }
}

async function safeDeleteHangout(
  repos: Repositories,
  hangoutId: string,
): Promise<void> {
  try {
    await repos.hangouts.delete(hangoutId);
  } catch {
    // Best-effort rollback.
  }
}
