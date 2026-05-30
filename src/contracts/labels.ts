// labels.ts — the exact interactive-control strings from Requirement 10.1.
// Single source of truth shared by UI components and Kane flows so they never drift.
export const LABELS = {
  signUp: "Sign up",
  logIn: "Log in",
  logIt: "Log it",
  cheer: "Cheer",
  skipADay: "Skip a day",
  logOut: "Log out",
} as const;

export type LabelKey = keyof typeof LABELS;
