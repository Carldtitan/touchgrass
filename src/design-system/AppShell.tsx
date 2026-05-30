// AppShell — centered phone-width column with room for a fixed bottom bar (Req 9.3).
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        maxWidth: "var(--app-max-width)",
        margin: "0 auto",
        minHeight: "100vh",
        background: "var(--color-bg)",
        borderLeft: "1px solid var(--color-border)",
        borderRight: "1px solid var(--color-border)",
        position: "relative",
      }}
    >
      {children}
    </div>
  );
}
