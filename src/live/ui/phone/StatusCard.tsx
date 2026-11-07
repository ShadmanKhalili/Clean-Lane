import React from 'react';
import { MATERIALS, MaterialGlyph, relatableCount } from '../../../design/materials';
import type { LiveBooking } from '../../model';
import { Confetti, fmtNum, pick, type Lang } from './shared';
import { Trike } from './Trike';

const Spinner = () => <span className="inline-block h-5 w-5 animate-spin rounded-full border-[3px] border-white/30 border-t-[#CBEA70]" aria-hidden="true" />;

/** The big, changing card above the journey. Copy is plain language; no evidence codes. */
export const StatusCard: React.FC<{ booking: LiveBooking; lang: Lang; verifyUrl: string }> = ({ booking: b, lang, verifyUrl }) => {
  const m = MATERIALS[b.materials[0] ?? 'PET_BOTTLES'];
  const mName = pick(lang, m.en.toLowerCase(), m.bn);
  const kg = b.weightKg ?? 0;
  const base = 'cl-rise relative overflow-visible rounded-[28px] bg-[#124B3A] p-6 text-white shadow-[0_18px_40px_-18px_rgba(18,75,58,.7)]';

  if (b.stage === 'booked') {
    return (
      <section className={base} aria-live="polite">
        <Spinner />
        <h2 className="mt-4 font-display text-[28px] font-extrabold leading-tight">{pick(lang, 'Finding a collector near you…', 'আপনার কাছের সংগ্রাহক খোঁজা হচ্ছে…')}</h2>
        <p className="mt-2 text-[15px] text-white/75">{pick(lang, 'Your pickup is booked. Stay on this screen.', 'আপনার পিকআপ বুক হয়েছে। এই স্ক্রিনেই থাকুন।')}</p>
      </section>
    );
  }
  if (b.stage === 'accepted') {
    return (
      <section className={base} aria-live="polite">
        <Trike />
        <h2 className="mt-2 font-display text-[28px] font-extrabold leading-tight">
          {pick(lang, `${b.collector ?? 'Your collector'} is on the way`, `${b.collector ?? 'সংগ্রাহক'} আসছেন`)}
        </h2>
        <p className="mt-2 text-[15px] text-white/75">{pick(lang, 'Keep your bag by the door.', 'ব্যাগটি দরজার কাছে রাখুন।')}</p>
      </section>
    );
  }
  if (b.stage === 'collected') {
    return (
      <section className={base} aria-live="polite">
        <p className="text-sm font-bold uppercase tracking-wide text-[#CBEA70]">{pick(lang, 'Weighed at your door', 'আপনার দরজায় ওজন হয়েছে')}</p>
        <p className="cl-pop mt-1 font-display text-[56px] font-extrabold leading-none">
          {fmtNum(kg, lang, 1)} <span className="text-3xl">{pick(lang, 'kg', 'কেজি')}</span>
        </p>
        <p className="mt-3 flex items-center gap-2 text-[17px] font-semibold">
          <MaterialGlyph material={m.id} size={22} />
          {pick(lang, `≈ ${fmtNum(relatableCount(m.id, kg), lang)} ${m.itemEn}`, `≈ ${fmtNum(relatableCount(m.id, kg), lang)}টি ${m.itemBn}`)}
        </p>
        <p className="mt-4 rounded-2xl bg-white/12 px-4 py-3 text-[15px] font-medium text-white/90">
          {pick(lang, 'Points are confirmed at the hub scale. Almost there.', 'হাবের স্কেলে ওজন মিললে পয়েন্ট নিশ্চিত হবে। আর একটু বাকি।')}
        </p>
      </section>
    );
  }
  if (b.stage === 'verified') {
    return (
      <section className={`${base} text-center`} aria-live="polite">
        <Confetti />
        <p className="text-sm font-bold uppercase tracking-wide text-[#CBEA70]">{pick(lang, 'Confirmed at the hub scale', 'হাবের স্কেলে নিশ্চিত')}</p>
        <p className="cl-pop mt-2 font-display text-[68px] font-extrabold leading-none text-[#CBEA70]">+{fmtNum(b.points ?? 0, lang)}</p>
        <p className="font-display text-2xl font-extrabold">{pick(lang, 'points earned', 'পয়েন্ট পেলেন')}</p>
        <p className="mt-2 text-[15px] text-white/75">{pick(lang, `${fmtNum(b.hubWeightKg ?? kg, lang, 1)} kg of ${mName}`, `${fmtNum(b.hubWeightKg ?? kg, lang, 1)} কেজি ${mName}`)}</p>
        <a
          href={verifyUrl}
          className="mt-5 flex h-14 items-center justify-center rounded-2xl bg-[#CBEA70] px-4 text-[17px] font-extrabold text-[#124B3A] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
        >
          {pick(lang, 'See your bag’s journey', 'আপনার ব্যাগের যাত্রা দেখুন')}
        </a>
      </section>
    );
  }
  const recycled = b.stage === 'recycled';
  return (
    <section className={base} aria-live="polite">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/12">
          <MaterialGlyph material={m.id} size={28} />
        </span>
        <p className="text-sm font-bold uppercase tracking-wide text-[#CBEA70]">{recycled ? pick(lang, 'Recycled', 'রিসাইকেল সম্পন্ন') : pick(lang, 'On its way to be recycled', 'রিসাইকেলের পথে')}</p>
      </div>
      <h2 className="mt-3 font-display text-[26px] font-extrabold leading-tight">
        {recycled
          ? pick(lang, `Your ${mName} are now new material.`, `আপনার ${mName} এখন নতুন কাঁচামাল।`)
          : pick(lang, `Your ${mName} are being turned into new material at Bengal Polymers, Savar.`, `আপনার ${mName} সাভারের বেঙ্গল পলিমার্সে নতুন কাঁচামালে রূপ নিচ্ছে।`)}
      </h2>
      <p className="mt-3 text-[15px] font-semibold text-[#CBEA70]">+{fmtNum(b.points ?? 0, lang)} {pick(lang, 'points', 'পয়েন্ট')}</p>
      <a
        href={verifyUrl}
        className="mt-4 flex h-14 items-center justify-center rounded-2xl bg-[#CBEA70] px-4 text-[17px] font-extrabold text-[#124B3A] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
      >
        {pick(lang, 'See your bag’s journey', 'আপনার ব্যাগের যাত্রা দেখুন')}
      </a>
    </section>
  );
};
