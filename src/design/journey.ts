import type { Booking, CustodyEvent, MaterialLot } from '../types';

/**
 * The customer-facing journey of a pickup, in plain language. Evidence levels
 * (E0–E5) stay available as `tag` for staff and brand views only.
 */
export type StopState = 'done' | 'current' | 'todo';

export interface JourneyStop {
  id: 'booked' | 'picked_up' | 'weighed' | 'sorted' | 'recycled' | 'made_new';
  en: string;
  bn: string;
  /** Short helper line under the current stop. */
  hintEn?: string;
  hintBn?: string;
  tag: string;
  state: StopState;
  at?: string;
}

const STOPS: Omit<JourneyStop, 'state' | 'at'>[] = [
  { id: 'booked', en: 'Booked', bn: 'বুক হয়েছে', tag: 'E0' },
  { id: 'picked_up', en: 'Picked up', bn: 'সংগ্রহ হয়েছে', tag: 'E1' },
  { id: 'weighed', en: 'Weighed at the hub', bn: 'হাবে ওজন হয়েছে', tag: 'E2' },
  { id: 'sorted', en: 'Sorted & sent on', bn: 'বাছাই করে পাঠানো', tag: 'E3' },
  { id: 'recycled', en: 'Recycled', bn: 'রিসাইকেল হয়েছে', tag: 'E4' },
  { id: 'made_new', en: 'Ready to become something new', bn: 'নতুন কিছু হওয়ার পথে', tag: 'E4' }
];

export type JourneyOutcome = 'active' | 'complete' | 'cancelled' | 'missed' | 'under_review' | 'disputed';

export interface CustomerJourney {
  stops: JourneyStop[];
  outcome: JourneyOutcome;
  /** Index of the current stop (or last done stop when complete). */
  index: number;
}

/** How far a booking has got, as an index into STOPS (the stop now in progress). */
const progressIndex = (b: Booking): number => {
  switch (b.status) {
    case 'REQUESTED':
    case 'CONFIRMED':
    case 'COLLECTOR_ASSIGNED':
    case 'EN_ROUTE':
      return 1; // booked is done, waiting for pickup
    case 'COLLECTED':
    case 'QUANTITY_UNDER_REVIEW':
      return 2;
    case 'QUANTITY_CONFIRMED':
      return 3;
    case 'ENTERED_RECOVERY_CHAIN':
      return 4;
    case 'PROCESSED':
      return STOPS.length; // all done
    default:
      return 1;
  }
};

/**
 * Builds the journey for a booking. Timestamps come from the custody records
 * of lots that originated from this booking, when they exist.
 */
export const customerJourney = (b: Booking, lots: MaterialLot[] = [], events: CustodyEvent[] = []): CustomerJourney => {
  const lotIds = new Set(lots.filter((l) => l.sourceBookingId === b.id).map((l) => l.id));
  const evs = events.filter((e) => lotIds.has(e.lotId)).sort((x, y) => (x.timestamp < y.timestamp ? -1 : 1));
  const atFor = (tag: string) => evs.find((e) => e.evidenceLevelResult === tag)?.timestamp;

  const outcome: JourneyOutcome =
    b.status === 'CANCELLED' ? 'cancelled'
    : b.status === 'MISSED' ? 'missed'
    : b.status === 'DISPUTED' ? 'disputed'
    : b.status === 'QUANTITY_UNDER_REVIEW' ? 'under_review'
    : b.status === 'PROCESSED' ? 'complete'
    : 'active';

  const idx = progressIndex(b);
  const stops = STOPS.map((s, i): JourneyStop => {
    const state: StopState = i < idx ? 'done' : i === idx && outcome === 'active' ? 'current' : i === idx && outcome === 'under_review' ? 'current' : 'todo';
    const at = s.id === 'booked' ? b.createdAt : s.id === 'made_new' ? undefined : atFor(s.tag);
    return { ...s, state, at: state === 'todo' ? undefined : at };
  });

  const current = stops.find((s) => s.state === 'current');
  if (current?.id === 'picked_up' && (b.status === 'COLLECTOR_ASSIGNED' || b.status === 'EN_ROUTE')) {
    current.hintEn = 'Your collector is on the way';
    current.hintBn = 'আপনার সংগ্রাহক আসছেন';
  }
  if (current?.id === 'weighed' && outcome === 'under_review') {
    current.hintEn = 'Door and hub weights differ — a person is checking';
    current.hintBn = 'দরজা ও হাবের ওজনে পার্থক্য — একজন যাচাই করছেন';
  }
  return { stops, outcome, index: Math.min(idx, STOPS.length - 1) };
};
