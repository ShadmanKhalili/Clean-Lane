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
