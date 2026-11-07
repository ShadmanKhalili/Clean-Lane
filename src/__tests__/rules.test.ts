import { describe, expect, it } from 'vitest';
import {
  assessScaleReading,
  computePointBalances,
  isOverTolerance,
  pointsForWeight,
  releasePendingHolds
} from '../domain/rules';
import type { PointsLedgerEntry } from '../types';

const entry = (over: Partial<PointsLedgerEntry>): PointsLedgerEntry => ({
  id: Math.random().toString(36),
  customerId: 'C1',
  timestamp: '2026-01-01T00:00:00Z',
  ruleVersion: 'TEST',
  sourceEvent: 'TEST',
  description: '',
  type: 'CREDIT',
  amount: 0,
  status: 'AVAILABLE',
  ...over
});

describe('assessScaleReading', () => {
  it('accepts readings within ±5%', () => {
    expect(assessScaleReading(10, 10.5)).toMatchObject({ deltaPercent: 5, isDiscrepant: false });
    expect(assessScaleReading(10, 9.5)).toMatchObject({ deltaPercent: -5, isDiscrepant: false });
  });

  it('flags readings beyond the tolerance in either direction', () => {
    expect(assessScaleReading(15, 13.8)).toMatchObject({ deltaPercent: -8, isDiscrepant: true });
    expect(assessScaleReading(10, 10.6).isDiscrepant).toBe(true);
  });

  it('never returns Infinity/NaN for a zero field weight', () => {
    expect(assessScaleReading(0, 4)).toMatchObject({ deltaPercent: 100, isDiscrepant: true });
    expect(assessScaleReading(0, 0)).toMatchObject({ deltaPercent: 0, isDiscrepant: false });
  });
});

describe('isOverTolerance', () => {
  it('treats missing values as not discrepant', () => {
    expect(isOverTolerance(undefined)).toBe(false);
    expect(isOverTolerance(NaN)).toBe(false);
    expect(isOverTolerance(-5.1)).toBe(true);
  });
});

describe('pointsForWeight', () => {
  it('uses channel-specific rates and never goes negative', () => {
    expect(pointsForWeight(10)).toBe(450);
    expect(pointsForWeight(10, 'dropOff')).toBe(500);
    expect(pointsForWeight(-3)).toBe(0);
  });
});

describe('computePointBalances', () => {
  it('subtracts redemptions from the available balance (regression)', () => {
    const ledger = [
      entry({ amount: 470 }),
      entry({ type: 'DEBIT', amount: -400, status: 'REDEEMED' })
    ];
    expect(computePointBalances(ledger, 'C1').available).toBe(70);
  });

  it('locks reserved points immediately and restores them on refund', () => {
    const ledger = [
      entry({ amount: 470 }),
      entry({ type: 'DEBIT', amount: -400, status: 'RESERVED' }),
      entry({ type: 'CREDIT', amount: 400, status: 'AVAILABLE' })
    ];
    expect(computePointBalances(ledger, 'C1').available).toBe(470);
  });

  it('keeps pending holds out of the spendable balance', () => {
    const ledger = [entry({ amount: 100 }), entry({ type: 'PENDING_HOLD', amount: 175, status: 'PENDING' })];
    expect(computePointBalances(ledger, 'C1')).toEqual({ available: 100, pending: 175 });
  });

  it('ignores other customers', () => {
    expect(computePointBalances([entry({ customerId: 'C2', amount: 999 })], 'C1').available).toBe(0);
  });
});

describe('releasePendingHolds', () => {
  it('settles only the matching booking hold', () => {
    const ledger = [
      entry({ type: 'PENDING_HOLD', amount: 150, status: 'PENDING', linkedBookingId: 'B1' }),
      entry({ type: 'PENDING_HOLD', amount: 175, status: 'PENDING', linkedBookingId: 'B2' })
    ];
    expect(computePointBalances(releasePendingHolds(ledger, 'B1'), 'C1').pending).toBe(175);
  });
});

import { isWithinReminderWindow } from '../services/notificationService';
import { canHandOverToHub, intakeLots, isReadyForProcessing, isReadyToSort } from '../domain/lots';
import type { MaterialLot } from '../types';

