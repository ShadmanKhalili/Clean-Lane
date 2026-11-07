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
