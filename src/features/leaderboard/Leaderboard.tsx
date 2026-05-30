// Leaderboard — ranked users (Requirements 5.1–5.6, 10.3).
import { Trophy } from "lucide-react";
import { Card } from "../../design-system/ui";
import { useLeaderboard } from "../../hooks/useLeaderboard";
import { LeaderboardRow } from "./LeaderboardRow";

export function Leaderboard() {
  const { rows, state } = useLeaderboard();

  return (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 24, color: "var(--color-text)" }}>
          Leaderboard
        </h1>
        <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: 14 }}>
          See where you rank.
        </p>
      </header>

      {state === "loading" && <RowSkeleton />}

      {state === "error" && (
        <Card style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
          Couldn't load the leaderboard. Try again in a moment.
        </Card>
      )}

      {state === "ready" && rows.length === 0 && (
        <Card
          style={{
            textAlign: "center",
            display: "grid",
            gap: "var(--space-2)",
            padding: "var(--space-8) var(--space-4)",
          }}
        >
          <div aria-hidden style={{ display: "flex", justifyContent: "center", color: "var(--color-accent)" }}>
            <Trophy size={36} />
          </div>
          <p style={{ margin: 0, fontWeight: 700, color: "var(--color-text)" }}>
            No rankings yet
          </p>
          <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: 14 }}>
            Log a hangout to put yourself on the board.
          </p>
        </Card>
      )}

      {state === "ready" && rows.length > 0 && (
        <div style={{ display: "grid", gap: "var(--space-2)" }}>
          {rows.map((row) => (
            <LeaderboardRow key={row.userId} row={row} />
          ))}
        </div>
      )}
    </div>
  );
}

function RowSkeleton() {
  return (
    <div style={{ display: "grid", gap: "var(--space-2)" }} aria-hidden>
      {[0, 1, 2].map((i) => (
        <Card
          key={i}
          style={{
            height: 56,
            background: "var(--color-surface)",
          }}
        />
      ))}
    </div>
  );
}
