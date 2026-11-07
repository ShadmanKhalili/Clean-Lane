import { describe, expect, it } from 'vitest';
import { ITEMS, pickRound, searchItems } from '../learn/items';

describe('ITEMS', () => {
  it('has at least 50 items with unique ids', () => {
    expect(ITEMS.length).toBeGreaterThanOrEqual(50);
    const ids = new Set(ITEMS.map((i) => i.id));
    expect(ids.size).toBe(ITEMS.length);
  });

  it('gives every recyclable item a material', () => {
    for (const item of ITEMS.filter((i) => i.recyclable)) {
      expect(item.material, item.id).toBeTruthy();
    }
  });

  it('has non-empty names and tips for every item', () => {
    for (const item of ITEMS) {
      expect(item.en.trim(), item.id).not.toBe('');
      expect(item.bn.trim(), item.id).not.toBe('');
      expect(item.tipEn.trim(), item.id).not.toBe('');
      expect(item.tipBn.trim(), item.id).not.toBe('');
    }
  });
});

describe('searchItems', () => {
  it('finds the chip packet as not recyclable for "chips"', () => {
    const results = searchItems('chips');
    expect(results.length).toBeGreaterThan(0);
    const chip = results.find((i) => i.id === 'chip-packet');
    expect(chip).toBeDefined();
    expect(chip?.recyclable).toBe(false);
  });

  it('finds a bottle for the Bangla word for bottle', () => {
    const results = searchItems('বোতল');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((i) => i.bn.includes('বোতল'))).toBe(true);
  });

  it('returns an empty list for an empty query', () => {
    expect(searchItems('')).toEqual([]);
    expect(searchItems('   ')).toEqual([]);
  });

  it('is case-insensitive', () => {
    expect(searchItems('CHIPS').map((i) => i.id)).toEqual(searchItems('chips').map((i) => i.id));
  });
});

describe('pickRound', () => {
  it('returns 10 distinct items with at least 3 of each kind', () => {
    const round = pickRound(10, 42);
    expect(round).toHaveLength(10);
    expect(new Set(round.map((i) => i.id)).size).toBe(10);
    expect(round.filter((i) => i.recyclable).length).toBeGreaterThanOrEqual(3);
    expect(round.filter((i) => !i.recyclable).length).toBeGreaterThanOrEqual(3);
  });

  it('is deterministic for the same seed', () => {
    expect(pickRound(10, 42).map((i) => i.id)).toEqual(pickRound(10, 42).map((i) => i.id));
  });
});
