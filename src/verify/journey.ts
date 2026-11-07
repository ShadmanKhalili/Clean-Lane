import type { CustodyEvent, MaterialCategory, MaterialLot, ProcessingDisposition, SortingTransformation } from '../types';
import { GENESIS_HASH } from '../domain/hashChain';
import { lotEventsInOrder, verifyLot } from '../domain/custodyChain';
import { AREAS, HUB_POINT, MILL_POINT, STAGE_INFO, verifyLiveChain, type LiveBooking } from '../live/model';

/**
 * Pure view-model for the public "scan the bottle" page: turns custody records
 * (or a live booking's chain) into plain-language journey stops, and re-runs
 * verification on an in-memory copy when the presenter simulates tampering.
 */

export interface Bi {
  en: string;
  bn: string;
}

export type StopKind = 'record' | 'sorting' | 'processing';

export interface SplitOutput {
  label: string;
  kg: number;
  lotId: string;
  destination: string;
  isThis: boolean;
}

export interface Stop {
  key: string;
  kind: StopKind;
  at: string;
  title: Bi;
  who?: string;
  where?: string;
  kg?: number;
  evidence?: string;
  hash?: string;
  prevHash?: string;
  /** What the previous-hash points at. */
  linkTo?: 'start' | 'previous' | 'parent';
  /** 0-based index among sealed records (only for kind 'record'). */
  recordIndex?: number;
  /** Lot the record belongs to (lots with a parent show the parent's records too). */
  lotId?: string;
  inherited?: boolean;
  /** Sorting step */
  inputKg?: number;
  split?: SplitOutput[];
  residueKg?: number;
  residueNote?: string;
  /** Processing step */
  certificate?: string;
  yieldKg?: number;
  lossKg?: number;
}

export interface Tamper {
  key: string;
  kg: number;
}

export interface TamperTarget {
  key: string;
  recordNo: number;
  title: Bi;
  kg: number;
}

export interface Verification {
  ok: boolean;
  /** 0-based record index of the first altered record. */
  brokenRecord?: number;
  recordCount: number;
}

export interface Facts {
  weightKg?: number;
  weightKind: 'hub' | 'door' | 'none';
  place: string;
  stage: Bi;
  evidence?: string;
  recycled: boolean;
}

export interface Journey {
  kind: 'lot' | 'live';
  id: string;
  material: MaterialCategory;
  stops: Stop[];
  recordCount: number;
  parentLotId?: string;
  facts: Facts;
  targets: TamperTarget[];
  defaultTamperKey?: string;
  verify: (tamper: Tamper | null) => Verification;
}

export type StopStatus = 'ok' | 'altered' | 'unproven' | 'none';

const round1 = (n: number) => Math.round(n * 10) / 10;
export const fmtKg = (n: number) => `${Number.isInteger(n) ? n : round1(n)} kg`;

/** "+40%" edit used by the presenter's tampering demo. */
export const tamperedWeight = (kg: number) => round1(kg * 1.4);

/** Status of one stop once verification has run (outcome stops follow the records before them). */
export const stopStatus = (stop: Stop, stops: Stop[], v: Verification): StopStatus => {
  if (v.ok || v.brokenRecord === undefined) return stop.kind === 'record' ? 'ok' : 'none';
  if (stop.kind === 'record') {
    const i = stop.recordIndex ?? 0;
    return i < v.brokenRecord ? 'ok' : i === v.brokenRecord ? 'altered' : 'unproven';
  }
  const first = stops.find((s) => s.kind === 'record' && s.recordIndex === v.brokenRecord);
  return first && stop.at >= first.at ? 'unproven' : 'none';
};

// ---------- plain-language copy ----------

const TITLE_BY_EVIDENCE: Record<string, Bi> = {
  E0: { en: 'Pickup booked', bn: 'পিকআপ বুক হয়েছে' },
  E1: { en: 'Weighed at your door', bn: 'আপনার দরজায় ওজন করা হয়েছে' },
  E2: { en: 'Confirmed on certified hub scale', bn: 'সার্টিফায়েড হাব স্কেলে নিশ্চিত' },
  E3: { en: 'Received by the recycler', bn: 'রিসাইক্লার গ্রহণ করেছে' },
  E4: { en: 'Recycled', bn: 'রিসাইকেল সম্পন্ন' },
  E5: { en: 'Independently audited', bn: 'স্বাধীনভাবে নিরীক্ষিত' }
};
const titleFor = (level: string): Bi => TITLE_BY_EVIDENCE[level] ?? { en: 'Custody handover', bn: 'হস্তান্তর' };

