// RepositoriesContext — context + hook for the repository layer.
// The matching <RepositoriesProvider> lives in RepositoriesProvider.tsx; this
// module stays component-free so React Fast Refresh treats it as a plain module
// (react-refresh/only-export-components).
import { createContext, useContext } from "react";
import type { AuthRepo, Repositories } from "../data/repositories";

// Track A's Repositories bundle is repo-agnostic and omits auth (the use-case
// never needs it). The app additionally needs the AuthRepo for session handling,
// and both factories (Supabase + in-memory) return it, so we extend here.
export type AppRepositories = Repositories & { auth: AuthRepo };

export const RepositoriesContext = createContext<AppRepositories | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useRepositories(): AppRepositories {
  const repos = useContext(RepositoriesContext);
  if (!repos) {
    throw new Error("useRepositories must be used within a RepositoriesProvider");
  }
  return repos;
}
