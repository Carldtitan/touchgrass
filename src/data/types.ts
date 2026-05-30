// types.ts — shared domain types (Phase 0). Frozen so all tracks agree.
import type { ActivityType } from "../core/activities";

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
