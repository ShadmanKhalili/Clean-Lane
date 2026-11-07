import React from 'react';
import { MaterialGlyph, MATERIAL_LIST } from './materials';

/**
 * Celebration pieces. The local signature (a rickshaw-art-inspired band) is
 * used ONLY for celebrations, rewards and empty states — never behind content
 * people need to read.
 */

/** Short burst of material-shaped confetti. Mount it to fire it; it is aria-hidden. */
export const Confetti: React.FC<{ count?: number; top?: string }> = ({ count = 30, top = '42%' }) => {
  const pieces = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (i % 3) * 0.4;
    const dist = 90 + ((i * 53) % 110);
    return {
      m: MATERIAL_LIST[i % MATERIAL_LIST.length].id,
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist * 0.8 - 40,
      rot: (i % 2 ? 1 : -1) * (180 + ((i * 37) % 260)),
      delay: (i % 6) * 0.04,
      size: 16 + ((i * 7) % 12)
    };
  });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
      <div className="absolute left-1/2" style={{ top }}>
        {pieces.map((p, i) => (
          <span
            key={i}
            className="absolute"
            style={
              {
                '--dx': `${p.dx}px`,
                '--dy': `${p.dy}px`,
                '--rot': `${p.rot}deg`,
                animation: `cl-confetti 2.1s ${p.delay}s cubic-bezier(.15,.7,.3,1) both`,
                filter: 'drop-shadow(0 0 1.5px #fff) drop-shadow(0 0 1px #fff)'
              } as React.CSSProperties
            }
          >
            <MaterialGlyph material={p.m} size={p.size} />
          </span>
        ))}
      </div>
    </div>
  );
};

/** Rickshaw-art palette: saturated, joyful, used sparingly. */
export const RICKSHAW = { magenta: '#D6336C', marigold: '#F5A524', teal: '#0E9F8E', cobalt: '#2152C4', leaf: '#3FA34D', ink: '#1B1F3B' };

/**
 * Decorative band of petals, dots and scallops in rickshaw-art colours.
 * Original geometric motif — not a reproduction of any specific artwork.
 */
export const RickshawBand: React.FC<{ height?: number; className?: string }> = ({ height = 28, className = '' }) => {
  const id = React.useId().replace(/:/g, '');
  const c = RICKSHAW;
  return (
    <svg className={className} width="100%" height={height} aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <pattern id={`rb-${id}`} width="56" height="28" patternUnits="userSpaceOnUse">
          <rect width="56" height="28" fill={c.ink} />
          <path d="M0 28 Q7 18 14 28 Q21 18 28 28 Q35 18 42 28 Q49 18 56 28Z" fill={c.marigold} />
          <circle cx="14" cy="11" r="6" fill={c.magenta} />
          <circle cx="14" cy="11" r="2.4" fill={c.marigold} />
          <path d="M42 4 L46 11 L42 18 L38 11Z" fill={c.teal} />
          <circle cx="42" cy="11" r="1.6" fill="#fff" />
          <circle cx="28" cy="6" r="1.6" fill={c.leaf} />
          <circle cx="0" cy="6" r="1.6" fill={c.cobalt} />
          <circle cx="56" cy="6" r="1.6" fill={c.cobalt} />
        </pattern>
      </defs>
      <rect width="100%" height={height} fill={`url(#rb-${id})`} />
    </svg>
  );
};

/** Empty state that teaches the next step, with the band as a quiet accent. */
export const EmptyState: React.FC<{ title: React.ReactNode; body?: React.ReactNode; action?: React.ReactNode; icon?: React.ReactNode }> = ({
  title,
  body,
  action,
  icon
}) => (
  <div className="rounded-3xl border border-[#EDE4D8] bg-white overflow-hidden text-center">
    <RickshawBand height={14} />
    <div className="px-6 py-8 space-y-3">
      {icon && <div className="mx-auto w-12 h-12 grid place-items-center rounded-2xl bg-[#FAF5EC]">{icon}</div>}
      <h3 className="font-display text-lg font-bold text-[#172521]">{title}</h3>
      {body && <p className="text-sm text-[#53616D] max-w-sm mx-auto">{body}</p>}
      {action && <div className="pt-1">{action}</div>}
    </div>
  </div>
);
