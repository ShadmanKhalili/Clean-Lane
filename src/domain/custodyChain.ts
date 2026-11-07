import type { CustodyEvent, MaterialLot } from '../types';
import { GENESIS_HASH, linkHash, verifyChain, type ChainVerification } from './hashChain';

/**
 * Hash-chains a lot's custody records (see hashChain.ts). Records are ordered by
 * timestamp per lot; a sorted child lot's first record links to the last record
 * of its parent, so the lineage parent → child is covered by the same proof.
 */

const PREFIX = 'sha256:';

/** Everything except the chain fields is covered by the hash. */
export const custodyPayload = (ev: CustodyEvent) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { signatureOrHash, prevHash, ...payload } = ev;
  return payload;
};

const byTime = (a: CustodyEvent, b: CustodyEvent) =>
  a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0;

export const lotEventsInOrder = (lotId: string, events: CustodyEvent[]) => events.filter((e) => e.lotId === lotId).sort(byTime);

const hashOf = (ev: CustodyEvent | undefined) =>
  ev?.signatureOrHash?.startsWith(PREFIX) ? ev.signatureOrHash.slice(PREFIX.length) : undefined;

/** The hash a lot's chain must start from. */
export const genesisFor = (lot: MaterialLot | undefined, events: CustodyEvent[], lots: MaterialLot[]): string => {
  if (!lot?.parentLotId) return GENESIS_HASH;
  const parent = lots.find((l) => l.id === lot.parentLotId);
  const parentEvents = lotEventsInOrder(lot.parentLotId, events);
  return hashOf(parentEvents[parentEvents.length - 1]) ?? genesisFor(parent, events, lots);
};

/** The hash a new record for `lotId` must link to. */
export const chainTip = (lotId: string, events: CustodyEvent[], lots: MaterialLot[]): string => {
  const ordered = lotEventsInOrder(lotId, events);
  return hashOf(ordered[ordered.length - 1]) ?? genesisFor(lots.find((l) => l.id === lotId), events, lots);
};

/** Seals a new record onto the end of its lot's chain. */
export const sealCustodyEvent = (ev: CustodyEvent, events: CustodyEvent[], lots: MaterialLot[]): CustodyEvent => {
  const prevHash = chainTip(ev.lotId, events, lots);
  const draft = { ...ev, prevHash };
  return { ...draft, signatureOrHash: PREFIX + linkHash(prevHash, custodyPayload(draft)) };
};

/** Re-seals an entire record set (used once for seed data, parents before children). */
export const sealAll = (events: CustodyEvent[], lots: MaterialLot[]): CustodyEvent[] => {
  const depth = (lotId: string): number => {
    const lot = lots.find((l) => l.id === lotId);
    return lot?.parentLotId ? 1 + depth(lot.parentLotId) : 0;
  };
  const ordered = [...events].sort((a, b) => depth(a.lotId) - depth(b.lotId) || byTime(a, b));
  const sealed: CustodyEvent[] = [];
  for (const ev of ordered) sealed.push(sealCustodyEvent({ ...ev, prevHash: undefined, signatureOrHash: '' }, sealed, lots));
  const byId = new Map(sealed.map((e) => [e.id, e]));
  return events.map((e) => byId.get(e.id) ?? e);
};

export interface LotVerification extends ChainVerification {
  events: CustodyEvent[];
  genesis: string;
}

export const verifyLot = (lotId: string, events: CustodyEvent[], lots: MaterialLot[]): LotVerification => {
  const ordered = lotEventsInOrder(lotId, events);
  const genesis = genesisFor(lots.find((l) => l.id === lotId), events, lots);
  const result = verifyChain(
    ordered.map((e) => ({ payload: custodyPayload(e), prevHash: e.prevHash ?? '', hash: hashOf(e) ?? '' })),
    genesis
  );
  return { ...result, events: ordered, genesis };
};
