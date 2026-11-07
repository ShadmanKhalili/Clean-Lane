import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MaterialGlyph } from '../../design/materials';
import { AREAS, STAGE_INFO, type LiveAction, type LiveBooking, type LiveStage } from '../model';
import { useLiveRoom } from '../useLiveRoom';
import { WeighSheet } from './phone/WeighSheet';
import { ConnectionBanner, LangToggle, PhoneStyles, fmtNum, pick, readStore, writeStore, PAPER, type Lang } from './phone/shared';

const FOCUS = 'focus:outline-none focus-visible:ring-4 focus-visible:ring-[#CBEA70]';
const COLLECTOR_KEY = 'cleanlane:live:collector';

const NEXT_LABEL: Partial<Record<LiveStage, { en: string; bn: string }>> = {
  booked: { en: 'Accept', bn: 'গ্রহণ করুন' },
  accepted: { en: 'Weigh', bn: 'ওজন করুন' },
  collected: { en: 'Verify at hub scale', bn: 'হাবের স্কেলে যাচাই' },
  verified: { en: 'Dispatch to recycler', bn: 'রিসাইক্লারে পাঠান' },
  dispatched: { en: 'Mark recycled', bn: 'রিসাইকেল হয়েছে' }
};

const Check = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

const ActionButton: React.FC<{ label: string; onRun: () => Promise<unknown> | void; lang: Lang; primary?: boolean }> = ({ label, onRun, lang, primary = true }) => {
  const [state, setState] = useState<'idle' | 'busy' | 'ok'>('idle');
  const run = async () => {
    if (state !== 'idle') return;
    setState('busy');
    try {
      await onRun();
      setState('ok');
      window.setTimeout(() => setState('idle'), 700);
    } catch {
      setState('idle');
    }
  };
  return (
    <button
      type="button"
      onClick={run}
      disabled={state === 'busy'}
      aria-label={state === 'ok' ? pick(lang, 'Done', 'হয়েছে') : label}
      className={`flex h-16 w-full items-center justify-center gap-2 rounded-2xl text-lg font-extrabold transition-all active:scale-[.98] ${FOCUS} ${
        state === 'ok' ? 'bg-[#CBEA70] text-[#124B3A]' : primary ? 'bg-[#124B3A] text-white' : 'bg-white text-[#124B3A] ring-1 ring-[#124B3A]/20'
      } ${state === 'busy' ? 'opacity-70' : ''}`}
    >
      {state === 'busy' ? <span className="h-5 w-5 animate-spin rounded-full border-[3px] border-white/30 border-t-white" aria-hidden="true" /> : state === 'ok' ? <Check /> : label}
    </button>
  );
};

