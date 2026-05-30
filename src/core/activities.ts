// activities.ts — the fixed activity table (Glossary, Requirements 3.2, 3.7).
// Pure module: no imports from React or Supabase.

export type ActivityType = "Coffee" | "Gym" | "Dinner" | "Hike";

// Fixed point values (Requirement 3.2).
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

// Points awarded for a given activity (Requirement 3.2).
export function pointsFor(activity: ActivityType): number {
  return ACTIVITY_POINTS[activity];
}

// Type guard: is the given string one of the four fixed activities?
export function isActivityType(value: REDACTED value is ActivityType {
  return (ACTIVITIES as readonly string[]).includes(value);
}
