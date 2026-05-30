// ConfigError — shown at startup when Supabase config is missing (Requirement 11.4).
// Names the specific missing configuration value(s).
import { COPY } from "../contracts/copy";
import { TESTIDS } from "../contracts/testids";

export function ConfigError({ missing }: { missing: string[] }) {
  return (
    <div
      data-testid={TESTIDS.configError}
      className="mt-8 flex flex-col gap-4 p-8 text-center"
    >
      <h1 className="m-0 text-2xl text-danger">{COPY.configErrorTitle}</h1>
      <p className="m-0 text-muted">
        The app is missing required configuration. Set the following in your
        <code> .env </code> file:
      </p>
      <ul className="m-0 list-none p-0">
        {missing.map((key) => (
          <li key={key} className="p-2 font-mono text-text">
            {key}
          </li>
        ))}
      </ul>
    </div>
  );
}
