import { useEffect, useRef, useState } from 'react';

/** Animates a number toward `target` (ease-out). Jumps instantly under reduced motion. */
export const useCountUp = (target: number, decimals = 0, durationMs = 900) => {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  const raf = useRef(0);
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const start = performance.now();
    const origin = from.current;
    if (reduce || origin === target) {
      from.current = target;
      setValue(target);
      return;
    }
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = origin + (target - origin) * eased;
      from.current = v;
      setValue(p >= 1 ? target : v);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, durationMs]);
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
};
