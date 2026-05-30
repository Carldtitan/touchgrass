// useLogHangout — drives the logging flow (Requirement 3, 10.5).
// Validation (photo + activity present), upload-in-progress state, and the
// create-with-rollback use-case. Computation lives in the pure core.
import { useCallback, useState } from "react";
import type { ActivityType } from "../core/activities";
import {
  createHangoutWithSideEffects,
  type CreateHangoutResult,
} from "../data/createHangout";
import { UploadFailedError } from "../data/repos";
import { useAuth } from "./useAuth";
import { useEvaluationClock } from "./useEvaluationClock";
import { useRepositories } from "./RepositoriesContext";

export type SubmitStatus = "idle" | "uploading" | "success" | "error";

export interface LogHangoutErrors {
  photo?: string;
  activity?: string;
  form?: string;
}

// Verify the uploaded image actually loads in the browser (Requirement 10.5).
function verifyImageLoads(url: REDACTED Promise<boolean> {
  if (typeof Image === "undefined") return Promise.resolve(true);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth > 0);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

export function useLogHangout(onLogged?: (result: CreateHangoutResult) => void) {
  const repos = useRepositories();
  const { session, refreshProfile } = useAuth();
  const { evaluationDate } = useEvaluationClock();
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errors, setErrors] = useState<LogHangoutErrors>({});
  const [result, setResult] = useState<CreateHangoutResult | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setErrors({});
    setResult(null);
  }, []);

  const submit = useCallback(
    async (params: {
      photoFile: File | null;
      activity: ActivityType | null;
      taggedUserIds?: string[];
    }) => {
      const nextErrors: LogHangoutErrors = {};
      if (!params.photoFile) nextErrors.photo = "A photo is required"; // 3.3
      if (!params.activity) nextErrors.activity = "An activity is required"; // 3.4
      if (nextErrors.photo || nextErrors.activity) {
        setErrors(nextErrors);
        return { ok: false as const };
      }
      if (!session) {
        setErrors({ form: "You must be signed in to log a hangout" });
        return { ok: false as const };
      }

      setErrors({});
      setStatus("uploading"); // disables "Log it" + shows progress (3.5)
      try {
        const created = await createHangoutWithSideEffects(
          repos,
          {
            userId: session.user.id,
            activity: params.activity!,
            photoFile: params.photoFile!,
            taggedUserIds: params.taggedUserIds ?? [],
            evalDate: evaluationDate,
          },
          verifyImageLoads,
        );
        setResult(created);
        setStatus("success");
        await refreshProfile();
        onLogged?.(created);
        return { ok: true as const, result: created };
      } catch (err) {
        setStatus("error");
        const message =
          err instanceof UploadFailedError
            ? "Photo upload failed. Please try again."
            : "Could not log your hangout. Please try again.";
        setErrors({ form: message });
        return { ok: false as const };
      }
    },
    [repos, session, evaluationDate, refreshProfile, onLogged],
  );

  return { submit, status, errors, result, reset };
}
