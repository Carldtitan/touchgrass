// AppRoutes — session-driven routing + tab shell (Requirements 1.6, 2.2, 2.7, 2.8, 3.1).
// Anon → AuthScreen; authed → tabs with the bottom bar, Log dialog, and celebration.
import { useState } from "react";
import type { LoggedResult } from "../hooks/useLogHangout";
import { useAuth } from "../hooks/useAuth";
import { AuthScreen } from "./auth/AuthScreen";
import { BottomTabBar, type Tab } from "./nav/BottomTabBar";
import { HomeFeed } from "./feed/HomeFeed";
import { Leaderboard } from "./leaderboard/Leaderboard";
import { Profile } from "./profile/Profile";
import { LogDialog } from "./log/LogDialog";
import { Celebration } from "./log/Celebration";

export function AppRoutes() {
  const { status, logOut } = useAuth();
  const [tab, setTab] = useState<Tab>("home");
  const [logOpen, setLogOpen] = useState(false);
  const [celebration, setCelebration] = useState<LoggedResult | null>(null);
  const [feedKey, setFeedKey] = useState(0); // remount to reload after a log

  if (status === "loading") {
    return (
      <div
        role="status"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-muted)",
        }}
      >
        Loading…
      </div>
    );
  }

  if (status === "anon") {
    return <AuthScreen />;
  }

  return (
    <>
      <main
        style={{
          padding: "var(--space-4)",
          paddingBottom: "calc(56px + var(--space-8))",
        }}
      >
        {tab === "home" && (
          <HomeFeed key={feedKey} onOpenLog={() => setLogOpen(true)} />
        )}
        {tab === "leaderboard" && <Leaderboard />}
        {tab === "profile" && (
          <Profile onLogOut={() => void logOut()} onOpenLog={() => setLogOpen(true)} />
        )}
      </main>

      <BottomTabBar active={tab} onSelect={setTab} onOpenLog={() => setLogOpen(true)} />

      <LogDialog
        open={logOpen}
        onClose={() => setLogOpen(false)}
        onLogged={(result) => {
          setLogOpen(false);
          setCelebration(result);
          setFeedKey((k) => k + 1);
        }}
      />

      {celebration && (
        <Celebration
          points={celebration.hangout.points}
          streak={celebration.profile.streak}
          newBadges={celebration.newBadges}
          onDone={() => setCelebration(null)}
        />
      )}
    </>
  );
}
