// App — skeleton entry. Phase 0 + Track C foundation.
// Renders ConfigError when Supabase config is missing (Req 11.4); otherwise a
// placeholder shell that Track B will fill with the auth screen and tabs.
import { checkConfig } from "./data/config";
import { AppShell } from "./design-system/AppShell";
import { ConfigError } from "./design-system/ConfigError";

export function App() {
  const config = checkConfig();

  return (
    <AppShell>
      {!config.valid ? (
        <ConfigError missing={config.missing} />
      ) : (
        <div className="p-6">
          <h1 className="text-accent">TouchGrass</h1>
          <p className="text-muted">
            Configuration loaded. Auth screen and tabs land here (Track B).
          </p>
        </div>
      )}
    </AppShell>
  );
}
