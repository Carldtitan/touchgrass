// supabaseRepos.ts — Supabase-backed repositories (Requirements 1, 3, 4, 5, 6, 12).
// Real persisted data only. No seed/mock rows. The feed, leaderboard, and profile
// all source their content from Postgres + Storage per Requirement 12.4.
import type { BadgeName } from "../core/badges";
import { isActivityType } from "../core/activities";
import type { Hangout, HangoutWithPoster, NewHangout, Profile } from "./types";
import {
  DuplicateEmailError,
  InvalidCredentialsError,
  UploadFailedError,
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
import { getSupabase, PHOTO_BUCKET } from "./supabaseClient";

// --- row mappers -----------------------------------------------------------

interface ProfileRow {
  id: string;
  display_name: string;
  score: number;
  streak: number;
  last_log_date: string | null;
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

interface HangoutRow {
  id: string;
  poster_id: string;
  activity_type: string;
  photo_url: string;
  points: number;
  created_at: string;
  hangout_tags?: { tagged_user_id: string }[];
}

function toHangout(row: HangoutRow): Hangout {
  return {
    id: row.id,
    posterId: row.poster_id,
    activityType: isActivityType(row.activity_type) ? row.activity_type : "Coffee",
    photoUrl: row.photo_url,
    points: row.points,
    taggedUserIds: (row.hangout_tags ?? []).map((t) => t.tagged_user_id),
    createdAt: row.created_at,
  };
}

// --- repositories ----------------------------------------------------------

class SupabaseAuthRepo implements AuthRepo {
  async signUp(email: string, password: REDACTED Promise<AuthUser> {
    const { data, error } = await getSupabase().auth.signUp({ email, password });
    if (error) {
      if (/already registered|already exists|User already/i.test(error.message)) {
        throw new DuplicateEmailError();
      }
      throw error;
    }
    const user = data.user;
    if (!user) throw new Error("Sign up did not return a user");
    return { id: user.id, email: user.email ?? email };
  }

  async signIn(email: string, password: REDACTED Promise<AuthUser> {
    const { data, error } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      if (/invalid login credentials/i.test(error.message)) {
        throw new InvalidCredentialsError();
      }
      throw error;
    }
    const user = data.user;
    if (!user) throw new InvalidCredentialsError();
    return { id: user.id, email: user.email ?? email };
  }

  async signOut(): Promise<void> {
    const { error } = await getSupabase().auth.signOut();
    if (error) throw error;
  }

  async getSession(): Promise<AuthSession | null> {
    const { data } = await getSupabase().auth.getSession();
    const session = data.session;
    if (!session?.user) return null;
    return { user: { id: session.user.id, email: session.user.email ?? "" } };
  }

  onAuthStateChange(cb: (s: AuthSession | null) => void): Unsubscribe {
    const { data } = getSupabase().auth.onAuthStateChange((_event, session) => {
      cb(
        session?.user
          ? { user: { id: session.user.id, email: session.user.email ?? "" } }
          : null,
      );
    });
    return () => data.subscription.unsubscribe();
  }
}

class SupabaseProfileRepo implements ProfileRepo {
  async create(userId: string, displayName: REDACTED Promise<Profile> {
    const { data, error } = await getSupabase()
      .from("profiles")
      .insert({ id: userId, display_name: displayName, score: 0, streak: 0 })
      .select()
      .single();
    if (error) throw error;
    return toProfile(data as ProfileRow);
  }

  async getById(userId: REDACTED Promise<Profile | null> {
    const { data, error } = await getSupabase()
      .from("profiles")
      .select()
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    return data ? toProfile(data as ProfileRow) : null;
  }

  async list(): Promise<Profile[]> {
    const { data, error } = await getSupabase().from("profiles").select();
    if (error) throw error;
    return (data as ProfileRow[]).map(toProfile);
  }

  async update(userId: string, patch: Partial<Profile>): Promise<Profile> {
    const row: Record<string, unknown> = {};
    if (patch.displayName !== undefined) row.display_name = patch.displayName;
    if (patch.score !== undefined) row.score = patch.score;
    if (patch.streak !== undefined) row.streak = patch.streak;
    if (patch.lastLogDate !== undefined) row.last_log_date = patch.lastLogDate;
    const { data, error } = await getSupabase()
      .from("profiles")
      .update(row)
      .eq("id", userId)
      .select()
      .single();
    if (error) throw error;
    return toProfile(data as ProfileRow);
  }
}

class SupabaseHangoutRepo implements HangoutRepo {
  async create(input: NewHangout): Promise<Hangout> {
    const { data, error } = await getSupabase()
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
    const hangout = toHangout(data as HangoutRow);

    if (input.taggedUserIds.length > 0) {
      const tags = input.taggedUserIds.map((tagged_user_id) => ({
        hangout_id: hangout.id,
        tagged_user_id,
      }));
      const { error: tagError } = await getSupabase()
        .from("hangout_tags")
        .insert(tags);
      if (tagError) throw tagError;
      hangout.taggedUserIds = input.taggedUserIds;
    }
    return hangout;
  }

  async delete(hangoutId: REDACTED Promise<void> {
    const { error } = await getSupabase()
      .from("hangouts")
      .delete()
      .eq("id", hangoutId);
    if (error) throw error;
  }

  async listFeed(): Promise<HangoutWithPoster[]> {
    const { data, error } = await getSupabase()
      .from("hangouts")
      .select(
        "*, hangout_tags(tagged_user_id), profiles!hangouts_poster_id_fkey(display_name)",
      )
      .order("created_at", { ascending: false });
    if (error) throw error;

    const rows = data as (HangoutRow & {
      profiles: { display_name: string } | null;
    })[];

    return Promise.all(
      rows.map(async (row) => {
        const base = toHangout(row);
        const [cheerCount, commentCount] = await Promise.all([
          this.countRelated("cheers", base.id),
          this.countRelated("comments", base.id),
        ]);
        return {
          ...base,
          posterDisplayName: row.profiles?.display_name ?? "Unknown",
          cheerCount,
          commentCount,
        };
      }),
    );
  }

  private async countRelated(
    table: "cheers" | "comments",
    hangoutId: string,
  ): Promise<number> {
    const { count, error } = await getSupabase()
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq("hangout_id", hangoutId);
    if (error) throw error;
    return count ?? 0;
  }

  async listByUser(userId: REDACTED Promise<Hangout[]> {
    const { data, error } = await getSupabase()
      .from("hangouts")
      .select("*, hangout_tags(tagged_user_id)")
      .eq("poster_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as HangoutRow[]).map(toHangout);
  }

  async countByUser(userId: REDACTED Promise<number> {
    const { count, error } = await getSupabase()
      .from("hangouts")
      .select("id", { count: "exact", head: true })
      .eq("poster_id", userId);
    if (error) throw error;
    return count ?? 0;
  }
}

class SupabaseCheerRepo implements CheerRepo {
  async add(hangoutId: string, userId: REDACTED Promise<void> {
    const { error } = await getSupabase()
      .from("cheers")
      .upsert(
        { hangout_id: hangoutId, user_id: userId },
        { onConflict: "hangout_id,user_id", ignoreDuplicates: true },
      );
    if (error) throw error;
  }

  async countFor(hangoutId: REDACTED Promise<number> {
    const { count, error } = await getSupabase()
      .from("cheers")
      .select("id", { count: "exact", head: true })
      .eq("hangout_id", hangoutId);
    if (error) throw error;
    return count ?? 0;
  }

  async hasCheered(hangoutId: string, userId: REDACTED Promise<boolean> {
    const { data, error } = await getSupabase()
      .from("cheers")
      .select("id")
      .eq("hangout_id", hangoutId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data !== null;
  }
}

class SupabaseCommentRepo implements CommentRepo {
  async add(hangoutId: string, userId: string, body: REDACTED Promise<void> {
    const { error } = await getSupabase()
      .from("comments")
      .insert({ hangout_id: hangoutId, user_id: userId, body });
    if (error) throw error;
  }

  async countFor(hangoutId: REDACTED Promise<number> {
    const { count, error } = await getSupabase()
      .from("comments")
      .select("id", { count: "exact", head: true })
      .eq("hangout_id", hangoutId);
    if (error) throw error;
    return count ?? 0;
  }
}

class SupabaseBadgeRepo implements BadgeRepo {
  async listByUser(userId: REDACTED Promise<BadgeName[]> {
    const { data, error } = await getSupabase()
      .from("user_badges")
      .select("badge_name")
      .eq("user_id", userId);
    if (error) throw error;
    return (data as { badge_name: BadgeName }[]).map((r) => r.badge_name);
  }

  async unlock(userId: string, badge: BadgeName): Promise<void> {
    const { error } = await getSupabase()
      .from("user_badges")
      .upsert(
        { user_id: userId, badge_name: badge },
        { onConflict: "user_id,badge_name", ignoreDuplicates: true },
      );
    if (error) throw error;
  }
}

class SupabasePhotoStorageRepo implements PhotoStorageRepo {
  async upload(file: File, userId: REDACTED Promise<string> {
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await getSupabase()
      .storage.from(PHOTO_BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) throw new UploadFailedError();
    const { data } = getSupabase().storage.from(PHOTO_BUCKET).getPublicUrl(path);
    if (!data.publicUrl) throw new UploadFailedError();
    return data.publicUrl;
  }
}

export function createSupabaseRepositories(): Repositories {
  return {
    auth: new SupabaseAuthRepo(),
    profiles: new SupabaseProfileRepo(),
    hangouts: new SupabaseHangoutRepo(),
    cheers: new SupabaseCheerRepo(),
    comments: new SupabaseCommentRepo(),
    badges: new SupabaseBadgeRepo(),
    photos: new SupabasePhotoStorageRepo(),
  };
}
