import type { MaterialLot, ProcessingDisposition } from '../types';

/**
 * Lot lifecycle guards. Sorting splits a parent lot into child lots, so the
 * parent's mass must never be counted, sorted or processed again alongside its
 * children.
 */

export const isSplit = (lot: MaterialLot) => (lot.childLotIds?.length ?? 0) > 0;

/** Lots that represent original intake (not sorting outputs) — used for intake KPIs. */
export const intakeLots = (lots: MaterialLot[]) => lots.filter((l) => !l.parentLotId);

/** A collector may hand a lot to the hub only while it is still in their custody. */
export const canHandOverToHub = (lot: MaterialLot) =>
  lot.currentCustodian === 'COLLECTOR' && lot.verifiedHubWeightKg === undefined;

/** Hub-verified original lots that have not been sorted yet. */
export const isReadyToSort = (lot: MaterialLot) =>
  lot.currentCustodian === 'AGGREGATION_HUB' && lot.evidenceLevel === 'E2' && !lot.parentLotId && !isSplit(lot);

/** Leaf lots at the hub or dispatched (E2/E3) with no processing outcome yet. */
export const isReadyForProcessing = (lot: MaterialLot, dispositions: ProcessingDisposition[]) =>
  !isSplit(lot) &&
  (lot.evidenceLevel === 'E2' || lot.evidenceLevel === 'E3') &&
  lot.currentCustodian !== 'FINISHED_RECOVERED' &&
  !dispositions.some((d) => d.lotId === lot.id);
