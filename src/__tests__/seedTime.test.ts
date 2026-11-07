import { describe, expect, it } from 'vitest';
import { rebaseSeed, seedDayOffset, SEED_ANCHOR_DATE } from '../utils/seedTime';

describe('seedDayOffset', () => {
  it('is zero on the anchor date and counts whole days', () => {
    expect(seedDayOffset(new Date(`${SEED_ANCHOR_DATE}T15:00:00`))).toBe(0);
    expect(seedDayOffset(new Date('2026-11-07T09:00:00'))).toBe(32);
  });
});

describe('rebaseSeed', () => {
  const seed = {
    id: 'CL-BK-2026-101',
    lot: 'LOT-2026-095-PET',
    scheduledDate: '2026-10-06',
    createdAt: '2026-10-05T14:30:00Z',
    title: 'Reminder: Collection tomorrow (2026-10-06)',
    calibration: 'Calibration Valid 2026-12',
    nested: [{ at: '2026-09-28T11:45:00Z' }],
    n: 4
  };

  it('shifts dates (whole-value and embedded) but not identifiers', () => {
    const out = rebaseSeed(seed, 32);
    expect(out.id).toBe('CL-BK-2026-101');
    expect(out.lot).toBe('LOT-2026-095-PET');
    expect(out.calibration).toBe('Calibration Valid 2026-12');
    expect(out.scheduledDate).toBe('2026-11-07');
    expect(out.createdAt).toBe('2026-11-06T14:30:00Z');
    expect(out.title).toBe('Reminder: Collection tomorrow (2026-11-07)');
    expect(out.nested[0].at).toBe('2026-10-30T11:45:00Z');
    expect(out.n).toBe(4);
  });

  it('crosses month and year boundaries', () => {
    expect(rebaseSeed({ d: '2026-12-31' }, 1).d).toBe('2027-01-01');
  });

  it('returns the same object when no shift is needed', () => {
    expect(rebaseSeed(seed, 0)).toBe(seed);
  });
});
