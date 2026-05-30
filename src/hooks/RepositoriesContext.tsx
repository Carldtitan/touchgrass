// RepositoriesContext — composition root for the repository layer.
// Production mounts the Supabase repositories; tests can inject the in-memory fakes.
import { createContext, useContext, type ReactNode } from "react";
import type { AuthRepo, Repositories } from "../data/repositories";

// Track A's Repositories bundle is repo-agnostic and omits auth (the use-case
// never needs it). The app additionally needs the AuthRepo for session handling,
// and both factories (Supabase + in-memory) return it, so we extend here.
export type AppRepositories = Repositories & { auth: AuthRepo };

const RepositoriesContext = createContext<AppRepositories | null>(null);

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

export function useRepositories(): AppRepositories {
  const repos = useContext(RepositoriesContext);
  if (!repos) {
    throw new Error("useRepositories must be used within a RepositoriesProvider");
  }
  return repos;
}
