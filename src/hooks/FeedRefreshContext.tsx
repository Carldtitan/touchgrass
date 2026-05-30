// FeedRefreshContext — a tiny signal bus so a successful log (handled in
// AppRoutes) can tell the mounted HomeFeed to refetch from the backend.
// Avoids relying solely on a key-remount and survives tab switches.
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface FeedRefreshValue {
  // Incremented to request a refetch.
  signal: number;
  requestRefresh: () => void;
}

const FeedRefreshContext = createContext<FeedRefreshValue | null>(null);

export function FeedRefreshProvider({ children }: { children: ReactNode }) {
  const [signal, setSignal] = useState(0);
  const requestRefresh = useCallback(() => setSignal((s) => s + 1), []);
  const value = useMemo(() => ({ signal, requestRefresh }), [signal, requestRefresh]);
  return (
    <FeedRefreshContext.Provider value={value}>
      {children}
    </FeedRefreshContext.Provider>
  );
}

// Co-located with its provider by design; the provider is the only component here.
// eslint-disable-next-line react-refresh/only-export-components
export function useFeedRefresh(): FeedRefreshValue {
  const ctx = useContext(FeedRefreshContext);
  if (!ctx) {
    throw new Error("useFeedRefresh must be used within a FeedRefreshProvider");
  }
  return ctx;
}
