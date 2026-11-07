import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AREA_IDS, advance, createLiveBooking, type AreaId, type LiveAction, type LiveBooking } from './model';
import { createFirebaseTransport, createLocalTransport, isFirebaseConfigured, type LiveTransport } from './transport';
import type { MaterialCategory } from '../types';

export type TransportChoice = 'auto' | 'firebase' | 'local';

const transports: Partial<Record<'firebase' | 'local', LiveTransport>> = {};

/** `?transport=local` forces the offline backup; otherwise Firebase when configured. */
export const resolveTransport = (choice: TransportChoice = 'auto'): LiveTransport => {
  const fromUrl = new URLSearchParams(window.location.search).get('transport');
  const want = choice !== 'auto' ? choice : fromUrl === 'local' || fromUrl === 'firebase' ? fromUrl : 'auto';
  const kind = want === 'local' || (want === 'auto' && !isFirebaseConfigured()) ? 'local' : 'firebase';
  if (kind === 'firebase' && !isFirebaseConfigured()) return (transports.local ??= createLocalTransport());
  return (transports[kind] ??= kind === 'firebase' ? createFirebaseTransport() : createLocalTransport());
};

export interface LiveRoom {
  bookings: LiveBooking[];
  transport: LiveTransport['kind'];
  connected: boolean;
  error: string | null;
  book: (input: { name: string; area: AreaId; materials: MaterialCategory[]; simulated?: boolean }) => Promise<LiveBooking>;
  act: (bookingId: string, action: LiveAction) => Promise<LiveBooking | null>;
  reset: () => Promise<void>;
}

export const useLiveRoom = (room: string | null, choice: TransportChoice = 'auto'): LiveRoom => {
  const transport = useMemo(() => resolveTransport(choice), [choice]);
  const [bookings, setBookings] = useState<LiveBooking[]>([]);
  const [connected, setConnected] = useState(transport.kind === 'local');
  const [error, setError] = useState<string | null>(null);
  const latest = useRef<LiveBooking[]>([]);
  latest.current = bookings;

  useEffect(() => {
    if (!room) return;
    setError(null);
    const offData = transport.subscribe(room, setBookings, (e) => setError(e.message));
    const offConn = transport.watchConnection(setConnected);
    return () => {
      offData();
      offConn();
    };
  }, [room, transport]);

  const book = useCallback<LiveRoom['book']>(
    async (input) => {
      if (!room) throw new Error('No room');
      const b = createLiveBooking(input);
      await transport.save(room, b);
      return b;
    },
    [room, transport]
  );

  const act = useCallback<LiveRoom['act']>(
    async (bookingId, action) => {
      if (!room) return null;
      const current = latest.current.find((b) => b.id === bookingId);
      if (!current) return null;
      const next = advance(current, action);
      if (next === current) return null;
      await transport.save(room, next);
      return next;
    },
    [room, transport]
  );

  const reset = useCallback(async () => {
    if (room) await transport.reset(room);
  }, [room, transport]);

  return { bookings, transport: transport.kind, connected, error, book, act, reset };
};

// ------------------------------------------------------------ simulator

const NAMES = ['Nasreen', 'Rafi', 'Tania', 'Imran', 'Sadia', 'Arif', 'Mitu', 'Shuvo', 'Farhana', 'Kamal', 'Nusrat', 'Tanvir', 'Rumana', 'Sabbir', 'Lamia', 'Jamil'];
const MATERIAL_MIXES: MaterialCategory[][] = [
  ['PET_BOTTLES'],
  ['PET_BOTTLES', 'CARDBOARD_OCC'],
  ['CARDBOARD_OCC'],
  ['ALUMINUM_CANS', 'PET_BOTTLES'],
  ['HDPE_RIGID', 'PET_BOTTLES'],
  ['TETRAPAK_BEVERAGE', 'CARDBOARD_OCC']
];
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
const SIM_COLLECTORS = ['Rahim', 'Jahid', 'Babul'];

/**
 * Keeps the stage alive: books simulated households and walks simulated (only)
 * bookings through the journey. Real audience bookings are never touched — the
 * presenter's collector phone handles those.
 */
export const useAudienceSimulator = (live: LiveRoom, enabled: boolean, intervalMs = 5000) => {
  const liveRef = useRef(live);
  liveRef.current = live;

  useEffect(() => {
    if (!enabled) return;
    const tick = () => {
      const { bookings, book, act } = liveRef.current;
      const sims = bookings.filter((b) => b.simulated);
      const movable = sims.filter((b) => b.stage !== 'recycled');
      if (sims.length < 24 && (movable.length < 4 || Math.random() < 0.45)) {
        void book({ name: pick(NAMES), area: pick(AREA_IDS), materials: pick(MATERIAL_MIXES), simulated: true });
        return;
      }
      const b = pick(movable);
      if (!b) return;
      const step: LiveAction | null =
        b.stage === 'booked' ? { type: 'accept', collector: pick(SIM_COLLECTORS) }
        : b.stage === 'accepted' ? { type: 'collect', weightKg: 2 + Math.random() * 9 }
        : b.stage === 'collected' ? { type: 'verify' }
        : b.stage === 'verified' ? { type: 'dispatch' }
        : b.stage === 'dispatched' ? { type: 'recycle' }
        : null;
      if (step) void act(b.id, step);
    };
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [enabled, intervalMs]);
};
