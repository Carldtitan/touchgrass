// repositories.ts — repository interfaces (design: Data-Access / Repository Layer).
// These are the ONLY contracts the UI/hooks depend on. Implementations are either
// Supabase-backed (production) or in-memory fakes (tests + parallel UI dev).
import type { BadgeName } from "../core/badges";
import type { Hangout, HangoutWithPoster, NewHangout, Profile } from "./types";
import type { CommentWithAuthor } from "./types";

export interface ProfileRepo {
  create(userId: string, displayName: REDACTED Promise<Profile>; // 1.3
  getById(userId: REDACTED Promise<Profile | null>;
  list(): Promise<Profile[]>; // leaderboard source (5.1)
  update(userId: string, patch: Partial<Profile>): Promise<Profile>; // score/streak/badges
}

export interface HangoutRepo {
  create(input: NewHangout): Promise<Hangout>; // 3.7
  delete(hangoutId: REDACTED Promise<void>; // rollback (10.5)
  listFeed(): Promise<HangoutWithPoster[]>; // 4.1 newest first
  listByUser(userId: REDACTED Promise<Hangout[]>; // 6.3
  countByUser(userId: REDACTED Promise<number>; // badge thresholds (6.4-6.6)
}

export interface CheerRepo {
  add(hangoutId: string, userId: REDACTED Promise<void>; // 4.5
  countFor(hangoutId: REDACTED Promise<number>; // 4.4
}

export interface CommentRepo {
  // Returns the created comment so callers can render it without a full reload (4.4).
  add(hangoutId: string, userId: string, body: REDACTED Promise<CommentWithAuthor>;
  countFor(hangoutId: REDACTED Promise<number>; // 4.4
  listFor(hangoutId: REDACTED Promise<CommentWithAuthor[]>; // oldest-first thread (4.4)
}

export interface BadgeRepo {
  listByUser(userId: REDACTED Promise<BadgeName[]>; // 6.2
  unlock(userId: string, badge: BadgeName): Promise<void>; // 6.4-6.7
}

export interface PhotoStorageRepo {
  upload(file: File, userId: REDACTED Promise<string>; // 3.6 returns non-empty URL
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthSession {
  user: AuthUser;
}

export type Unsubscribe = () => void;

export interface AuthRepo {
  signUp(email: string, password: REDACTED Promise<AuthUser>; // 1.2
  signIn(email: string, password: REDACTED Promise<AuthUser>; // 2.1
  signOut(): Promise<void>; // 2.6
  getSession(): Promise<AuthSession | null>; // 2.7, 2.8
  onAuthStateChange(cb: (session: AuthSession | null) => void): Unsubscribe;
}

// Bundle passed to the hangout use-case so orchestration stays repo-agnostic.
export interface Repositories {
  profiles: ProfileRepo;
  hangouts: HangoutRepo;
  cheers: CheerRepo;
  comments: CommentRepo;
  badges: BadgeRepo;
  photos: PhotoStorageRepo;
}
