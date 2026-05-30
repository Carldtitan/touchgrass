// badges.ts — pure badge-unlock rules (Requirement 6.4–6.7).
export type BadgeName = "First Steps" | "Weekend Warrior" | "On Fire";

export const BADGE_NAMES: readonly BadgeName[] = [
  "First Steps",
  "Weekend Warrior",
  "On Fire",
] as const;

export interface BadgeStats {
  hangoutCount: number; // total logged hangouts for the user
  streak: number; // current streak
}

// The full set of badge names that should be unlocked for these stats.
// Pure and monotonic: unlocking is based only on thresholds reached.
export function unlockedBadges(stats: BadgeStats): Set<BadgeName> {
  const unlocked = new Set<BadgeName>();
  if (stats.hangoutCount >= 1) unlocked.add("First Steps"); // 6.4
  if (stats.hangoutCount >= 5) unlocked.add("Weekend Warrior"); // 6.5, 6.6
  if (stats.streak >= 7) unlocked.add("On Fire"); // 6.7
  return unlocked;
}

// Badges newly earned given previously-unlocked badges
// (for what to persist/animate).
export function newlyUnlocked(
  prev: ReadonlySet<BadgeName>,
  stats: BadgeStats,
): Set<BadgeName> {
  const result = new Set<BadgeName>();
  for (const badge of unlockedBadges(stats)) {
    if (!prev.has(badge)) result.add(badge);
  }
  return result;
}
