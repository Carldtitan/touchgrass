// useLogHangout — drives the logging flow (Requirement 3, 10.5).
// Validation (photo + activity present), upload-in-progress state, and the
// create-with-rollback use-case from Track A. Computation lives in the pure core.
import { useCallback, useState } from "react";
import type { ActivityType } from "../core/activities";
import {
  createHangoutWithSideEffects,
  type LogHangoutResult,
} from "../data/createHangout";
import { useAuth } from "./useAuth";
import { useEvaluationClock } from "./useEvaluationClock";
import { useRepositories } from "./RepositoriesContext";

export type SubmitStatus = "idle" | "uploading" | "success" | "error";

export interface LogHangoutErrors {
  photo?: string;
  activity?: string;
  form?: string;
}

// A successful create result (the ok branch of Track A's union).
export type LoggedResult = Extract<LogHangoutResult, { ok: true }>;

export function useLogHangout(onLogged?: (result: LoggedResult) => void) {
  const repos = useRepositories();
  const { session, refreshProfile } = useAuth();
  const { evaluationDate } = useEvaluationClock();
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errors, setErrors] = useState<LogHangoutErrors>({});
  const [result, setResult] = useState<LoggedResult | null>(null);

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
      note?: string;
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

      const res = await createHangoutWithSideEffects(repos, {
        posterId: session.user.id,
        activity: params.activity!,
        photoFile: params.photoFile!,
        taggedUserIds: params.taggedUserIds ?? [],
        note: params.note,
        evalDate: evaluationDate,
      });

      if (res.ok) {
        setResult(res);
        setStatus("success");
        await refreshProfile();
        onLogged?.(res);
        return { ok: true as const, result: res };
      }

      setStatus("error");
      setErrors({
        form:
          res.reason === "upload-failed"
            ? "Photo upload failed. Please try again."
            : "Could not log your hangout. Please try again.",
      });
      return { ok: false as const };
    },
    [repos, session, evaluationDate, refreshProfile, onLogged],
  );

  return { submit, status, errors, result, reset };
}
