// useAuth — auth context, types, and the consumer hook (Requirements 1, 2).
// The <AuthProvider> component lives in AuthProvider.tsx; this module stays
// component-free so React Fast Refresh treats it as a plain module
// (react-refresh/only-export-components).
import { createContext, useContext } from "react";
import type { SignUpError, LoginError } from "../core/validation";
import type { Profile } from "../data/types";
import type { AuthSession } from "../data/repositories";

export type AuthStatus = "loading" | "authed" | "anon";

export interface FieldError<F extends string> {
  field: F;
  message: string;
}

export interface AuthContextValue {
  status: AuthStatus;
  session: AuthSession | null;
  profile: Profile | null;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<{ ok: true } | { ok: false; error: FieldError<SignUpError["field"] | "form"> }>;
  logIn: (
    email: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: FieldError<LoginError["field"] | "form"> }>;
  logOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
