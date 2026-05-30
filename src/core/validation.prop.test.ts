// Feature: touchgrass, Property 5 & 6: sign-up and login validation.
// Validates Requirements 1.2, 1.5, 1.7, 1.8, 2.4.
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { validateSignUp, validateLogin, isValidEmail } from "./validation";

describe("Property 5: sign-up validation", () => {
  it("succeeds iff email valid, password >= 8, name length 1..50", () => {
    fc.assert(
      fc.property(
        fc.string({ maxLength: 40 }),
        fc.string({ maxLength: 20 }),
        fc.string({ maxLength: 60 }),
        (email, password, displayName) => {
          const res = validateSignUp({ email, password, displayName });
          const trimmedEmail = email.trim();
          const trimmedName = displayName.trim();
          const expectedOk =
            isValidEmail(trimmedEmail) &&
            password.length >= 8 &&
            trimmedName.length >= 1 &&
            trimmedName.length <= 50;
          expect(res.ok).toBe(expectedOk);
          if (!res.ok) {
            expect(["email", "password", "displayName"]).toContain(res.error.field);
            expect(res.error.message.length).toBeGreaterThan(0);
          }
        },
      ),
      { numRuns: 300 },
    );
  });

  it("accepts a known-good input", () => {
    expect(validateSignUp({
      email: "REDACTED",
      password: "REDACTED",
      displayName: "Ada",
    })).toEqual({ ok: true });
  });
});

describe("Property 6: login empty-field validation", () => {
  it("fails and names the empty field when email or password is empty", () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 20 }), fc.string({ maxLength: 20 }), (email, password) => {
        const res = validateLogin({ email, password });
        if (email.trim().length === 0) {
          expect(res).toEqual({
            ok: false,
            error: { field: "email", message: expect.any(String) },
          });
        } else if (password.length === 0) {
          expect(res).toEqual({
            ok: false,
            error: { field: "password", message: expect.any(String) },
          });
        } else {
          expect(res).toEqual({ ok: true });
        }
      }),
      { numRuns: 200 },
    );
  });
});
