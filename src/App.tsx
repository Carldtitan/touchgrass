// App — composition root. Renders ConfigError when Supabase config is missing
// (Req 11.4); otherwise mounts the repositories, auth, and evaluation-clock
// providers and routes by session status (Track B).
import { useMemo } from "react";
import { checkConfig } from "./data/config";
import { createSupabaseRepositories } from "./data/supabaseRepositories";
import { AppShell } from "./design-system/AppShell";
import { ConfigError } from "./design-system/ConfigError";
import { RepositoriesProvider } from "./hooks/RepositoriesProvider";
import { type AppRepositories } from "./hooks/RepositoriesContext";
import { AuthProvider } from "./hooks/AuthProvider";
import { EvaluationClockProvider } from "./hooks/EvaluationClockProvider";
import { FeedRefreshProvider } from "./hooks/FeedRefreshContext";
import { AppRoutes } from "./features/AppRoutes";

export function App() {
  const config = checkConfig();

  if (!config.valid) {
    return (
      <AppShell>
        <ConfigError missing={config.missing} />
      </AppShell>
    );
  }

  return <ConfiguredApp />;
}

// Separated so the Supabase client is only constructed once config is valid.
function ConfiguredApp() {
  const repositories = useMemo<AppRepositories>(
    () => createSupabaseRepositories(),
    [],
  );
  return (
    <RepositoriesProvider repositories={repositories}>
      <AuthProvider>
        <EvaluationClockProvider>
          <FeedRefreshProvider>
            <AppShell>
              <AppRoutes />
            </AppShell>
          </FeedRefreshProvider>
        </EvaluationClockProvider>
      </AuthProvider>
    </RepositoriesProvider>
  );
}
