import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowUpRight, SearchX, WifiOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLiveRoom } from '../live/useLiveRoom';
import { verifyLiveUrl, verifyLotUrl, type PitchRoute } from '../live/routes';
import { buildLiveJourney, buildLotJourney, stopStatus, tamperedWeight, type Journey, type Tamper, type Verification } from './journey';
import { Hero } from './Hero';
import { Timeline, type ShownStop } from './Timeline';
import { Explainer } from './Explainer';
import { SharePanel } from './SharePanel';
import { DemoControls } from './DemoControls';
import { useT } from './ui';
import './verify.css';

type VerifyRoute = Extract<PitchRoute, { kind: 'verify-lot' | 'verify-live' }>;

const DEMO_LOT = 'LOT-2026-095-PET';

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, lang, setLang } = useT();
  return (
    <div className="vf-paper min-h-screen bg-[#FAF9F5] text-[#172521] overflow-x-hidden">
      <header className="max-w-6xl mx-auto px-4 sm:px-8 pt-4 flex items-center justify-between gap-3">
        <a href="./" className="font-display text-lg font-extrabold tracking-tight text-[#124B3A] inline-flex items-center gap-2 min-h-11">
          <span className="w-2.5 h-2.5 rounded-full bg-[#CBEA70] ring-2 ring-[#124B3A]" aria-hidden="true" />
          Clean Lane
        </a>
        <div role="group" aria-label={t('Language', 'ভাষা')} className="inline-flex rounded-full border border-[#172521]/20 bg-white p-0.5 text-sm">
          {(['en', 'bn'] as const).map((l) => (
            <button
              key={l}
              type="button"
              lang={l}
              aria-pressed={lang === l}
              onClick={() => setLang(l)}
              className={`min-h-10 min-w-12 px-3 rounded-full font-semibold cursor-pointer ${lang === l ? 'bg-[#124B3A] text-white' : 'text-[#172521]'}`}
            >
              {l === 'en' ? 'EN' : 'বাংলা'}
            </button>
          ))}
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10">{children}</main>
    </div>
  );
};

const NotFound: React.FC<{ what: string }> = ({ what }) => {
  const { t } = useT();
  return (
    <Shell>
      <div className="max-w-md mx-auto text-center py-16 space-y-5">
        <span className="mx-auto grid place-items-center w-16 h-16 rounded-full bg-[#172521]/6 text-[#5B6B66]">
          <SearchX className="w-8 h-8" aria-hidden="true" />
        </span>
        <h1 className="font-display text-3xl font-bold">{t("We can't find that bag", 'এই ব্যাগটি খুঁজে পাওয়া যায়নি')}</h1>
        <p className="text-[#5B6B66]">
          {t(`There is no journey on record for “${what}”. The code may be mistyped or the bag not registered yet.`, `“${what}” নামে কোনো যাত্রা পাওয়া যায়নি। কোডটি ভুল হতে পারে, অথবা ব্যাগটি এখনো নিবন্ধিত নয়।`)}
        </p>
        <a href={verifyLotUrl(DEMO_LOT)} className="inline-flex items-center gap-2 min-h-12 px-5 rounded-full bg-[#124B3A] text-white font-semibold">
          {t('See a demo journey', 'একটি ডেমো যাত্রা দেখুন')}
          <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
        </a>
      </div>
    </Shell>
  );
};

const Skeleton: React.FC = () => {
  const { t } = useT();
  return (
    <Shell>
      <div role="status" aria-label={t('Loading this journey', 'যাত্রা লোড হচ্ছে')} className="max-w-3xl mx-auto space-y-5">
        <div className="vf-skeleton h-12 w-3/4 rounded-xl" />
        <div className="vf-skeleton h-32 rounded-3xl" />
        <div className="grid grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="vf-skeleton h-14 rounded-lg" />
          ))}
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="vf-skeleton h-28 rounded-2xl" />
        ))}
        <span className="sr-only">{t('Loading…', 'লোড হচ্ছে…')}</span>
      </div>
    </Shell>
  );
};

/** Waits a moment for a live room to deliver its first snapshot before calling a booking "not found". */
const useSettled = (hasData: boolean, active: boolean) => {
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (!active) return;
    const id = window.setTimeout(() => setTimedOut(true), 3500);
    return () => window.clearTimeout(id);
  }, [active]);
  return hasData || timedOut;
};

