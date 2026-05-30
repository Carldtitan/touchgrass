// useAuth — session state + sign up / log in / log out (Requirements 1, 2).
// Holds no business rules: validation comes from the pure core, persistence from
// the repositories. Exposes `status` to drive routing (2.7, 2.8).
import {
  createContext,
  useContext,
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
  type SignUpField,
  type LoginField,
} from "../core/validation";
import type { Profile } from "../data/types";
import {
  DuplicateEmailError,
  InvalidCredentialsError,
  type AuthSession,
} from "../data/repos";
import { useRepositories } from "./RepositoriesContext";

export type AuthStatus = "loading" | "authed" | "anon";

export interface FieldError<F extends string> {
  field: F;
  message: string;
}

interface AuthContextValue {
  status: AuthStatus;
  session: AuthSession | null;
  profile: Profile | null;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<{ ok: true } | { ok: false; error: FieldError<SignUpField | "form"> }>;
  logIn: (
    email: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: FieldError<LoginField | "form"> }>;
  logOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

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
      if (!check.ok) return { ok: false, error: check.error };

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
        if (err instanceof DuplicateEmailError) {
          return {
            ok: false,
            error: { field: "email", message: err.message },
          };
        }
        return {
          ok: false,
          error: { field: "form", message: "Sign up could not be completed" },
        };
      }
    },
    [repos],
  );

  const logIn = useCallback<AuthContextValue["logIn"]>(
    async (email, password) => {
      const check = validateLogin({ email, password });
      if (!check.ok) return { ok: false, error: check.error };

      try {
        const user = await repos.auth.signIn(email.trim(), password);
        await loadProfile(user.id);
        return { ok: true };
      } catch (err) {
        if (err instanceof InvalidCredentialsError) {
          return { ok: false, error: { field: "form", message: err.message } };
        }
        return {
          ok: false,
          error: { field: "form", message: "Log in could not be completed" },
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

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
