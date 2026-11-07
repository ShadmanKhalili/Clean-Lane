import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';

/**
 * Bump STORAGE_VERSION whenever the shape of persisted data changes; older
 * snapshots are then ignored instead of crashing the app with a stale schema.
 */
// v2: custody records gained real hash-chain seals.
export const STORAGE_VERSION = 2;
export const STORAGE_PREFIX = `cleanlane:v${STORAGE_VERSION}:`;

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
};

/**
 * Drop-in replacement for `useState` that survives page reloads. Storage can be
 * unavailable (private mode, quota, sandboxed iframes) — in that case it quietly
 * degrades to in-memory state.
 */
export function usePersistentState<T>(key: string, initial: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() =>
    read(key, typeof initial === 'function' ? (initial as () => T)() : initial)
  );
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(state));
    } catch {
      /* storage full or blocked — keep working in memory */
    }
  }, [key, state]);

  return [state, setState];
}

/** Removes every persisted Clean Lane key (all versions). */
export const clearPersistedState = () => {
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith('cleanlane:'))
      .forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
};