/** Households are named in the records; the public page shows the role only. */
const publicParty = (s: string) => (/\(household\)/i.test(s) ? 'Household' : s);

/** Doorstep records carry a street address; the public page keeps only the neighbourhood. */
const publicPlace = (place: string, level: string) =>
  level === 'E0' || level === 'E1' ? (place.split(',').pop() ?? place).trim() : place;

const hashOf = (ev: CustodyEvent) => (ev.signatureOrHash?.startsWith('sha256:') ? ev.signatureOrHash.slice(7) : ev.signatureOrHash);

// ---------- lots ----------

const lineageOf = (lotId: string, lots: MaterialLot[]): string[] => {
  const out: string[] = [];
  const seen = new Set<string>();
  let cur: MaterialLot | undefined = lots.find((l) => l.id === lotId);
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id);
    out.unshift(cur.id);
    cur = cur.parentLotId ? lots.find((l) => l.id === cur!.parentLotId) : undefined;
  }
  return out;
};

export interface LotInputs {
  lotId: string;
  lots: MaterialLot[];
  events: CustodyEvent[];
  sortings: SortingTransformation[];
  dispositions: ProcessingDisposition[];
}

export const buildLotJourney = ({ lotId, lots, events, sortings, dispositions }: LotInputs): Journey | null => {
  const lot = lots.find((l) => l.id === lotId);
  if (!lot) return null;
  const lineage = lineageOf(lotId, lots);

  const stops: Stop[] = [];
  let recordIndex = 0;
  for (const id of lineage) {
    const ordered = lotEventsInOrder(id, events);
    ordered.forEach((ev, i) => {
      const prevIsGenesis = (ev.prevHash ?? '') === GENESIS_HASH;
      stops.push({
        key: ev.id,
        kind: 'record',
        at: ev.timestamp,
        title: titleFor(ev.evidenceLevelResult),
        who: `${publicParty(ev.sender)} → ${publicParty(ev.receiver)}`,
        where: publicPlace(ev.location, ev.evidenceLevelResult),
        kg: ev.quantityKg,
        evidence: ev.evidenceLevelResult,
        hash: hashOf(ev),
        prevHash: ev.prevHash,
        linkTo: prevIsGenesis ? 'start' : i === 0 ? 'parent' : 'previous',
        recordIndex: recordIndex++,
        lotId: id,
        inherited: id !== lotId
      });
    });
  }
  const recordCount = recordIndex;

  // Sorting splits that involve any lot on this lineage.
  for (const s of sortings) {
    if (!lineage.includes(s.inputLotId)) continue;
    stops.push({
      key: s.id,
      kind: 'sorting',
      at: s.timestamp,
      title: { en: 'Sorted into clean streams', bn: 'আলাদা ধরনে বাছাই করা হয়েছে' },
      who: s.operator,
      where: s.facility,
      inputKg: s.inputWeightKg,
      split: s.outputs.map((o) => ({
        label: o.materialGrade.replace(/\s*\(.*\)\s*$/, ''),
        kg: o.outputWeightKg,
        lotId: o.childLotId,
        destination: o.destinationProcessor,
        isThis: o.childLotId === lotId
      })),
      residueKg: s.residueContaminationKg,
      residueNote: s.residueDisposition,
      lotId: s.inputLotId
    });
  }

  const disp = dispositions.filter((d) => lineage.includes(d.lotId)).sort((a, b) => (a.completedAt < b.completedAt ? -1 : 1));
  for (const d of disp) {
    stops.push({
      key: d.id,
      kind: 'processing',
      at: d.completedAt,
      title: { en: `Recycled at ${d.processorName}`, bn: `রিসাইকেল হয়েছে: ${d.processorName}` },
      who: d.processorName,
      where: d.facilityLocation,
      evidence: d.evidenceLevel,
      yieldKg: d.outputYieldKg,
      lossKg: d.processLossKg,
      certificate: d.dispositionCertificateId,
      lotId: d.lotId
    });
  }

  stops.sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : a.kind === 'record' ? -1 : 1));

  const records = stops.filter((s) => s.kind === 'record');
  const last = records[records.length - 1];
  const recycled = disp.length > 0 || last?.evidence === 'E4';
  const first = records[0];
  const stage: Bi = recycled
    ? TITLE_BY_EVIDENCE.E4
    : last
      ? last.title
      : { en: 'Awaiting first sealed record', bn: 'প্রথম সিল করা রেকর্ডের অপেক্ষায়' };

  const targets: TamperTarget[] = records
    .filter((s) => typeof s.kg === 'number')
    .map((s) => ({ key: s.key, recordNo: (s.recordIndex ?? 0) + 1, title: s.title, kg: s.kg! }));
  const defaultTarget = targets.find((t) => records.find((r) => r.key === t.key)?.evidence === 'E1') ?? targets[0];

  return {
    kind: 'lot',
    id: lotId,
    material: lot.material,
    stops,
    recordCount,
    parentLotId: lot.parentLotId,
    facts: {
      weightKg: lot.verifiedHubWeightKg ?? lot.initialFieldWeightKg,
      weightKind: lot.verifiedHubWeightKg !== undefined ? 'hub' : 'door',
      place: first?.where ?? lot.location,
      stage,
      evidence: disp.length ? 'E4' : lot.evidenceLevel,
      recycled
    },
    targets,
    defaultTamperKey: defaultTarget?.key,
    verify: (tamper) => {
      const evs = tamper ? events.map((e) => (e.id === tamper.key ? { ...e, quantityKg: tamper.kg } : e)) : events;
      let offset = 0;
      for (const id of lineage) {
        const r = verifyLot(id, evs, lots);
        if (!r.ok) return { ok: false, brokenRecord: offset + (r.brokenAt ?? 0), recordCount };
        offset += r.events.length;
      }
      return { ok: true, recordCount };
    }
  };
};

