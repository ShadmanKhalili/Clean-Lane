import type { PointsLedgerEntry } from '../types';

/**
 * Clean Lane business rules, kept free of React so they can be unit-tested and
 * shared by every screen that displays or enforces them.
 */

/** Field-vs-hub weight variance (in %) above which a lot is flagged for review. */
export const SCALE_TOLERANCE_PERCENT = 5;

/** Reward and payout rates, rule-set RULES_V1.2_GULSHAN_CLEANLANE. */
export const RATES = {
  doorstepPointsPerKg: 45,
  /** Walk-in drop-off earns more: the resident does the transport. */
  dropOffPointsPerKg: 50,
  materialPayoutBdtPerKg: 30
} as const;

export const pointsForWeight = (kg: number, channel: 'doorstep' | 'dropOff' = 'doorstep') =>
  Math.max(0, Math.round(kg * (channel === 'doorstep' ? RATES.doorstepPointsPerKg : RATES.dropOffPointsPerKg)));

export const payoutForWeight = (kg: number) => Math.max(0, Math.round(kg * RATES.materialPayoutBdtPerKg));

export interface ScaleAssessment {
  deltaKg: number;
  /** Signed, rounded to one decimal. Negative = hub weighed less than the field. */
  deltaPercent: number;
  isDiscrepant: boolean;
}

export const isOverTolerance = (deltaPercent: number | undefined | null): boolean =>
  typeof deltaPercent === 'number' && Number.isFinite(deltaPercent) && Math.abs(deltaPercent) > SCALE_TOLERANCE_PERCENT;

/**
 * Compares the doorstep (field) weight with the certified hub scale.
 * A zero/unknown field weight cannot produce a meaningful percentage, so any
 * non-zero hub reading is treated as a 100% variance rather than `Infinity`/`NaN`.
 */
export const assessScaleReading = (fieldKg: number, hubKg: number): ScaleAssessment => {
  const deltaKg = Number((hubKg - fieldKg).toFixed(2));
  let deltaPercent: number;
  if (!fieldKg || fieldKg <= 0) deltaPercent = hubKg > 0 ? 100 : 0;
  else deltaPercent = Number(((deltaKg / fieldKg) * 100).toFixed(1));
  return { deltaKg, deltaPercent, isDiscrepant: isOverTolerance(deltaPercent) };
};

export interface PointBalances {
  /** Spendable now: settled credits minus every debit (including reservations). */
  available: number;
  /** Awaiting hub verification — shown, but not spendable. */
  pending: number;
}

/**
 * Ledger semantics:
 * - CREDIT with status AVAILABLE adds to the spendable balance.
 * - DEBIT / REVERSAL entries always reduce it, whatever their lifecycle status
 *   (RESERVED, REDEEMED, REVERSED) — a reservation must lock points immediately.
 * - PENDING_HOLD entries with status PENDING are the "pending" bucket only.
 */
export const computePointBalances = (ledger: PointsLedgerEntry[], customerId: string): PointBalances => {
  let available = 0;
  let pending = 0;
  for (const entry of ledger) {
    if (entry.customerId !== customerId) continue;
    if (entry.type === 'PENDING_HOLD') {
      if (entry.status === 'PENDING') pending += entry.amount;
      continue;
    }
    if (entry.type === 'DEBIT' || entry.type === 'REVERSAL') {
      available -= Math.abs(entry.amount);
      continue;
    }
    if (entry.type === 'CREDIT' && entry.status === 'AVAILABLE') available += entry.amount;
  }
  return { available, pending };
};

/** Marks a booking's pending hold as settled once its real credit is issued. */
export const releasePendingHolds = (
  ledger: PointsLedgerEntry[],
  bookingId: string,
  note = 'settled by hub scale confirmation'
): PointsLedgerEntry[] =>
  ledger.map((e) =>
    e.type === 'PENDING_HOLD' && e.status === 'PENDING' && e.linkedBookingId === bookingId
      ? { ...e, status: 'REVERSED' as const, description: `${e.description} (${note})` }
      : e
  );

/**
 * Midpoint of a weight band such as "2-5 kg", "5–15 kg", "<2 kg", "15+ kg" or "3.5 kg".
 * Unparseable bands count as 0 so an estimate never invents weight.
 */
export const bandMidpointKg = (band: string): number => {
  const nums = (band.match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
  if (nums.length === 0) return 0;
  if (nums.length >= 2) return (nums[0] + nums[1]) / 2;
  return nums[0];
};

/** Points held while a booking awaits hub verification: estimated weight x doorstep rate. */
export const estimateHeldPoints = (bands: { approximateBandKg: string }[]): number =>
  pointsForWeight(bands.reduce((a, m) => a + bandMidpointKg(m.approximateBandKg), 0));

/**
 * Taka value of points, for "worth ≈ ৳X" copy. Derived from the reward
 * catalogue (titles like "৳250 … Voucher" with a points cost), using the LEAST
 * generous rate so the app never over-promises.
 */
export const takaPerPoint = (rewards: { title: string; pointsCost: number }[]): number | null => {
  const rates = rewards
    .map((r) => {
      const m = /৳\s?([\d,]+)/.exec(r.title);
      const taka = m ? Number(m[1].replace(/,/g, '')) : NaN;
      return taka > 0 && r.pointsCost > 0 ? taka / r.pointsCost : NaN;
    })
    .filter((x) => Number.isFinite(x));
  return rates.length ? Math.min(...rates) : null;
};

export const pointsToTaka = (points: number, rewards: { title: string; pointsCost: number }[]): number | null => {
  const rate = takaPerPoint(rewards);
  return rate === null ? null : Math.floor(Math.max(0, points) * rate);
};
