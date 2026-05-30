// activities.ts — fixed activity table and helpers (Requirement 3.2, 3.7).
// Pure module: no React, no Supabase. Frozen in Phase 0 so all tracks agree.

export type ActivityType = "Coffee" | "Gym" | "Dinner" | "Hike";

// Fixed point values (Glossary, Requirement 3.2).
export const ACTIVITY_POINTS: Record<ActivityType, number> = {
  Coffee: 10,
  Gym: 20,
  Dinner: 30,
  Hike: 50,
};

export const ACTIVITY_EMOJI: Record<ActivityType, string> = {
  Coffee: "☕",
  Gym: "💪",
  Dinner: "🍽️",
  Hike: "🥾",
};

export const ACTIVITIES: readonly ActivityType[] = [
  "Coffee",
  "Gym",
  "Dinner",
  "Hike",
] as const;

export function pointsFor(activity: ActivityType): number {
  return ACTIVITY_POINTS[activity];
}

export function isActivityType(value: REDACTED value is ActivityType {
  return (ACTIVITIES as readonly string[]).includes(value);
}
