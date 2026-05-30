// useFeed — loads the feed newest-first and exposes cheer + comment actions (Req 4).
import { useCallback, useEffect, useState } from "react";
import type { CommentWithAuthor, HangoutWithPoster } from "../data/types";
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
  // hangoutId -> its comment thread (oldest first). Loaded with the feed (4.4).
  const [comments, setComments] = useState<Record<string, CommentWithAuthor[]>>({});

  const load = useCallback(async () => {
    setState("loading");
    try {
      const feed = await repos.hangouts.listFeed();
      setPosts(feed);
      // Load each post's comment thread in parallel so captions render immediately.
      const threads = await Promise.all(
        feed.map((p) => repos.comments.listFor(p.id).catch(() => [])),
      );
      const byId: Record<string, CommentWithAuthor[]> = {};
      feed.forEach((p, i) => {
        byId[p.id] = threads[i];
      });
      setComments(byId);
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

  // Add a comment and reflect it live: append to the thread and bump the count (4.4).
  const addComment = useCallback(
    async (hangoutId: string, body: REDACTED Promise<boolean> => {
      const trimmed = body.trim();
      if (!session || trimmed.length === 0) return false;
      try {
        const created = await repos.comments.add(hangoutId, session.user.id, trimmed);
        setComments((prev) => ({
          ...prev,
          [hangoutId]: [...(prev[hangoutId] ?? []), created],
        }));
        setPosts((prev) =>
          prev.map((p) =>
            p.id === hangoutId ? { ...p, commentCount: p.commentCount + 1 } : p,
          ),
        );
        return true;
      } catch {
        return false;
      }
    },
    [repos, session],
  );

  return { posts, state, cheered, cheer, comments, addComment, reload: load };
}
