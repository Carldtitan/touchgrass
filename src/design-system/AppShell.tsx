// AppShell — centered phone-width column with room for a fixed bottom bar (Req 9.3).
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto min-h-screen max-w-app border-x border-border bg-bg font-sans">
      {children}
    </div>
  );
}
