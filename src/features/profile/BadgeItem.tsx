// BadgeItem — one unlocked badge (Requirements 6.2, 10.3).
import { Award } from "lucide-react";
import { TESTIDS } from "../../contracts/testids";
import type { BadgeName } from "../../core/badges";

export function BadgeItem({ name }: { name: BadgeName }) {
  return (
    <span
      data-testid={TESTIDS.badge(name)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-2)",
        padding: "var(--space-2) var(--space-3)",
        borderRadius: 999,
        background: "var(--color-surface)",
        border: "1px solid var(--color-accent)",
        color: "var(--color-text)",
        fontWeight: 600,
        fontSize: 14,
      }}
    >
      <Award size={16} color="var(--color-accent)" />
      {name}
    </span>
  );
}