export const DriveScreen: React.FC<{ room: string }> = ({ room }) => {
  const { lang, setLang } = useApp();
  const live = useLiveRoom(room);
  const [collector, setCollector] = useState(() => readStore(COLLECTOR_KEY) || 'Tariq');
  const [editing, setEditing] = useState(false);
  const [showSim, setShowSim] = useState(false);
  const [weighing, setWeighing] = useState<LiveBooking | null>(null);

  const saveCollector = (v: string) => {
    const n = v.trim().slice(0, 20) || 'Tariq';
    setCollector(n);
    writeStore(COLLECTOR_KEY, n);
    setEditing(false);
  };

  const { open, done, simHidden } = useMemo(() => {
    const byNew = (a: LiveBooking, b: LiveBooking) => b.createdAt - a.createdAt;
    const visible = live.bookings.filter((b) => showSim || !b.simulated);
    return {
      open: visible.filter((b) => b.stage !== 'recycled').sort(byNew),
      done: visible.filter((b) => b.stage === 'recycled').sort(byNew),
      simHidden: live.bookings.filter((b) => b.simulated).length
    };
  }, [live.bookings, showSim]);

  const run = (b: LiveBooking) => {
    const actions: Partial<Record<LiveStage, LiveAction>> = {
      booked: { type: 'accept', collector },
      collected: { type: 'verify' },
      verified: { type: 'dispatch' },
      dispatched: { type: 'recycle' }
    };
    const a = actions[b.stage];
    return a ? live.act(b.id, a) : undefined;
  };

  return (
    <div lang={lang} className="mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col overflow-x-hidden text-[#124B3A]" style={{ background: PAPER }}>
      <PhoneStyles />
      <header className="rounded-b-[28px] bg-[#124B3A] px-4 pb-4 pt-4 text-white">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-[#CBEA70]">{pick(lang, 'Collector', 'সংগ্রাহক')}</p>
            {editing ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveCollector(new FormData(e.currentTarget).get('collector') as string);
                }}
                className="flex items-center gap-2"
              >
                <label htmlFor="cl-collector" className="sr-only">{pick(lang, 'Collector name', 'সংগ্রাহকের নাম')}</label>
                <input
                  id="cl-collector"
                  name="collector"
                  autoFocus
                  defaultValue={collector}
                  maxLength={20}
                  onBlur={(e) => saveCollector(e.currentTarget.value)}
                  className="h-12 w-36 rounded-xl bg-white px-3 text-lg font-bold text-[#124B3A] focus:outline-none focus:ring-4 focus:ring-[#CBEA70]"
                />
                <button type="submit" className={`h-12 rounded-xl bg-[#CBEA70] px-4 font-bold text-[#124B3A] ${FOCUS}`}>{pick(lang, 'Save', 'সেভ')}</button>
              </form>
            ) : (
              <button type="button" onClick={() => setEditing(true)} className={`flex h-12 items-center gap-2 rounded-xl pr-2 ${FOCUS}`} aria-label={pick(lang, `Collector ${collector}. Edit name`, `সংগ্রাহক ${collector}। নাম বদলান`)}>
                <span className="truncate font-display text-[28px] font-extrabold leading-none">{collector}</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60" aria-hidden="true">
                  <path d="M4 20h4L19 9l-4-4L4 16Z" />
                </svg>
              </button>
            )}
          </div>
          {!editing && <LangToggle lang={lang} setLang={setLang} dark />}
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-white/80">
          <span className={`h-2.5 w-2.5 rounded-full ${live.connected ? 'bg-[#CBEA70]' : 'bg-[#F5BF55]'}`} aria-hidden="true" />
          <span>{live.connected ? pick(lang, 'Live', 'লাইভ') : pick(lang, 'Reconnecting…', 'আবার সংযোগ হচ্ছে…')}</span>
          <span aria-hidden="true">·</span>
          <span>{pick(lang, 'Room', 'রুম')} <span className="font-mono font-bold tracking-widest text-white">{room}</span></span>
        </div>
      </header>

      <div className="pt-3">
        <ConnectionBanner connected={live.connected} error={live.error} lang={lang} />
      </div>

      <main className="flex flex-1 flex-col gap-3 px-4 pb-10">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-extrabold">
            {pick(lang, 'To do', 'করণীয়')} <span className="text-[#124B3A]/50">{fmtNum(open.length, lang)}</span>
          </h1>
          <label className="flex h-12 cursor-pointer items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={showSim} onChange={(e) => setShowSim(e.target.checked)} className="h-5 w-5 accent-[#124B3A]" />
            {pick(lang, 'Show simulated', 'সিমুলেটেড দেখান')}{simHidden > 0 && !showSim ? ` (${fmtNum(simHidden, lang)})` : ''}
          </label>
        </div>

        {open.length === 0 && (
          <div className="grid place-items-center rounded-[28px] border-2 border-dashed border-[#124B3A]/20 px-6 py-12 text-center">
            <p className="font-display text-xl font-extrabold">{pick(lang, 'Waiting for the first booking', 'প্রথম বুকিংয়ের অপেক্ষায়')}</p>
            <p className="mt-1 text-sm font-medium text-[#124B3A]/60">{pick(lang, 'New pickups from the audience appear here.', 'দর্শকদের নতুন পিকআপ এখানে আসবে।')}</p>
          </div>
        )}

        {open.map((b) => (
          <article key={b.id + b.stage} className="cl-rise rounded-[24px] bg-white p-4 ring-1 ring-[#124B3A]/10" style={{ animation: 'cl-rise .4s both, cl-flash .9s ease-out' }}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate font-display text-[22px] font-extrabold leading-tight">{b.name}{b.simulated && <span className="ml-2 align-middle text-[11px] font-bold text-[#124B3A]/45">SIM</span>}</h2>
                <p className="text-sm font-semibold text-[#124B3A]/60">{pick(lang, AREAS[b.area].en, AREAS[b.area].bn)} · {b.id}</p>
              </div>
              <div className="flex shrink-0 gap-1" aria-hidden="true">
                {b.materials.map((m) => <MaterialGlyph key={m} material={m} size={24} />)}
              </div>
            </div>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm font-bold">
              <span className="rounded-full bg-[#CBEA70]/60 px-3 py-1">{pick(lang, STAGE_INFO[b.stage].en, STAGE_INFO[b.stage].bn)}</span>
              <span className="rounded-md bg-[#124B3A]/8 px-1.5 py-0.5 font-mono text-[10px] text-[#124B3A]/60" title="Evidence level">{STAGE_INFO[b.stage].evidence}</span>
              {b.weightKg !== undefined && <span className="text-[#124B3A]/70">{fmtNum(b.hubWeightKg ?? b.weightKg, lang, 1)} {pick(lang, 'kg', 'কেজি')}</span>}
            </p>
            <div className="mt-3">
              {b.stage === 'accepted' ? (
                <button type="button" onClick={() => setWeighing(b)} className={`flex h-16 w-full items-center justify-center rounded-2xl bg-[#124B3A] text-lg font-extrabold text-white active:scale-[.98] ${FOCUS}`}>
                  {pick(lang, NEXT_LABEL.accepted!.en, NEXT_LABEL.accepted!.bn)}
                </button>
              ) : NEXT_LABEL[b.stage] ? (
                <ActionButton lang={lang} label={pick(lang, NEXT_LABEL[b.stage]!.en, NEXT_LABEL[b.stage]!.bn)} onRun={() => run(b)} />
              ) : null}
            </div>
          </article>
        ))}

        {done.length > 0 && (
          <section className="mt-2" aria-label={pick(lang, 'Done', 'সম্পন্ন')}>
            <h2 className="mb-2 font-display text-lg font-extrabold">{pick(lang, 'Done', 'সম্পন্ন')} <span className="text-[#124B3A]/50">{fmtNum(done.length, lang)}</span></h2>
            <ul className="divide-y divide-[#124B3A]/10 rounded-2xl bg-white ring-1 ring-[#124B3A]/10">
              {done.map((b) => (
                <li key={b.id} className="flex items-center gap-3 px-4 py-3 text-sm font-semibold">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[#124B3A] text-white"><Check /></span>
                  <span className="min-w-0 flex-1 truncate">{b.name} · {pick(lang, AREAS[b.area].en, AREAS[b.area].bn)}</span>
                  <span className="text-[#124B3A]/60">+{fmtNum(b.points ?? 0, lang)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      {weighing && (
        <WeighSheet
          lang={lang}
          who={weighing.name}
          onCancel={() => setWeighing(null)}
          onConfirm={async (kg) => {
            await live.act(weighing.id, { type: 'collect', weightKg: kg });
            setWeighing(null);
          }}
        />
      )}
    </div>
  );
};

export default DriveScreen;
