// useProfile — current user's stats, badges, and own-hangout grid (Requirement 6).
import { useCallback, useEffect, useState } from "react";
import type { BadgeName } from "../core/badges";
import type { Hangout, Profile } from "../data/types";
import { useAuth } from "./useAuth";
import { useRepositories } from "./RepositoriesContext";

export type LoadState = "loading" | "ready" | "error";

export function useProfile() {
  const repos = useRepositories();
  const { session, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(authProfile);
  const [badges, setBadges] = useState<BadgeName[]>([]);
  const [hangouts, setHangouts] = useState<Hangout[]>([]);
  const [state, setState] = useState<LoadState>("loading");

  const load = useCallback(async () => {
    if (!session) return;
    setState("loading");
    try {
      const [p, b, h] = await Promise.all([
        repos.profiles.getById(session.user.id),
        repos.badges.listByUser(session.user.id),
        repos.hangouts.listByUser(session.user.id),
      ]);
      setProfile(p);
      setBadges(b);
      setHangouts(h);
      setState("ready");
    } catch {
      setState("error");
    }
  }, [repos, session]);

  useEffect(() => {
    void load();
  }, [load]);

  return { profile, badges, hangouts, state, reload: load };
}
