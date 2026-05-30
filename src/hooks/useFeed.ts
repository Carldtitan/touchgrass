// useFeed — loads the feed newest-first and exposes cheer counts (Requirement 4).
import { useCallback, useEffect, useState } from "react";
import type { HangoutWithPoster } from "../data/types";
import { useAuth } from "./useAuth";
import { useFeedRefresh } from "./FeedRefreshContext";
import { useRepositories } from "./RepositoriesContext";

export type LoadState = "loading" | "ready" | "error";

export function useFeed() {
  const repos = useRepositories();
  const { session } = useAuth();
  const { signal } = useFeedRefresh();
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

  // Initial load.
  useEffect(() => {
    void load();
  }, [load]);

  // Refetch when a log (or other mutation) requests it. A short delayed second
  // fetch covers read-after-write timing so a just-created post reliably shows.
  useEffect(() => {
    if (signal === 0) return;
    void load();
    const t = setTimeout(() => void load(), 800);
    return () => clearTimeout(t);
  }, [signal, load]);

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
