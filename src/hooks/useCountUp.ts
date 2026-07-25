import { useEffect, useState } from "react";

interface UseCountUpOptions {
  durationMs?: number;
  decimals?: number;
  enabled?: boolean;
}

/**
 * Animates a numeric value from 0 to target over durationMs (ease-out).
 */
export function useCountUp(
  target: number,
  { durationMs = 600, decimals = 0, enabled = true }: UseCountUpOptions = {}
) {
  const [value, setValue] = useState(enabled ? 0 : target);

  useEffect(() => {
    if (!enabled || Number.isNaN(target)) {
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const from = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + (target - from) * eased;
      setValue(Number(next.toFixed(decimals)));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs, decimals, enabled]);

  return value;
}
