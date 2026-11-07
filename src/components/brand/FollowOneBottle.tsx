import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ExternalLink, Pause, Play, RotateCcw, SkipForward, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { verifyLot } from '../../domain/custodyChain';
import { verifyLotUrl } from '../../live/routes';
import { MaterialGlyph, MATERIALS } from '../../design/materials';
import { Term } from '../../design/Glossary';
import { EmptyState } from '../../design/Celebrate';
import type { CustodyEvent } from '../../types';

const STEP_LABEL: Record<string, [string, string]> = {
  E1: ['Picked up from the customer', 'গ্রাহকের কাছ থেকে সংগ্রহ'],
  E2: ['Weighed on the hub scale', 'হাবের স্কেলে ওজন'],
  E3: ['On its way to the recycler', 'রিসাইক্লারের পথে'],
  E4: ['Recycled into new material', 'নতুন উপাদানে রিসাইকেল']
};
const STEP_MS = 1500;
const labelFor = (events: CustodyEvent[], i: number): [string, string] => {
  const lvl = events[i].evidenceLevelResult;
  if (lvl === 'E3' && events.slice(0, i).some((e) => e.evidenceLevelResult === 'E3')) return ['Arrived at the recycler', 'রিসাইক্লারের কাছে পৌঁছেছে'];
  return STEP_LABEL[lvl] ?? ['Handed on', 'হস্তান্তর'];
};
const clock = (iso: string, lang: 'en' | 'bn') =>
  new Date(iso).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/** Steps through the real custody records of one recycled lot. */
