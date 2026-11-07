import { describe, expect, it } from 'vitest';
import { advance, createLiveBooking, normaliseBooking, roomTotals, verifyLiveChain } from '../live/model';

describe('live booking journey', () => {
  const start = createLiveBooking({ name: '  Nasreen  ', area: 'gulshan', materials: ['PET_BOTTLES'] }, 1000);

  it('walks the full journey with a valid hash chain', () => {
    let b = advance(start, { type: 'accept', collector: 'Tariq' }, 2000);
    b = advance(b, { type: 'collect', weightKg: 8.24 }, 3000);
    b = advance(b, { type: 'verify' }, 4000);
    b = advance(b, { type: 'dispatch' }, 5000);
    b = advance(b, { type: 'recycle' }, 6000);
    expect(b.stage).toBe('recycled');
    expect(b.name).toBe('Nasreen');
    expect(b.weightKg).toBe(8.2);
    expect(b.hubWeightKg).toBe(8);
    expect(b.points).toBe(360);
    expect(b.chain).toHaveLength(6);
    expect(verifyLiveChain(b).ok).toBe(true);
  });

  it('refuses out-of-order steps', () => {
    expect(advance(start, { type: 'verify' })).toBe(start);
  });

  it('detects tampering with a recorded weight', () => {
    let b = advance(start, { type: 'accept', collector: 'Tariq' });
    b = advance(b, { type: 'collect', weightKg: 5 });
    expect(verifyLiveChain(b, (e) => (e.seq === 2 ? { ...e, kg: 50 } : e))).toMatchObject({ ok: false, brokenAt: 2 });
  });

  it('normalises Firebase object-shaped arrays and rejects junk', () => {
    const wire = JSON.parse(JSON.stringify(start));
    wire.chain = { 0: wire.chain[0] };
    wire.materials = { 0: 'PET_BOTTLES' };
    expect(normaliseBooking(wire)?.chain).toHaveLength(1);
    expect(normaliseBooking({ id: 'x', stage: 'hacked' })).toBeNull();
  });

  it('totals kg using hub weight when available', () => {
    let b = advance(start, { type: 'accept', collector: 'T' });
    b = advance(b, { type: 'collect', weightKg: 10 });
    expect(roomTotals([b]).kg).toBe(10);
    expect(roomTotals([advance(b, { type: 'verify', hubWeightKg: 9.5 })])).toMatchObject({ kg: 9.5, verifiedKg: 9.5, points: 428 });
  });
});
