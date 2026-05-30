// score.ts — scoring rules (Requirement 3.8). Pure.
import { type ActivityType, pointsFor } from "./activities";

// Add the activity's points to the current score (Requirement 3.8).
export function applyPoints(currentScore: number, activity: ActivityType): number {
  return currentScore + pointsFor(activity);
}
