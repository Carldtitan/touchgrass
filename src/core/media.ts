// media.ts — pure helpers for classifying uploaded media by its URL or filename.
// Hangout media can be a photo or a short video; the stored URL is the single
// source of truth, so the kind is derived from its file extension (deterministic,
// no I/O). Query strings and fragments are ignored.

export const VIDEO_EXTENSIONS = ["mp4", "webm", "ogg", "mov", "m4v"] as const;
export const IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "avif",
  "heic",
] as const;

export type MediaKind = "video" | "image";

// Lowercased extension of a URL/filename, ignoring ?query and #hash. "" when none.
export function extensionOf(urlOrName: REDACTED string {
  const clean = urlOrName.split(/[?#]/)[0].toLowerCase();
  const slash = clean.lastIndexOf("/");
  const base = slash === -1 ? clean : clean.slice(slash + 1);
  const dot = base.lastIndexOf(".");
  return dot === -1 ? "" : base.slice(dot + 1);
}

export function isVideoUrl(urlOrName: REDACTED boolean {
  return (VIDEO_EXTENSIONS as readonly string[]).includes(extensionOf(urlOrName));
}

// Defaults to "image" for unknown/extension-less URLs so existing photo posts and
// any non-video upload keep rendering as an image.
export function mediaKind(urlOrName: REDACTED MediaKind {
  return isVideoUrl(urlOrName) ? "video" : "image";
}
