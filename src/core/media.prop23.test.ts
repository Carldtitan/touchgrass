// Property 23: media kind is derived deterministically from the URL extension.
// Video extensions render as video; everything else (including extension-less
// URLs and query/hash variants) defaults to image so existing photos are safe.
import { describe, expect, it } from "vitest";
import fc from "fast-check";
import {
  IMAGE_EXTENSIONS,
  VIDEO_EXTENSIONS,
  isVideoUrl,
  mediaKind,
} from "./media";

describe("Property 23: media kind from URL", () => {
  it("any video extension classifies as video, regardless of path/query/case", () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        fc.constantFrom(...VIDEO_EXTENSIONS),
        fc.constantFrom("", "?t=123", "#frag", "?a=1#b"),
        (base, ext, suffix) => {
          // Mix case to prove case-insensitivity.
          const url = `${base}/clip.${ext.toUpperCase()}${suffix}`;
          expect(isVideoUrl(url)).toBe(true);
          expect(mediaKind(url)).toBe("video");
        },
      ),
      { numRuns: 200 },
    );
  });

  it("image extensions and extension-less URLs classify as image", () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        fc.constantFrom(...IMAGE_EXTENSIONS),
        (base, ext) => {
          expect(mediaKind(`${base}/pic.${ext}`)).toBe("image");
        },
      ),
      { numRuns: 100 },
    );
  });

  it("a URL with no extension defaults to image", () => {
    expect(mediaKind("https://cdn.example.com/abc123")).toBe("image");
    expect(mediaKind("memory://photos/u1/p1")).toBe("image");
  });
});
