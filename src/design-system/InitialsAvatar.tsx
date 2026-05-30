// InitialsAvatar — colored circle with the user's initials (Requirement 9.6).
// Color is derived deterministically from the display name (see initials.ts).
import { initialsOf, colorOf } from "./initials";

export function InitialsAvatar({
  displayName,
  size = 40,
}: {
  displayName: string;
  size?: number;
}) {
  // Background color and pixel size are computed per-user (Req 9.6), so they are
  // necessarily inline rather than static token utilities.
  return (
    <div
      aria-label={displayName}
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-bg"
      style={{
        width: size,
        height: size,
        background: colorOf(displayName),
        fontSize: size * 0.4,
      }}
    >
      {initialsOf(displayName)}
    </div>
  );
}
