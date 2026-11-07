import type { Booking, CustomerRedemption, PointsLedgerEntry } from '../../types';

type Lang = 'en' | 'bn';

const BOOKING_STATUS: Record<Booking['status'], { en: string; bn: string; tone: 'info' | 'ok' | 'warn' | 'muted' }> = {
  REQUESTED: { en: 'Requested', bn: 'অনুরোধ গৃহীত', tone: 'info' },
  CONFIRMED: { en: 'Confirmed', bn: 'নিশ্চিত', tone: 'info' },
  COLLECTOR_ASSIGNED: { en: 'Collector assigned', bn: 'সংগ্রাহক নির্ধারিত', tone: 'info' },
  EN_ROUTE: { en: 'Collector on the way', bn: 'সংগ্রাহক পথে', tone: 'info' },
  COLLECTED: { en: 'Collected', bn: 'সংগৃহীত', tone: 'ok' },
  QUANTITY_UNDER_REVIEW: { en: 'Under scale check', bn: 'স্কেল যাচাই চলছে', tone: 'warn' },
  QUANTITY_CONFIRMED: { en: 'Quantity confirmed', bn: 'ওজন নিশ্চিত', tone: 'ok' },
  ENTERED_RECOVERY_CHAIN: { en: 'In recovery chain', bn: 'রিকভারি চেইনে', tone: 'ok' },
  PROCESSED: { en: 'Processed', bn: 'প্রক্রিয়াজাত', tone: 'ok' },
  CANCELLED: { en: 'Cancelled', bn: 'বাতিল', tone: 'muted' },
  MISSED: { en: 'Missed', bn: 'ছুটে গেছে', tone: 'warn' },
  DISPUTED: { en: 'Under review', bn: 'পর্যালোচনাধীন', tone: 'warn' }
};

const TONE_CLASS = {
  info: 'bg-sky-100 text-sky-800',
  ok: 'bg-emerald-100 text-emerald-800',
  warn: 'bg-amber-100 text-amber-900',
  muted: 'bg-slate-200 text-slate-700'
} as const;

export const bookingStatusLabel = (status: Booking['status'], lang: Lang): string => BOOKING_STATUS[status]?.[lang] ?? status;
export const bookingStatusClass = (status: Booking['status']): string => TONE_CLASS[BOOKING_STATUS[status]?.tone ?? 'muted'];

export const MATERIAL_SHORT: Record<string, { en: string; bn: string }> = {
  PET_BOTTLES: { en: 'Plastic bottles', bn: 'প্লাস্টিক বোতল' },
  HDPE_RIGID: { en: 'Rigid containers', bn: 'কঠিন প্লাস্টিক' },
  CARDBOARD_OCC: { en: 'Paper & cardboard', bn: 'কাগজ ও কার্টন' },
  ALUMINUM_CANS: { en: 'Cans & metal', bn: 'ক্যান ও ধাতু' },
  LDPE_FILM: { en: 'Plastic film', bn: 'প্লাস্টিক ফিল্ম' },
  TETRAPAK_BEVERAGE: { en: 'Drink cartons', bn: 'পানীয়ের কার্টন' }
};

export const materialLabel = (category: string, lang: Lang): string => MATERIAL_SHORT[category]?.[lang] ?? category.replace(/_/g, ' ');

/** Signed display amount for a ledger row: debits and reversals always read as negative. */
export const ledgerDelta = (e: PointsLedgerEntry): number => (e.type === 'DEBIT' || e.type === 'REVERSAL' ? -Math.abs(e.amount) : e.amount);

export const ledgerStatusLabel = (e: PointsLedgerEntry, lang: Lang): string => {
  if (e.type === 'PENDING_HOLD') {
    return e.status === 'PENDING' ? (lang === 'en' ? 'Pending' : 'যাচাইাধীন') : lang === 'en' ? 'Settled' : 'নিষ্পন্ন';
  }
  if (e.type === 'DEBIT') return lang === 'en' ? 'Spent' : 'ব্যয়িত';
  if (e.type === 'REVERSAL') return lang === 'en' ? 'Reversed' : 'প্রত্যাহৃত';
  return e.status === 'AVAILABLE' ? (lang === 'en' ? 'Available' : 'উপলব্ধ') : e.status;
};

export const redemptionStatusLabel = (r: CustomerRedemption, lang: Lang): string =>
  r.status === 'COMPLETED'
    ? lang === 'en'
      ? 'Ready to use'
      : 'ব্যবহারযোগ্য'
    : r.status === 'PENDING_FULFILLMENT'
    ? lang === 'en'
      ? 'Being prepared'
      : 'প্রস্তুত হচ্ছে'
    : lang === 'en'
    ? 'Refunded'
    : 'ফেরত দেওয়া হয়েছে';
