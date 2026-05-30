// testids.ts — the data-testid attributes from Requirement 10.3.
// Centralized so Kane flows and components reference identical identifiers.
export const TESTIDS = {
  streakCounter: "streak-counter",
  scoreDisplay: "score-display",
  feedPost: "feed-post",
  feedPostImage: "feed-post-image",
  leaderboardRow: (displayName: string) => `leaderboard-row-${displayName}`,
  badge: (name: string) => `badge-${name}`,
} as const;
