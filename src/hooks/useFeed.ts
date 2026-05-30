// useFeed — loads the feed newest-first and exposes cheer counts (Requirement 4).
import { useCallback, useEffect, useState } from "react";
import type { HangoutWithPoster } from "../data/types";
import { useAuth } from "./useAuth";
import { useRepositories } from "./RepositoriesContext";

export type LoadState = "loading" | "ready" | "error";

export function useFeed() {
  const repos = useRepositories();
  const { session } = useAuth();
  const [posts, setPosts] = useState<HangoutWithPoster[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [cheered, setCheered] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setState("loading");
    try {
      const feed = await repos.hangouts.listFeed();
      setPosts(feed);
      setState("ready");
    } catch {
      setState("error");
    }
  }, [repos]);

  useEffect(() => {
    void load();
  }, [load]);

  const cheer = useCallback(
    async (hangoutId: string) => {
      if (!session) return;
      if (cheered.has(hangoutId)) return; // one cheer per user (4.5)
      // Optimistic update.
      setCheered((prev) => new Set(prev).add(hangoutId));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === hangoutId ? { ...p, cheerCount: p.cheerCount + 1 } : p,
        ),
      );
      try {
        await repos.cheers.add(hangoutId, session.user.id);
        const count = await repos.cheers.countFor(hangoutId);
        setPosts((prev) =>
          prev.map((p) => (p.id === hangoutId ? { ...p, cheerCount: count } : p)),
        );
      } catch {
        // Roll back the optimistic update on failure.
        setCheered((prev) => {
          const next = new Set(prev);
          next.delete(hangoutId);
          return next;
        });
        setPosts((prev) =>
          prev.map((p) =>
            p.id === hangoutId
              ? { ...p, cheerCount: Math.max(0, p.cheerCount - 1) }
              : p,
          ),
        );
      }
    },
    [repos, session, cheered],
  );

  return { posts, state, cheered, cheer, reload: load };
}
