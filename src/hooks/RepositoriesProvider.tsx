// RepositoriesProvider — composition root for the repository layer.
// Production mounts the Supabase repositories; tests can inject the in-memory fakes.
// The context object, hook, and types live in RepositoriesContext.ts so this file
// only exports a component (react-refresh/only-export-components).
import { type ReactNode } from "react";
import { RepositoriesContext, type AppRepositories } from "./RepositoriesContext";

export function RepositoriesProvider({
  repositories,
  children,
}: {
  repositories: AppRepositories;
  children: ReactNode;
}) {
  return (
    <RepositoriesContext.Provider value={repositories}>
      {children}
    </RepositoriesContext.Provider>
  );
}
