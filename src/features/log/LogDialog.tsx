// LogDialog — create a hangout (Requirements 3.1–3.5, 3.10, 3.11, 10.2).
// Standard input[type=file] (10.2), the four activities with point values, an
// optional tag control, and the "Log it" submit which disables during upload.
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import {
  ACTIVITIES,
  ACTIVITY_EMOJI,
  ACTIVITY_POINTS,
  type ActivityType,
} from "../../core/activities";
import { LABELS } from "../../contracts/labels";
import { COPY } from "../../contracts/copy";
import { Button, Dialog, Field, Textarea } from "../../design-system/ui";
import { useAuth } from "../../hooks/useAuth";
import { useLogHangout, type LoggedResult } from "../../hooks/useLogHangout";
import type { Profile } from "../../data/types";
import { useRepositories } from "../../hooks/RepositoriesContext";

export function LogDialog({
  open,
  onClose,
  onLogged,
}: {
  open: boolean;
  onClose: () => void;
  onLogged: (result: LoggedResult) => void;
}) {
  const { session } = useAuth();
  const repos = useRepositories();
  const { submit, status, errors, reset } = useLogHangout((result) => {
    onLogged(result);
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activity, setActivity] = useState<ActivityType | null>(null);
  const [taggable, setTaggable] = useState<Profile[]>([]);
  const [taggedIds, setTaggedIds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load other users to tag (optional control, Req 3.2). Real data only.
  useEffect(() => {
    if (!open || !session) return;
    let active = true;
    void (async () => {
      try {
        const all = await repos.profiles.list();
        if (active) setTaggable(all.filter((p) => p.id !== session.user.id));
      } catch {
        if (active) setTaggable([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [open, session, repos]);

  // Reset transient state whenever the dialog closes.
  useEffect(() => {
    if (!open) {
      setPhotoFile(null);
      setActivity(null);
      setTaggedIds([]);
      setNote("");
      setPreviewUrl((url) => {
        if (url) URL.revokeObjectURL(url);
        return null;
      });
      reset();
    }
  }, [open, reset]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await submit({ photoFile, activity, taggedUserIds: taggedIds, note });
    if (res.ok) {
      onClose(); // celebration is shown by the parent (Req 3.10)
    }
    // On failure the dialog stays open with the error (Req 3.11).
  }

  const uploading = status === "uploading";

  return (
    <Dialog open={open} onClose={uploading ? () => undefined : onClose} title="Log a hangout">
      <form onSubmit={handleSubmit} noValidate style={{ display: "grid", gap: "var(--space-4)" }}>
        {/* Photo input (Req 3.2, 10.2) — a real, visible file input so it can
            be set both by a person and programmatically by an automated agent. */}
        <Field label="Photo" htmlFor="hangout-photo" error={errors.photo}>
          <div style={{ display: "grid", gap: "var(--space-2)" }}>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Selected hangout preview"
                style={{
                  width: "100%",
                  maxHeight: 240,
                  objectFit: "cover",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--color-border)",
                }}
              />
            )}
            <input
              ref={fileInputRef}
              id="hangout-photo"
              name="photo"
              type="file"
              accept="image/*"
              onChange={handleFile}
              style={{
                width: "100%",
                padding: "var(--space-4)",
                borderRadius: "var(--radius)",
                border: "1px dashed var(--color-border)",
                background: "var(--color-surface)",
                color: "var(--color-text)",
                fontSize: 14,
                cursor: "pointer",
              }}
            />
            {!previewUrl && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  color: "var(--color-text-muted)",
                  fontSize: 13,
                }}
              >
                <ImagePlus size={16} />
                Add a photo from your hangout
              </span>
            )}
          </div>
        </Field>

        {/* Activity picker (Req 3.2) */}
        <Field label="Activity" htmlFor="activity-group" error={errors.activity}>
          <div
            id="activity-group"
            role="radiogroup"
            aria-label="Activity"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--space-2)",
            }}
          >
            {ACTIVITIES.map((a) => {
              const selected = activity === a;
              return (
                <button
                  key={a}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setActivity(a)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    padding: "var(--space-3)",
                    borderRadius: "var(--radius)",
                    border: `1px solid ${
                      selected ? "var(--color-accent)" : "var(--color-border)"
                    }`,
                    background: selected ? "var(--color-surface)" : "var(--color-bg)",
                    cursor: "pointer",
                    fontWeight: 600,
                    color: "var(--color-text)",
                    transition: "border-color var(--transition)",
                  }}
                >
                  <span aria-hidden style={{ fontSize: 20 }}>
                    {ACTIVITY_EMOJI[a]}
                  </span>
                  <span style={{ flex: 1, textAlign: "left" }}>{a}</span>
                  <span style={{ color: "var(--color-accent)" }}>
                    {ACTIVITY_POINTS[a]} points
                  </span>
                </button>
              );
            })}
          </div>
        </Field>

        {/* Optional tag control (Req 3.2) */}
        {taggable.length > 0 && (
          <Field label="Tag friends (optional)" htmlFor="tag-group">
            <div
              id="tag-group"
              style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}
            >
              {taggable.map((p) => {
                const on = taggedIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      setTaggedIds((prev) =>
                        on ? prev.filter((id) => id !== p.id) : [...prev, p.id],
                      )
                    }
                    style={{
                      padding: "var(--space-1) var(--space-3)",
                      borderRadius: 999,
                      border: `1px solid ${
                        on ? "var(--color-accent)" : "var(--color-border)"
                      }`,
                      background: on ? "var(--color-accent)" : "var(--color-bg)",
                      color: on ? "#ffffff" : "var(--color-text)",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {p.displayName}
                  </button>
                );
              })}
            </div>
          </Field>
        )}

        <Field label="Note (optional)" htmlFor="hangout-note">
          <Textarea
            id="hangout-note"
            name="note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={COPY.notePlaceholder}
          />
        </Field>

        {/* Upload progress (Req 3.5) */}
        {uploading && (
          <div
            role="status"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              color: "var(--color-text-muted)",
              fontSize: 14,
            }}
          >
            <Loader2 size={16} className="spin" />
            Uploading your photo…
          </div>
        )}

        {errors.form && (
          <p role="alert" style={{ margin: 0, color: "var(--color-danger)", fontSize: 14 }}>
            {errors.form}
          </p>
        )}

        <Button type="submit" disabled={uploading}>
          {uploading ? "Logging…" : LABELS.logIt}
        </Button>
      </form>
    </Dialog>
  );
}
