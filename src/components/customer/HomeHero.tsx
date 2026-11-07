import React, { useEffect, useState } from 'react';
import { ArrowRight, Droplets, Layers, ShoppingBag, XCircle, ClipboardList, LifeBuoy, Repeat2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Confetti, RickshawBand } from '../../design/Celebrate';
import { JourneyLine } from '../../design/JourneyLine';
import { MaterialGlyph } from '../../design/materials';
import type { Booking } from '../../types';
import { MaterialChips, useJourney } from './BookingBits';
import { relativeDayLabel } from './dates';
import { isCancellable } from './useCustomerData';
import type { HeroModel } from './useHeroModel';
import { CARD, DANGER_GHOST, GHOST, PRIMARY, SECONDARY } from './ui';

interface HomeHeroProps {
  model: HeroModel;
  onBook: () => void;
  onSameAsLast?: () => void;
  onTrack: (b: Booking) => void;
  onChecklist: (b: Booking) => void;
  onCancel: (b: Booking) => void;
  onHelp: (bookingId?: string) => void;
  onSeeRewards: () => void;
}

const celebratedKey = (id: string) => `cleanlane:celebrated:${id}`;

const Steps: React.FC<{ lang: 'en' | 'bn' }> = ({ lang }) => {
  const steps = [
    { Icon: Droplets, en: 'Rinse', bn: 'ধুয়ে নিন', tip: lang === 'en' ? 'Quick rinse, no food left' : 'খাবার না থাকে' },
    { Icon: Layers, en: 'Flatten', bn: 'চ্যাপ্টা করুন', tip: lang === 'en' ? 'Squash bottles and boxes' : 'বোতল ও বাক্স চেপে দিন' },
    { Icon: ShoppingBag, en: 'Bag', bn: 'ব্যাগে ভরুন', tip: lang === 'en' ? 'One bag, by the door' : 'এক ব্যাগ, দরজার কাছে' }
  ];
  return (
    <ol className="grid grid-cols-3 gap-2">
      {steps.map(({ Icon, en, bn, tip }, i) => (
        <li key={en} className="cl-rise rounded-2xl bg-white/70 p-3 text-center ring-1 ring-[#124B3A]/10" style={{ animationDelay: `${i * 90}ms` }}>
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#CBEA70] text-[#124B3A]">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="mt-2 block text-base font-extrabold">
            {i + 1}. {lang === 'en' ? en : bn}
          </span>
          <span className="mt-0.5 block text-[11px] font-medium leading-tight text-[#124B3A]/65">{tip}</span>
        </li>
      ))}
    </ol>
  );
};

const LiveDot: React.FC = () => (
  <span className="relative inline-grid h-3 w-3 place-items-center" aria-hidden="true">
    <span className="absolute inset-0 rounded-full bg-[#124B3A]/50 cl-ring" />
    <span className="relative h-3 w-3 rounded-full bg-[#124B3A]" />
  </span>
);

