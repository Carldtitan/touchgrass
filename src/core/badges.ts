// badges.ts — badge unlock rules (Requirement 6). Pure and monotonic.
//
// Thresholds: First Steps at hangoutCount >= 1 (6.4); Weekend Warrior at
// hangoutCount >= 5 (6.5, 6.6); On Fire at streak >= 7 (6.7).

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

// The full set of badges that should be unlocked for these stats.
export function unlockedBadges(stats: BadgeStats): Set<BadgeName> {
  const unlocked = new Set<BadgeName>();
  if (stats.hangoutCount >= 1) unlocked.add("First Steps");
  if (stats.hangoutCount >= 5) unlocked.add("Weekend Warrior");
  if (stats.streak >= 7) unlocked.add("On Fire");
  return unlocked;
}

// Badges newly earned vs. a previously-unlocked set (for persist/animate decisions).
export function newlyUnlocked(
  prev: ReadonlySet<BadgeName>,
  stats: BadgeStats,
): Set<BadgeName> {
  const now = unlockedBadges(stats);
  const fresh = new Set<BadgeName>();
  for (const badge of now) {
    if (!prev.has(badge)) fresh.add(badge);
  }
  return fresh;
}