describe('isWithinReminderWindow', () => {
  const now = new Date('2026-11-07T10:00:00');
  it('fires only for today or tomorrow', () => {
    expect(isWithinReminderWindow('2026-11-07', now)).toBe(true);
    expect(isWithinReminderWindow('2026-11-08', now)).toBe(true);
    expect(isWithinReminderWindow('2026-11-10', now)).toBe(false);
    expect(isWithinReminderWindow('2026-11-01', now)).toBe(false);
  });
});

describe('lot lifecycle', () => {
  const base: MaterialLot = {
    id: 'L1',
    material: 'PET_BOTTLES',
    primaryCollector: 'X',
    initialFieldWeightKg: 10,
    currentCustodian: 'COLLECTOR',
    location: '',
    evidenceLevel: 'E1',
    createdAt: '',
    updatedAt: ''
  };
  const atHub: MaterialLot = { ...base, currentCustodian: 'AGGREGATION_HUB', evidenceLevel: 'E2', verifiedHubWeightKg: 10 };
  const parent: MaterialLot = { ...atHub, childLotIds: ['C1'] };
  const child: MaterialLot = { ...atHub, id: 'C1', parentLotId: 'L1', initialFieldWeightKg: 9 };

  it('allows a single hub handover', () => {
    expect(canHandOverToHub(base)).toBe(true);
    expect(canHandOverToHub(atHub)).toBe(false);
  });

  it('never re-sorts a sorted lot or its outputs', () => {
    expect(isReadyToSort(atHub)).toBe(true);
    expect(isReadyToSort(parent)).toBe(false);
    expect(isReadyToSort(child)).toBe(false);
  });

  it('processes only leaf lots, once', () => {
    expect(isReadyForProcessing(parent, [])).toBe(false);
    expect(isReadyForProcessing(child, [])).toBe(true);
    expect(isReadyForProcessing(child, [{ lotId: 'C1' } as never])).toBe(false);
  });

  it('excludes sorting outputs from intake totals', () => {
    expect(intakeLots([parent, child]).map((l) => l.id)).toEqual(['L1']);
  });
});

import { bandMidpointKg, estimateHeldPoints } from '../domain/rules';

describe('held points estimate', () => {
  it('parses common band formats', () => {
    expect(bandMidpointKg('2-5 kg')).toBe(3.5);
    expect(bandMidpointKg('5–15 kg')).toBe(10);
    expect(bandMidpointKg('3.5 kg (Drop-off scale)')).toBe(3.5);
    expect(bandMidpointKg('unknown')).toBe(0);
  });
  it('sums bands at the doorstep rate', () => {
    expect(estimateHeldPoints([{ approximateBandKg: '2-5 kg' }, { approximateBandKg: '1-3 kg' }])).toBe(248);
  });
});

import { pointsToTaka, takaPerPoint } from '../domain/rules';
import { customerJourney } from '../design/journey';
import type { Booking } from '../types';

describe('points to taka', () => {
  const rewards = [
    { title: '৳250 Grocery Voucher', pointsCost: 400 },
    { title: '৳100 Mobile Airtime', pointsCost: 180 },
    { title: 'Sponsor a solar lamp', pointsCost: 600 }
  ];
  it('uses the least generous catalogue rate and ignores non-taka rewards', () => {
    expect(takaPerPoint(rewards)).toBeCloseTo(100 / 180);
    expect(pointsToTaka(470, rewards)).toBe(261);
    expect(pointsToTaka(470, [{ title: 'Lamp', pointsCost: 10 }])).toBeNull();
  });
});

describe('customerJourney', () => {
  const b = (status: Booking['status']) => ({ id: 'B', status, createdAt: '2026-11-01T10:00:00Z' }) as Booking;
  it('maps booking status to plain-language stops', () => {
    const j = customerJourney(b('EN_ROUTE'));
    expect(j.stops.map((s) => s.state)).toEqual(['done', 'current', 'todo', 'todo', 'todo', 'todo']);
    expect(j.stops[1].hintEn).toMatch(/on the way/);
    expect(customerJourney(b('QUANTITY_CONFIRMED')).stops[3].state).toBe('current');
    expect(customerJourney(b('PROCESSED')).stops.every((s) => s.state === 'done')).toBe(true);
    expect(customerJourney(b('CANCELLED')).outcome).toBe('cancelled');
    expect(customerJourney(b('QUANTITY_UNDER_REVIEW')).stops[2]).toMatchObject({ state: 'current', hintEn: expect.stringMatching(/checking/) });
  });
});
