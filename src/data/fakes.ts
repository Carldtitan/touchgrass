// fakes.ts — in-memory fake repositories (Phase 0).
// Used by property/unit tests and for parallel UI development so nothing blocks
// on a live Supabase project. NOT used in production — see no-mock-data steering:
// these create no persistent seed data and exist only for the test harness.
import type { BadgeName } from "../core/badges";
import type { Hangout, HangoutWithPoster, NewHangout, Profile } from "./types";
import {
  DuplicateEmailError,
  InvalidCredentialsError,
  type AuthRepo,
  type AuthSession,
  type AuthUser,
  type BadgeRepo,
  type CheerRepo,
  type CommentRepo,
  type HangoutRepo,
  type PhotoStorageRepo,
  type ProfileRepo,
  type Repositories,
  type Unsubscribe,
} from "./repos";

let counter = 0;
const uid = (prefix: string) => `${prefix}_${(++counter).toString(36)}_${Date.now()}`;

export class FakeAuthRepo implements AuthRepo {
  private users = new Map<string, { id: string; email: string; password: string }>();
  private session: AuthSession | null = null;
  private listeners = new Set<(s: AuthSession | null) => void>();

  private emit() {
    for (const cb of this.listeners) cb(this.session);
  }

  async signUp(email: string, password: REDACTED Promise<AuthUser> {
    const key = email.toLowerCase();
    if (this.users.has(key)) throw new DuplicateEmailError();
    const user = { id: uid("user"), email, password };
    this.users.set(key, user);
    this.session = { user: { id: user.id, email: user.email } };
    this.emit();
    return { id: user.id, email: user.email };
  }

  async signIn(email: string, password: REDACTED Promise<AuthUser> {
    const user = this.users.get(email.toLowerCase());
    if (!user || user.password !== password) throw new InvalidCredentialsError();
    this.session = { user: { id: user.id, email: user.email } };
    this.emit();
    return { id: user.id, email: user.email };
  }

  async signOut(): Promise<void> {
    this.session = null;
    this.emit();
  }

  async getSession(): Promise<AuthSession | null> {
    return this.session;
  }

  onAuthStateChange(cb: (s: AuthSession | null) => void): Unsubscribe {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
}

export class FakeProfileRepo implements ProfileRepo {
  private profiles = new Map<string, Profile>();

  async create(userId: string, displayName: REDACTED Promise<Profile> {
    const profile: Profile = {
      id: userId,
      displayName,
      score: 0,
      streak: 0,
      lastLogDate: null,
      createdAt: new Date().toISOString(),
    };
    this.profiles.set(userId, profile);
    return profile;
  }

  async getById(userId: REDACTED Promise<Profile | null> {
    return this.profiles.get(userId) ?? null;
  }

  async list(): Promise<Profile[]> {
    return [...this.profiles.values()];
  }

  async update(userId: string, patch: Partial<Profile>): Promise<Profile> {
    const existing = this.profiles.get(userId);
    if (!existing) throw new Error(`No profile ${userId}`);
    const updated = { ...existing, ...patch, id: existing.id };
    this.profiles.set(userId, updated);
    return updated;
  }
}

export class FakeHangoutRepo implements HangoutRepo {
  private hangouts: Hangout[] = [];
  constructor(private profiles: FakeProfileRepo) {}

  async create(input: NewHangout): Promise<Hangout> {
    const hangout: Hangout = {
      id: uid("hangout"),
      posterId: input.posterId,
      activityType: input.activityType,
      photoUrl: input.photoUrl,
      points: input.points,
      taggedUserIds: input.taggedUserIds,
      createdAt: new Date().toISOString(),
    };
    this.hangouts.push(hangout);
    return hangout;
  }

  async delete(hangoutId: REDACTED Promise<void> {
    this.hangouts = this.hangouts.filter((h) => h.id !== hangoutId);
  }

  async listFeed(): Promise<HangoutWithPoster[]> {
    const profiles = await this.profiles.list();
    const nameOf = new Map(profiles.map((p) => [p.id, p.displayName]));
    return [...this.hangouts]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((h) => ({
        ...h,
        posterDisplayName: nameOf.get(h.posterId) ?? "Unknown",
        cheerCount: 0,
        commentCount: 0,
      }));
  }

  async listByUser(userId: REDACTED Promise<Hangout[]> {
    return this.hangouts
      .filter((h) => h.posterId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async countByUser(userId: REDACTED Promise<number> {
    return this.hangouts.filter((h) => h.posterId === userId).length;
  }
}

export class FakeCheerRepo implements CheerRepo {
  private cheers = new Set<string>(); // `${hangoutId}:${userId}`
  private counts = new Map<string, number>();

  async add(hangoutId: string, userId: REDACTED Promise<void> {
    const key = `${hangoutId}:${userId}`;
    if (this.cheers.has(key)) return; // one cheer per user per hangout
    this.cheers.add(key);
    this.counts.set(hangoutId, (this.counts.get(hangoutId) ?? 0) + 1);
  }

  async countFor(hangoutId: REDACTED Promise<number> {
    return this.counts.get(hangoutId) ?? 0;
  }

  async hasCheered(hangoutId: string, userId: REDACTED Promise<boolean> {
    return this.cheers.has(`${hangoutId}:${userId}`);
  }
}

export class FakeCommentRepo implements CommentRepo {
  private counts = new Map<string, number>();

  async add(hangoutId: REDACTED Promise<void> {
    this.counts.set(hangoutId, (this.counts.get(hangoutId) ?? 0) + 1);
  }

  async countFor(hangoutId: REDACTED Promise<number> {
    return this.counts.get(hangoutId) ?? 0;
  }
}

export class FakeBadgeRepo implements BadgeRepo {
  private badges = new Map<string, Set<BadgeName>>();

  async listByUser(userId: REDACTED Promise<BadgeName[]> {
    return [...(this.badges.get(userId) ?? new Set<BadgeName>())];
  }

  async unlock(userId: string, badge: BadgeName): Promise<void> {
    const set = this.badges.get(userId) ?? new Set<BadgeName>();
    set.add(badge);
    this.badges.set(userId, set);
  }
}

export class FakePhotoStorageRepo implements PhotoStorageRepo {
  async upload(file: File, userId: REDACTED Promise<string> {
    return `https://fake.storage/${userId}/${encodeURIComponent(file.name)}`;
  }
}

// Build a complete in-memory repository set wired together.
export function createFakeRepositories(): Repositories {
  const profiles = new FakeProfileRepo();
  return {
    auth: new FakeAuthRepo(),
    profiles,
    hangouts: new FakeHangoutRepo(profiles),
    cheers: new FakeCheerRepo(),
    comments: new FakeCommentRepo(),
    badges: new FakeBadgeRepo(),
    photos: new FakePhotoStorageRepo(),
  };
}
