// AuthScreen — sign up / log in (Requirements 1, 2, 10.1).
// Labels come from the shared contract. Validation messages and the
// duplicate-email / invalid-credentials errors are surfaced inline.
import { useState } from "react";
import { Leaf } from "lucide-react";
import { LABELS } from "../../contracts/labels";
import { Button, Card, Field, Input } from "../../design-system/ui";
import { useAuth } from "../../hooks/useAuth";

type Mode = "signup" | "login";

export function AuthScreen() {
  const { signUp, logIn } = useAuth();
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    displayName?: string;
    form?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      const res =
        mode === "signup"
          ? await signUp(email, password, displayName)
          : await logIn(email, password);
      if (!res.ok) {
        const { field, message } = res.error;
        setErrors(field === "form" ? { form: message } : { [field]: message });
      }
    } finally {
      setSubmitting(false);
    }
  }

  const isSignup = mode === "signup";
  const primaryLabel = isSignup ? LABELS.signUp : LABELS.logIn;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "var(--space-6)",
        padding: "var(--space-6)",
      }}
    >
      <header style={{ textAlign: "center", display: "grid", gap: "var(--space-2)" }}>
        <div
          aria-hidden
          style={{
            display: "flex",
            justifyContent: "center",
            color: "var(--color-accent)",
          }}
        >
          <Leaf size={40} />
        </div>
        <h1 style={{ margin: 0, fontSize: 28, color: "var(--color-text)" }}>
          TouchGrass
        </h1>
        <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
          Log real hangouts, build your streak, climb the leaderboard.
        </p>
      </header>

      {/* Mode switch — both controls are always present (Req 1.1). */}
      <div
        role="tablist"
        aria-label="Authentication mode"
        style={{
          display: "flex",
          gap: "var(--space-2)",
          background: "var(--color-surface)",
          borderRadius: "var(--radius)",
          padding: "var(--space-1)",
        }}
      >
        <ModeTab
          active={isSignup}
          label={LABELS.signUp}
          onClick={() => {
            setMode("signup");
            setErrors({});
          }}
        />
        <ModeTab
          active={!isSignup}
          label={LABELS.logIn}
          onClick={() => {
            setMode("login");
            setErrors({});
          }}
        />
      </div>

      <Card>
        <form
          onSubmit={handleSubmit}
          noValidate
          style={{ display: "grid", gap: "var(--space-4)" }}
        >
          {isSignup && (
            <Field label="Display name" htmlFor="displayName" error={errors.displayName}>
              <Input
                id="displayName"
                name="displayName"
                autoComplete="name"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </Field>
          )}
          <Field label="Email" htmlFor="email" error={errors.email}>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Password" htmlFor="password" error={errors.password}>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          {errors.form && (
            <p role="alert" style={{ margin: 0, color: "var(--color-danger)", fontSize: 14 }}>
              {errors.form}
            </p>
          )}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Working…" : primaryLabel}
          </Button>
        </form>
      </Card>

      <p style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: 14 }}>
        {isSignup ? "Already have an account?" : "New to TouchGrass?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(isSignup ? "login" : "signup");
            setErrors({});
          }}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-accent)",
            fontWeight: 600,
            cursor: "pointer",
            padding: 0,
            fontSize: 14,
          }}
        >
          {isSignup ? LABELS.logIn : LABELS.signUp}
        </button>
      </p>
    </div>
  );
}

function ModeTab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        flex: 1,
        padding: "var(--space-2) var(--space-3)",
        borderRadius: "var(--radius)",
        border: "none",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: 14,
        background: active ? "var(--color-bg)" : "transparent",
        color: active ? "var(--color-text)" : "var(--color-text-muted)",
        boxShadow: active ? "0 1px 2px rgba(17,24,39,0.08)" : "none",
        transition: "background var(--transition)",
      }}
    >
      {label}
    </button>
  );
}
