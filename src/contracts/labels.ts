// labels.ts — the exact interactive-control strings from Requirement 10.1.
// Single source of truth: Kane flows and components both import from here.
export const LABELS = {
  signUp: "Sign up",
  logIn: "Log in",
  logIt: "Log it",
  cheer: "Cheer",
  comment: "Comment",
  postComment: "Post",
  skipADay: "Skip a day",
  logOut: "Log out",
} as const;

export type LabelKey = keyof typeof LABELS;
