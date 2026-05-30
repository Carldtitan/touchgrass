// validation.ts — pure sign-up and login validation
// (Requirements 1.2, 1.5, 1.7, 1.8, 2.4). No I/O.

export type SignUpField = "email" | "password" | "displayName";
export type LoginField = "email" | "password";

export type SignUpError =
  | { field: "email"; reason: "missing" | "invalidFormat" }
  | { field: "password"; reason: "missing" | "tooShort" }
  | { field: "displayName"; reason: "missing" | "tooLong" };

export type LoginError = { field: LoginField; reason: "missing" };

export type ValidationResult<E> =
  | { ok: true }
  | { ok: false; error: E };

export const PASSWORD_MIN_LENGTH = 8;
export const DISPLAY_NAME_MAX_LENGTH = 50;

// Pragmatic email-format check: non-empty local part, "@", domain with a dot,
// and no whitespace. Deliberately conservative — the server is the source of truth.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmailFormat(email: REDACTED boolean {
  return EMAIL_RE.test(email);
}

// Requirements 1.2, 1.5, 1.7, 1.8. Checks fields in a fixed order so the reported
// offending field is deterministic.
export function validateSignUp(input: {
  email: string;
  password: string;
  displayName: string;
}): ValidationResult<SignUpError> {
  const email = input.email.trim();
  const displayName = input.displayName.trim();
  const { password } = input;

  // Email (1.5 missing, 1.7 invalid format)
  if (email.length === 0) {
    return { ok: false, error: { field: "email", reason: "missing" } };
  }
  if (!isValidEmailFormat(email)) {
    return { ok: false, error: { field: "email", reason: "invalidFormat" } };
  }

  // Password (1.5 missing, 1.8 too short)
  if (password.length === 0) {
    return { ok: false, error: { field: "password", reason: "missing" } };
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { ok: false, error: { field: "password", reason: "tooShort" } };
  }

  // Display name (1.5 missing, 1.8 too long)
  if (displayName.length === 0) {
    return { ok: false, error: { field: "displayName", reason: "missing" } };
  }
  if (displayName.length > DISPLAY_NAME_MAX_LENGTH) {
    return { ok: false, error: { field: "displayName", reason: "tooLong" } };
  }

  return { ok: true };
}

// Requirement 2.4. Empty email or password fails and identifies the empty field.
export function validateLogin(input: {
  email: string;
  password: string;
}): ValidationResult<LoginError> {
  if (input.email.trim().length === 0) {
    return { ok: false, error: { field: "email", reason: "missing" } };
  }
  if (input.password.length === 0) {
    return { ok: false, error: { field: "password", reason: "missing" } };
  }
  return { ok: true };
}
