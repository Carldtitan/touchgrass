// HomeFeed — the Home tab (Requirements 4.1, 4.6, 4.7, 4.8, 4.9, 8.4).
// Streak header (streak-counter), "haven't touched grass today" banner, empty
// state, loading and error states, then the newest-first feed.
import { Flame, Sprout } from "lucide-react";
import { COPY } from "../../contracts/copy";
import { LABELS } from "../../contracts/labels";
import { TESTIDS } from "../../contracts/testids";
import { Button, Card } from "../../design-system/ui";
import { useAuth } from "../../hooks/useAuth";
import { useEvaluationClock } from "../../hooks/useEvaluationClock";
import { useFeed } from "../../hooks/useFeed";
import { FeedPost } from "./FeedPost";

export function HomeFeed({ onOpenLog }: { onOpenLog: () => void }) {
  const { profile } = useAuth();
  const { evaluationDate, skipADay } = useEvaluationClock();
  const { posts, state, cheered, cheer } = useFeed();

  const streak = profile?.streak ?? 0;
  const touchedToday = profile?.lastLogDate === evaluationDate;

  return (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      {/* Header: title + streak counter (Req 4.6) */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-3)",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 24, color: "var(--color-text)" }}>
            Home
          </h1>
          <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: 14 }}>
            See what everyone's been up to.
          </p>
        </div>
        <div
          data-testid={TESTIDS.streakCounter}
          aria-label={`Current streak: ${streak} days`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-1)",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 999,
            padding: "var(--space-2) var(--space-3)",
            fontWeight: 700,
            color: "var(--color-accent)",
          }}
        >
          <Flame size={18} fill="var(--color-accent)" />
          {streak}
        </div>
      </header>

      {/* "Haven't touched grass today" banner (Req 4.7) */}
      {!touchedToday && (
        <Card
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--space-3)",
            background: "var(--color-surface)",
          }}
        >
          <span style={{ color: "var(--color-text)", fontWeight: 600 }}>
            {COPY.noGrassToday}
          </span>
          <div style={{ width: 120 }}>
            <Button onClick={onOpenLog}>{LABELS.logIt}</Button>
          </div>
        </Card>
      )}

      {/* Skip a day (Req 8.1) */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={() => void skipADay()}
          style={{
            background: "none",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius)",
            padding: "var(--space-1) var(--space-3)",
            color: "var(--color-text-muted)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {LABELS.skipADay}
        </button>
      </div>

      {/* Feed body */}
      {state === "loading" && <FeedSkeleton />}

      {state === "error" && (
        <Card style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
          Something went wrong loading the feed.{" "}
          <span style={{ color: "var(--color-text)" }}>Pull to refresh.</span>
        </Card>
      )}

      {state === "ready" && posts.length === 0 && (
        <Card
          style={{
            textAlign: "center",
            display: "grid",
            gap: "var(--space-3)",
            padding: "var(--space-8) var(--space-4)",
          }}
        >
          <div
            aria-hidden
            style={{ display: "flex", justifyContent: "center", color: "var(--color-accent)" }}
          >
            <Sprout size={40} />
          </div>
          <p style={{ margin: 0, fontWeight: 700, color: "var(--color-text)" }}>
            {COPY.emptyFeed}
          </p>
          <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: 14 }}>
            Log your first hangout to get the feed going.
          </p>
          <div style={{ maxWidth: 200, margin: "0 auto", width: "100%" }}>
            <Button onClick={onOpenLog}>{LABELS.logIt}</Button>
          </div>
        </Card>
      )}

      {state === "ready" && posts.length > 0 && (
        <div style={{ display: "grid", gap: "var(--space-4)" }}>
          {posts.map((post) => (
            <FeedPost
              key={post.id}
              post={post}
              hasCheered={cheered.has(post.id)}
              onCheer={cheer}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div style={{ display: "grid", gap: "var(--space-4)" }} aria-hidden>
      {[0, 1].map((i) => (
        <Card key={i} style={{ display: "grid", gap: "var(--space-3)" }}>
          <div
            style={{
              height: 16,
              width: "40%",
              background: "var(--color-surface)",
              borderRadius: "var(--radius)",
            }}
          />
          <div
            style={{
              height: 200,
              background: "var(--color-surface)",
              borderRadius: "var(--radius)",
            }}
          />
        </Card>
      ))}
    </div>
  );
}
