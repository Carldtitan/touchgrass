// CommentThread — renders a hangout's comments and an inline add-comment input
// (Requirement 4.4). The first comment is the poster's note/caption. Token-only
// styling; all strings/test-ids come from contracts.
import { useState } from "react";
import { COPY } from "../../contracts/copy";
import { LABELS } from "../../contracts/labels";
import { TESTIDS } from "../../contracts/testids";
import type { CommentWithAuthor } from "../../data/types";

export function CommentThread({
  comments,
  canComment,
  onAdd,
}: {
  comments: CommentWithAuthor[];
  canComment: boolean;
  onAdd: (body: string) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || busy) return;
    setBusy(true);
    const ok = await onAdd(body);
    setBusy(false);
    if (ok) setDraft("");
  }

  return (
    <div
      data-testid={TESTIDS.commentList}
      style={{
        display: "grid",
        gap: "var(--space-2)",
        padding: "0 var(--space-4) var(--space-4)",
      }}
    >
      {comments.length === 0 ? (
        <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: 13 }}>
          {COPY.noComments}
        </p>
      ) : (
        comments.map((c) => (
          <p
            key={c.id}
            data-testid={TESTIDS.commentItem}
            style={{ margin: 0, fontSize: 14, color: "var(--color-text)" }}
          >
            <span style={{ fontWeight: 700 }}>{c.authorDisplayName}</span>{" "}
            <span style={{ color: "var(--color-text)" }}>{c.body}</span>
          </p>
        ))
      )}

      {canComment && (
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-1)" }}
        >
          <input
            data-testid={TESTIDS.commentInput}
            aria-label={LABELS.comment}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={COPY.commentPlaceholder}
            disabled={busy}
            style={{
              flex: 1,
              minWidth: 0,
              padding: "var(--space-2) var(--space-3)",
              borderRadius: "var(--radius)",
              border: "1px solid var(--color-border)",
              background: "var(--color-bg)",
              color: "var(--color-text)",
              fontSize: 14,
              fontFamily: "inherit",
            }}
          />
          <button
            type="submit"
            disabled={busy || draft.trim().length === 0}
            style={{
              border: "1px solid var(--color-accent)",
              background: "var(--color-accent)",
              color: "#ffffff",
              borderRadius: "var(--radius)",
              padding: "var(--space-2) var(--space-4)",
              fontWeight: 600,
              fontSize: 14,
              cursor: busy || draft.trim().length === 0 ? "not-allowed" : "pointer",
              opacity: busy || draft.trim().length === 0 ? 0.55 : 1,
              whiteSpace: "nowrap",
            }}
          >
            {LABELS.postComment}
          </button>
        </form>
      )}
    </div>
  );
}
