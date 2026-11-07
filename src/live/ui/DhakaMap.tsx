import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { MaterialGlyph } from '../../design/materials';
import { AREAS, AREA_IDS, HUB_POINT, MILL_POINT, stageIndex, type LiveBooking, type LiveStage } from '../model';

/**
 * Stylised Dhaka (viewBox 0 0 100 130, north up). Explicitly NOT survey-accurate:
 * soft area blobs, the Turag (west) and Buriganga (south-west) as ribbons, the
 * hub and the Savar mill. Pins carry a progress ring for the journey stage;
 * stage changes animate dots pin -> hub and hub -> mill.
 */
const LIME = '#CBEA70';
const AMBER = '#F5BF55';
const OFFWHITE = '#EAF1E6';

export const MAP_CSS = `
@keyframes dm-drop { 0% { transform: translateY(-9px) scale(.4); opacity: 0 } 55% { transform: translateY(0) scale(1.18); opacity: 1 } 78% { transform: translateY(-1.2px) scale(.94) } 100% { transform: translateY(0) scale(1) } }
@keyframes dm-pulse { 0% { transform: scale(.7); opacity: .85 } 100% { transform: scale(2.4); opacity: 0 } }
@keyframes dm-breathe { 0%,100% { opacity: .55 } 50% { opacity: 1 } }
@keyframes dm-trail { 0% { stroke-dashoffset: 1; opacity: .9 } 70% { stroke-dashoffset: 0; opacity: .9 } 100% { stroke-dashoffset: 0; opacity: 0 } }
@keyframes dm-spin { to { transform: rotate(360deg) } }
@keyframes dm-flow { to { stroke-dashoffset: -4 } }
.dm-pin-in { animation: dm-drop .62s cubic-bezier(.3,1.4,.5,1) both; transform-box: fill-box; transform-origin: 50% 100%; }
.dm-pulse { animation: dm-pulse 1.8s ease-out infinite; transform-box: fill-box; transform-origin: center; }
.dm-breathe { animation: dm-breathe 5s ease-in-out infinite; }
.dm-trail { stroke-dasharray: 1; animation: dm-trail 1.7s ease-in-out both; }
.dm-spin { animation: dm-spin 6s linear infinite; transform-box: fill-box; transform-origin: center; }
.dm-route { animation: dm-flow 3s linear infinite; }
.dm-pin .dm-label { opacity: 0; transition: opacity .25s; }
.dm-pin:hover .dm-label, .dm-pin:focus-visible .dm-label, .dm-pin[data-show="1"] .dm-label { opacity: 1; }
.dm-pin:focus-visible { outline: none; }
.dm-pin:focus-visible circle.dm-focus { stroke: ${LIME}; opacity: 1; }
.dm-trike { transition: transform 5.5s cubic-bezier(.45,.05,.4,1); }
`;

const stageRing = (s: LiveStage) => (s === 'booked' ? '#9FB3A8' : s === 'accepted' ? AMBER : LIME);

const reducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Sparse, hand-placed "blob" per area; sizes are stylised, not geographic. */
const BLOB: Record<string, { rx: number; ry: number; rot: number }> = {
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

/** Label offsets where the default (below the blob) would collide with pins or the hub. */
const LABEL_AT: Record<string, { dx: number; dy: number; anchor: 'start' | 'middle' | 'end' }> = {
  banani: { dx: 0, dy: -5.2, anchor: 'middle' },
  gulshan: { dx: 6, dy: 0.5, anchor: 'start' },
  baridhara: { dx: 5.5, dy: -3, anchor: 'start' },
  bashundhara: { dx: 0, dy: -8.6, anchor: 'middle' },
  mohakhali: { dx: -5, dy: 1, anchor: 'end' }
};

const curve = (x1: number, y1: number, x2: number, y2: number, bend = 0.14) => {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  return `M${x1} ${y1} Q${mx - dy * bend} ${my + dx * bend} ${x2} ${y2}`;
};

interface Flow { key: string; d: string; color: string; dots: number; dur: number }

const Trike: React.FC<{ to: { x: number; y: number } }> = ({ to }) => {
  const [at, setAt] = useState<{ x: number; y: number }>(HUB_POINT);
  useEffect(() => {
    const id = requestAnimationFrame(() => setAt(to));
    return () => cancelAnimationFrame(id);
  }, [to.x, to.y]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <g className="dm-trike" style={{ transform: `translate(${at.x}px, ${at.y}px)` }} aria-hidden="true">
      <g transform="translate(-2.2,-4.6)">
        <rect x="-1.6" y="-1.3" width="3.8" height="2.2" rx=".6" fill={LIME} />
        <rect x="-.8" y="-2.6" width="2.2" height="1.4" rx=".4" fill="#0B1A15" stroke={LIME} strokeWidth=".3" />
        <circle cx="-.8" cy="1.2" r=".75" fill="#0B1A15" stroke={LIME} strokeWidth=".3" />
        <circle cx="1.8" cy="1.2" r=".75" fill="#0B1A15" stroke={LIME} strokeWidth=".3" />
      </g>
    </g>
  );
};

interface PinProps {
  b: LiveBooking;
  showName: boolean;
  fresh: boolean;
  highlighted: boolean;
  onSelect?: (id: string) => void;
}

const Pin = memo(function Pin({ b, showName, fresh, highlighted, onSelect }: PinProps) {
  const idx = stageIndex(b.stage);
  const ring = stageRing(b.stage);
  const done = b.stage === 'recycled';
  const label = b.name.split(' ')[0];
  const labelW = Math.max(7, label.length * 1.55 + 3);
  return (
    <g
      className="dm-pin"
      data-show={showName || highlighted ? 1 : 0}
      transform={`translate(${b.x} ${b.y})`}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={`${b.name}, ${b.stage}`}
      style={{ cursor: onSelect ? 'pointer' : undefined }}
      onClick={onSelect ? () => onSelect(b.id) : undefined}
      onKeyDown={onSelect ? (e) => (e.key === ' ' ? (e.preventDefault(), onSelect(b.id)) : undefined) : undefined}
    >
      <g className={fresh ? 'dm-pin-in' : undefined}>
        {(b.stage === 'accepted' || highlighted) && <circle className="dm-pulse" r="3.2" fill="none" stroke={highlighted ? LIME : AMBER} strokeWidth=".35" />}
        {done && <circle r="4.6" fill={LIME} opacity=".16" />}
        <circle r="3.1" fill="none" stroke={OFFWHITE} strokeOpacity=".18" strokeWidth=".55" />
        <circle
          r="3.1" fill="none" stroke={ring} strokeWidth=".7" strokeLinecap="round"
          pathLength={6} strokeDasharray={`${idx + 1} 6`} transform="rotate(-90)"
          style={{ transition: 'stroke-dasharray .8s ease, stroke .5s' }}
        />
        <circle className="dm-focus" r="3.9" fill="none" stroke="none" strokeWidth=".4" opacity="0" />
        <circle r="2.35" fill={OFFWHITE} opacity=".96" />
        <g transform="translate(-1.55 -1.55)">
          <MaterialGlyph material={b.materials[0]} size={3.1} />
        </g>
        {done && (
          <g transform="translate(2.2 -2.2)">
            <circle r="1.25" fill={LIME} stroke="#0B1A15" strokeWidth=".3" />
            <path d="M-.6 0 L-.1 .55 L.7 -.5" fill="none" stroke="#0B1A15" strokeWidth=".35" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
      </g>
      <g className="dm-label" transform="translate(4.4 0)" pointerEvents="none">
        <rect x="0" y="-1.9" width={labelW} height="3.8" rx="1.9" fill="#0B1A15" fillOpacity=".86" stroke={ring} strokeOpacity=".6" strokeWidth=".2" />
        <text x={labelW / 2} y=".85" textAnchor="middle" fontSize="2.3" fontWeight="600" fill={OFFWHITE}>{label}</text>
      </g>
    </g>
  );
});

export interface DhakaMapProps {
  bookings: LiveBooking[];
  highlightId?: string;
  onSelect?: (id: string) => void;
  /** Gentle breathing when nobody has joined yet. */
  idle?: boolean;
  className?: string;
}

export const DhakaMap: React.FC<DhakaMapProps> = ({ bookings, highlightId, onSelect, idle, className }) => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [millPulse, setMillPulse] = useState(0);
  const prev = useRef<Map<string, LiveStage> | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Stage transitions -> travelling dots. Only for recent changes, never on reload.
  useEffect(() => {
    const before = prev.current;
    prev.current = new Map(bookings.map((b) => [b.id, b.stage]));
    if (!before || reducedMotion()) return;
    const now = Date.now();
    const added: Flow[] = [];
    let pulse = false;
    for (const b of bookings) {
      if (before.get(b.id) === b.stage || now - b.updatedAt > 6000) continue;
      if (b.stage === 'collected') added.push({ key: `${b.id}-c`, d: curve(b.x, b.y, HUB_POINT.x, HUB_POINT.y, 0.18), color: b.materials[0] ? '#EAF1E6' : LIME, dots: 1, dur: 1.6 });
      if (b.stage === 'dispatched') added.push({ key: `${b.id}-d`, d: curve(HUB_POINT.x, HUB_POINT.y, MILL_POINT.x, MILL_POINT.y, 0.16), color: LIME, dots: 3, dur: 2.6 });
      if (b.stage === 'recycled') pulse = true;
    }
    if (pulse) {
      setMillPulse((n) => n + 1);
    }
    if (added.length) {
      setFlows((f) => [...f.filter((x) => !added.some((a) => a.key === x.key)), ...added]);
      timers.current.push(
        window.setTimeout(() => setFlows((f) => f.filter((x) => !added.some((a) => a.key === x.key))), 3400)
      );
    }
  }, [bookings]);

  const recentIds = useMemo(() => new Set([...bookings].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5).map((b) => b.id)), [bookings]);
  const mountedAt = useRef(Date.now());
  const accepted = useMemo(() => bookings.filter((b) => b.stage === 'accepted'), [bookings]);

  return (
    <svg viewBox="0 0 100 130" className={className} role="img" aria-label="Stylised map of Dhaka showing live pickups" preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
      <style>{MAP_CSS}</style>
      <defs>
        <radialGradient id="dm-blob" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2E5A47" stopOpacity=".55" />
          <stop offset="70%" stopColor="#1C3B2F" stopOpacity=".28" />
          <stop offset="100%" stopColor="#1C3B2F" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dm-river" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1B5560" />
          <stop offset="100%" stopColor="#143B4A" />
        </linearGradient>
        <filter id="dm-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation=".7" /></filter>
      </defs>

      {/* land */}
      <rect x="0" y="0" width="100" height="130" fill="none" />
      <g className={idle ? 'dm-breathe' : undefined}>
        {AREA_IDS.map((id) => {
          const a = AREAS[id], s = BLOB[id];
          return <ellipse key={id} cx={a.x} cy={a.y} rx={s.rx} ry={s.ry} transform={`rotate(${s.rot} ${a.x} ${a.y})`} fill="url(#dm-blob)" />;
        })}
      </g>
      {/* faint arterial roads */}
      <g fill="none" stroke={OFFWHITE} strokeOpacity=".07" strokeWidth=".35" strokeLinecap="round">
        <path d="M52 0 C52 20 48 40 47 60 S42 90 48 128" />
        <path d="M20 40 C40 48 60 44 96 36" />
        <path d="M26 70 C44 66 64 74 98 66" />
        <path d="M24 100 C40 98 58 108 96 98" />
        <path d="M70 28 C74 50 70 70 72 100" />
      </g>
      {/* rivers: Turag (west) and Buriganga (south-west), stylised */}
      <g fill="none" strokeLinecap="round">
        <path d="M26 -4 C18 10 12 24 16 38 S8 62 12 76 S4 90 -2 98" stroke="url(#dm-river)" strokeWidth="2.6" />
        <path d="M-2 101 C12 104 18 114 34 118 S62 124 80 126 S98 130 104 134" stroke="url(#dm-river)" strokeWidth="3.4" />
        <path d="M26 -4 C18 10 12 24 16 38 S8 62 12 76 S4 90 -2 98" stroke="#4FB6C8" strokeOpacity=".28" strokeWidth=".4" />
        <path d="M-2 101 C12 104 18 114 34 118 S62 124 80 126 S98 130 104 134" stroke="#4FB6C8" strokeOpacity=".28" strokeWidth=".4" />
      </g>
      <text x="9" y="30" fontSize="1.9" letterSpacing=".3" fill="#6FB9C6" fillOpacity=".75" transform="rotate(-72 9 30)">TURAG</text>
      <text x="44" y="124.4" fontSize="1.9" letterSpacing=".3" fill="#6FB9C6" fillOpacity=".75" transform="rotate(8 44 124.4)">BURIGANGA</text>

      {/* area labels */}
      {AREA_IDS.map((id) => {
        const a = AREAS[id];
        const o = LABEL_AT[id] ?? { dx: 0, dy: BLOB[id].ry + 1.8, anchor: 'middle' as const };
        return (
          <text key={id} x={a.x + o.dx} y={a.y + o.dy} textAnchor={o.anchor} fontSize="2.6" letterSpacing=".35" fill={OFFWHITE} fillOpacity=".5" style={{ textTransform: 'uppercase' }} fontWeight="600">
            {a.en}
          </text>
        );
      })}

      {/* hub -> mill route */}
      <path d={curve(HUB_POINT.x, HUB_POINT.y, MILL_POINT.x, MILL_POINT.y, 0.16)} fill="none" stroke={LIME} strokeOpacity=".28" strokeWidth=".35" strokeDasharray="1 1.6" className="dm-route" />

      {/* hub */}
      <g transform={`translate(${HUB_POINT.x} ${HUB_POINT.y})`}>
        <circle r="5" fill={LIME} opacity=".22" filter="url(#dm-glow)" />
        <rect x="-2.6" y="-2.6" width="5.2" height="5.2" rx="1.2" transform="rotate(45)" fill="#0B1A15" stroke={LIME} strokeWidth=".7" />
        <circle r="1" fill={LIME} />
        <text x="4.2" y="1" textAnchor="start" fontSize="2.4" fontWeight="700" letterSpacing=".35" fill={LIME}>GULSHAN HUB</text>
      </g>

      {/* mill */}
      <g transform={`translate(${MILL_POINT.x} ${MILL_POINT.y})`}>
        {millPulse > 0 && <circle key={millPulse} className="dm-pulse" r="3" fill="none" stroke={LIME} strokeWidth=".4" style={{ animationIterationCount: 2 }} />}
        <rect x="-3" y="-2" width="6" height="4.4" rx=".6" fill="#0B1A15" stroke={LIME} strokeWidth=".6" />
        <path d="M-3 -2 L-1.2 -3.6 V-2 L.6 -3.6 V-2 L2.4 -3.6 V-2" fill="none" stroke={LIME} strokeWidth=".5" strokeLinejoin="round" />
        <rect x="1.4" y="-5" width="1.1" height="2.2" fill={LIME} />
        <text x="0" y="6.8" textAnchor="middle" fontSize="2.2" fontWeight="700" letterSpacing=".3" fill={LIME}>RECYCLING MILL</text>
        <text x="0" y="9.6" textAnchor="middle" fontSize="2.2" fill={OFFWHITE} fillOpacity=".75">{'→'} Savar</text>
      </g>

      {/* flows */}
      {flows.map((f) => (
        <g key={f.key} pointerEvents="none">
          <path d={f.d} fill="none" stroke={f.color} strokeWidth=".5" strokeLinecap="round" pathLength={1} className="dm-trail" />
          {Array.from({ length: f.dots }).map((_, i) => (
            <circle key={i} r="1" fill={f.color}>
              <animateMotion dur={`${f.dur}s`} begin={`${i * 0.35}s`} path={f.d} fill="freeze" calcMode="spline" keyTimes="0;1" keySplines=".4 0 .2 1" />
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.85;1" dur={`${f.dur}s`} begin={`${i * 0.35}s`} fill="freeze" />
            </circle>
          ))}
        </g>
      ))}

      {/* trikes */}
      {accepted.map((b) => (
        <Trike key={`t-${b.id}`} to={{ x: b.x, y: b.y }} />
      ))}

      {/* pins */}
      {bookings.map((b) => (
        <Pin
          key={b.id}
          b={b}
          showName={recentIds.has(b.id)}
          fresh={b.createdAt >= mountedAt.current - 4000 || Date.now() - b.createdAt < 5000}
          highlighted={b.id === highlightId}
          onSelect={onSelect}
        />
      ))}
    </svg>
  );
};

export default DhakaMap;
