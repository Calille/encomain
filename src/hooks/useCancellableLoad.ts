import { DependencyList, useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_TIMEOUT_MS = 10_000;

export interface LoadController {
  /** True if the effect was cleaned up or the timeout already fired */
  isCancelled: () => boolean;
}

/**
 * Runs an async loader on mount / when deps or retry change.
 * Cancels in-flight work on unmount, surfaces errors, and times out after 10s
 * so pages never stick on an infinite skeleton.
 */
export function useCancellableLoad(
  loader: (ctl: LoadController) => Promise<void>,
  deps: DependencyList = [],
  timeoutMs = DEFAULT_TIMEOUT_MS
) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const retry = useCallback(() => {
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const ctl: LoadController = {
      isCancelled: () => cancelled,
    };

    setLoading(true);
    setError(null);

    const timer = window.setTimeout(() => {
      if (!cancelled) {
        cancelled = true;
        setLoading(false);
        setError("Failed to load, try refreshing");
      }
    }, timeoutMs);

    (async () => {
      try {
        await loaderRef.current(ctl);
        if (cancelled) return;
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load");
        setLoading(false);
      } finally {
        window.clearTimeout(timer);
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps passed by caller
  }, [attempt, timeoutMs, ...deps]);

  return { loading, error, retry, attempt };
}
