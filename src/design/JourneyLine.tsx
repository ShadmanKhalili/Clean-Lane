import React from 'react';
import type { JourneyStop } from './journey';

/**
 * Transit-line journey. Completed stops become stamps, the current stop pulses,
 * and the line draws itself up to the current stop. `showTags` adds evidence
 * codes (E0–E5) for staff and brand views; customers never see them.
 */
export interface JourneyLineProps {
  stops: JourneyStop[];
  lang: 'en' | 'bn';
  orientation?: 'vertical' | 'horizontal';
  showTags?: boolean;
  /** Dim everything (cancelled / missed). */
  muted?: boolean;
  className?: string;
}

const fmtWhen = (iso: string | undefined, lang: 'en' | 'bn') => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'short' });
};

const Check = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

const Dot: React.FC<{ stop: JourneyStop; n: number; lang: 'en' | 'bn' }> = ({ stop, n, lang }) => (
  <span className="relative grid h-8 w-8 shrink-0 place-items-center">
    {stop.state === 'current' && (
      <span className="absolute inset-0 rounded-full border-2 border-[#124B3A]/50 cl-ring" aria-hidden="true" />
    )}
    <span
      className={`relative grid h-8 w-8 place-items-center rounded-full border-2 text-xs font-bold ${
        stop.state === 'done'
          ? 'border-[#124B3A] bg-[#124B3A] text-white cl-stamp'
          : stop.state === 'current'
          ? 'border-[#124B3A] bg-[#CBEA70] text-[#124B3A]'
          : 'border-[#124B3A]/20 bg-white text-[#124B3A]/40'
      }`}
    >
      {stop.state === 'done' ? <Check /> : stop.state === 'current' ? <span className="h-2.5 w-2.5 rounded-full bg-[#124B3A]" /> : (n + 1).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en')}
    </span>
  </span>
);

export const JourneyLine: React.FC<JourneyLineProps> = ({ stops, lang, orientation = 'vertical', showTags = false, muted = false, className = '' }) => {
  const label = lang === 'bn' ? 'পিকআপের যাত্রা' : 'Pickup journey';
  const progress = Math.max(0, stops.findIndex((s) => s.state !== 'done'));
  const doneCount = progress === -1 ? stops.length : progress;

  if (orientation === 'horizontal') {
    const pct = stops.length > 1 ? (Math.min(doneCount, stops.length - 1) / (stops.length - 1)) * 100 : 0;
    return (
      <div className={`${muted ? 'opacity-50 grayscale' : ''} ${className}`}>
        <ol className="relative grid" style={{ gridTemplateColumns: `repeat(${stops.length}, minmax(0, 1fr))` }} aria-label={label}>
          <span className="absolute left-4 right-4 top-4 h-0.5 bg-[#124B3A]/15" aria-hidden="true" />
          <span className="absolute left-4 top-4 h-0.5 bg-[#124B3A] cl-draw-x origin-left" style={{ width: `calc((100% - 2rem) * ${pct / 100})` }} aria-hidden="true" />
          {stops.map((s, i) => (
            <li key={s.id} className="relative flex flex-col items-center text-center gap-1.5" aria-current={s.state === 'current' ? 'step' : undefined}>
              <Dot stop={s} n={i} lang={lang} />
              <span className={`text-[11px] leading-tight ${s.state === 'current' ? 'font-extrabold text-[#124B3A]' : s.state === 'done' ? 'font-semibold text-[#1d2b26]' : 'text-[#124B3A]/45'}`}>
                {lang === 'bn' ? s.bn : s.en}
              </span>
              {showTags && <span className="text-[9px] font-bold text-[#53616D] bg-[#F1EDE4] rounded px-1">{s.tag}</span>}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <ol className={`relative ${muted ? 'opacity-50 grayscale' : ''} ${className}`} aria-label={label}>
      {stops.map((s, i) => (
        <li key={s.id} className="relative flex items-start gap-4 pb-4 last:pb-0" aria-current={s.state === 'current' ? 'step' : undefined}>
          {i < stops.length - 1 && (
            <span className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-0.5 bg-[#124B3A]/15" aria-hidden="true">
              {s.state === 'done' && <span className="absolute inset-0 bg-[#124B3A] cl-draw-y origin-top" style={{ animationDelay: `${i * 90}ms` }} />}
            </span>
          )}
          <Dot stop={s} n={i} lang={lang} />
          <span className="flex min-w-0 flex-1 flex-col pt-1">
            <span className="flex items-baseline justify-between gap-3">
              <span className={`text-[15px] leading-snug ${s.state === 'current' ? 'font-extrabold text-[#124B3A]' : s.state === 'done' ? 'font-semibold text-[#1d2b26]' : 'font-medium text-[#124B3A]/45'}`}>
                {lang === 'bn' ? s.bn : s.en}
                {showTags && <span className="ml-2 align-middle text-[10px] font-bold text-[#53616D] bg-[#F1EDE4] rounded px-1">{s.tag}</span>}
              </span>
              <time className="shrink-0 text-xs font-semibold tabular-nums text-[#124B3A]/55" dateTime={s.at}>
                {fmtWhen(s.at, lang)}
              </time>
            </span>
            {s.state === 'current' && (s.hintEn || s.hintBn) && (
              <span className="text-xs text-[#53616D] mt-0.5">{lang === 'bn' ? s.hintBn : s.hintEn}</span>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
};
