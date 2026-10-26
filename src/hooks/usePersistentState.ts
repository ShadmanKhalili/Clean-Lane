import { useEffect, useRef, useState } from 'react';

/**
 * A useState-compatible hook that transparently persists its value to
 * localStorage. The state rehydrates on page reload, so demo sessions
 * (bookings, points, role, language, ...) survive refreshes.
 *
 * - Storage failures (private mode, quota exceeded) degrade gracefully
 *   to plain in-memory state.
 * - Writes are deferred with requestIdleCallback (fallback: setTimeout)
 *   to avoid blocking interactions while large collections serialize.
 */
export function usePersistentState<T>(
  storageKey: string,
  initialValue: T | (() => T)
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw !== null) return JSON.parse(raw) as T;
    } catch {
      /* corrupted or unavailable storage — fall back to initial value */
    }
    return typeof initialValue === 'function'
      ? (initialValue as () => T)()
      : initialValue;
  });

  const keyRef = useRef(storageKey);
  keyRef.current = storageKey;

  useEffect(() => {
    const persist = () => {
      try {
        window.localStorage.setItem(keyRef.current, JSON.stringify(state));
      } catch {
        /* ignore quota / private-mode errors */
      }
    };
    if (typeof window.requestIdleCallback === 'function') {
      const handle = window.requestIdleCallback(persist, { timeout: 800 });
      return () => window.cancelIdleCallback(handle);
    }
    const timer = window.setTimeout(persist, 250);
    return () => window.clearTimeout(timer);
  }, [storageKey, state]);

  return [state, setState];
}

/** Clears every Clean Lane persistence key (used by "Reset demo data"). */
export function clearAllPersistedState(prefix = 'cleanlane:') {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(prefix)) keysToRemove.push(key);
    }
    keysToRemove.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}