export const VerifyPage: React.FC<{ route: VerifyRoute }> = ({ route }) => {
  const { lots, custodyEvents, sortingTransformations, processingDispositions } = useApp();
  const { t } = useT();
  const room = route.kind === 'verify-live' ? route.room : null;
  const live = useLiveRoom(room);
  const booking = route.kind === 'verify-live' ? live.bookings.find((b) => b.id === route.bookingId) : undefined;
  const settled = useSettled(!!booking, route.kind === 'verify-live');

  const journey: Journey | null = useMemo(() => {
    if (route.kind === 'verify-live') return booking ? buildLiveJourney(booking) : null;
    return buildLotJourney({ lotId: route.lotId, lots, events: custodyEvents, sortings: sortingTransformations, dispositions: processingDispositions });
  }, [route, booking, lots, custodyEvents, sortingTransformations, processingDispositions]);

  const [tamper, setTamper] = useState<Tamper | null>(null);
  const [pickedKey, setPickedKey] = useState<string | undefined>();
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<{ ms: number; records: number; ok: boolean }>();

  const routeId = route.kind === 'verify-live' ? `${route.room}:${route.bookingId}` : route.lotId;
  useEffect(() => {
    setTamper(null);
    setPickedKey(undefined);
    setLastCheck(undefined);
  }, [routeId]);

  const verification: Verification | null = useMemo(() => (journey ? journey.verify(tamper) : null), [journey, tamper]);

  useEffect(() => {
    document.title = journey ? `${t("This bag's journey", 'এই ব্যাগের যাত্রা')} · ${journey.id} · Clean Lane` : 'Clean Lane';
  }, [journey, t]);

  const recheck = () => {
    if (!journey || checking) return;
    setChecking(true);
    const t0 = performance.now();
    const r = journey.verify(tamper);
    const ms = performance.now() - t0;
    window.setTimeout(() => {
      setLastCheck({ ms, records: r.recordCount, ok: r.ok });
      setChecking(false);
    }, 650);
  };

  if (route.kind === 'verify-live' && !journey) return settled ? <NotFound what={route.bookingId} /> : <Skeleton />;
  if (!journey || !verification) return <NotFound what={route.kind === 'verify-lot' ? route.lotId : ''} />;

  const selectedKey = pickedKey ?? journey.defaultTamperKey;
  const shown: ShownStop[] = journey.stops.map((stop) => {
    const edited = tamper && stop.key === tamper.key;
    return {
      stop,
      status: stopStatus(stop, journey.stops, verification),
      kg: edited ? tamper.kg : stop.kg,
      wasKg: edited ? stop.kg : undefined
    };
  });

  const url = route.kind === 'verify-live' ? verifyLiveUrl(route.room, route.bookingId) : verifyLotUrl(route.lotId);
  const brokenNo = (verification.brokenRecord ?? 0) + 1;
  const unprovenCount = verification.recordCount - brokenNo;
  const startTamper = () => {
    const target = journey.targets.find((x) => x.key === selectedKey) ?? journey.targets[0];
    if (target) setTamper({ key: target.key, kg: tamperedWeight(target.kg) });
  };

  return (
    <Shell>
      {route.kind === 'verify-live' && (!live.connected || live.error) && (
        <div role="status" className="mb-5 flex items-center gap-2 rounded-xl border border-[#B7791F]/40 bg-[#FFF7E0] px-3 py-2 text-sm text-[#7A4B00]">
          <WifiOff className="w-4 h-4 shrink-0" aria-hidden="true" />
          {t('Live connection lost. Showing the last records we received.', 'লাইভ সংযোগ বিচ্ছিন্ন। সর্বশেষ পাওয়া রেকর্ড দেখানো হচ্ছে।')}
        </div>
      )}

      <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-8 lg:gap-14 items-start">
        <div className="space-y-6 lg:sticky lg:top-6">
          <Hero
            journey={journey}
            verification={verification}
            checkedLabel={lastCheck && !checking ? t(`Re-checked in ${lastCheck.ms.toFixed(1)} ms`, `${lastCheck.ms.toFixed(1)} মি.সে.-এ পুনরায় যাচাই হয়েছে`) : undefined}
          />

          {!verification.ok && tamper && (
            <div role="alert" className="rounded-2xl border border-[#B42318] bg-[#FFF5F3] p-4 flex gap-3 text-[#7A1A12]">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-[#B42318]" aria-hidden="true" />
              <div className="text-sm leading-snug space-y-1">
                <p className="font-bold">
                  {t(`Record ${brokenNo} was altered — its fingerprint no longer matches.`, `রেকর্ড ${brokenNo} পরিবর্তন করা হয়েছে — এর ফিঙ্গারপ্রিন্ট আর মিলছে না।`)}
                </p>
                <p>
                  {unprovenCount > 0
                    ? t('Every later record is now unproven.', 'পরের সব রেকর্ড এখন অপ্রমাণিত।')
                    : t('This was the last record, so nothing after it is affected.', 'এটি শেষ রেকর্ড, তাই পরে আর কিছু প্রভাবিত নয়।')}
                </p>
              </div>
            </div>
          )}

          <Explainer checking={checking} onRecheck={recheck} lastCheck={lastCheck} />
          <SharePanel url={url} />
        </div>

        <div className="space-y-8">
          {journey.stops.length > 0 ? (
            <Timeline shown={shown} parentLotId={journey.parentLotId} />
          ) : (
            <section className="rounded-2xl border border-dashed border-[#172521]/25 bg-white/60 p-6 text-sm text-[#5B6B66]">
              <h2 className="font-display text-xl font-bold text-[#172521] mb-1">{t('No steps recorded yet', 'এখনো কোনো ধাপ রেকর্ড হয়নি')}</h2>
              {t('This lot exists, but its first custody record has not been sealed yet.', 'লটটি আছে, কিন্তু এর প্রথম হস্তান্তর রেকর্ড এখনো সিল করা হয়নি।')}
              {journey.parentLotId && (
                <a href={verifyLotUrl(journey.parentLotId)} className="mt-3 inline-flex items-center gap-1 text-[#124B3A] font-semibold underline underline-offset-2">
                  {t('See the parent lot’s journey', 'মূল লটের যাত্রা দেখুন')} <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </a>
              )}
            </section>
          )}
          <DemoControls
            journey={journey}
            selectedKey={selectedKey}
            onSelect={setPickedKey}
            tamper={tamper}
            onTamper={startTamper}
            onRestore={() => setTamper(null)}
          />
        </div>
      </div>
    </Shell>
  );
};

export default VerifyPage;