/** One card that changes with the situation. Exactly one primary button. */
export const HomeHero: React.FC<HomeHeroProps> = ({ model, onBook, onSameAsLast, onTrack, onChecklist, onCancel, onHelp, onSeeRewards }) => {
  const { lang } = useApp();
  const en = lang === 'en';
  const b = model.booking;
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    if (model.kind !== 'celebrate' || !b) return;
    try {
      if (!window.localStorage.getItem(celebratedKey(b.id))) {
        window.localStorage.setItem(celebratedKey(b.id), '1');
        setConfetti(true);
      }
    } catch {
      setConfetti(true);
    }
  }, [model.kind, b]);

  const shell = (tone: 'lime' | 'paper' | 'amber', children: React.ReactNode, band = false) => (
    <section
      aria-labelledby="home-hero-title"
      className={`relative overflow-hidden rounded-[28px] p-5 sm:p-6 ring-1 text-[#124B3A] ${
        tone === 'lime' ? 'bg-[#EAF5C9] ring-[#124B3A]/15' : tone === 'amber' ? 'bg-[#FFF4DC] ring-[#B9772B]/30' : 'bg-white ring-[#124B3A]/10'
      }`}
    >
      {children}
      {band && <RickshawBand height={10} className="absolute inset-x-0 bottom-0" />}
    </section>
  );

  const title = (
    <h1 id="home-hero-title" className="font-display text-[28px] font-extrabold leading-[1.08] sm:text-[32px]">
      {model.title}
    </h1>
  );
  const body = <p className="mt-2 text-[15px] font-medium leading-snug text-[#124B3A]/75">{model.body}</p>;

  if (model.kind === 'none') {
    return shell(
      'paper',
      <>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {(['PET_BOTTLES', 'CARDBOARD_OCC', 'ALUMINUM_CANS', 'HDPE_RIGID'] as const).map((m) => (
            <MaterialGlyph key={m} material={m} size={26} />
          ))}
        </div>
        <div className="mt-3">{title}</div>
        {body}
        <div className="mt-5 space-y-2.5">
          <button type="button" onClick={onBook} className={PRIMARY}>
            {en ? 'Book a pickup' : 'পিকআপ বুক করুন'}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
          {onSameAsLast && (
            <button type="button" onClick={onSameAsLast} className={`${SECONDARY} w-full`}>
              <Repeat2 className="h-4 w-4" aria-hidden="true" />
              {en ? 'Same as last time' : 'আগের বারের মতোই'}
            </button>
          )}
        </div>
      </>
    );
  }

  if (!b) return null;

  if (model.kind === 'celebrate') {
    return (
      <section aria-labelledby="home-hero-title" className="relative overflow-hidden rounded-[28px] bg-[#124B3A] p-5 pb-7 text-white sm:p-6">
        {confetti && <Confetti />}
        <p className="text-sm font-bold text-[#CBEA70]">{en ? 'Weighed at the hub' : 'হাবে ওজন হয়েছে'}</p>
        <h1 id="home-hero-title" className="cl-pop font-display text-[40px] font-extrabold leading-none text-[#CBEA70]">
          {model.title} <span aria-hidden="true">🎉</span>
        </h1>
        <p className="mt-2 text-[15px] font-medium leading-snug text-white/85">{model.body}</p>
        <div className="mt-5">
          <button type="button" onClick={onSeeRewards} className={`${PRIMARY} !bg-[#CBEA70] !text-[#124B3A]`}>
            {en ? 'See my rewards' : 'আমার রিওয়ার্ড দেখুন'}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <RickshawBand height={10} className="absolute inset-x-0 bottom-0" />
      </section>
    );
  }

  if (model.kind === 'review' || model.kind === 'missed' || model.kind === 'disputed') {
    return shell(
      'amber',
      <>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <MaterialChips booking={b} />
        </div>
        {title}
        {body}
        <div className="mt-5">
          <button type="button" onClick={() => onHelp(b.id)} className={PRIMARY}>
            <LifeBuoy className="h-5 w-5" aria-hidden="true" />
            {en ? 'Talk to us' : 'আমাদের সাথে কথা বলুন'}
          </button>
          <div className="mt-2 flex justify-center">
            <button type="button" onClick={() => onTrack(b)} className={GHOST}>
              {en ? 'See where it is' : 'কোথায় আছে দেখুন'}
            </button>
          </div>
        </div>
      </>
    );
  }

  // Active booking: ready / today / later
  const cancellable = isCancellable(b);
  return (
    <ActiveHero
      model={model}
      booking={b}
      shell={shell}
      title={title}
      body={body}
      onTrack={onTrack}
      onChecklist={onChecklist}
      onCancel={cancellable ? onCancel : undefined}
    />
  );
};

const ActiveHero: React.FC<{
  model: HeroModel;
  booking: Booking;
  shell: (tone: 'lime' | 'paper' | 'amber', children: React.ReactNode, band?: boolean) => React.ReactElement;
  title: React.ReactNode;
  body: React.ReactNode;
  onTrack: (b: Booking) => void;
  onChecklist: (b: Booking) => void;
  onCancel?: (b: Booking) => void;
}> = ({ model, booking: b, shell, title, body, onTrack, onChecklist, onCancel }) => {
  const { lang } = useApp();
  const en = lang === 'en';
  const j = useJourney(b);
  return shell(
    'lime',
    <>
      <div className="mb-3 flex items-center gap-2 text-sm font-extrabold">
        {model.kind === 'today' ? <LiveDot /> : null}
        <span>
          {relativeDayLabel(b.scheduledDate, lang)} · {b.scheduledTimeWindow}
        </span>
      </div>
      {title}
      {body}
      {model.kind === 'ready' && (
        <div className="mt-4">
          <Steps lang={lang} />
        </div>
      )}
      <div className="mt-4 rounded-2xl bg-white/70 p-3 ring-1 ring-[#124B3A]/10">
        <JourneyLine stops={j.stops} lang={lang} orientation="horizontal" />
      </div>
      <div className="mt-3">
        <MaterialChips booking={b} />
      </div>
      <div className="mt-5">
        <button type="button" onClick={() => onTrack(b)} className={PRIMARY}>
          {en ? 'See pickup details' : 'পিকআপের বিবরণ দেখুন'}
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3">
          {model.kind !== 'later' && (
            <button type="button" onClick={() => onChecklist(b)} className={GHOST}>
              <ClipboardList className="h-4 w-4" aria-hidden="true" />
              {en ? 'Preparation checklist' : 'প্রস্তুতির তালিকা'}
            </button>
          )}
          {onCancel && (
            <button type="button" onClick={() => onCancel(b)} className={DANGER_GHOST}>
              <XCircle className="h-4 w-4" aria-hidden="true" />
              {en ? 'Cancel pickup' : 'বাতিল করুন'}
            </button>
          )}
        </div>
      </div>
    </>
  );
};
