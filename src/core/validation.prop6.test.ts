// Property 6: Login empty-field validation. Validates Requirement 2.4.
import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { validateLogin } from "./validation";

describe("Property 6: login empty-field validation", () => {
  it("fails and names the empty field when email or password is empty", () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 30 }), fc.string({ maxLength: 30 }), (email, password) => {
        const result = validateLogin({ email, password });
        const emailEmpty = email.trim().length === 0;
        const passwordEmpty = password.length === 0;

        if (emailEmpty || passwordEmpty) {
          expect(result.ok).toBe(false);
          if (!result.ok) {
            const expectedField = emailEmpty ? "email" : "password";
            expect(result.error).toEqual({ field: expectedField, reason: "missing" });
          }
        } else {
          expect(result.ok).toBe(true);
        }
      }),
      { numRuns: 300 },
    );
  });
});
