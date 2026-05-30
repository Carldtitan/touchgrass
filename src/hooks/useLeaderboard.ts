// useLeaderboard — loads profiles and returns ranked rows (Requirement 5).
// Ordering is computed by the pure core (rankUsers), not by SQL, so it is
// identical whether or not the tab is shown (5.3) and is unit-testable.
import { useCallback, useEffect, useState } from "react";
import { rankUsers, type LeaderboardEntry } from "../core/leaderboard";
import { useAuth } from "./useAuth";
import { useRepositories } from "./RepositoriesContext";

export type LoadState = "loading" | "ready" | "error";

export interface RankedRow extends LeaderboardEntry {
  rank: number;
  isCurrentUser: boolean;
}

export function useLeaderboard() {
  const repos = useRepositories();
  const { session } = useAuth();
  const [rows, setRows] = useState<RankedRow[]>([]);
  const [state, setState] = useState<LoadState>("loading");

  const load = useCallback(async () => {
    setState("loading");
    try {
      const profiles = await repos.profiles.list();
      const entries: LeaderboardEntry[] = profiles.map((p) => ({
        userId: p.id,
        displayName: p.displayName,
        score: p.score,
        streak: p.streak,
      }));
      const ranked = rankUsers(entries).map((entry, index) => ({
        ...entry,
        rank: index + 1,
        isCurrentUser: session?.user.id === entry.userId,
      }));
      setRows(ranked);
      setState("ready");
    } catch {
      setState("error");
    }
  }, [repos, session]);

  useEffect(() => {
    void load();
  }, [load]);

  return { rows, state, reload: load };
}
