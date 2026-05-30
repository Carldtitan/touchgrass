// leaderboard.ts — total ordering of users (Requirements 5.1, 5.2, 5.3, 5.6). Pure.
//
// Sort by score desc, then streak desc, then displayName asc (case-insensitive,
// locale-aware), with userId as a final stable tiebreak for total determinism so
// the order is identical regardless of whether the Leaderboard tab is displayed.

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  score: number;
  streak: number;
}

export function rankUsers<T extends LeaderboardEntry>(entries: readonly T[]): T[] {
  return [...entries].sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score; // 5.1 score desc
    if (a.streak !== b.streak) return b.streak - a.streak; // 5.2 streak desc

    // 5.3 display name ascending, case-insensitive and locale-aware.
    const byName = a.displayName.localeCompare(b.displayName, undefined, {
      sensitivity: "base",
    });
    if (byName !== 0) return byName;

    // Final deterministic tiebreak so the ordering is total (no ambiguity).
    return a.userId.localeCompare(b.userId);
  });
}
