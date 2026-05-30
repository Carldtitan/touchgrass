// validation.ts — pure sign-up / login validation (Requirements 1.2, 1.5, 1.7, 1.8, 2.4).
// Returns the specific offending field so the UI can show a precise message.

export type SignUpField = "email" | "password" | "displayName";
export type LoginField = "email" | "password";

export interface ValidationError<F extends string> {
  field: F;
  message: string;
}

export type ValidationResult<F extends string> =
  | { ok: true }
  | { ok: false; error: ValidationError<F> };

export interface SignUpInput {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

const PASSWORD_MIN = 8;
const DISPLAY_NAME_MIN = 1;
const DISPLAY_NAME_MAX = 50;

// Pragmatic email-format check: non-empty local part, single @, dotted domain.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: REDACTED boolean {
  return EMAIL_RE.test(email);
}

export function validateSignUp(input: SignUpInput): ValidationResult<SignUpField> {
  const email = input.email.trim();
  const displayName = input.displayName.trim();

  // Empty checks first (Requirement 1.5).
  if (email.length === 0) {
    return { ok: false, error: { field: "email", message: "Email is required" } };
  }
  if (input.password.length === 0) {
    return {
      ok: false,
      error: { field: "password", message: "Password is required" },
    };
  }
  if (displayName.length === 0) {
    return {
      ok: false,
      error: { field: "displayName", message: "Display name is required" },
    };
  }

  // Format / length checks (Requirements 1.7, 1.8).
  if (!isValidEmail(email)) {
    return {
      ok: false,
      error: { field: "email", message: "Enter a valid email address" },
    };
  }
  if (input.password.length < PASSWORD_MIN) {
    return {
      ok: false,
      error: {
        field: "password",
        message: `Password must be at least ${PASSWORD_MIN} characters`,
      },
    };
  }
  if (displayName.length > DISPLAY_NAME_MAX) {
    return {
      ok: false,
      error: {
        field: "displayName",
        message: `Display name must be ${DISPLAY_NAME_MIN}–${DISPLAY_NAME_MAX} characters`,
      },
    };
  }

  return { ok: true };
}

export function validateLogin(input: LoginInput): ValidationResult<LoginField> {
  if (input.email.trim().length === 0) {
    return { ok: false, error: { field: "email", message: "Email is required" } };
  }
  if (input.password.length === 0) {
    return {
      ok: false,
      error: { field: "password", message: "Password is required" },
    };
  }
  return { ok: true };
}
