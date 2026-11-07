import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { weighedKgOf } from './impact';

/**
 * Neighbourhood goal and area leaderboard.
 *
 * Real part: kilograms from every booking in the app, grouped by zone.
 * Simulated part: the pilot only has a handful of demo bookings, so each area
 * also carries a clearly labelled "pilot sample" baseline. The UI always shows
 * the Pilot sample tag next to these figures.
 */
export const NEIGHBOURHOOD_GOAL_KG = 5000;

const AREAS: Record<string, { en: string; bn: string; sampleKg: number }> = {
  'ZONE-GUL-02': { en: 'Gulshan-2', bn: 'গুলশান-২', sampleKg: 3380 },
  'ZONE-BAN-11': { en: 'Banani', bn: 'বনানী', sampleKg: 2410 },
  'ZONE-DHA-9A': { en: 'Dhanmondi 9A', bn: 'ধানমন্ডি ৯এ', sampleKg: 1760 }
};

export interface AreaRow {
  zoneId: string;
  en: string;
  bn: string;
  kg: number;
  pct: number;
  mine: boolean;
  rank: number;
}

export const useNeighbourhood = (zoneId: string | undefined) => {
  const { bookings } = useApp();
  return useMemo(() => {
    const mineZone = zoneId && AREAS[zoneId] ? zoneId : 'ZONE-GUL-02';
    const rows = Object.entries(AREAS)
      .map(([id, a]) => {
        const real = bookings.filter((b) => b.zoneId === id).reduce((s, b) => s + weighedKgOf(b), 0);
        const kg = a.sampleKg + real;
        return { zoneId: id, en: a.en, bn: a.bn, kg, pct: Math.min(100, Math.round((kg / NEIGHBOURHOOD_GOAL_KG) * 100)), mine: id === mineZone, rank: 0 };
      })
      .sort((a, b) => b.kg - a.kg)
      .map((r, i): AreaRow => ({ ...r, rank: i + 1 }));
    const mine = rows.find((r) => r.mine)!;
    return { rows, mine, goalKg: NEIGHBOURHOOD_GOAL_KG };
  }, [bookings, zoneId]);
};
