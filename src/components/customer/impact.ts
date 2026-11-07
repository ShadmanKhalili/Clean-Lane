import type { Booking, MaterialCategory } from '../../types';
import { bandMidpointKg } from '../../domain/rules';
import { MATERIALS, relatableCount } from '../../design/materials';

/**
 * Indicative per-kg conversion factors for customer-facing impact figures.
 * These are blended, rounded planning factors for mixed PET / HDPE / paper / metal
 * streams — NOT certified lifecycle-assessment values. They are used only to turn
 * a customer's own scale-confirmed kilograms into relatable equivalents.
 */
/** Indicative kg CO2e avoided per kg of recyclate (blended stream). */
export const INDICATIVE_CO2E_KG_PER_KG = 2.2;
/** Indicative kWh saved per kg of recyclate vs. virgin production (blended stream). */
export const INDICATIVE_KWH_PER_KG = 3.4;
/** Indicative landfill volume (m3) avoided per kg, for loosely packed recyclables. */
export const INDICATIVE_LANDFILL_M3_PER_KG = 0.01;
/** Indicative number of 500 ml PET bottles per kg of bottle plastic. */
export const INDICATIVE_BOTTLES_PER_KG = 24;

export interface ImpactFigures {
  co2eKg: number;
  kwh: number;
  landfillM3: number;
  bottles: number;
}

export const impactForKg = (kg: number): ImpactFigures => ({
  co2eKg: kg * INDICATIVE_CO2E_KG_PER_KG,
  kwh: kg * INDICATIVE_KWH_PER_KG,
  landfillM3: kg * INDICATIVE_LANDFILL_M3_PER_KG,
  bottles: Math.round(kg * INDICATIVE_BOTTLES_PER_KG)
});

/* ---------------------------------------------------------------------------
 * Impact you can picture
 * ------------------------------------------------------------------------- */

/** Weighed kilograms: hub-confirmed where we have it, otherwise the collector's doorstep weight. */
export const weighedKgOf = (b: Booking): number => {
  if (b.status === 'CANCELLED' || b.status === 'MISSED') return 0;
  return b.confirmedWeightKg && b.confirmedWeightKg > 0 ? b.confirmedWeightKg : b.fieldWeightKg && b.fieldWeightKg > 0 ? b.fieldWeightKg : 0;
};

/**
 * Splits each weighed booking's kilograms across its materials in proportion
 * to the customer's own weight bands (equal split when bands are unreadable).
 * The result is indicative: the hub scale weighs a bag, not each material.
 */
export const kgByMaterial = (bookings: Booking[]): Partial<Record<MaterialCategory, number>> => {
  const out: Partial<Record<MaterialCategory, number>> = {};
  for (const b of bookings) {
    const kg = weighedKgOf(b);
    if (kg <= 0 || b.materials.length === 0) continue;
    const weights = b.materials.map((m) => bandMidpointKg(m.approximateBandKg));
    const total = weights.reduce((a, x) => a + x, 0);
    b.materials.forEach((m, i) => {
      const share = total > 0 ? weights[i] / total : 1 / b.materials.length;
      out[m.category] = (out[m.category] ?? 0) + kg * share;
    });
  }
  return out;
};

export interface PicturedItem {
  material: MaterialCategory;
  kg: number;
  count: number;
}

/** Items you can picture, biggest count first. */
export const picturedImpact = (bookings: Booking[]): PicturedItem[] =>
  (Object.entries(kgByMaterial(bookings)) as [MaterialCategory, number][])
    .map(([material, kg]) => ({ material, kg, count: relatableCount(material, kg) }))
    .filter((x) => x.count > 0 && MATERIALS[x.material])
    .sort((a, b) => b.count - a.count);
