// Celebration — success overlay after a hangout is logged (Requirement 3.10).
import { useEffect } from "react";
import { PartyPopper } from "lucide-react";
import type { BadgeName } from "../../core/badges";

export function Celebration({
  points,
  streak,
  newBadges,
  onDone,
}: {
  points: number;
  streak: number;
  newBadges: BadgeName[];
  onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={onDone}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(17,24,39,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
        padding: "var(--space-6)",
      }}
    >
      <div
        style={{
          background: "var(--color-bg)",
          borderRadius: "var(--radius)",
          padding: "var(--space-8)",
          textAlign: "center",
          display: "grid",
          gap: "var(--space-3)",
          maxWidth: 320,
        }}
      >
        <div
          aria-hidden
          style={{ display: "flex", justifyContent: "center", color: "var(--color-accent)" }}
        >
          <PartyPopper size={48} />
        </div>
        <h2 style={{ margin: 0, color: "var(--color-text)" }}>Nice, you touched grass!</h2>
        <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--color-accent)" }}>
          +{points} points
        </p>
        <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
          {streak === 1 ? "Streak started" : `${streak} day streak`}
        </p>
        {newBadges.length > 0 && (
          <p style={{ margin: 0, color: "var(--color-text)", fontWeight: 600 }}>
            New badge: {newBadges.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
