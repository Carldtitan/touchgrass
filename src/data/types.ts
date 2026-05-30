// types.ts — shared domain types (design: TypeScript Domain Types).
import type { ActivityType } from "../core/activities";

export type { ActivityType };

export interface Profile {
  id: string;
  displayName: string;
  score: number;
  streak: number;
  lastLogDate: string | null; // "YYYY-MM-DD"
  createdAt: string;
}

export interface Hangout {
  id: string;
  posterId: string;
  activityType: ActivityType;
  photoUrl: string;
  points: number;
  taggedUserIds: string[];
  createdAt: string;
}

export interface HangoutWithPoster extends Hangout {
  posterDisplayName: string;
  cheerCount: number;
  commentCount: number;
}

export interface NewHangout {
  posterId: string;
  activityType: ActivityType;
  photoUrl: string;
  points: number;
  taggedUserIds: string[];
}
