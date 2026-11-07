import React from 'react';
import { MaterialGlyph } from '../../../design/materials';
import type { RoomTotals } from '../../model';
import { useCountUp } from './useCountUp';
import type { Impact } from './feed';

const Big: React.FC<{ value: number; decimals?: number; label: string; unit?: string }> = ({ value, decimals = 0, label, unit }) => {
  const v = useCountUp(value, decimals);
  return (
    <div className="min-w-0">
      <div className="font-display font-bold leading-none tracking-tight text-[#F4F7EF] tabular-nums" style={{ fontSize: 'clamp(46px, 7.2vh, 88px)' }}>
        {v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
        {unit && <span className="ml-1 text-[.36em] font-semibold text-[#CBEA70]">{unit}</span>}
      </div>
      <div className="mt-[.6em] text-[.78em] font-semibold uppercase tracking-[.18em] text-[#F4F7EF]/60">{label}</div>
    </div>
  );
};

export const LiveNumbers: React.FC<{ totals: RoomTotals; impact: Impact }> = ({ totals, impact }) => {
  const items = useCountUp(impact.items);
  return (
    <section aria-label="Live numbers">
      <div className="grid grid-cols-3 gap-[1.2em]">
        <Big value={totals.households} label="Households" />
        <Big value={totals.kg} decimals={1} unit="kg" label="Recovered" />
        <Big value={totals.points} label="Points earned" />
      </div>
      <div className="mt-[1.4em] flex flex-wrap items-center gap-x-[.8em] gap-y-1 text-[1.05em] text-[#F4F7EF]/85">
        {impact.items > 0 ? (
          <>
            <span className="font-display text-[1.3em] font-semibold text-[#CBEA70] tabular-nums">{'≈'} {items.toLocaleString('en-US')}</span>
            <span>everyday items kept out of the canals</span>
            <span className="flex items-center gap-[.9em] text-[.8em] text-[#F4F7EF]/55">
              {impact.top.slice(0, 2).map((t) => (
                <span key={t.material} className="inline-flex items-center gap-[.4em]">
                  <MaterialGlyph material={t.material} size={14} /> {t.count.toLocaleString('en-US')} {t.noun}
                </span>
              ))}
            </span>
          </>
        ) : (
          <span className="text-[#F4F7EF]/55">Every kilo is weighed, verified and traced. Impact appears with the first pickup.</span>
        )}
      </div>
    </section>
  );
};
