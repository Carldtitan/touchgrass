// supabaseRepositories.ts — Supabase-backed implementations of the repository
// interfaces (task 3.3). Maps snake_case DB columns to camelCase domain types.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { BadgeName } from "../core/badges";
import { isActivityType } from "../core/activities";
import { getSupabaseClient, HANGOUT_PHOTOS_BUCKET } from "./supabaseClient";
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
import type {
  ActivityType,
  Hangout,
  HangoutWithPoster,
  NewHangout,
  Profile,
} from "./types";
import type { CommentWithAuthor } from "./types";

// ---- row shapes (as stored) ----
interface ProfileRow {
  id: string;
  display_name: string;
  score: number;
  streak: number;
  last_log_date: string | null;
  created_at: string;
}

interface HangoutRow {
  id: string;
  poster_id: string;
  activity_type: string;
  photo_url: string;
  points: number;
  created_at: string;
}

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    score: row.score,
    streak: row.streak,
    lastLogDate: row.last_log_date,
    createdAt: row.created_at,
  };
}

function toActivity(value: REDACTED ActivityType {
  if (!isActivityType(value)) {
    throw new Error(`Unknown activity_type from DB: ${value}`);
  }
  return value;
}

export class SupabaseProfileRepo implements ProfileRepo {
  constructor(private readonly db: SupabaseClient) {}

  async create(userId: string, displayName: REDACTED Promise<Profile> {
    const { data, error } = await this.db
      .from("profiles")
      .insert({ id: userId, display_name: displayName, score: 0, streak: 0 })
      .select()
      .single();
    if (error) throw error;
    return toProfile(data as ProfileRow);
  }

  async getById(userId: REDACTED Promise<Profile | null> {
    const { data, error } = await this.db
      .from("profiles")
      .select()
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    return data ? toProfile(data as ProfileRow) : null;
  }

  async list(): Promise<Profile[]> {
    const { data, error } = await this.db.from("profiles").select();
    if (error) throw error;
    return (data as ProfileRow[]).map(toProfile);
  }

  async update(userId: string, patch: Partial<Profile>): Promise<Profile> {
    const row: Record<string, unknown> = {};
    if (patch.displayName !== undefined) row.display_name = patch.displayName;
    if (patch.score !== undefined) row.score = patch.score;
    if (patch.streak !== undefined) row.streak = patch.streak;
    if (patch.lastLogDate !== undefined) row.last_log_date = patch.lastLogDate;

    const { data, error } = await this.db
      .from("profiles")
      .update(row)
      .eq("id", userId)
      .select()
      .single();
    if (error) throw error;
    return toProfile(data as ProfileRow);
  }
}

export class SupabaseHangoutRepo implements HangoutRepo {
  constructor(private readonly db: SupabaseClient) {}

  async create(input: NewHangout): Promise<Hangout> {
    const { data, error } = await this.db
      .from("hangouts")
      .insert({
        poster_id: input.posterId,
        activity_type: input.activityType,
        photo_url: input.photoUrl,
        points: input.points,
      })
      .select()
      .single();
    if (error) throw error;
    const row = data as HangoutRow;

    if (input.taggedUserIds.length > 0) {
      const tags = input.taggedUserIds.map((tagged_user_id) => ({
        hangout_id: row.id,
        tagged_user_id,
      }));
      const { error: tagError } = await this.db.from("hangout_tags").insert(tags);
      if (tagError) throw tagError;
    }

    return {
      id: row.id,
      posterId: row.poster_id,
      activityType: toActivity(row.activity_type),
      photoUrl: row.photo_url,
      points: row.points,
      taggedUserIds: [...input.taggedUserIds],
      createdAt: row.created_at,
    };
  }

  async delete(hangoutId: REDACTED Promise<void> {
    const { error } = await this.db.from("hangouts").delete().eq("id", hangoutId);
    if (error) throw error;
  }

  async listFeed(): Promise<HangoutWithPoster[]> {
    // Newest first (4.1). Join poster name; counts come from aggregate views/queries.
    const { data, error } = await this.db
      .from("hangouts")
      .select(
        "id, poster_id, activity_type, photo_url, points, created_at, " +
          "profiles!hangouts_poster_id_fkey(display_name), " +
          "hangout_tags(tagged_user_id), " +
          "cheers(count), comments(count)",
      )
      .order("created_at", { ascending: false });
    if (error) throw error;

    return (data as unknown as RawFeedRow[]).map((row) => ({
      id: row.id,
      posterId: row.poster_id,
      activityType: toActivity(row.activity_type),
      photoUrl: row.photo_url,
      points: row.points,
      taggedUserIds: (row.hangout_tags ?? []).map((t) => t.tagged_user_id),
      createdAt: row.created_at,
      posterDisplayName: row.profiles?.display_name ?? "Unknown",
      cheerCount: row.cheers?.[0]?.count ?? 0,
      commentCount: row.comments?.[0]?.count ?? 0,
    }));
  }

  async listByUser(userId: REDACTED Promise<Hangout[]> {
    const { data, error } = await this.db
      .from("hangouts")
      .select("id, poster_id, activity_type, photo_url, points, created_at, hangout_tags(tagged_user_id)")
      .eq("poster_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;

    return (data as unknown as RawFeedRow[]).map((row) => ({
      id: row.id,
      posterId: row.poster_id,
      activityType: toActivity(row.activity_type),
      photoUrl: row.photo_url,
      points: row.points,
      taggedUserIds: (row.hangout_tags ?? []).map((t) => t.tagged_user_id),
      createdAt: row.created_at,
    }));
  }

  async countByUser(userId: REDACTED Promise<number> {
    const { count, error } = await this.db
      .from("hangouts")
      .select("id", { count: "exact", head: true })
      .eq("poster_id", userId);
    if (error) throw error;
    return count ?? 0;
  }
}

interface RawFeedRow extends HangoutRow {
  profiles?: { display_name: string } | null;
  hangout_tags?: { tagged_user_id: string }[];
  cheers?: { count: number }[];
  comments?: { count: number }[];
}

export class SupabaseCheerRepo implements CheerRepo {
  constructor(private readonly db: SupabaseClient) {}

  async add(hangoutId: string, userId: REDACTED Promise<void> {
    // Unique (hangout_id, user_id) makes this idempotent (4.5); ignore conflicts.
    const { error } = await this.db
      .from("cheers")
      .upsert(
        { hangout_id: hangoutId, user_id: userId },
        { onConflict: "hangout_id,user_id", ignoreDuplicates: true },
      );
    if (error) throw error;
  }

  async countFor(hangoutId: REDACTED Promise<number> {
    const { count, error } = await this.db
      .from("cheers")
      .select("id", { count: "exact", head: true })
      .eq("hangout_id", hangoutId);
    if (error) throw error;
    return count ?? 0;
  }
}

export class SupabaseCommentRepo implements CommentRepo {
  constructor(private readonly db: SupabaseClient) {}

  async add(
    hangoutId: string,
    userId: string,
    body: string,
  ): Promise<CommentWithAuthor> {
    const { data, error } = await this.db
      .from("comments")
      .insert({ hangout_id: hangoutId, user_id: userId, body })
      .select("id, hangout_id, user_id, body, created_at, profiles(display_name)")
      .single();
    if (error) throw error;
    return toComment(data as unknown as CommentRow);
  }

  async countFor(hangoutId: REDACTED Promise<number> {
    const { count, error } = await this.db
      .from("comments")
      .select("id", { count: "exact", head: true })
      .eq("hangout_id", hangoutId);
    if (error) throw error;
    return count ?? 0;
  }

  async listFor(hangoutId: REDACTED Promise<CommentWithAuthor[]> {
    const { data, error } = await this.db
      .from("comments")
      .select("id, hangout_id, user_id, body, created_at, profiles(display_name)")
      .eq("hangout_id", hangoutId)
      .order("created_at", { ascending: true }); // oldest-first thread
    if (error) throw error;
    return (data as unknown as CommentRow[]).map(toComment);
  }
}

interface CommentRow {
  id: string;
  hangout_id: string;
  user_id: string;
  body: string;
  created_at: string;
  profiles?: { display_name: string } | null;
}

function toComment(row: CommentRow): CommentWithAuthor {
  return {
    id: row.id,
    hangoutId: row.hangout_id,
    authorId: row.user_id,
    authorDisplayName: row.profiles?.display_name ?? "Unknown",
    body: row.body,
    createdAt: row.created_at,
  };
}

export class SupabaseBadgeRepo implements BadgeRepo {
  constructor(private readonly db: SupabaseClient) {}

  async listByUser(userId: REDACTED Promise<BadgeName[]> {
    const { data, error } = await this.db
      .from("user_badges")
      .select("badge_name")
      .eq("user_id", userId);
    if (error) throw error;
    return (data as { badge_name: BadgeName }[]).map((r) => r.badge_name);
  }

  async unlock(userId: string, badge: BadgeName): Promise<void> {
    const { error } = await this.db
      .from("user_badges")
      .upsert(
        { user_id: userId, badge_name: badge },
        { onConflict: "user_id,badge_name", ignoreDuplicates: true },
      );
    if (error) throw error;
  }
}

export class SupabasePhotoStorageRepo implements PhotoStorageRepo {
  constructor(private readonly db: SupabaseClient) {}

  async upload(file: File, userId: REDACTED Promise<string> {
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await this.db.storage
      .from(HANGOUT_PHOTOS_BUCKET)
      .upload(path, file, { upsert: false });
    if (error) throw error;

    const { data } = this.db.storage.from(HANGOUT_PHOTOS_BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) throw new Error("Storage returned an empty public URL");
    return data.publicUrl;
  }
}

export class SupabaseAuthRepo implements AuthRepo {
  constructor(private readonly db: SupabaseClient) {}

  async signUp(email: string, password: REDACTED Promise<AuthUser> {
    const { data, error } = await this.db.auth.signUp({ email, password });
    if (error) throw error;
    const user = data.user;
    if (!user) throw new Error("Sign up did not return a user");
    return { id: user.id, email: user.email ?? email };
  }

  async signIn(email: string, password: REDACTED Promise<AuthUser> {
    const { data, error } = await this.db.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const user = data.user;
    if (!user) throw new Error("Sign in did not return a user");
    return { id: user.id, email: user.email ?? email };
  }

  async signOut(): Promise<void> {
    const { error } = await this.db.auth.signOut();
    if (error) throw error;
  }

  async getSession(): Promise<AuthSession | null> {
    const { data, error } = await this.db.auth.getSession();
    if (error) throw error;
    const session = data.session;
    if (!session?.user) return null;
    return { user: { id: session.user.id, email: session.user.email ?? "" } };
  }

  onAuthStateChange(cb: (s: AuthSession | null) => void): Unsubscribe {
    const { data } = this.db.auth.onAuthStateChange((_event, session) => {
      cb(
        session?.user
          ? { user: { id: session.user.id, email: session.user.email ?? "" } }
          : null,
      );
    });
    return () => data.subscription.unsubscribe();
  }
}

// Build the full Supabase-backed repository set against the shared client.
export function createSupabaseRepositories(
  db: SupabaseClient = getSupabaseClient(),
): Repositories & { auth: AuthRepo } {
  return {
    profiles: new SupabaseProfileRepo(db),
    hangouts: new SupabaseHangoutRepo(db),
    cheers: new SupabaseCheerRepo(db),
    comments: new SupabaseCommentRepo(db),
    badges: new SupabaseBadgeRepo(db),
    photos: new SupabasePhotoStorageRepo(db),
    auth: new SupabaseAuthRepo(db),
  };
}
