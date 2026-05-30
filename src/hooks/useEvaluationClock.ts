// useEvaluationClock — context, types, and the consumer hook (Requirement 8).
// The <EvaluationClockProvider> component lives in EvaluationClockProvider.tsx;
// this module stays component-free so React Fast Refresh treats it as a plain
// module (react-refresh/only-export-components).
import { createContext, useContext } from "react";

export interface EvaluationClockValue {
  evaluationDate: string;
  skippedDays: number;
  skipADay: () => Promise<void>;
}

export const EvaluationClockContext = createContext<EvaluationClockValue | null>(
  null,
);

export function useEvaluationClock(): EvaluationClockValue {
  const ctx = useContext(EvaluationClockContext);
  if (!ctx) {
    throw new Error(
      "useEvaluationClock must be used within an EvaluationClockProvider",
    );
  }
  return ctx;
}
