// testids.ts — the data-testid attributes from Requirement 10.3.
// Single source of truth: Kane flows and components both import from here.
export const TESTIDS = {
  streakCounter: "streak-counter",
  scoreDisplay: "score-display",
  feedPost: "feed-post",
  feedPostImage: "feed-post-image",
  commentList: "comment-list",
  commentItem: "comment-item",
  commentInput: "comment-input",
  commentCount: "comment-count",
  leaderboardRow: (displayName: string) => `leaderboard-row-${displayName}`,
  badge: (name: string) => `badge-${name}`,
  configError: "config-error",
} as const;
