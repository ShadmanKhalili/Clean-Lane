import React from 'react';
import { STAGES, STAGE_INFO, stageIndex, type LiveBooking } from '../../model';
import { fmtNum, fmtTime, pick, type Lang } from './shared';

/** Vertical six-stop journey: done = check, current = pulsing, upcoming = quiet. */
export const Journey: React.FC<{ booking: LiveBooking; lang: Lang }> = ({ booking, lang }) => {
  const cur = stageIndex(booking.stage);
  return (
    <ol className="relative" aria-label={pick(lang, 'Your bag’s journey', 'আপনার ব্যাগের যাত্রা')}>
      {STAGES.map((s, i) => {
        const done = i < cur || (i === cur && s === 'recycled');
        const current = i === cur && !done;
        const at = booking.chain.find((e) => e.stage === s)?.at;
        return (
          <li key={s} className="relative flex items-center gap-4 pb-4 last:pb-0" aria-current={current ? 'step' : undefined}>
            {i < STAGES.length - 1 && (
              <span className={`absolute left-[15px] top-8 h-[calc(100%-1rem)] w-0.5 ${i < cur ? 'bg-[#124B3A]' : 'bg-[#124B3A]/15'}`} aria-hidden="true" />
            )}
            <span className="relative grid h-8 w-8 shrink-0 place-items-center">
              {current && <span className="absolute inset-0 rounded-full border-2 border-[#124B3A]/50" style={{ animation: 'cl-ring 1.6s ease-out infinite' }} aria-hidden="true" />}
              <span
                className={`relative grid h-8 w-8 place-items-center rounded-full border-2 text-xs font-bold ${
                  done ? 'border-[#124B3A] bg-[#124B3A] text-white' : current ? 'border-[#124B3A] bg-[#CBEA70] text-[#124B3A]' : 'border-[#124B3A]/20 bg-white text-[#124B3A]/40'
                }`}
              >
                {done ? (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  </svg>
                ) : (
                  <span className={current ? 'h-2.5 w-2.5 rounded-full bg-[#124B3A]' : ''}>{current ? '' : fmtNum(i + 1, lang)}</span>
                )}
              </span>
            </span>
            <span className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
              <span className={`text-[15px] leading-snug ${current ? 'font-extrabold text-[#124B3A]' : done ? 'font-semibold text-[#1d2b26]' : 'font-medium text-[#124B3A]/45'}`}>
                {pick(lang, STAGE_INFO[s].en, STAGE_INFO[s].bn)}
              </span>
              <time className="shrink-0 text-xs font-semibold tabular-nums text-[#124B3A]/55" dateTime={at}>
                {done || current ? fmtTime(at, lang) : ''}
              </time>
            </span>
          </li>
        );
      })}
    </ol>
  );
};
