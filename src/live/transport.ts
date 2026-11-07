import { normaliseBooking, type LiveBooking } from './model';

/**
 * How live rooms are synced. Two interchangeable implementations:
 * - firebase: Firebase Realtime Database; works across phones in the room.
 * - local:    BroadcastChannel + localStorage; works across tabs/windows on one
 *             device. Used for development and as the offline backup on stage.
 */
export interface LiveTransport {
  readonly kind: 'firebase' | 'local';
  subscribe(room: string, onChange: (bookings: LiveBooking[]) => void, onError?: (e: Error) => void): () => void;
  save(room: string, booking: LiveBooking): Promise<void>;
  reset(room: string): Promise<void>;
  /** Fires with the current connection state, then on every change. */
  watchConnection(onChange: (connected: boolean) => void): () => void;
}

export const sortBookings = (list: LiveBooking[]) => [...list].sort((a, b) => a.createdAt - b.createdAt);

/** Firebase rejects `undefined`; JSON round-trip drops those keys. */
export const toWire = (b: LiveBooking) => JSON.parse(JSON.stringify(b)) as LiveBooking;

// ---------------------------------------------------------------- local

const storageKey = (room: string) => `cleanlane:live:${room}`;

const readLocal = (room: string): Record<string, LiveBooking> => {
  try {
    return JSON.parse(window.localStorage.getItem(storageKey(room)) ?? '{}');
  } catch {
    return {};
  }
};

export const createLocalTransport = (): LiveTransport => {
  const channels = new Map<string, BroadcastChannel | null>();
  const channel = (room: string) => {
    if (!channels.has(room)) {
      channels.set(room, typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(`cleanlane-live-${room}`));
    }
    return channels.get(room) ?? null;
  };
  const write = (room: string, data: Record<string, LiveBooking>) => {
    try {
      window.localStorage.setItem(storageKey(room), JSON.stringify(data));
    } catch {
      /* storage blocked — tabs still sync via the broadcast payload */
    }
    channel(room)?.postMessage(data);
  };

  return {
    kind: 'local',
    subscribe(room, onChange) {
      const emit = (data: Record<string, LiveBooking>) =>
        onChange(sortBookings(Object.values(data).map(normaliseBooking).filter((b): b is LiveBooking => !!b)));
      emit(readLocal(room));
      const ch = channel(room);
      const onMsg = (e: MessageEvent) => emit(e.data ?? {});
      const onStorage = (e: StorageEvent) => e.key === storageKey(room) && emit(readLocal(room));
      ch?.addEventListener('message', onMsg);
      window.addEventListener('storage', onStorage);
      return () => {
        ch?.removeEventListener('message', onMsg);
        window.removeEventListener('storage', onStorage);
      };
    },
    async save(room, booking) {
      const data = { ...readLocal(room), [booking.id]: toWire(booking) };
      write(room, data);
      // BroadcastChannel does not echo to the sender; notify this tab too.
      window.dispatchEvent(new StorageEvent('storage', { key: storageKey(room) }));
    },
    async reset(room) {
      write(room, {});
      window.dispatchEvent(new StorageEvent('storage', { key: storageKey(room) }));
    },
    watchConnection(onChange) {
      onChange(true);
      return () => {};
    }
  };
};

// ---------------------------------------------------------------- firebase

export const firebaseConfig = () => {
  const env = import.meta.env;
  const cfg = {
    apiKey: env.VITE_FIREBASE_API_KEY as string | undefined,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
    databaseURL: env.VITE_FIREBASE_DATABASE_URL as string | undefined,
    projectId: env.VITE_FIREBASE_PROJECT_ID as string | undefined,
    appId: env.VITE_FIREBASE_APP_ID as string | undefined
  };
  return cfg.apiKey && cfg.databaseURL && cfg.projectId ? cfg : null;
};

export const isFirebaseConfigured = () => firebaseConfig() !== null;

export const createFirebaseTransport = (): LiveTransport => {
  const cfg = firebaseConfig();
  if (!cfg) throw new Error('Firebase is not configured (VITE_FIREBASE_* env vars).');

  // Loaded on first use so the SDK stays out of the main bundle.
  const sdk = (async () => {
    const [{ initializeApp, getApps }, db] = await Promise.all([import('firebase/app'), import('firebase/database')]);
    const app = getApps()[0] ?? initializeApp(cfg);
    const database = db.getDatabase(app);
    if (import.meta.env.VITE_FIREBASE_EMULATOR_HOST) {
      const [host, port] = String(import.meta.env.VITE_FIREBASE_EMULATOR_HOST).split(':');
      db.connectDatabaseEmulator(database, host, Number(port || 9000));
    }
    return { db, database };
  })();

  const roomRef = async (room: string, path = '') => {
    const { db, database } = await sdk;
    return { db, ref: db.ref(database, `rooms/${room}${path}`) };
  };

  return {
    kind: 'firebase',
    subscribe(room, onChange, onError) {
      let off: (() => void) | undefined;
      let cancelled = false;
      roomRef(room, '/bookings')
        .then(({ db, ref }) => {
          if (cancelled) return;
          off = db.onValue(
            ref,
            (snap) => {
              const val = (snap.val() ?? {}) as Record<string, unknown>;
              onChange(sortBookings(Object.values(val).map(normaliseBooking).filter((b): b is LiveBooking => !!b)));
            },
            (err) => onError?.(err)
          );
        })
        .catch((e) => onError?.(e));
      return () => {
        cancelled = true;
        off?.();
      };
    },
    async save(room, booking) {
      const { db, ref } = await roomRef(room, `/bookings/${booking.id}`);
      await db.set(ref, toWire(booking));
    },
    async reset(room) {
      const { db, ref } = await roomRef(room, '/bookings');
      await db.remove(ref);
    },
    watchConnection(onChange) {
      let off: (() => void) | undefined;
      let cancelled = false;
      sdk.then(({ db, database }) => {
        if (cancelled) return;
        off = db.onValue(db.ref(database, '.info/connected'), (snap) => onChange(snap.val() === true));
      });
      return () => {
        cancelled = true;
        off?.();
      };
    }
  };
};
