// FeedPost — a single hangout card (Requirements 4.2, 4.3, 4.4, 4.5, 10.4, 10.6).
import { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { ACTIVITY_EMOJI } from "../../core/activities";
import { LABELS } from "../../contracts/labels";
import { TESTIDS } from "../../contracts/testids";
import type { HangoutWithPoster } from "../../data/types";
import { Card } from "../../design-system/ui";
import { InitialsAvatar } from "../../design-system/InitialsAvatar";
import { timeAgo } from "./timeAgo";

export function FeedPost({
  post,
  hasCheered,
  onCheer,
}: {
  post: HangoutWithPoster;
  hasCheered: boolean;
  onCheer: (id: string) => void;
}) {
  const [imageOk, setImageOk] = useState(true);

  return (
    <Card
      data-testid={TESTIDS.feedPost}
      style={{ display: "grid", gap: "var(--space-3)", padding: 0, overflow: "hidden" }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          padding: "var(--space-4) var(--space-4) 0",
        }}
      >
        <InitialsAvatar displayName={post.posterDisplayName} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, color: "var(--color-text)" }}>
            {post.posterDisplayName}
          </div>
          <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
            {timeAgo(post.createdAt)}
          </div>
        </div>
        <div
          aria-hidden
          style={{
            fontSize: 24,
            lineHeight: 1,
          }}
          title={post.activityType}
        >
          {ACTIVITY_EMOJI[post.activityType]}
        </div>
      </div>

      {/* Photo (Req 4.3, 10.4) */}
      <img
        data-testid={TESTIDS.feedPostImage}
        src={post.photoUrl}
        alt={`${post.posterDisplayName}'s ${post.activityType} hangout`}
        onError={() => setImageOk(false)}
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          objectFit: "cover",
          background: "var(--color-surface)",
          display: imageOk ? "block" : "none",
        }}
      />

      {/* Meta row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          flexWrap: "wrap",
          padding: "0 var(--space-4)",
        }}
      >
        <span
          style={{
            fontWeight: 700,
            color: "var(--color-accent)",
          }}
        >
          +{post.points} points
        </span>
        <span style={{ color: "var(--color-text-muted)" }}>
          · {post.activityType}
        </span>
        {post.taggedUserIds.length > 0 && (
          <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
            · with {post.taggedUserIds.length}{" "}
            {post.taggedUserIds.length === 1 ? "friend" : "friends"}
          </span>
        )}
      </div>

      {/* Actions (Req 4.4, 4.5) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-4)",
          padding: "0 var(--space-4) var(--space-4)",
        }}
      >
        <button
          type="button"
          onClick={() => onCheer(post.id)}
          aria-pressed={hasCheered}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
            color: hasCheered ? "var(--color-accent)" : "var(--color-text-muted)",
            padding: 0,
            transition: "color var(--transition)",
          }}
        >
          <Heart size={18} fill={hasCheered ? "var(--color-accent)" : "none"} />
          {LABELS.cheer} {post.cheerCount}
        </button>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            color: "var(--color-text-muted)",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <MessageCircle size={18} />
          {post.commentCount}
        </span>
      </div>
    </Card>
  );
}
