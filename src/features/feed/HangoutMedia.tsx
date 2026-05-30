// HangoutMedia — renders a hangout's photo OR video from its stored URL
// (Req 4.3, 10.4). The media kind is derived from the URL via the pure core.
// Keeps the feed-post-image test id on the rendered element so existing Kane
// flows continue to assert a non-empty, loaded source regardless of kind.
import { useState, type CSSProperties } from "react";
import { mediaKind } from "../../core/media";

export function HangoutMedia({
  url,
  label,
  testId,
  style,
  controls = true,
}: {
  url: string;
  label: string;
  testId?: string;
  style?: CSSProperties;
  controls?: boolean;
}) {
  const [ok, setOk] = useState(true);
  const baseStyle: CSSProperties = {
    width: "100%",
    objectFit: "cover",
    background: "var(--color-surface)",
    display: ok ? "block" : "none",
    ...style,
  };

  if (mediaKind(url) === "video") {
    return (
      <video
        data-testid={testId}
        src={url}
        aria-label={label}
        controls={controls}
        playsInline
        preload="metadata"
        onError={() => setOk(false)}
        style={baseStyle}
      />
    );
  }

  return (
    <img
      data-testid={testId}
      src={url}
      alt={label}
      onError={() => setOk(false)}
      style={baseStyle}
    />
  );
}
