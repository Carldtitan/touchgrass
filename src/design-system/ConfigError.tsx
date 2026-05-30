// ConfigError — shown at startup when Supabase config is missing (Requirement 11.4).
// Names the specific missing configuration value(s).
import { COPY } from "../contracts/copy";
import { TESTIDS } from "../contracts/testids";

export function ConfigError({ missing }: { missing: string[] }) {
  return (
    <div
      data-testid={TESTIDS.configError}
      style={{
        padding: "var(--space-8)",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
        marginTop: "var(--space-8)",
      }}
    >
      <h1 style={{ color: "var(--color-danger)", fontSize: 22, margin: 0 }}>
        {COPY.configErrorTitle}
      </h1>
      <p style={{ color: "var(--color-text-muted)", margin: 0 }}>
        The app is missing required configuration. Set the following in your
        <code> .env </code> file:
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {missing.map((key) => (
          <li
            key={key}
            style={{
              fontFamily: "monospace",
              color: "var(--color-text)",
              padding: "var(--space-2)",
            }}
          >
            {key}
          </li>
        ))}
      </ul>
    </div>
  );
}
