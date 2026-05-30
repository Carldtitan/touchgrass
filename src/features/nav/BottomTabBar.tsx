// BottomTabBar — fixed Home / Log / Leaderboard / Profile navigation (Req 3.1, 9.3).
// The center Log control opens the Log dialog rather than switching tabs.
import { Home, Trophy, User, Plus } from "lucide-react";

export type Tab = "home" | "leaderboard" | "profile";

export function BottomTabBar({
  active,
  onSelect,
  onOpenLog,
}: {
  active: Tab;
  onSelect: (tab: Tab) => void;
  onOpenLog: () => void;
}) {
  return (
    <nav
      aria-label="Primary"
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "var(--app-max-width)",
        background: "var(--color-bg)",
        borderTop: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "var(--space-2) var(--space-2)",
        zIndex: 40,
      }}
    >
      <TabButton
        label="Home"
        active={active === "home"}
        onClick={() => onSelect("home")}
        icon={<Home size={22} />}
      />
      <TabButton
        label="Leaderboard"
        active={active === "leaderboard"}
        onClick={() => onSelect("leaderboard")}
        icon={<Trophy size={22} />}
      />

      {/* Center Log control (Req 3.1). */}
      <button
        type="button"
        aria-label="Log a hangout"
        onClick={onOpenLog}
        style={{
          background: "var(--color-accent)",
          color: "#ffffff",
          border: "none",
          borderRadius: "50%",
          width: 56,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          marginTop: "calc(-1 * var(--space-6))",
          boxShadow: "0 4px 12px rgba(34,197,94,0.4)",
          transition: "transform var(--transition)",
        }}
      >
        <Plus size={28} />
      </button>

      <TabButton
        label="Profile"
        active={active === "profile"}
        onClick={() => onSelect("profile")}
        icon={<User size={22} />}
      />
      {/* Spacer to balance the layout around the center control. */}
      <span aria-hidden style={{ width: 22 }} />
    </nav>
  );
}

function TabButton({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        fontSize: 11,
        fontWeight: 600,
        color: active ? "var(--color-accent)" : "var(--color-text-muted)",
        transition: "color var(--transition)",
        minWidth: 56,
      }}
    >
      {icon}
      {label}
    </button>
  );
}
