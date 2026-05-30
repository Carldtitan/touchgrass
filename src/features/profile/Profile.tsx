// Profile — current user's stats, badges, and hangout grid (Requirement 6, 10.3).
import { Award, Flame, Sprout } from "lucide-react";
import { BADGE_NAMES } from "../../core/badges";
import { ACTIVITY_EMOJI } from "../../core/activities";
import { LABELS } from "../../contracts/labels";
import { TESTIDS } from "../../contracts/testids";
import { Button, Card } from "../../design-system/ui";
import { InitialsAvatar } from "../../design-system/InitialsAvatar";
import { useProfile } from "../../hooks/useProfile";
import { BadgeItem } from "./BadgeItem";

export function Profile({
  onLogOut,
  onOpenLog,
}: {
  onLogOut: () => void;
  onOpenLog: () => void;
}) {
  const { profile, badges, hangouts, state } = useProfile();

  if (state === "loading" && !profile) {
    return (
      <Card style={{ height: 160, background: "var(--color-surface)" }} aria-hidden />
    );
  }

  if (state === "error" || !profile) {
    return (
      <Card style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
        Couldn't load your profile. Try again in a moment.
      </Card>
    );
  }

  const unlocked = new Set(badges);

  return (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      {/* Stats header (Req 6.1) */}
      <Card style={{ display: "grid", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <InitialsAvatar displayName={profile.displayName} size={64} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: 22, color: "var(--color-text)" }}>
              {profile.displayName}
            </h1>
            <div
              style={{
                display: "flex",
                gap: "var(--space-4)",
                marginTop: "var(--space-2)",
              }}
            >
              <Stat
                label="Score"
                value={
                  <span data-testid={TESTIDS.scoreDisplay}>{profile.score}</span>
                }
              />
              <Stat
                label="Streak"
                value={
                  <span
                    data-testid={TESTIDS.streakCounter}
                    style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    <Flame size={16} fill="var(--color-accent)" color="var(--color-accent)" />
                    {profile.streak}
                  </span>
                }
              />
              <Stat label="Hangouts" value={<span>{hangouts.length}</span>} />
            </div>
          </div>
        </div>
        <div style={{ width: 120 }}>
          <Button variant="secondary" onClick={onLogOut}>
            {LABELS.logOut}
          </Button>
        </div>
      </Card>

      {/* Badges (Req 6.2) */}
      <section style={{ display: "grid", gap: "var(--space-3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <Award size={18} color="var(--color-accent)" />
          <h2 style={{ margin: 0, fontSize: 17, color: "var(--color-text)" }}>Badges</h2>
        </div>
        {unlocked.size === 0 ? (
          <Card style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
            No badges earned yet. Log a hangout to unlock "First Steps".
          </Card>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
            {BADGE_NAMES.filter((b) => unlocked.has(b)).map((b) => (
              <BadgeItem key={b} name={b} />
            ))}
          </div>
        )}
      </section>

      {/* Hangout grid (Req 6.3) */}
      <section style={{ display: "grid", gap: "var(--space-3)" }}>
        <h2 style={{ margin: 0, fontSize: 17, color: "var(--color-text)" }}>
          Your hangouts
        </h2>
        {hangouts.length === 0 ? (
          <Card
            style={{
              textAlign: "center",
              display: "grid",
              gap: "var(--space-3)",
              padding: "var(--space-8) var(--space-4)",
            }}
          >
            <div aria-hidden style={{ display: "flex", justifyContent: "center", color: "var(--color-accent)" }}>
              <Sprout size={36} />
            </div>
            <p style={{ margin: 0, fontWeight: 700, color: "var(--color-text)" }}>
              No hangouts yet
            </p>
            <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: 14 }}>
              Log your first hangout to start your history.
            </p>
            <div style={{ maxWidth: 200, margin: "0 auto", width: "100%" }}>
              <Button onClick={onOpenLog}>{LABELS.logIt}</Button>
            </div>
          </Card>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "var(--space-2)",
            }}
          >
            {hangouts.map((h) => (
              <div
                key={h.id}
                style={{
                  position: "relative",
                  aspectRatio: "1 / 1",
                  borderRadius: "var(--radius)",
                  overflow: "hidden",
                  background: "var(--color-surface)",
                }}
              >
                <img
                  src={h.photoUrl}
                  alt={`${h.activityType} hangout`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    bottom: 4,
                    right: 4,
                    fontSize: 16,
                  }}
                >
                  {ACTIVITY_EMOJI[h.activityType]}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text)" }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{label}</div>
    </div>
  );
}
