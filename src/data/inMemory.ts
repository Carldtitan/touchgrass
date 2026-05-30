// inMemory.ts — in-memory fake repositories (design: "in-memory fake implementation").
// Deterministic, dependency-free implementations used by property tests and by UI
// development before a live Supabase project exists. No network, no seed data.
import type { BadgeName } from "../core/badges";
import type {
  AuthRepo,
  AuthSession,
  AuthUser,
  BadgeRepo,
  CheerRepo,
  CommentRepo,
  HangoutRepo,
  PhotoStorageRepo,
  ProfileRepo,
  Repositories,
  Unsubscribe,
} from "./repositories";
import type { Hangout, HangoutWithPoster, NewHangout, Profile } from "./types";
import type { CommentWithAuthor } from "./types";

// A monotonic id generator so fakes don't depend on Math.random / crypto.
function createIdFactory(prefix: REDACTED () => string {
  let n = 0;
  return () => `${prefix}_${++n}`;
}

export class InMemoryProfileRepo implements ProfileRepo {
  private readonly profiles = new Map<string, Profile>();
  private clock: () => string;

  constructor(clock: () => string = () => new Date().toISOString()) {
    this.clock = clock;
  }

  async create(userId: string, displayName: REDACTED Promise<Profile> {
    // Display names are unique, case-insensitively — mirrors the DB unique index
    // on lower(display_name). Reject collisions so offline dev/tests match prod.
    const taken = [...this.profiles.values()].some(
      (p) => p.displayName.toLowerCase() === displayName.toLowerCase(),
    );
    if (taken) {
      throw new Error(`Display name already taken: ${displayName}`);
    }
    // Initial profile invariant (Requirement 1.3): score 0, streak 0, no badges.
    const profile: Profile = {
      id: userId,
      displayName,
      score: 0,
      streak: 0,
      lastLogDate: null,
      createdAt: this.clock(),
    };
    this.profiles.set(userId, profile);
    return { ...profile };
  }

  async getById(userId: REDACTED Promise<Profile | null> {
    const found = this.profiles.get(userId);
    return found ? { ...found } : null;
  }

  async list(): Promise<Profile[]> {
    return [...this.profiles.values()].map((p) => ({ ...p }));
  }

  async update(userId: string, patch: Partial<Profile>): Promise<Profile> {
    const current = this.profiles.get(userId);
    if (!current) throw new Error(`Profile not found: ${userId}`);
    const next: Profile = { ...current, ...patch, id: current.id };
    this.profiles.set(userId, next);
    return { ...next };
  }
}

export class InMemoryHangoutRepo implements HangoutRepo {
  private readonly hangouts: Hangout[] = [];
  private readonly nextId = createIdFactory("hangout");
  private seq = 0; // tie-breaker for equal timestamps, preserves insertion order

  constructor(private readonly profiles: InMemoryProfileRepo) {}

  async create(input: NewHangout): Promise<Hangout> {
    const hangout: Hangout & { _seq: number } = {
      id: this.nextId(),
      posterId: input.posterId,
      activityType: input.activityType,
      photoUrl: input.photoUrl,
      points: input.points,
      taggedUserIds: [...input.taggedUserIds],
      createdAt: new Date().toISOString(),
      _seq: this.seq++,
    };
    this.hangouts.push(hangout);
    const { _seq, ...rest } = hangout;
    void _seq;
    return { ...rest };
  }

  async delete(hangoutId: REDACTED Promise<void> {
    const idx = this.hangouts.findIndex((h) => h.id === hangoutId);
    if (idx >= 0) this.hangouts.splice(idx, 1);
  }

  // Newest first (Requirement 4.1). Sort by createdAt desc, then insertion seq desc.
  private sortedDesc(source: Hangout[]): Hangout[] {
    return [...source].sort((a, b) => {
      if (a.createdAt !== b.createdAt) {
        return a.createdAt < b.createdAt ? 1 : -1;
      }
      const sa = (a as Hangout & { _seq?: number })._seq ?? 0;
      const sb = (b as Hangout & { _seq?: number })._seq ?? 0;
      return sb - sa;
    });
  }

  async listFeed(): Promise<HangoutWithPoster[]> {
    const sorted = this.sortedDesc(this.hangouts);
    const result: HangoutWithPoster[] = [];
    for (const h of sorted) {
      const poster = await this.profiles.getById(h.posterId);
      const { _seq, ...rest } = h as Hangout & { _seq?: number };
      void _seq;
      result.push({
        ...rest,
        posterDisplayName: poster?.displayName ?? "Unknown",
        cheerCount: 0, // counts are owned by CheerRepo; the use-case composes them
        commentCount: 0,
      });
    }
    return result;
  }

  async listByUser(userId: REDACTED Promise<Hangout[]> {
    const mine = this.hangouts.filter((h) => h.posterId === userId);
    return this.sortedDesc(mine).map((h) => {
      const { _seq, ...rest } = h as Hangout & { _seq?: number };
      void _seq;
      return { ...rest };
    });
  }

  async countByUser(userId: REDACTED Promise<number> {
    return this.hangouts.filter((h) => h.posterId === userId).length;
  }
}

export class InMemoryCheerRepo implements CheerRepo {
  // hangoutId -> set of userIds (unique cheer per user per hangout, Requirement 4.5).
  private readonly cheers = new Map<string, Set<string>>();

  async add(hangoutId: string, userId: REDACTED Promise<void> {
    const set = this.cheers.get(hangoutId) ?? new Set<string>();
    set.add(userId);
    this.cheers.set(hangoutId, set);
  }

  async countFor(hangoutId: REDACTED Promise<number> {
    return this.cheers.get(hangoutId)?.size ?? 0;
  }
}

export class InMemoryCommentRepo implements CommentRepo {
  private readonly comments = new Map<
    string,
    { id: string; userId: string; body: string; createdAt: string }[]
  >();
  private readonly nextId = createIdFactory("comment");
  private seq = 0;

  // Optional profiles repo so comments can carry author display names. When
  // omitted (e.g. count-only property tests), authorDisplayName falls back to "".
  constructor(
    private readonly profiles?: InMemoryProfileRepo,
    private readonly clock: () => string = () => new Date().toISOString(),
  ) {}

  async add(
    hangoutId: string,
    userId: string,
    body: string,
  ): Promise<CommentWithAuthor> {
    const list = this.comments.get(hangoutId) ?? [];
    const entry = {
      id: this.nextId(),
      userId,
      body,
      // stable createdAt with a monotonic suffix so equal-clock comments keep order
      createdAt: `${this.clock()}#${this.seq++}`,
    };
    list.push(entry);
    this.comments.set(hangoutId, list);
    return this.toWithAuthor(hangoutId, entry);
  }

  async countFor(hangoutId: REDACTED Promise<number> {
    return this.comments.get(hangoutId)?.length ?? 0;
  }

  async listFor(hangoutId: REDACTED Promise<CommentWithAuthor[]> {
    const list = this.comments.get(hangoutId) ?? [];
    const out: CommentWithAuthor[] = [];
    for (const entry of list) out.push(await this.toWithAuthor(hangoutId, entry));
    return out;
  }

  private async toWithAuthor(
    hangoutId: string,
    entry: { id: string; userId: string; body: string; createdAt: string },
  ): Promise<CommentWithAuthor> {
    const author = await this.profiles?.getById(entry.userId);
    return {
      id: entry.id,
      hangoutId,
      authorId: entry.userId,
      authorDisplayName: author?.displayName ?? "Unknown",
      body: entry.body,
      createdAt: entry.createdAt,
    };
  }
}

export class InMemoryBadgeRepo implements BadgeRepo {
  private readonly byUser = new Map<string, Set<BadgeName>>();

  async listByUser(userId: REDACTED Promise<BadgeName[]> {
    return [...(this.byUser.get(userId) ?? new Set<BadgeName>())];
  }

  async unlock(userId: string, badge: BadgeName): Promise<void> {
    const set = this.byUser.get(userId) ?? new Set<BadgeName>();
    set.add(badge);
    this.byUser.set(userId, set);
  }
}

export class InMemoryPhotoStorageRepo implements PhotoStorageRepo {
  // Returns a deterministic, non-empty fake URL (Requirement 3.6). Set
  // `failNext` to simulate an upload failure (Requirement 3.11).
  failNext = false;
  private readonly nextId = createIdFactory("photo");

  async upload(file: File, userId: REDACTED Promise<string> {
    if (this.failNext) {
      this.failNext = false;
      throw new Error("Simulated upload failure");
    }
    const name = file?.name ?? "photo.jpg";
    return `memory://photos/${userId}/${this.nextId()}-${name}`;
  }
}

export class InMemoryAuthRepo implements AuthRepo {
  private readonly users = new Map<string, { user: AuthUser; password: string }>();
  private session: AuthSession | null = null;
  private listeners = new Set<(s: AuthSession | null) => void>();
  private readonly nextId = createIdFactory("user");

  private emit(): void {
    for (const cb of this.listeners) cb(this.session);
  }

  async signUp(email: string, password: REDACTED Promise<AuthUser> {
    const key = email.toLowerCase();
    if (this.users.has(key)) {
      throw new Error("Email already registered");
    }
    const user: AuthUser = { id: this.nextId(), email };
    this.users.set(key, { user, password });
    this.session = { user };
    this.emit();
    return user;
  }

  async signIn(email: string, password: REDACTED Promise<AuthUser> {
    const record = this.users.get(email.toLowerCase());
    if (!record || record.password !== password) {
      throw new Error("Invalid credentials");
    }
    this.session = { user: record.user };
    this.emit();
    return record.user;
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

// Convenience builder wiring a complete set of in-memory repositories together.
export function createInMemoryRepositories(): Repositories & {
  auth: InMemoryAuthRepo;
} {
  const profiles = new InMemoryProfileRepo();
  return {
    profiles,
    hangouts: new InMemoryHangoutRepo(profiles),
    cheers: new InMemoryCheerRepo(),
    comments: new InMemoryCommentRepo(profiles),
    badges: new InMemoryBadgeRepo(),
    photos: new InMemoryPhotoStorageRepo(),
    auth: new InMemoryAuthRepo(),
  };
}
