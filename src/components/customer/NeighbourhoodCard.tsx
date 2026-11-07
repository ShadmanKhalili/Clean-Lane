import React from 'react';
import { Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNeighbourhood } from './useNeighbourhood';
import { CARD, PilotTag, nf } from './ui';

/** Neighbourhood goal and a friendly area leaderboard. Figures are pilot sample data plus real pickups. */
export const NeighbourhoodCard: React.FC<{ zoneId?: string; className?: string }> = ({ zoneId, className = '' }) => {
  const { lang } = useApp();
  const en = lang === 'en';
  const { rows, mine, goalKg } = useNeighbourhood(zoneId);
  const tonnes = (kg: number) => nf(kg / 1000, lang, 1);
  const name = (r: { en: string; bn: string }) => (en ? r.en : r.bn);
  const max = Math.max(...rows.map((r) => r.kg));

  return (
    <section className={`${CARD} p-5 text-[#124B3A] ${className}`} aria-labelledby="goal-title">
      <div className="flex items-start justify-between gap-2">
        <h2 id="goal-title" className="font-display text-xl font-extrabold leading-tight">
          {en
            ? `${mine.en} is ${nf(mine.pct, lang)}% of the way to ${tonnes(goalKg)} tonnes this month`
            : `এই মাসে ${tonnes(goalKg)} টনের লক্ষ্যে ${mine.bn} ${nf(mine.pct, lang)}% এগিয়েছে`}
        </h2>
        <PilotTag lang={lang} />
      </div>
      <div
        className="mt-3 h-4 overflow-hidden rounded-full bg-[#124B3A]/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={mine.pct}
        aria-label={en ? 'Neighbourhood goal' : 'এলাকার লক্ষ্য'}
      >
        <div className="cl-draw-x h-full origin-left rounded-full bg-gradient-to-r from-[#7DBE4A] to-[#CBEA70]" style={{ width: `${mine.pct}%` }} />
      </div>
      <p className="mt-1.5 text-xs font-semibold text-[#124B3A]/65">
        {en ? `${tonnes(mine.kg)} of ${tonnes(goalKg)} tonnes. Your bags are part of this.` : `${tonnes(goalKg)} টনের মধ্যে ${tonnes(mine.kg)} টন। আপনার ব্যাগও এর অংশ।`}
      </p>

      <h3 className="mt-5 flex items-center gap-1.5 text-sm font-extrabold">
        <Users className="h-4 w-4" aria-hidden="true" />
        {en ? 'Friendly race between areas' : 'এলাকাগুলোর বন্ধুত্বপূর্ণ প্রতিযোগিতা'}
      </h3>
      <ol className="mt-2 space-y-2">
        {rows.map((r) => (
          <li key={r.zoneId} className={`rounded-2xl px-3 py-2 ${r.mine ? 'bg-[#EAF5C9] ring-1 ring-[#124B3A]/20' : 'bg-[#FAF9F5]'}`}>
            <div className="flex items-center justify-between gap-2 text-sm font-bold">
              <span className="flex min-w-0 items-center gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#124B3A] text-xs font-extrabold text-[#CBEA70]">{nf(r.rank, lang)}</span>
                <span className="truncate">
                  {name(r)}
                  {r.mine && <span className="ml-1.5 text-xs font-semibold text-[#124B3A]/60">{en ? '(you)' : '(আপনি)'}</span>}
                </span>
              </span>
              <span className="shrink-0 tabular-nums">{tonnes(r.kg)} {en ? 't' : 'টন'}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#124B3A]/10" aria-hidden="true">
              <div className="h-full rounded-full bg-[#124B3A]" style={{ width: `${(r.kg / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-[11px] font-medium text-[#124B3A]/55">
        {en
          ? 'Area totals combine real pickups with simulated pilot sample figures for the demo.'
          : 'এলাকার মোট হিসাবে আসল পিকআপের সঙ্গে ডেমোর জন্য নমুনা সংখ্যা যোগ করা হয়েছে।'}
      </p>
    </section>
  );
};
