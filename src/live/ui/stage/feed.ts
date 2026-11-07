import { AREAS, STAGE_INFO, type LiveBooking, type LiveStage } from '../../model';
import type { MaterialCategory } from '../../../types';
import { MATERIALS, relatableCount } from '../../../design/materials';

export interface FeedItem {
  key: string;
  at: number;
  stage: LiveStage;
  material: MaterialCategory;
  text: string;
  label: string;
}

const kg = (n?: number) => (n === undefined ? '' : `${n.toFixed(1)} kg`);

const describe = (b: LiveBooking, stage: LiveStage, k?: number, actor?: string): string => {
  const area = AREAS[b.area].en;
  switch (stage) {
    case 'booked': return `${b.name} in ${area} booked a pickup`;
    case 'accepted': return `${actor ?? b.collector ?? 'A collector'} is on the way to ${b.name} in ${area}`;
    case 'collected': return `${b.name} weighed ${kg(k)} in ${area}`;
    case 'verified': return `${b.name}'s bag verified at hub${b.points ? ` · +${b.points} pts` : ''}`;
    case 'dispatched': return `${b.name}'s ${kg(k)} sent to the recycler`;
    case 'recycled': return `${b.name}'s bag recycled at Savar mill`;
  }
};

/** Newest-first journey events across all bookings, from their hash chains. */
export const buildFeed = (bookings: LiveBooking[], limit = 7): FeedItem[] => {
  const items: FeedItem[] = [];
  for (const b of bookings) {
    for (const e of b.chain) {
      items.push({
        key: `${b.id}-${e.seq}`,
        at: Date.parse(e.at) || b.updatedAt,
        stage: e.stage,
        material: b.materials[0],
        text: describe(b, e.stage, e.kg, e.actor),
        label: STAGE_INFO[e.stage].en
      });
    }
  }
  return items.sort((a, b) => b.at - a.at).slice(0, limit);
};

export interface Impact {
  items: number;
  top: { material: MaterialCategory; count: number; noun: string }[];
}

/** Everyday items kept out of the canals, using each booking's first material weighted by its kg. */
export const buildImpact = (bookings: LiveBooking[]): Impact => {
  const per = new Map<MaterialCategory, number>();
  for (const b of bookings) {
    const w = b.hubWeightKg ?? b.weightKg ?? 0;
    if (!w || !b.materials[0]) continue;
    per.set(b.materials[0], (per.get(b.materials[0]) ?? 0) + relatableCount(b.materials[0], w));
  }
  const top = [...per.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([material, count]) => ({ material, count, noun: MATERIALS[material].itemEn }));
  return { items: [...per.values()].reduce((a, c) => a + c, 0), top };
};
