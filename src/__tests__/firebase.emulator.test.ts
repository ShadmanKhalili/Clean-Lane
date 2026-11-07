/**
 * Runs only against the Firebase Realtime Database emulator:
 *   FIREBASE_EMULATOR=127.0.0.1:9000 npx vitest run firebase.emulator
 * (start it with `npx firebase-tools emulators:start --only database --project demo-cleanlane`).
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { deleteApp, initializeApp, type FirebaseApp } from 'firebase/app';
import { connectDatabaseEmulator, getDatabase, onValue, ref, remove, set } from 'firebase/database';
import { advance, createLiveBooking, normaliseBooking, verifyLiveChain, type LiveBooking } from '../live/model';
import { toWire } from '../live/transport';

const host = process.env.FIREBASE_EMULATOR;
const suite = host ? describe : describe.skip;

suite('Firebase realtime sync + security rules (emulator)', () => {
  const apps: FirebaseApp[] = [];
  const client = (name: string) => {
    const app = initializeApp({ projectId: 'demo-cleanlane', databaseURL: `http://${host}?ns=demo-cleanlane-default-rtdb` }, name);
    apps.push(app);
    const db = getDatabase(app);
    const [h, p] = host!.split(':');
    connectDatabaseEmulator(db, h, Number(p));
    return db;
  };
  // Created in beforeAll: a skipped describe still runs its body during collection.
  let audience: ReturnType<typeof getDatabase>;
  let presenter: ReturnType<typeof getDatabase>;
  const ROOM = 'TEST';

  beforeAll(() => {
    audience = client('audience');
    presenter = client('presenter');
  });

  afterAll(async () => {
    await remove(ref(presenter, `rooms/${ROOM}/bookings`));
    await Promise.all(apps.map((a) => deleteApp(a)));
  });

  it('syncs a booking from one client to another through the whole journey', async () => {
    let b = createLiveBooking({ name: 'Nasreen', area: 'gulshan', materials: ['PET_BOTTLES', 'CARDBOARD_OCC'] });
    const seen: LiveBooking[] = [];
    const done = new Promise<void>((resolve) => {
      const off = onValue(ref(presenter, `rooms/${ROOM}/bookings/${b.id}`), (snap) => {
        const got = normaliseBooking(snap.val());
        if (got) seen.push(got);
        if (got?.stage === 'recycled') {
          off();
          resolve();
        }
      });
    });
    await set(ref(audience, `rooms/${ROOM}/bookings/${b.id}`), toWire(b));
    for (const step of [
      { type: 'accept', collector: 'Tariq' },
      { type: 'collect', weightKg: 7.5 },
      { type: 'verify' },
      { type: 'dispatch' },
      { type: 'recycle' }
    ] as const) {
      b = advance(b, step);
      await set(ref(audience, `rooms/${ROOM}/bookings/${b.id}`), toWire(b));
    }
    await done;
    const final = seen[seen.length - 1];
    expect(final.chain).toHaveLength(6);
    expect(final.materials).toEqual(['PET_BOTTLES', 'CARDBOARD_OCC']);
    expect(verifyLiveChain(final).ok).toBe(true);
  });

  it('rejects writes that break the rules', async () => {
    const good = toWire(createLiveBooking({ name: 'Rafi', area: 'banani', materials: ['PET_BOTTLES'] }));
    const path = (id: string, room = ROOM) => ref(audience, `rooms/${room}/bookings/${id}`);
    await expect(set(path(good.id), { ...good, stage: 'teleported' })).rejects.toThrow(/permission/i);
    await expect(set(path(good.id), { ...good, name: 'x'.repeat(200) })).rejects.toThrow(/permission/i);
    await expect(set(path(good.id), { ...good, isAdmin: true })).rejects.toThrow(/permission/i);
    await expect(set(path('LV-NOPE!!'), { ...good, id: 'LV-NOPE!!' })).rejects.toThrow(/permission/i);
    await expect(set(path(good.id, 'lowercase'), good)).rejects.toThrow(/permission/i);
    await expect(set(ref(audience, 'secrets/x'), 1)).rejects.toThrow(/permission/i);
    await expect(set(path(good.id), good)).resolves.toBeUndefined();
  });
});
