import React from 'react';
import { MaterialGlyph } from '../../design/materials';
import { AREAS, AREA_IDS, HUB_POINT, type AreaId } from '../../live/model';
import { MAP_CSS } from '../../live/ui/DhakaMap';
import type { MaterialCategory, PickupJob } from '../../types';

/**
 * Operator's map of today's routes. Same stylised Dhaka and visual language as
 * the pitch map (it reuses AREAS and the map CSS), but the pins are jobs:
 * quiet lime when fine, numbered amber when they need the operator (1 = most urgent).
 */
const LIME = '#CBEA70';
const AMBER = '#F5BF55';
const OFFWHITE = '#EAF1E6';

const BLOB: Record<AreaId, { rx: number; ry: number; rot: number }> = {
  uttara: { rx: 12, ry: 8, rot: -8 },
  mirpur: { rx: 11, ry: 10, rot: 12 },
  bashundhara: { rx: 9, ry: 8, rot: 20 },
  baridhara: { rx: 7, ry: 5.5, rot: -10 },
  gulshan: { rx: 8.5, ry: 7, rot: 8 },
  banani: { rx: 7.5, ry: 6, rot: -18 },
  mohakhali: { rx: 7, ry: 6, rot: 0 },
  tejgaon: { rx: 9, ry: 7, rot: 15 },
  dhanmondi: { rx: 9, ry: 7.5, rot: -6 },
  motijheel: { rx: 9, ry: 6.5, rot: 5 }
};
const LABEL_AT: Partial<Record<AreaId, { dx: number; dy: number; anchor: 'start' | 'middle' | 'end' }>> = {
  banani: { dx: 0, dy: -5.2, anchor: 'middle' },
  gulshan: { dx: 6, dy: 0.5, anchor: 'start' },
  baridhara: { dx: 5.5, dy: -3, anchor: 'start' },
  bashundhara: { dx: 0, dy: -8.6, anchor: 'middle' },
  mohakhali: { dx: -5, dy: 1, anchor: 'end' }
};

/** Find the stylised area for an address by keyword; unknown places sit on the hub. */
export const areaForAddress = (address: string): AreaId | null => {
  const a = address.toLowerCase();
  return AREA_IDS.find((id) => a.includes(id)) ?? null;
};

export interface MapPin {
  id: string;
  x: number;
  y: number;
  label: string;
  /** 1.. for items that need the operator (1 = most urgent). */
  rank?: number;
  done?: boolean;
  material?: MaterialCategory;
}

/** Place jobs on the map, spreading several jobs in one area so pins don't stack. */
export const pinsForJobs = (jobs: PickupJob[], rankOf: (jobId: string) => number | undefined): MapPin[] => {
  const seen: Record<string, number> = {};
  return jobs.map((j) => {
    const area = areaForAddress(j.customerAddress);
    const base = area ? AREAS[area] : HUB_POINT;
    const key = area ?? 'hub';
    const n = (seen[key] = (seen[key] ?? 0) + 1) - 1;
    const ang = -0.9 - n * 1.9 + (area ? 0 : 3);
    const r = n === 0 && area ? 0 : 8 + n * 0.8;
    return {
      id: j.id,
      x: base.x + Math.cos(ang) * r,
      y: base.y + Math.sin(ang) * r + (area ? 0 : 8),
      label: j.customerAddress.split(',')[0],
      rank: rankOf(j.id),
      done: j.status === 'COMPLETED',
      material: j.expectedMaterials[0]
    };
  });
};

