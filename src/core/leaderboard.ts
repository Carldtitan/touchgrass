// leaderboard.ts — pure total ordering (Requirements 5.1, 5.2, 5.3, 5.6).
export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  score: number;
  streak: number;
}

// Sort by score desc, then streak desc, then displayName asc (case-insensitive),
// with userId as a final stable tiebreak for total determinism.
export function rankUsers<T extends LeaderboardEntry>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    if (a.streak !== b.streak) return b.streak - a.streak;
    const nameCmp = a.displayName.localeCompare(b.displayName, undefined, {
      sensitivity: "base",
    });
    if (nameCmp !== 0) return nameCmp;
    return a.userId < b.userId ? -1 : a.userId > b.userId ? 1 : 0;
  });
}
