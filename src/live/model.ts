import type { MaterialCategory } from '../types';
import { GENESIS_HASH, linkHash, verifyChain, type ChainVerification } from '../domain/hashChain';
import { pointsForWeight } from '../domain/rules';

/**
 * Live pitch demo model: a "room" holds bookings made by audience phones in real
 * time. Kept independent of the main AppContext so it can be synced through a
 * backend (Firebase) without migrating the rest of the demo.
 */

export type AreaId =
  | 'uttara' | 'mirpur' | 'bashundhara' | 'baridhara' | 'gulshan' | 'banani' | 'mohakhali' | 'tejgaon' | 'dhanmondi' | 'motijheel';

/** Stylised map positions (viewBox 0 0 100 130, north up). Not survey-accurate. */
export const AREAS: Record<AreaId, { en: string; bn: string; x: number; y: number }> = {
  uttara: { en: 'Uttara', bn: 'উত্তরা', x: 52, y: 12 },
  mirpur: { en: 'Mirpur', bn: 'মিরপুর', x: 26, y: 44 },
  bashundhara: { en: 'Bashundhara', bn: 'বসুন্ধরা', x: 70, y: 38 },
  baridhara: { en: 'Baridhara', bn: 'বারিধারা', x: 64, y: 51 },
  gulshan: { en: 'Gulshan', bn: 'গুলশান', x: 59, y: 61 },
  banani: { en: 'Banani', bn: 'বনানী', x: 49, y: 56 },
  mohakhali: { en: 'Mohakhali', bn: 'মহাখালী', x: 46, y: 69 },
  tejgaon: { en: 'Tejgaon', bn: 'তেজগাঁও', x: 42, y: 81 },
  dhanmondi: { en: 'Dhanmondi', bn: 'ধানমন্ডি', x: 31, y: 96 },
  motijheel: { en: 'Motijheel', bn: 'মতিঝিল', x: 55, y: 110 }
};
export const AREA_IDS = Object.keys(AREAS) as AreaId[];

/** Where collected material goes on the map. */
export const HUB_POINT = { x: 57, y: 66, en: 'Gulshan Hub', bn: 'গুলশান হাব' };
export const MILL_POINT = { x: 6, y: 92, en: 'Recycling mill, Savar', bn: 'রিসাইক্লিং মিল, সাভার' };

/**
 * Journey stages, in order. Plain-language labels for the public; evidence
 * levels kept for operators and brands.
 */
export const STAGES = ['booked', 'accepted', 'collected', 'verified', 'dispatched', 'recycled'] as const;
export type LiveStage = (typeof STAGES)[number];

export const STAGE_INFO: Record<LiveStage, { en: string; bn: string; evidence: string }> = {
  booked: { en: 'Booked', bn: 'বুক হয়েছে', evidence: 'E0' },
  accepted: { en: 'Collector on the way', bn: 'সংগ্রাহক আসছেন', evidence: 'E0' },
  collected: { en: 'Picked up & weighed', bn: 'সংগ্রহ ও ওজন হয়েছে', evidence: 'E1' },
  verified: { en: 'Verified at hub scale', bn: 'হাবের স্কেলে যাচাই', evidence: 'E2' },
  dispatched: { en: 'Sent to recycler', bn: 'রিসাইক্লারে পাঠানো', evidence: 'E3' },
  recycled: { en: 'Recycled', bn: 'রিসাইকেল হয়েছে', evidence: 'E4' }
};

export const stageIndex = (s: LiveStage) => STAGES.indexOf(s);

export interface LiveChainEvent {
  seq: number;
  stage: LiveStage;
  at: string;
  actor: string;
  note: string;
  kg?: number;
  prevHash: string;
  hash: string;
}

export interface LiveBooking {
  id: string;
  name: string;
  area: AreaId;
  /** Map position (area centre + jitter so pins don't stack). */
  x: number;
  y: number;
  materials: MaterialCategory[];
  stage: LiveStage;
  collector?: string;
  /** Doorstep weight (E1). */
  weightKg?: number;
  /** Certified hub weight (E2). */
  hubWeightKg?: number;
  points?: number;
  createdAt: number;
  updatedAt: number;
  /** Created by the stage's audience simulator rather than a real phone. */
  simulated?: boolean;
  chain: LiveChainEvent[];
}

const payloadOf = (bookingId: string, e: Omit<LiveChainEvent, 'prevHash' | 'hash'>) => ({
  bookingId,
  seq: e.seq,
  stage: e.stage,
  at: e.at,
  actor: e.actor,
  note: e.note,
  kg: e.kg
});

const appendEvent = (b: LiveBooking, stage: LiveStage, actor: string, note: string, kg: number | undefined, now: number): LiveChainEvent[] => {
  const prev = b.chain[b.chain.length - 1];
  const base = { seq: b.chain.length, stage, at: new Date(now).toISOString(), actor, note, kg };
  const prevHash = prev?.hash ?? GENESIS_HASH;
  return [...b.chain, { ...base, prevHash, hash: linkHash(prevHash, payloadOf(b.id, base)) }];
};

