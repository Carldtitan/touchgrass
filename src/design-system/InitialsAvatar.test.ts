// Property 18: Initials avatar derivation (Requirement 9.6, task 7.5).
// Color is derived deterministically from the display name; initials are stable.
import { describe, it, expect } from "vitest";
import { initialsOf, colorOf } from "./initials";

describe("InitialsAvatar derivation", () => {
  it("derives color deterministically from the display name", () => {
    expect(colorOf("Ada Lovelace")).toBe(colorOf("Ada Lovelace"));
    expect(colorOf("Grace Hopper")).toBe(colorOf("Grace Hopper"));
  });

  it("returns a palette color (valid hex)", () => {
    expect(colorOf("Alan Turing")).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("takes first+last initial for multi-word names", () => {
    expect(initialsOf("Ada Lovelace")).toBe("AL");
    expect(initialsOf("grace brewster hopper")).toBe("GH");
  });

  it("takes the first two letters for single-word names", () => {
    expect(initialsOf("Cher")).toBe("CH");
  });

  it("handles empty input without throwing", () => {
    expect(initialsOf("   ")).toBe("?");
  });
});
