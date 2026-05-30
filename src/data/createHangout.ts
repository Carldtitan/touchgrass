// createHangout.ts — the hangout logging use-case (Requirements 3.6–3.11, 10.5).
//
// Composes: upload photo -> compute (score + streak + badges via the pure core)
// -> persist (hangout, profile, badges) -> optional rollback. Repo-agnostic, so it
// runs against either the in-memory fakes or the Supabase-backed repositories.
import { newlyUnlocked, unlockedBadges, type BadgeName } from "../core/badges";
import { pointsFor } from "../core/activities";
import { applyPoints } from "../core/score";
import { applyLog, type StreakState } from "../core/streak";
import type { ActivityType, Hangout, HangoutWithPoster, Profile } from "./types";
import type { Repositories } from "./repositories";

export interface LogHangoutInput {
  posterId: string;
  activity: ActivityType;
  photoFile: File;
  taggedUserIds: string[];
  // Optional caption. When non-empty, it is persisted as the poster's first
  // comment on the new hangout so it renders as the post caption (Req 4.4).
  note?: string;
  // The streak-evaluation date "YYYY-MM-DD" from the caller's clock (Requirement 8).
  // Defaults to real "today" (UTC) when omitted so production callers stay simple.
  evalDate?: string;
}

export type LogHangoutResult =
  | {
      ok: true;
      hangout: Hangout;
      profile: Profile;
      newBadges: BadgeName[];
    }
  | {
      ok: false;
      reason: "upload-failed" | "persist-failed";
      message: string;
    };

// Reason 3.11/10.5: a failure after writes must leave no partial state behind.
export async function createHangoutWithSideEffects(
  repos: Repositories,
  input: LogHangoutInput,
): Promise<LogHangoutResult> {
  const { posterId, activity, photoFile, taggedUserIds } = input;

  const before = await repos.profiles.getById(posterId);
  if (!before) {
    return { ok: false, reason: "persist-failed", message: "Profile not found" };
  }

  // 1) Upload the photo. On failure: no DB writes, dialog stays open (3.11).
  let photoUrl: string;
  try {
    photoUrl = await repos.photos.upload(photoFile, posterId);
    if (!photoUrl) throw new Error("Storage returned an empty URL");
  } catch (err) {
    return {
      ok: false,
      reason: "upload-failed",
      message: err instanceof Error ? err.message : "Upload failed",
    };
  }

  // 2) Compute the next state with the pure core (deterministic).
  const evalDate = input.evalDate ?? new Date().toISOString().slice(0, 10);
  const points = pointsFor(activity);
  const nextScore = applyPoints(before.score, activity);

  const streakBefore: StreakState = {
    streak: before.streak,
    lastLogDate: before.lastLogDate,
  };
  const streakAfter = applyLog(streakBefore, evalDate);

  const priorBadges = new Set<BadgeName>(await repos.badges.listByUser(posterId));

  // Snapshot for rollback (10.5).
  const snapshot = {
    score: before.score,
    streak: before.streak,
    lastLogDate: before.lastLogDate,
  };

  let createdHangout: Hangout | null = null;
  const unlockedThisLog: BadgeName[] = [];

  try {
    // 3) Persist the hangout (3.7).
    createdHangout = await repos.hangouts.create({
      posterId,
      activityType: activity,
      photoUrl,
      points,
      taggedUserIds,
    });

    // 3b) Persist the optional note as the poster's first comment (caption, 4.4).
    // Best-effort: a caption failure must not roll back a logged hangout.
    const note = input.note?.trim();
    if (note) {
      try {
        await repos.comments.add(createdHangout.id, posterId, note);
      } catch {
        // swallow — the hangout itself succeeded; caption is non-critical
      }
    }

    // 4) Persist the updated score + streak (3.8, 3.9).
    const persistedProfile = await repos.profiles.update(posterId, {
      score: nextScore,
      streak: streakAfter.streak,
      lastLogDate: streakAfter.lastLogDate,
    });

    // 5) Persist any newly-unlocked badges (6.4–6.7).
    const hangoutCount = await repos.hangouts.countByUser(posterId);
    const fresh = newlyUnlocked(priorBadges, {
      hangoutCount,
      streak: streakAfter.streak,
    });
    for (const badge of fresh) {
      await repos.badges.unlock(posterId, badge);
      unlockedThisLog.push(badge);
    }

    return {
      ok: true,
      hangout: createdHangout,
      profile: persistedProfile,
      newBadges: unlockedThisLog,
    };
  } catch (err) {
    // Rollback (10.5): delete the hangout and restore pre-state score/streak.
    await rollback(repos, posterId, createdHangout, snapshot);
    return {
      ok: false,
      reason: "persist-failed",
      message: err instanceof Error ? err.message : "Persist failed",
    };
  }
}

async function rollback(
  repos: Repositories,
  posterId: string,
  createdHangout: Hangout | null,
  snapshot: { score: number; streak: number; lastLogDate: string | null },
): Promise<void> {
  if (createdHangout) {
    try {
      await repos.hangouts.delete(createdHangout.id);
    } catch {
      // best-effort; swallow so the original error surfaces
    }
  }
  try {
    await repos.profiles.update(posterId, {
      score: snapshot.score,
      streak: snapshot.streak,
      lastLogDate: snapshot.lastLogDate,
    });
  } catch {
    // best-effort
  }
  // Note: badge unlocks are monotonic and idempotent; we recompute on next read,
  // so we deliberately do not "re-lock" badges here.
}

// The evaluation date is supplied by the caller's clock (Requirement 8) via
// LogHangoutInput.evalDate; see the input type above.

// Helper to expose the badge computation for callers that want it without a write.
export function badgesForStats(hangoutCount: number, streak: number): Set<BadgeName> {
  return unlockedBadges({ hangoutCount, streak });
}

// Re-export the composed feed type for convenience.
export type { HangoutWithPoster };
