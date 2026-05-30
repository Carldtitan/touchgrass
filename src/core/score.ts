// score.ts — pure scoring (Requirement 3.8).
import { pointsFor, type ActivityType } from "./activities";

// Add the activity's points to the current score.
export function applyPoints(currentScore: number, activity: ActivityType): number {
  return currentScore + pointsFor(activity);
}
