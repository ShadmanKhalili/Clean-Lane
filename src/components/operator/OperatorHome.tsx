import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, MessageSquareWarning, PackageX, UserPlus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isOverTolerance } from '../../domain/rules';
import type { MaterialLot, PickupJob, ServiceComplaint } from '../../types';
import { EmptyState } from '../../design/Celebrate';
import { Term } from '../../design/Glossary';
import { OperatorMap, pinsForJobs } from './OperatorMap';

type Kind = 'job' | 'exception' | 'weight' | 'complaint';
interface Need {
  key: string;
  kind: Kind;
  /** Higher = more urgent. */
  urgency: number;
  jobId?: string;
  job?: PickupJob;
  lot?: MaterialLot;
  complaint?: ServiceComplaint;
}

const short = (a: string) => a.split(',').slice(0, 2).join(',');

/** Operator landing: a map of today, then only what needs a person. */
export const OperatorHome: React.FC<{
  jobs: PickupJob[];
  lots: MaterialLot[];
  complaints: ServiceComplaint[];
  collectors: string[];
  onOpenTab: (tab: 'dispatch' | 'material' | 'customers') => void;
}> = ({ jobs, lots, complaints, collectors, onOpenTab }) => {
  const { reassignJob, resolveComplaint, resolveDiscrepancy, lang, totalCollectedKg } = useApp();
  const t = (en: string, bn: string) => (lang === 'en' ? en : bn);

  const [handled, setHandled] = useState<{ key: string; text: string }[]>([]);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [pick, setPick] = useState<Record<string, string>>({});
  const [note, setNote] = useState<Record<string, string>>({});
  const handledKeys = new Set(handled.map((h) => h.key));

  const needs = useMemo<Need[]>(() => {
    const list: Need[] = [];
    for (const j of jobs) {
      if (j.status === 'PENDING') list.push({ key: `job:${j.id}`, kind: 'job', urgency: /today/i.test(j.scheduledWindow) ? 100 : 80, jobId: j.id, job: j });
      if (j.status === 'EXCEPTION') list.push({ key: `exc:${j.id}`, kind: 'exception', urgency: 90, jobId: j.id, job: j });
    }
    for (const l of lots) if (isOverTolerance(l.discrepancyPercentage) && !l.discrepancyResolved) list.push({ key: `lot:${l.id}`, kind: 'weight', urgency: 70, lot: l });
    for (const c of complaints)
      if (c.status === 'OPEN' || c.status === 'INVESTIGATING') list.push({ key: `cmp:${c.id}`, kind: 'complaint', urgency: c.type === 'MISSED_COLLECTION' ? 65 : 60, complaint: c });
    return list.filter((n) => !handledKeys.has(n.key)).sort((a, b) => b.urgency - a.urgency);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs, lots, complaints, handled]);

  const rankByJob = useMemo(() => {
    const m = new Map<string, number>();
    needs.forEach((n, i) => n.jobId && m.set(n.jobId, i + 1));
    // a complaint about a booking also marks that job's pin
    needs.forEach((n, i) => {
      if (n.complaint?.bookingId) {
        const j = jobs.find((x) => x.bookingId === n.complaint!.bookingId);
        if (j && !m.has(j.id)) m.set(j.id, i + 1);
      }
    });
    return m;
  }, [needs, jobs]);

  const todayJobs = jobs.filter((j) => /today/i.test(j.scheduledWindow) || j.status === 'PENDING' || j.status === 'ACCEPTED' || j.status === 'EN_ROUTE' || j.status === 'EXCEPTION');
  const pins = useMemo(() => pinsForJobs(todayJobs, (id) => rankByJob.get(id)), [todayJobs, rankByJob]); // eslint-disable-line react-hooks/exhaustive-deps
  const inField = new Set(jobs.filter((j) => j.status === 'ACCEPTED' || j.status === 'EN_ROUTE').map((j) => j.collectorName)).size;
  const doneCount = todayJobs.filter((j) => j.status === 'COMPLETED').length;
  const calm = needs.length === 0;

  const mark = (key: string, text: string) => setHandled((h) => [...h, { key, text }]);
  const chosen = (key: string) => pick[key] ?? collectors.find((c) => c) ?? 'Enterprise Route #2 (Kamrul)';
  const options = Array.from(new Set([...collectors, 'Enterprise Route #2 (Kamrul)']));

  const focusPin = (id: string | undefined) => {
    if (!id) return;
    setHighlight(id);
    document.getElementById(`need-${id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };

  const inputCls = 'w-full bg-white border border-slate-300 rounded-lg px-3 min-h-11 text-sm text-slate-900';

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:items-start">
      <div className="space-y-5 min-w-0">
        {/* Hero */}
        <section
          aria-labelledby="op-hero"
          className={`rounded-3xl border p-6 sm:p-8 ${calm ? 'bg-[#EEF5E4] border-[#CBEA70]' : 'bg-white border-slate-200'}`}
        >
          <div className="flex items-start gap-4">
            <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-full ${calm ? 'bg-[#124B3A] text-[#CBEA70]' : 'bg-[#FFF1D3] text-[#8A5A00]'}`}>
              {calm ? <CheckCircle2 className="h-8 w-8" aria-hidden="true" /> : <span className="font-display text-2xl font-extrabold" aria-hidden="true">{needs.length}</span>}
            </span>
            <div className="min-w-0">
              <h1 id="op-hero" className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#124B3A]">
                {calm ? t('All clear', 'সব ঠিক আছে') : needs.length === 1 ? t('1 thing needs you', '১টি বিষয়ে আপনার দরকার') : t(`${needs.length} things need you`, `${needs.length}টি বিষয়ে আপনার দরকার`)}
              </h1>
              <p className="mt-1 text-sm sm:text-base text-[#124B3A]/75" aria-live="polite">
                {calm
                  ? t('Every pickup today has a collector and nothing is waiting on a decision.', 'আজকের প্রতিটি পিকআপের জন্য সংগ্রাহক আছেন এবং কোনো সিদ্ধান্ত বাকি নেই।')
                  : t('Most urgent first. Fix them right here; everything else is on track.', 'সবচেয়ে জরুরি আগে। এখানেই ঠিক করুন; বাকি সব ঠিকঠাক চলছে।')}
              </p>
              <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                <div><dt className="text-[#124B3A]/60 text-xs">{t('Pickups today', 'আজকের পিকআপ')}</dt><dd className="font-bold tabular-nums">{todayJobs.length}</dd></div>
                <div><dt className="text-[#124B3A]/60 text-xs">{t('Done', 'শেষ')}</dt><dd className="font-bold tabular-nums">{doneCount}</dd></div>
                <div><dt className="text-[#124B3A]/60 text-xs">{t('Collectors out', 'মাঠে সংগ্রাহক')}</dt><dd className="font-bold tabular-nums">{inField}</dd></div>
                <div><dt className="text-[#124B3A]/60 text-xs">{t('Collected so far', 'এ পর্যন্ত সংগৃহীত')}</dt><dd className="font-bold tabular-nums">{totalCollectedKg.toFixed(1)} kg</dd></div>
              </dl>
            </div>
          </div>
        </section>

        {/* Map on small screens sits right after the hero */}
        <section className="lg:hidden rounded-3xl bg-[#0B1A15] p-3" aria-label={t("Today's map", 'আজকের মানচিত্র')}>
          <OperatorMap pins={pins} lang={lang} highlightId={highlight} onSelect={focusPin} className="mx-auto h-[360px] w-full" />
        </section>

        {/* Needs you */}
        <section aria-labelledby="op-needs" className="space-y-3">
          <h2 id="op-needs" className="font-display text-xl font-bold text-slate-900">{t('Needs you', 'আপনার দরকার')}</h2>

          {handled.length > 0 && (
            <ul className="space-y-2" role="status" aria-live="polite">
              {handled.slice(-3).map((h) => (
                <li key={h.key} className="flex items-center gap-2 rounded-xl bg-[#EEF5E4] px-4 py-2.5 text-sm font-medium text-[#124B3A]">
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" /> {h.text}
                </li>
              ))}
            </ul>
          )}

          {calm && handled.length > 0 ? null : calm ? (
            <EmptyState
              title={t('Nothing is waiting on you', 'আপনার জন্য কিছু অপেক্ষা করছে না')}
              body={t('When a pickup has no collector, a weight does not match or a customer writes in, it shows up here with the button to fix it.', 'কোনো পিকআপে সংগ্রাহক না থাকলে, ওজন না মিললে বা গ্রাহক লিখলে এখানে সমাধানের বাটনসহ দেখা যাবে।')}
            />
          ) : (
            <ol className="space-y-3">
              {needs.map((n, i) => {
                const ring = n.kind === 'complaint' ? 'border-rose-200' : n.kind === 'weight' ? 'border-amber-200' : 'border-slate-200';
                return (
                  <li
                    key={n.key}
                    id={n.jobId ? `need-${n.jobId}` : undefined}
                    className={`rounded-2xl border bg-white p-4 sm:p-5 ${ring} ${n.jobId && highlight === n.jobId ? 'ring-2 ring-[#124B3A]' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#F5BF55] text-sm font-extrabold text-[#0B1A15]" aria-label={t(`Priority ${i + 1}`, `অগ্রাধিকার ${i + 1}`)}>{i + 1}</span>
                      <div className="min-w-0 flex-1 space-y-3">
                        {n.kind === 'job' && n.job && (
                          <>
                            <div>
                              <h3 className="font-bold text-slate-900 flex items-center gap-2"><UserPlus className="h-4 w-4 text-slate-500" aria-hidden="true" />{t('Nobody has taken this pickup', 'এই পিকআপ কেউ নেয়নি')}</h3>
                              <p className="text-sm text-slate-700">{short(n.job.customerAddress)} · {n.job.scheduledWindow}</p>
                              <p className="text-xs text-slate-500 font-mono">{n.job.id}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <label className="sr-only" htmlFor={`as-${n.key}`}>{t('Collector', 'সংগ্রাহক')}</label>
                              <select id={`as-${n.key}`} value={chosen(n.key)} onChange={(e) => setPick((p) => ({ ...p, [n.key]: e.target.value }))} className={`${inputCls} sm:flex-1`}>
                                {options.map((c) => <option key={c}>{c}</option>)}
                              </select>
                              <button
                                type="button"
                                className="min-h-11 px-5 rounded-lg bg-[#124B3A] text-white text-sm font-bold cursor-pointer"
                                onClick={() => {
                                  reassignJob(n.job!.id, chosen(n.key), 'Assigned from the Needs-you list');
                                  mark(n.key, t(`Assigned ${short(n.job!.customerAddress)} to ${chosen(n.key)}`, `${short(n.job!.customerAddress)} — ${chosen(n.key)}-কে দেওয়া হয়েছে`));
                                }}
                              >
                                {t('Assign', 'দিন')}
                              </button>
                            </div>
                          </>
                        )}
                        {n.kind === 'exception' && n.job && (
                          <>
                            <div>
                              <h3 className="font-bold text-slate-900 flex items-center gap-2"><PackageX className="h-4 w-4 text-slate-500" aria-hidden="true" />{t('Collector could not collect', 'সংগ্রাহক সংগ্রহ করতে পারেননি')}</h3>
                              <p className="text-sm text-slate-700">{short(n.job.customerAddress)} · {(n.job.exceptionReason ?? n.job.outcome ?? '').toString().replace(/_/g, ' ').toLowerCase()}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <label className="sr-only" htmlFor={`as-${n.key}`}>{t('Send another collector', 'অন্য সংগ্রাহক পাঠান')}</label>
                              <select id={`as-${n.key}`} value={chosen(n.key)} onChange={(e) => setPick((p) => ({ ...p, [n.key]: e.target.value }))} className={`${inputCls} sm:flex-1`}>
                                {options.map((c) => <option key={c}>{c}</option>)}
                              </select>
                              <button
                                type="button"
                                className="min-h-11 px-5 rounded-lg bg-[#124B3A] text-white text-sm font-bold cursor-pointer"
                                onClick={() => {
                                  reassignJob(n.job!.id, chosen(n.key), 'Retry after a failed pickup');
                                  mark(n.key, t(`Sent ${chosen(n.key)} to try again`, `${chosen(n.key)}-কে আবার পাঠানো হয়েছে`));
                                }}
                              >
                                {t('Send again', 'আবার পাঠান')}
                              </button>
                            </div>
                          </>
                        )}
                        {n.kind === 'weight' && n.lot && (
                          <>
                            <div>
                              <h3 className="font-bold text-slate-900 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-700" aria-hidden="true" />{t('Weights do not match', 'ওজন মিলছে না')}</h3>
                              <p className="text-sm text-slate-700">
                                {t('Doorstep', 'দরজায়')} {n.lot.initialFieldWeightKg} kg · {t('hub scale', 'হাবের স্কেল')} {n.lot.verifiedHubWeightKg} kg ({n.lot.discrepancyPercentage}%) — {t('beyond the', 'ছাড়িয়ে গেছে')} <Term id="weightTolerance" lang={lang} />
                              </p>
                              <p className="text-xs text-slate-500 font-mono">{n.lot.id}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <label className="sr-only" htmlFor={`wn-${n.key}`}>{t('Why is it fine?', 'কেন ঠিক আছে?')}</label>
                              <input id={`wn-${n.key}`} value={note[n.key] ?? ''} onChange={(e) => setNote((s) => ({ ...s, [n.key]: e.target.value }))} placeholder={t('Why is it fine? e.g. wet bottles', 'কেন ঠিক? যেমন: ভেজা বোতল')} className={`${inputCls} sm:flex-1`} />
                              <button
                                type="button"
                                disabled={!(note[n.key] ?? '').trim()}
                                className="min-h-11 px-5 rounded-lg bg-[#124B3A] text-white text-sm font-bold disabled:opacity-40 cursor-pointer"
                                onClick={() => {
                                  resolveDiscrepancy(n.lot!.id, note[n.key].trim());
                                  mark(n.key, t(`Accepted the hub weight for ${n.lot!.id}`, `${n.lot!.id}-এর হাবের ওজন গ্রহণ করা হয়েছে`));
                                }}
                              >
                                {t('Accept hub weight', 'হাবের ওজন মানুন')}
                              </button>
                            </div>
                            <button type="button" onClick={() => onOpenTab('material')} className="text-xs font-semibold text-slate-600 underline underline-offset-2 min-h-11 cursor-pointer">{t('See the scale log', 'স্কেলের লগ দেখুন')}</button>
                          </>
                        )}
                        {n.kind === 'complaint' && n.complaint && (
                          <>
                            <div>
                              <h3 className="font-bold text-slate-900 flex items-center gap-2"><MessageSquareWarning className="h-4 w-4 text-rose-700" aria-hidden="true" />{n.complaint.customerName}</h3>
                              <p className="text-sm text-slate-700">{n.complaint.description}</p>
                              <p className="text-xs text-slate-500 font-mono">{n.complaint.id}{n.complaint.bookingId ? ` · ${n.complaint.bookingId}` : ''}</p>
                            </div>
                            <form
                              className="flex flex-col sm:flex-row gap-2"
                              onSubmit={(e) => {
                                e.preventDefault();
                                const text = (note[n.key] ?? '').trim();
                                if (!text) return;
                                resolveComplaint(n.complaint!.id, text);
                                mark(n.key, t(`Replied to ${n.complaint!.customerName}`, `${n.complaint!.customerName}-কে উত্তর দেওয়া হয়েছে`));
                              }}
                            >
                              <label className="sr-only" htmlFor={`rn-${n.key}`}>{t('Reply to the customer', 'গ্রাহককে উত্তর')}</label>
                              <input id={`rn-${n.key}`} value={note[n.key] ?? ''} onChange={(e) => setNote((s) => ({ ...s, [n.key]: e.target.value }))} placeholder={t('What will you tell them?', 'তাঁকে কী জানাবেন?')} className={`${inputCls} sm:flex-1`} />
                              <button type="submit" disabled={!(note[n.key] ?? '').trim()} className="min-h-11 px-5 rounded-lg bg-[#124B3A] text-white text-sm font-bold disabled:opacity-40 cursor-pointer">{t('Resolve', 'সমাধান')}</button>
                            </form>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
          {needs.some((n) => n.kind === 'exception') && (
            <button type="button" onClick={() => onOpenTab('dispatch')} className="text-xs font-semibold text-slate-600 underline underline-offset-2 min-h-11 cursor-pointer">{t('Open the dispatch board', 'ডিসপ্যাচ বোর্ড খুলুন')}</button>
          )}
        </section>

        {/* Routes */}
        <section aria-labelledby="op-routes" className="space-y-3">
          <h2 id="op-routes" className="font-display text-xl font-bold text-slate-900">{t("Today's routes", 'আজকের রুট')}</h2>
          {todayJobs.length === 0 ? (
            <EmptyState title={t('No pickups on the map yet', 'মানচিত্রে এখনো কোনো পিকআপ নেই')} body={t('Bookings turn into jobs here once customers book a slot.', 'গ্রাহক স্লট বুক করলে বুকিং এখানে কাজ হয়ে আসবে।')} />
          ) : (
            <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
              {todayJobs.map((j) => (
                <li key={j.id}>
                  <button type="button" onClick={() => focusPin(j.id)} className="w-full text-left flex items-center justify-between gap-3 px-4 min-h-14 py-2 cursor-pointer hover:bg-slate-50">
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-slate-900 truncate">{short(j.customerAddress)}</span>
                      <span className="block text-xs text-slate-500">{j.scheduledWindow} · {j.collectorName}</span>
                    </span>
                    <span className={`shrink-0 text-xs font-bold rounded-full px-2.5 py-1 ${j.status === 'COMPLETED' ? 'bg-[#EEF5E4] text-[#124B3A]' : j.status === 'PENDING' || j.status === 'EXCEPTION' ? 'bg-[#FFF1D3] text-[#6B4A00]' : 'bg-slate-100 text-slate-700'}`}>
                      {j.status === 'COMPLETED' ? t('Done', 'শেষ') : j.status === 'PENDING' ? t('Not taken', 'নেওয়া হয়নি') : j.status === 'EXCEPTION' ? t('Missed', 'বাদ') : t('On the way', 'পথে')}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Desktop map */}
      <aside className="hidden lg:block lg:sticky lg:top-20" aria-label={t("Today's map", 'আজকের মানচিত্র')}>
        <div className="rounded-3xl bg-[#0B1A15] p-4">
          <div className="mb-2 flex items-center justify-between text-xs text-[#EAF1E6]/70">
            <span className="font-semibold tracking-wide uppercase">{t("Today's map", 'আজকের মানচিত্র')}</span>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-[#F5BF55]" />{t('needs you', 'আপনার দরকার')}</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-[#CBEA70]" />{t('on track', 'ঠিক আছে')}</span>
            </span>
          </div>
          <OperatorMap pins={pins} lang={lang} highlightId={highlight} onSelect={focusPin} className="mx-auto h-[560px] w-full" />
        </div>
      </aside>
    </div>
  );
};
