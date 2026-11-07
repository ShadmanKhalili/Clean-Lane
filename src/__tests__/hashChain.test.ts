import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { canonicalJson, GENESIS_HASH, linkHash, sha256Hex, verifyChain } from '../domain/hashChain';
import { sealAll, sealCustodyEvent, verifyLot } from '../domain/custodyChain';
import type { CustodyEvent, MaterialLot } from '../types';

const nodeSha = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');

describe('sha256Hex', () => {
  it('matches known vectors and node:crypto across block boundaries and unicode', () => {
    expect(sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    for (const len of [1, 55, 56, 63, 64, 65, 119, 120, 1000]) {
      const s = 'x'.repeat(len);
      expect(sha256Hex(s)).toBe(nodeSha(s));
    }
    const bn = 'বাংলা রিসাইক্লিং ♻️ ৳250';
    expect(sha256Hex(bn)).toBe(nodeSha(bn));
  });
});

describe('canonicalJson', () => {
  it('is independent of key order and drops undefined', () => {
    expect(canonicalJson({ b: 1, a: { d: [1, { z: 1, y: 2 }], c: undefined } })).toBe(canonicalJson({ a: { d: [1, { y: 2, z: 1 }] }, b: 1 }));
  });
});

describe('verifyChain', () => {
  const build = (payloads: object[]) => {
    let prev = GENESIS_HASH;
    return payloads.map((payload) => {
      const hash = linkHash(prev, payload);
      const item = { payload, prevHash: prev, hash };
      prev = hash;
      return item;
    });
  };

  it('accepts an untouched chain', () => {
    expect(verifyChain(build([{ kg: 10 }, { kg: 9.6 }, { kg: 9.6 }])).ok).toBe(true);
  });

  it('pinpoints an edited record', () => {
    const chain = build([{ kg: 10 }, { kg: 9.6 }, { kg: 9.6 }]);
    chain[1] = { ...chain[1], payload: { kg: 12 } };
    expect(verifyChain(chain)).toEqual({ ok: false, brokenAt: 1, reason: 'hash_mismatch' });
  });

  it('detects a deleted record', () => {
    const chain = build([{ kg: 10 }, { kg: 9.6 }, { kg: 9.6 }]);
    expect(verifyChain([chain[0], chain[2]])).toMatchObject({ ok: false, brokenAt: 1, reason: 'link_mismatch' });
  });
});

describe('custody chain', () => {
  const lot = (id: string, parentLotId?: string): MaterialLot => ({
    id, parentLotId, material: 'PET_BOTTLES', primaryCollector: 'T', initialFieldWeightKg: 10, currentCustodian: 'AGGREGATION_HUB',
    location: '', evidenceLevel: 'E2', createdAt: '', updatedAt: ''
  });
  const ev = (id: string, lotId: string, timestamp: string, quantityKg = 10): CustodyEvent => ({
    id, lotId, timestamp, sender: 'a', receiver: 'b', location: 'x', quantityKg, measurementMethod: 'scale',
    evidenceLevelResult: 'E1', verifiedBy: 'v', signatureOrHash: ''
  });
  const lots = [lot('P'), lot('C', 'P')];
  const sealed = sealAll([ev('2', 'P', '2026-01-02'), ev('1', 'P', '2026-01-01'), ev('3', 'C', '2026-01-03', 9)], lots);

  it('seals seed records into valid per-lot chains, children linked to parents', () => {
    expect(verifyLot('P', sealed, lots).ok).toBe(true);
    const child = verifyLot('C', sealed, lots);
    expect(child.ok).toBe(true);
    expect(child.genesis).toBe(sealed.find((e) => e.id === '2')!.signatureOrHash.slice(7));
  });

  it('appends new records to the tip', () => {
    const next = sealCustodyEvent(ev('4', 'P', '2026-01-04'), sealed, lots);
    expect(verifyLot('P', [next, ...sealed], lots).ok).toBe(true);
  });

  it('detects a tampered weight', () => {
    const tampered = sealed.map((e) => (e.id === '1' ? { ...e, quantityKg: 25 } : e));
    expect(verifyLot('P', tampered, lots)).toMatchObject({ ok: false, brokenAt: 0 });
  });
});
