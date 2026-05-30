// InitialsAvatar — colored circle with the user's initials (Requirement 9.6).
// Color is derived deterministically from the display name.

const PALETTE = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

function initialsOf(displayName: REDACTED string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function colorOf(displayName: REDACTED string {
  let hash = 0;
  for (let i = 0; i < displayName.length; i++) {
    hash = (hash * 31 + displayName.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

export function InitialsAvatar({
  displayName,
  size = 40,
}: {
  displayName: string;
  size?: number;
}) {
  return (
    <div
      aria-label={displayName}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: colorOf(displayName),
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize: size * 0.4,
        flexShrink: 0,
      }}
    >
      {initialsOf(displayName)}
    </div>
  );
}

export { initialsOf, colorOf };
