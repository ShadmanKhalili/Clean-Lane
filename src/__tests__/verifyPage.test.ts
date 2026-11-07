import { describe, expect, it } from 'vitest';
import { advance, createLiveBooking } from '../live/model';
import { buildLiveJourney, stopStatus, tamperedWeight } from '../verify/journey';

describe('verify journey view-model', () => {
  const t = Date.now();
  let b = createLiveBooking({ name: 'Rina', area: 'gulshan', materials: ['PET_BOTTLES'] }, t);
  b = advance(b, { type: 'accept', collector: 'T' }, t + 1);
  b = advance(b, { type: 'collect', weightKg: 7.5 }, t + 2);
  b = advance(b, { type: 'verify' }, t + 3);

  it('verifies untouched and breaks at the tampered record', () => {
    const j = buildLiveJourney(b);
    expect(j.verify(null).ok).toBe(true);
    expect(j.defaultTamperKey).toBe('2');
    const v = j.verify({ key: '2', kg: tamperedWeight(7.5) });
    expect(tamperedWeight(7.5)).toBe(10.5);
    expect(v).toMatchObject({ ok: false, brokenRecord: 2 });
    expect(j.stops.map((s) => stopStatus(s, j.stops, v))).toEqual(['ok', 'ok', 'altered', 'unproven']);
  });
  it('never mutates the booking', () => {
    const before = JSON.stringify(b);
    buildLiveJourney(b).verify({ key: '2', kg: 99 });
    expect(JSON.stringify(b)).toBe(before);
  });
});
