import React from 'react';

/**
 * Shared look for the customer app, matched to the pitch screens: warm paper,
 * brand green ink, lime highlight, generous radii. One primary button per
 * screen; everything else is secondary or a quiet text link.
 */
export const BRAND = '#124B3A';
export const LIME = '#CBEA70';
export const INK = '#172521';

export const FOCUS = 'focus:outline-none focus-visible:ring-4 focus-visible:ring-[#CBEA70] focus-visible:ring-offset-0';

export const CARD = 'rounded-[28px] bg-white ring-1 ring-[#124B3A]/10 shadow-[0_1px_0_rgba(18,75,58,.04)]';
export const PRIMARY = `inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#124B3A] px-5 text-base font-extrabold text-[#CBEA70] shadow-[0_14px_28px_-16px_rgba(18,75,58,.85)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer ${FOCUS}`;
export const SECONDARY = `inline-flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-[#124B3A]/20 bg-white px-4 text-sm font-bold text-[#124B3A] transition hover:border-[#124B3A]/50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer ${FOCUS}`;
export const GHOST = `inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-2 text-sm font-bold text-[#124B3A] underline-offset-4 hover:underline cursor-pointer ${FOCUS}`;
export const DANGER_GHOST = `inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-2 text-sm font-bold text-[#9B1C1C] underline-offset-4 hover:underline cursor-pointer ${FOCUS}`;

/** Small uppercase-free label used above a number or section. */
export const EYEBROW = 'text-xs font-bold tracking-wide text-[#124B3A]/60';

/** Tag for illustrative numbers that are not this customer's own data. */
export const PilotTag: React.FC<{ lang: 'en' | 'bn' }> = ({ lang }) => (
  <span className="inline-flex items-center rounded-full bg-[#F5E7C8] px-2 py-0.5 text-[10px] font-bold text-[#7A4D00]">
    {lang === 'en' ? 'Pilot sample' : 'পাইলট নমুনা'}
  </span>
);

export const nf = (n: number, lang: 'en' | 'bn', digits = 0) =>
  n.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-GB', { maximumFractionDigits: digits, minimumFractionDigits: digits });

export const taka = (n: number, lang: 'en' | 'bn') => `৳${nf(n, lang)}`;
