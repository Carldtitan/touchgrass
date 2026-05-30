// RepositoriesContext — composition root for the repository layer.
// Production mounts the Supabase repositories; tests can inject the in-memory fakes.
import { createContext, useContext, type ReactNode } from "react";
import type { Repositories } from "../data/repos";

const RepositoriesContext = createContext<Repositories | null>(null);

export function RepositoriesProvider({
  repositories,
  children,
}: {
  repositories: Repositories;
  children: ReactNode;
}) {
  return (
    <RepositoriesContext.Provider value={repositories}>
      {children}
    </RepositoriesContext.Provider>
  );
}

export function useRepositories(): Repositories {
  const repos = useContext(RepositoriesContext);
  if (!repos) {
    throw new Error("useRepositories must be used within a RepositoriesProvider");
  }
  return repos;
}