export const OperatorMap: React.FC<{
  pins: MapPin[];
  lang: 'en' | 'bn';
  highlightId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
}> = ({ pins, lang, highlightId, onSelect, className }) => {
  const hubRoute = pins.filter((p) => !p.done);
  const path = hubRoute.length ? `M${HUB_POINT.x} ${HUB_POINT.y} ` + hubRoute.map((p) => `L${p.x} ${p.y}`).join(' ') : '';
  return (
    <svg viewBox="0 0 100 130" className={className} role="img" aria-label={lang === 'en' ? "Stylised map of Dhaka showing today's pickups" : 'আজকের পিকআপসহ ঢাকার নকশা-মানচিত্র'} preserveAspectRatio="xMidYMid meet">
      <style>{MAP_CSS}</style>
      <defs>
        <radialGradient id="om-blob" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2E5A47" stopOpacity=".55" />
          <stop offset="70%" stopColor="#1C3B2F" stopOpacity=".28" />
          <stop offset="100%" stopColor="#1C3B2F" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="om-river" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1B5560" />
          <stop offset="100%" stopColor="#143B4A" />
        </linearGradient>
        <filter id="om-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation=".7" /></filter>
      </defs>
      {AREA_IDS.map((id) => {
        const a = AREAS[id], s = BLOB[id];
        return <ellipse key={id} cx={a.x} cy={a.y} rx={s.rx} ry={s.ry} transform={`rotate(${s.rot} ${a.x} ${a.y})`} fill="url(#om-blob)" />;
      })}
      <g fill="none" stroke={OFFWHITE} strokeOpacity=".07" strokeWidth=".35" strokeLinecap="round">
        <path d="M52 0 C52 20 48 40 47 60 S42 90 48 128" />
        <path d="M20 40 C40 48 60 44 96 36" />
        <path d="M26 70 C44 66 64 74 98 66" />
        <path d="M24 100 C40 98 58 108 96 98" />
        <path d="M70 28 C74 50 70 70 72 100" />
      </g>
      <g fill="none" strokeLinecap="round">
        <path d="M26 -4 C18 10 12 24 16 38 S8 62 12 76 S4 90 -2 98" stroke="url(#om-river)" strokeWidth="2.6" />
        <path d="M-2 101 C12 104 18 114 34 118 S62 124 80 126 S98 130 104 134" stroke="url(#om-river)" strokeWidth="3.4" />
      </g>
      {AREA_IDS.map((id) => {
        const a = AREAS[id];
        const o = LABEL_AT[id] ?? { dx: 0, dy: BLOB[id].ry + 1.8, anchor: 'middle' as const };
        return (
          <text key={id} x={a.x + o.dx} y={a.y + o.dy} textAnchor={o.anchor} fontSize="2.6" letterSpacing=".35" fill={OFFWHITE} fillOpacity=".5" style={{ textTransform: 'uppercase' }} fontWeight="600">
            {lang === 'en' ? a.en : a.bn}
          </text>
        );
      })}

      {path && <path d={path} fill="none" stroke={LIME} strokeOpacity=".35" strokeWidth=".35" strokeDasharray="1 1.6" className="dm-route" />}

      <g transform={`translate(${HUB_POINT.x} ${HUB_POINT.y})`}>
        <circle r="5" fill={LIME} opacity=".22" filter="url(#om-glow)" />
        <rect x="-2.6" y="-2.6" width="5.2" height="5.2" rx="1.2" transform="rotate(45)" fill="#0B1A15" stroke={LIME} strokeWidth=".7" />
        <circle r="1" fill={LIME} />
        <text x="4.2" y="1" fontSize="2.4" fontWeight="700" letterSpacing=".35" fill={LIME}>{lang === 'en' ? 'HUB' : 'হাব'}</text>
      </g>

      {pins.map((p) => {
        const urgent = p.rank !== undefined;
        const on = highlightId === p.id;
        const ring = urgent ? AMBER : LIME;
        const lw = Math.max(8, p.label.length * 1.5 + 3);
        return (
          <g
            key={p.id}
            className="dm-pin"
            data-show={on || urgent ? 1 : 0}
            transform={`translate(${p.x} ${p.y})`}
            role={onSelect ? 'button' : undefined}
            tabIndex={onSelect ? 0 : undefined}
            aria-label={`${p.label}${urgent ? (lang === 'en' ? `, needs you, number ${p.rank}` : `, আপনার দরকার, ${p.rank} নম্বর`) : p.done ? (lang === 'en' ? ', done' : ', শেষ') : ''}`}
            style={{ cursor: onSelect ? 'pointer' : undefined }}
            onClick={onSelect ? () => onSelect(p.id) : undefined}
            onKeyDown={onSelect ? (e) => (e.key === 'Enter' || e.key === ' ' ? (e.preventDefault(), onSelect(p.id)) : undefined) : undefined}
          >
            {(urgent || on) && <circle className="dm-pulse" r="3.4" fill="none" stroke={on ? LIME : AMBER} strokeWidth=".4" />}
            <circle r="3.4" fill="none" stroke={OFFWHITE} strokeOpacity=".18" strokeWidth=".55" />
            <circle r="3.4" fill="none" stroke={ring} strokeWidth=".8" strokeOpacity={p.done ? 0.5 : 1} />
            <circle className="dm-focus" r="4.2" fill="none" stroke="none" strokeWidth=".4" opacity="0" />
            <circle r="2.6" fill={urgent ? AMBER : OFFWHITE} opacity=".96" />
            {urgent ? (
              <text y=".95" textAnchor="middle" fontSize="3" fontWeight="800" fill="#0B1A15">{p.rank}</text>
            ) : p.done ? (
              <path d="M-1.2 .1 L-.3 1 L1.3 -.9" fill="none" stroke="#0B1A15" strokeWidth=".55" strokeLinecap="round" strokeLinejoin="round" />
            ) : p.material ? (
              <g transform="translate(-1.55 -1.55)"><MaterialGlyph material={p.material} size={3.1} /></g>
            ) : null}
            <g className="dm-label" transform="translate(4.8 0)" pointerEvents="none">
              <rect x="0" y="-1.9" width={lw} height="3.8" rx="1.9" fill="#0B1A15" fillOpacity=".9" stroke={ring} strokeOpacity=".6" strokeWidth=".2" />
              <text x={lw / 2} y=".85" textAnchor="middle" fontSize="2.3" fontWeight="600" fill={OFFWHITE}>{p.label}</text>
            </g>
          </g>
        );
      })}
    </svg>
  );
};