const randomId = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
};

/** Short code shown to the audience; avoids look-alike characters. */
export const newRoomCode = () => randomId().slice(0, 4);

export const createLiveBooking = (
  input: { name: string; area: AreaId; materials: MaterialCategory[]; simulated?: boolean },
  now = Date.now()
): LiveBooking => {
  const a = AREAS[input.area];
  const jitter = () => (Math.random() - 0.5) * 7;
  const name = input.name.trim().slice(0, 24) || 'Guest';
  const b: LiveBooking = {
    id: `LV-${randomId()}`,
    name,
    area: input.area,
    x: Math.min(96, Math.max(4, a.x + jitter())),
    y: Math.min(126, Math.max(4, a.y + jitter())),
    materials: input.materials.length ? input.materials : ['PET_BOTTLES'],
    stage: 'booked',
    createdAt: now,
    updatedAt: now,
    simulated: input.simulated || undefined,
    chain: []
  };
  return { ...b, chain: appendEvent(b, 'booked', name, `Pickup requested in ${a.en}`, undefined, now) };
};

export type LiveAction =
  | { type: 'accept'; collector: string }
  | { type: 'collect'; weightKg: number }
  | { type: 'verify'; hubWeightKg?: number }
  | { type: 'dispatch' }
  | { type: 'recycle' };

const NEXT: Record<LiveAction['type'], LiveStage> = {
  accept: 'accepted',
  collect: 'collected',
  verify: 'verified',
  dispatch: 'dispatched',
  recycle: 'recycled'
};

/** Applies one step. Returns the booking unchanged if the step is out of order. */
export const advance = (b: LiveBooking, action: LiveAction, now = Date.now()): LiveBooking => {
  const target = NEXT[action.type];
  if (stageIndex(target) !== stageIndex(b.stage) + 1) return b;
  switch (action.type) {
    case 'accept':
      return { ...b, stage: target, collector: action.collector, updatedAt: now, chain: appendEvent(b, target, action.collector, 'Accepted the pickup', undefined, now) };
    case 'collect': {
      const kg = Math.round(Math.max(0.1, Math.min(200, action.weightKg)) * 10) / 10;
      return {
        ...b, stage: target, weightKg: kg, updatedAt: now,
        chain: appendEvent(b, target, b.collector ?? 'Collector', 'Weighed at the door on a portable scale', kg, now)
      };
    }
    case 'verify': {
      // Small, realistic moisture/tare loss unless a hub weight is given.
      const hubKg = Math.round((action.hubWeightKg ?? (b.weightKg ?? 0) * 0.97) * 10) / 10;
      return {
        ...b, stage: target, hubWeightKg: hubKg, points: pointsForWeight(hubKg), updatedAt: now,
        chain: appendEvent(b, target, 'Gulshan Hub weighmaster', 'Confirmed on certified hub scale', hubKg, now)
      };
    }
    case 'dispatch':
      return { ...b, stage: target, updatedAt: now, chain: appendEvent(b, target, 'Gulshan Hub', 'Baled and dispatched to recycler', b.hubWeightKg, now) };
    case 'recycle':
      return {
        ...b, stage: target, updatedAt: now,
        chain: appendEvent(b, target, 'Bengal Polymers & Flake Mill', 'Processed into recycled flake (certificate issued)', b.hubWeightKg, now)
      };
  }
};

export const verifyLiveChain = (b: LiveBooking, tamper?: (e: LiveChainEvent) => LiveChainEvent): ChainVerification => {
  const events = tamper ? b.chain.map(tamper) : b.chain;
  return verifyChain(events.map((e) => ({ payload: payloadOf(b.id, e), prevHash: e.prevHash, hash: e.hash })));
};

/** Firebase returns arrays as arrays or as index-keyed objects; normalise and validate. */
export const normaliseBooking = (raw: unknown): LiveBooking | null => {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || typeof r.stage !== 'string' || !(STAGES as readonly string[]).includes(r.stage)) return null;
  const toArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : v && typeof v === 'object' ? (Object.values(v) as T[]) : []);
  const chain = toArray<LiveChainEvent>(r.chain).filter(Boolean).sort((a, b) => a.seq - b.seq);
  return { ...(r as unknown as LiveBooking), materials: toArray<MaterialCategory>(r.materials), chain };
};

export interface RoomTotals {
  households: number;
  kg: number;
  points: number;
  verifiedKg: number;
}

export const roomTotals = (bookings: LiveBooking[]): RoomTotals => ({
  households: bookings.length,
  kg: Math.round(bookings.reduce((a, b) => a + (b.hubWeightKg ?? b.weightKg ?? 0), 0) * 10) / 10,
  points: bookings.reduce((a, b) => a + (b.points ?? 0), 0),
  verifiedKg: Math.round(bookings.reduce((a, b) => a + (b.hubWeightKg ?? 0), 0) * 10) / 10
});