// ---------- live bookings ----------

const LIVE_TITLES: Record<string, Bi> = {
  booked: { en: 'Pickup booked', bn: 'পিকআপ বুক হয়েছে' },
  accepted: { en: 'Collector accepted the pickup', bn: 'সংগ্রাহক পিকআপ গ্রহণ করেছেন' },
  collected: TITLE_BY_EVIDENCE.E1,
  verified: TITLE_BY_EVIDENCE.E2,
  dispatched: { en: 'Baled and sent to the recycler', bn: 'বেল করে রিসাইক্লারে পাঠানো হয়েছে' },
  recycled: { en: 'Recycled at Bengal Polymers, Savar', bn: 'রিসাইকেল হয়েছে: বেঙ্গল পলিমার্স, সাভার' }
};

export const buildLiveJourney = (b: LiveBooking): Journey => {
  const where = (stage: string) =>
    stage === 'dispatched' ? HUB_POINT.en : stage === 'verified' ? HUB_POINT.en : stage === 'recycled' ? MILL_POINT.en : AREAS[b.area]?.en ?? 'Dhaka';
  const stops: Stop[] = b.chain.map((e, i) => ({
    key: String(e.seq),
    kind: 'record',
    at: e.at,
    title: LIVE_TITLES[e.stage] ?? { en: e.note, bn: e.note },
    who: e.actor,
    where: where(e.stage),
    kg: e.kg,
    evidence: STAGE_INFO[e.stage]?.evidence,
    hash: e.hash,
    prevHash: e.prevHash,
    linkTo: i === 0 ? 'start' : 'previous',
    recordIndex: i,
    lotId: b.id
  }));
  const targets: TamperTarget[] = stops
    .filter((s) => typeof s.kg === 'number')
    .map((s) => ({ key: s.key, recordNo: (s.recordIndex ?? 0) + 1, title: s.title, kg: s.kg! }));
  const info = STAGE_INFO[b.stage];
  const area = AREAS[b.area];
  return {
    kind: 'live',
    id: b.id,
    material: b.materials[0] ?? 'PET_BOTTLES',
    stops,
    recordCount: stops.length,
    facts: {
      weightKg: b.hubWeightKg ?? b.weightKg,
      weightKind: b.hubWeightKg !== undefined ? 'hub' : b.weightKg !== undefined ? 'door' : 'none',
      place: area ? `${area.en}, Dhaka` : 'Dhaka',
      stage: { en: info.en, bn: info.bn },
      evidence: info.evidence,
      recycled: b.stage === 'recycled'
    },
    targets,
    defaultTamperKey: (targets.find((t) => stops.find((s) => s.key === t.key)?.evidence === 'E1') ?? targets[0])?.key,
    verify: (tamper) => {
      const r = verifyLiveChain(b, tamper ? (e) => (String(e.seq) === tamper.key ? { ...e, kg: tamper.kg } : e) : undefined);
      return r.ok ? { ok: true, recordCount: stops.length } : { ok: false, brokenRecord: r.brokenAt ?? 0, recordCount: stops.length };
    }
  };
};
