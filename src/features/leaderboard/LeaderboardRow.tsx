// LeaderboardRow — one ranked user (Requirements 5.4, 5.5, 10.3).
import { Flame } from "lucide-react";
import { TESTIDS } from "../../contracts/testids";
import { InitialsAvatar } from "../../design-system/InitialsAvatar";
import type { RankedRow } from "../../hooks/useLeaderboard";

export function LeaderboardRow({ row }: { row: RankedRow }) {
  return (
    <div
      data-testid={TESTIDS.leaderboardRow(row.displayName)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-3)",
        borderRadius: "var(--radius)",
        // Highlight the current user's row (Req 5.5).
        background: row.isCurrentUser ? "var(--color-surface)" : "var(--color-bg)",
        border: `1px solid ${
          row.isCurrentUser ? "var(--color-accent)" : "var(--color-border)"
        }`,
      }}
    >
      <span
        style={{
          width: 28,
          textAlign: "center",
          fontWeight: 700,
          color: "var(--color-text-muted)",
        }}
      >
        {row.rank}
      </span>
      <InitialsAvatar displayName={row.displayName} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: "var(--color-text)" }}>
          {row.displayName}
          {row.isCurrentUser && (
            <span style={{ color: "var(--color-accent)", fontSize: 13 }}> · You</span>
          )}
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 13,
            color: "var(--color-text-muted)",
          }}
        >
          <Flame size={14} fill="var(--color-accent)" color="var(--color-accent)" />
          {row.streak} day streak
        </div>
      </div>
      <span
        data-testid={TESTIDS.scoreDisplay}
        style={{ fontWeight: 700, color: "var(--color-text)" }}
      >
        {row.score}
      </span>
    </div>
  );
}
