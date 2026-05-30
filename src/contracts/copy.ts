// copy.ts — fixed on-screen strings asserted by Kane (Requirements 4.7, 4.8).
// Single source of truth: Kane flows and components both import from here.
export const COPY = {
  noGrassToday: "You haven't touched grass today.",
  emptyFeed: "No grass touched yet — be the first",
  configErrorTitle: "Configuration error",
  noComments: "No comments yet — say something nice",
  commentPlaceholder: "Add a comment…",
  notePlaceholder: "What did you get up to?",
} as const;
