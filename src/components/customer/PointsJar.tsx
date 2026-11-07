import React from 'react';
import { Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { pointsToTaka } from '../../domain/rules';
import type { RewardItem } from '../../types';
import { nf, taka } from './ui';

export const shortPartner = (r: RewardItem) => r.partnerName.replace(/^Charity:\s*/, '').replace(/\s*\(.*\)/, '').split(/\s+/).slice(0, 2).join(' ');

/** Jar interior in viewBox units. */
const TOP = 34;
const BOTTOM = 172;
const H = 250;
const VB_H = 190;

/**
 * Points as a filling jar. Fill = available points against the dearest reward;
 * each reward is a line on the jar, ticked once you can afford it.
 */
export const PointsJar: React.FC<{ available: number; pending: number; rewards: RewardItem[] }> = ({ available, pending, rewards }) => {
  const { lang } = useApp();
  const en = lang === 'en';
  const sorted = [...rewards].sort((a, b) => a.pointsCost - b.pointsCost);
  const cap = Math.max(1, ...sorted.map((r) => r.pointsCost));
  const level = Math.min(1, Math.max(0, available / cap));
  const next = sorted.find((r) => r.pointsCost > available && r.stockAvailable > 0);
  const worth = pointsToTaka(available, rewards);

  const interior = (BOTTOM - TOP) * (H / VB_H); // px
  const fillH = (BOTTOM - TOP) * level;
  // Label positions in px from the jar's top, nudged so labels never overlap.
  const MIN_GAP = 30;
  const ys = sorted.map((r) => ((TOP * H) / VB_H) + interior * (1 - r.pointsCost / cap));
  ys[0] = Math.min(ys[0], H - 22);
  for (let i = 1; i < ys.length; i++) ys[i] = Math.min(ys[i], ys[i - 1] - MIN_GAP);

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 sm:gap-5">
      <svg viewBox="0 0 140 190" height={H} width={(140 * H) / VB_H} role="img" aria-label={en ? `Jar filled to ${Math.round(level * 100)} percent of your biggest reward` : `আপনার সবচেয়ে বড় রিওয়ার্ডের ${Math.round(level * 100)} শতাংশ পূর্ণ জার`}>
        <defs>
          <clipPath id="jar-clip">
            <path d="M40 34h60v8c13 7 22 19 22 38v78a14 14 0 0 1-14 14H32a14 14 0 0 1-14-14V80c0-19 9-31 22-38Z" />
          </clipPath>
          <linearGradient id="jar-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#CBEA70" />
            <stop offset="1" stopColor="#7DBE4A" />
          </linearGradient>
        </defs>
        <path d="M40 34h60v8c13 7 22 19 22 38v78a14 14 0 0 1-14 14H32a14 14 0 0 1-14-14V80c0-19 9-31 22-38Z" fill="#F4F8EA" />
        <g clipPath="url(#jar-clip)">
          <rect key={Math.round(available)} className="cl-fill" x="10" width="120" y={BOTTOM - fillH} height={fillH} fill="url(#jar-fill)" style={{ transformBox: 'fill-box', transformOrigin: 'bottom' }} />
          {sorted.map((r) => {
            const y = BOTTOM - (BOTTOM - TOP) * (r.pointsCost / cap);
            return <line key={r.id} x1="10" x2="130" y1={y} y2={y} stroke="#124B3A" strokeOpacity=".45" strokeWidth="1.5" strokeDasharray="4 3" />;
          })}
        </g>
        <path d="M40 34h60v8c13 7 22 19 22 38v78a14 14 0 0 1-14 14H32a14 14 0 0 1-14-14V80c0-19 9-31 22-38Z" fill="none" stroke="#124B3A" strokeWidth="3" strokeLinejoin="round" />
        <rect x="34" y="20" width="72" height="14" rx="6" fill="#124B3A" />
      </svg>

      <div className="relative min-w-0" style={{ height: H }}>
        {sorted.map((r, i) => {
          const reached = available >= r.pointsCost;
          return (
            <div key={r.id} className="absolute inset-x-0 flex items-center gap-2" style={{ top: ys[i] - 14 }}>
              <span className="h-px w-3 shrink-0 bg-[#124B3A]/40" aria-hidden="true" />
              <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${reached ? 'bg-[#124B3A] text-[#CBEA70]' : 'bg-white text-transparent ring-1 ring-[#124B3A]/25'}`}>
                <Check className="h-3 w-3" strokeWidth={3.5} aria-hidden="true" />
              </span>
              <span className="min-w-0 leading-tight">
                <span className={`text-base font-extrabold ${reached ? 'text-[#124B3A]' : 'text-[#124B3A]/70'}`}>{taka(r.cashEquivalentBdt, lang)}</span>{' '}
                <span className="text-[11px] font-semibold text-[#124B3A]/60">{nf(r.pointsCost, lang)}</span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="col-span-2">
        <p className="font-display text-[40px] font-extrabold leading-none text-[#124B3A]">
          {nf(available, lang)} <span className="text-lg font-bold">{en ? 'points' : 'পয়েন্ট'}</span>
        </p>
        {worth !== null && (
          <p className="mt-1 text-base font-bold text-[#124B3A]/75">≈ {taka(worth, lang)} {en ? 'in vouchers' : 'ভাউচারে'}</p>
        )}
        {next ? (
          <p className="mt-2 text-sm font-semibold text-[#124B3A]">
            {en
              ? `${nf(next.pointsCost - available, lang)} more points until your ${taka(next.cashEquivalentBdt, lang)} ${shortPartner(next)} reward`
              : `${taka(next.cashEquivalentBdt, lang)} ${shortPartner(next)} রিওয়ার্ডের জন্য আর ${nf(next.pointsCost - available, lang)} পয়েন্ট বাকি`}
          </p>
        ) : (
          <p className="mt-2 text-sm font-semibold text-[#124B3A]">{en ? 'Your jar is full. Pick any reward below.' : 'আপনার জার পূর্ণ। নিচ থেকে যেকোনো রিওয়ার্ড বেছে নিন।'}</p>
        )}
      </div>
    </div>
  );
};