export const FollowOneBottle: React.FC<{ preferMaterial?: string }> = ({ preferMaterial }) => {
  const { lots, custodyEvents, lang } = useApp();
  const t = (en: string, bn: string) => (lang === 'en' ? en : bn);

  // Prefer a recycled (E4) PET lot, else any recycled lot with records, else any lot with records.
  const lot = useMemo(() => {
    const withEvents = lots.filter((l) => custodyEvents.some((e) => e.lotId === l.id));
    const e4 = withEvents.filter((l) => l.evidenceLevel === 'E4');
    return e4.find((l) => l.material === (preferMaterial ?? 'PET_BOTTLES')) ?? e4.find((l) => l.id === 'LOT-2026-092-OCC') ?? e4[0] ?? withEvents[0];
  }, [lots, custodyEvents, preferMaterial]);

  const verification = useMemo(() => (lot ? verifyLot(lot.id, custodyEvents, lots) : null), [lot, custodyEvents, lots]);
  const events: CustodyEvent[] = verification?.events ?? [];

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);
  const last = events.length - 1;
  const finished = step >= last;

  useEffect(() => {
    if (!playing) return;
    if (step >= last) {
      setPlaying(false);
      return;
    }
    timer.current = window.setTimeout(() => setStep((s) => Math.min(last, s + 1)), STEP_MS);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [playing, step, last]);

  if (!lot || events.length === 0) {
    return (
      <section aria-labelledby="fob-h">
        <h2 id="fob-h" className="font-display text-2xl font-bold text-slate-900 mb-3">{t('Follow one bottle', 'একটি বোতলের যাত্রা')}</h2>
        <EmptyState title={t('No journeys to follow yet', 'অনুসরণ করার মতো যাত্রা এখনো নেই')} body={t('Once a pickup has been weighed and handed on, each hand-over shows up here, one step at a time.', 'পিকআপ ওজন ও হস্তান্তর হলে প্রতিটি ধাপ এখানে একে একে দেখা যাবে।')} />
      </section>
    );
  }

  const m = MATERIALS[lot.material];
  const ev = events[step];
  const ok = !!verification?.ok;
  const reached = ok && step === last;
  const isBottle = lot.material === 'PET_BOTTLES';
  const title = isBottle ? t('Follow one bottle', 'একটি বোতলের যাত্রা') : t(`Follow one load of ${m.en.toLowerCase()}`, `${m.bn} — একটি লটের যাত্রা`);
  const [stepEn, stepBn] = labelFor(events, step);
  const startKg = events[0].quantityKg;
  const nowKg = ev.quantityKg;

  return (
    <section aria-labelledby="fob-h" className="rounded-3xl bg-[#0B1A15] text-[#EAF1E6] p-5 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="fob-h" className="font-display text-2xl sm:text-3xl font-extrabold flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white"><MaterialGlyph material={lot.material} size={24} /></span>
            {title}
          </h2>
          <p className="mt-1 text-sm text-[#EAF1E6]/70 max-w-xl">
            {t('Every hand it passed through, in order, straight from the', 'যত হাত ঘুরে গেছে, ক্রমানুসারে, সরাসরি')} <span className="[&_button]:text-[#CBEA70]"><Term id="chainOfCustody" lang={lang} /></span> {t('record.', 'রেকর্ড থেকে।')}
          </p>
          {preferMaterial && lot.material !== preferMaterial && (
            <p className="mt-1 text-xs text-[#EAF1E6]/55 max-w-xl">{t('Our most complete recorded journey so far is a cardboard load. Bottles follow exactly the same steps.', 'এখন পর্যন্ত সবচেয়ে সম্পূর্ণ রেকর্ড করা যাত্রা একটি কার্ডবোর্ড লটের। বোতলও ঠিক একই ধাপে চলে।')}</p>
          )}
        </div>
        <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${ok ? 'bg-[#CBEA70] text-[#0B1A15]' : 'bg-[#F5BF55] text-[#0B1A15]'}`} data-testid="seal">
          {ok ? <ShieldCheck className="h-5 w-5" aria-hidden="true" /> : <ShieldAlert className="h-5 w-5" aria-hidden="true" />}
          {ok ? t('Verified ✓', 'যাচাইকৃত ✓') : t('Record needs review', 'রেকর্ড পর্যালোচনা দরকার')}
        </span>
      </div>

      <ol className="grid gap-2" style={{ gridTemplateColumns: `repeat(${events.length}, minmax(0, 1fr))` }} aria-label={t('Steps', 'ধাপ')}>
        {events.map((e, i) => (
          <li key={e.id}>
            <button
              type="button"
              onClick={() => { setPlaying(false); setStep(i); }}
              aria-current={i === step ? 'step' : undefined}
              aria-label={`${i + 1}: ${t(...labelFor(events, i))}`}
              className="block w-full min-h-11 text-left group cursor-pointer"
            >
              <span className={`block h-2 rounded-full transition-colors ${i < step ? 'bg-[#CBEA70]' : i === step ? 'bg-[#F5BF55]' : 'bg-white/20'}`} />
              <span className={`mt-1.5 hidden sm:block text-[11px] leading-tight ${i === step ? 'text-white font-bold' : 'text-white/50'}`}>{t(...labelFor(events, i))}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-stretch" aria-live="polite">
        <div key={ev.id} className="rounded-2xl bg-white/[0.06] border border-white/10 p-5 sm:p-6 space-y-4" style={{ animation: 'cl-rise .4s ease both' }}>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-[#CBEA70]">{t(`Step ${step + 1} of ${events.length}`, `ধাপ ${step + 1} / ${events.length}`)}</span>
            <span className="font-mono rounded bg-white/10 px-2 py-0.5">{ev.evidenceLevelResult}</span>
          </div>
          <h3 className="font-display text-2xl font-bold leading-tight">{t(stepEn, stepBn)}</h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base">
            <span className="font-semibold">{ev.sender}</span>
            <ArrowRight className="h-4 w-4 text-[#CBEA70] shrink-0" aria-label={t('hands to', 'হস্তান্তর করেন')} />
            <span className="font-semibold">{ev.receiver}</span>
          </div>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-white/50 text-xs">{t('Where', 'কোথায়')}</dt><dd>{ev.location}</dd></div>
            <div><dt className="text-white/50 text-xs">{t('When', 'কখন')}</dt><dd>{clock(ev.timestamp, lang)}</dd></div>
            <div><dt className="text-white/50 text-xs">{t('Checked by', 'যাচাই করেছেন')}</dt><dd>{ev.verifiedBy.split('(')[0]}</dd></div>
            <div><dt className="text-white/50 text-xs">{t('How it was measured', 'কীভাবে মাপা হয়েছে')}</dt><dd>{ev.measurementMethod.split('(')[0]}</dd></div>
          </dl>
        </div>

        <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div>
            <p className="text-xs text-white/50">{t('Weight at this step', 'এই ধাপে ওজন')}</p>
            <p className="font-display text-6xl font-extrabold tabular-nums leading-none mt-1">{nowKg}<span className="text-2xl text-white/60 ml-2">kg</span></p>
            <p className="mt-2 text-xs text-white/60">{t(`Started at ${startKg} kg at the door. Moisture and sorting losses are recorded, not hidden.`, `দরজায় শুরু ${startKg} কেজি। আর্দ্রতা ও বাছাইয়ের ক্ষতি লুকানো হয় না, রেকর্ড হয়।`)}</p>
          </div>
          <div className="h-2 rounded-full bg-white/15 overflow-hidden" aria-hidden="true">
            <div className="h-full rounded-full bg-[#CBEA70] transition-[width] duration-700" style={{ width: `${Math.min(100, (nowKg / Math.max(startKg, nowKg)) * 100)}%` }} />
          </div>
          {reached && (
            <p className="text-sm text-[#CBEA70] font-semibold" role="status">
              {t('Every step checks out. Nothing in this record was changed after it was written.', 'প্রতিটি ধাপ মিলে গেছে। লেখার পরে এই রেকর্ডে কিছু বদলানো হয়নি।')}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (playing) return setPlaying(false);
            if (finished) setStep(0);
            setPlaying(true);
          }}
          className="inline-flex items-center gap-2 min-h-12 px-6 rounded-full bg-[#CBEA70] text-[#0B1A15] font-bold cursor-pointer"
          data-testid="fob-play"
        >
          {playing ? <Pause className="h-5 w-5" aria-hidden="true" /> : finished && step > 0 ? <RotateCcw className="h-5 w-5" aria-hidden="true" /> : <Play className="h-5 w-5" aria-hidden="true" />}
          {playing ? t('Pause', 'থামান') : finished && step > 0 ? t('Play again', 'আবার চালান') : t('Play', 'চালান')}
        </button>
        <button
          type="button"
          onClick={() => { setPlaying(false); setStep((s) => Math.min(last, s + 1)); }}
          disabled={finished}
          className="inline-flex items-center gap-2 min-h-12 px-5 rounded-full border border-white/30 font-semibold disabled:opacity-40 cursor-pointer"
          data-testid="fob-next"
        >
          {t('Next step', 'পরের ধাপ')} <SkipForward className="h-4 w-4" aria-hidden="true" />
        </button>
        <a
          href={verifyLotUrl(lot.id)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 min-h-12 px-3 font-semibold text-[#CBEA70] underline underline-offset-4"
        >
          {t('Open public page', 'পাবলিক পেজ খুলুন')} <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
        <span className="ml-auto text-xs font-mono text-white/40">{lot.id}</span>
      </div>
    </section>
  );
};
