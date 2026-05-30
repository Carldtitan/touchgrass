// AuthProvider — session state + sign up / log in / log out (Requirements 1, 2).
// Holds no business rules: validation comes from the pure core, persistence from
// the repositories. Exposes `status` to drive routing (2.7, 2.8). The context,
// types, and useAuth hook live in useAuth.ts so this file only exports a component
// (react-refresh/only-export-components).
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  validateLogin,
  validateSignUp,
  type SignUpError,
  type LoginError,
} from "../core/validation";
import type { Profile } from "../data/types";
import type { AuthSession } from "../data/repositories";
import { useRepositories } from "./RepositoriesContext";
import { AuthContext, type AuthContextValue, type AuthStatus } from "./useAuth";

// Map Track A's structured validation errors to user-facing copy.
function signUpMessage(error: SignUpError): string {
  switch (error.field) {
    case "email":
      return error.reason === "missing"
        ? "Email is required"
        : "Enter a valid email address";
    case "password":
      return error.reason === "missing"
        ? "Password is required"
        : "Password must be at least 8 characters";
    case "displayName":
    default:
      return error.reason === "missing"
        ? "Display name is required"
        : "Display name must be 1–50 characters";
  }
}

function loginMessage(error: LoginError): string {
  return error.field === "email" ? "Email is required" : "Password is required";
}

// Map a Supabase auth error message to friendly copy (Track A throws raw errors).
function authErrorMessage(err: unknown, context: "signup" | "login"): string {
  const message = err instanceof Error ? err.message : "";
  if (/already registered|already exists|User already/i.test(message)) {
    return "That email is already registered";
  }
  if (/invalid login credentials/i.test(message)) {
    return "Email or password is incorrect";
  }
  return context === "signup"
    ? "Sign up could not be completed"
    : "Log in could not be completed";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const repos = useRepositories();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const mounted = useRef(true);

  const loadProfile = useCallback(
    async (userId: string) => {
      const p = await repos.profiles.getById(userId);
      if (mounted.current) setProfile(p);
    },
    [repos],
  );

  // Restore an existing session on load (2.7) and react to auth changes.
  useEffect(() => {
    mounted.current = true;
    let unsub: (() => void) | undefined;

    (async () => {
      const existing = await repos.auth.getSession();
      if (!mounted.current) return;
      setSession(existing);
      setStatus(existing ? "authed" : "anon");
      if (existing) await loadProfile(existing.user.id);

      unsub = repos.auth.onAuthStateChange((s) => {
        if (!mounted.current) return;
        setSession(s);
        setStatus(s ? "authed" : "anon");
        if (s) void loadProfile(s.user.id);
        else setProfile(null);
      });
    })();

    return () => {
      mounted.current = false;
      unsub?.();
    };
  }, [repos, loadProfile]);

  const signUp = useCallback<AuthContextValue["signUp"]>(
    async (email, password, displayName) => {
      const check = validateSignUp({ email, password, displayName });
      if (!check.ok) {
        return {
          ok: false,
          error: { field: check.error.field, message: signUpMessage(check.error) },
        };
      }

      try {
        const user = await repos.auth.signUp(email.trim(), password);
        // Create the profile; if it fails, do not leave an orphan (1.9 best-effort).
        try {
          const created = await repos.profiles.create(user.id, displayName.trim());
          if (mounted.current) setProfile(created);
        } catch (profileErr) {
          await repos.auth.signOut().catch(() => undefined);
          throw profileErr;
        }
        return { ok: true };
      } catch (err) {
        const message = authErrorMessage(err, "signup");
        if (message === "That email is already registered") {
          return { ok: false, error: { field: "email", message } };
        }
        return { ok: false, error: { field: "form", message } };
      }
    },
    [repos],
  );

  const logIn = useCallback<AuthContextValue["logIn"]>(
    async (email, password) => {
      const check = validateLogin({ email, password });
      if (!check.ok) {
        return {
          ok: false,
          error: { field: check.error.field, message: loginMessage(check.error) },
        };
      }

      try {
        const user = await repos.auth.signIn(email.trim(), password);
        await loadProfile(user.id);
        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          error: { field: "form", message: authErrorMessage(err, "login") },
        };
      }
    },
    [repos, loadProfile],
  );

  const logOut = useCallback(async () => {
    await repos.auth.signOut();
    if (mounted.current) {
      setSession(null);
      setProfile(null);
      setStatus("anon");
    }
  }, [repos]);

  const refreshProfile = useCallback(async () => {
    if (session) await loadProfile(session.user.id);
  }, [session, loadProfile]);

  const value = useMemo(
    () => ({ status, session, profile, signUp, logIn, logOut, refreshProfile }),
    [status, session, profile, signUp, logIn, logOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
