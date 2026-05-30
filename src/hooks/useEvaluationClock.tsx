// useEvaluationClock — owns the skipped-days offset (Requirement 8).
// Keeps the streak core pure: the evaluation date is derived here (today + offset)
// and passed into the pure functions. On skip, re-evaluates and persists.
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { addDays, reevaluate } from "../core/streak";
import { useAuth } from "./useAuth";
import { useRepositories } from "./RepositoriesContext";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

interface EvaluationClockValue {
  evaluationDate: string;
  skippedDays: number;
  skipADay: () => Promise<void>;
}

const EvaluationClockContext = createContext<EvaluationClockValue | null>(null);

export function EvaluationClockProvider({ children }: { children: ReactNode }) {
  const repos = useRepositories();
  const { profile, refreshProfile } = useAuth();
  const [skippedDays, setSkippedDays] = useState(0);

  const evaluationDate = useMemo(
    () => addDays(todayIso(), skippedDays),
    [skippedDays],
  );

  const skipADay = useCallback(async () => {
    const nextSkipped = skippedDays + 1;
    const nextDate = addDays(todayIso(), nextSkipped); // exactly one day later (8.2)
    setSkippedDays(nextSkipped);

    // Re-evaluate the current user's streak on the advanced date (8.3, 7.6).
    if (profile) {
      const next = reevaluate(
        { streak: profile.streak, lastLogDate: profile.lastLogDate },
        nextDate,
      );
      if (next.streak !== profile.streak) {
        await repos.profiles.update(profile.id, { streak: next.streak });
        await refreshProfile();
      }
    }
  }, [skippedDays, profile, repos, refreshProfile]);

  const value = useMemo(
    () => ({ evaluationDate, skippedDays, skipADay }),
    [evaluationDate, skippedDays, skipADay],
  );

  return (
    <EvaluationClockContext.Provider value={value}>
      {children}
    </EvaluationClockContext.Provider>
  );
}

export function useEvaluationClock(): EvaluationClockValue {
  const ctx = useContext(EvaluationClockContext);
  if (!ctx) {
    throw new Error(
      "useEvaluationClock must be used within an EvaluationClockProvider",
    );
  }
  return ctx;
}
