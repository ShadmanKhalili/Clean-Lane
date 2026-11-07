import React, { useMemo, useState } from 'react';
import { isOverTolerance } from '../../domain/rules';
import { canHandOverToHub } from '../../domain/lots';
import { useApp } from '../../context/AppContext';
import { MaterialCategory, PickupJob, MaterialLot } from '../../types';
import { MaterialGlyph, MATERIALS } from '../../design/materials';
import { Confetti, EmptyState, RickshawBand } from '../../design/Celebrate';
import { QrCodeScannerModal } from './QrCodeScannerModal';
import { LotHandoverModal } from './LotHandoverModal';
import {
  COLLECTOR_CSS,
  Sheet,
  SwipeToComplete,
  SyncBanner,
  WeighPad,
  fmtNum,
  pick,
  useSunMode,
  windowText,
  type WeighResult
} from './collectorKit';
import {
  AlertTriangle,
  Ban,
  Briefcase,
  Camera,
  CheckCircle,
  ChevronRight,
  Clock,
  KeyRound,
  List,
  MapPin,
  Navigation,
  PackageCheck,
  Phone,
  QrCode,
  Sun,
  User,
  Wifi,
  WifiOff
} from 'lucide-react';

type Destination = 'jobs' | 'route' | 'handovers' | 'account';
type ExceptionReason = 'customer_unavailable' | 'inaccessible' | 'contaminated_stream' | 'cancelled_at_door';

const ACTIVE: PickupJob['status'][] = ['PENDING', 'ACCEPTED', 'EN_ROUTE'];

const OUTCOME_LABEL: Record<NonNullable<PickupJob['outcome']>, [string, string]> = {
  COLLECTED: ['Collected', 'সংগৃহীত'],
  PARTIALLY_COLLECTED: ['Partly collected', 'আংশিক সংগৃহীত'],
  CUSTOMER_UNAVAILABLE: ['Customer not home', 'গ্রাহক অনুপস্থিত'],
  CANNOT_ACCESS: ['Could not get in', 'প্রবেশ করা যায়নি'],
  MATERIAL_UNSUITABLE: ['Material unsuitable', 'উপাদান অনুপযুক্ত']
};

const MaterialChips: React.FC<{ materials: MaterialCategory[]; lang: 'en' | 'bn'; big?: boolean }> = ({ materials, lang, big }) => (
  <ul className="flex flex-wrap gap-2" aria-label={pick(lang, 'Expected materials', 'প্রত্যাশিত উপাদান')}>
    {materials.map((m) => (
      <li key={m} className="cf-chip" style={big ? { fontSize: '1.05em', minHeight: 48 } : undefined}>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white">
          <MaterialGlyph material={m} size={big ? 22 : 18} />
        </span>
        {pick(lang, MATERIALS[m].en, MATERIALS[m].bn)}
      </li>
    ))}
  </ul>
);

export const CollectorFieldApp: React.FC = () => {
  const { jobs, lots, acceptJob, completeJob, recordJobException, isOfflineMode, setIsOfflineMode, offlineQueueCount, syncOfflineQueue, lang } = useApp();
  const t = (en: string, bn: string) => pick(lang, en, bn);
  const [sun, setSun] = useSunMode();

  const [dest, setDest] = useState<Destination>('jobs');
  const [view, setView] = useState<'focus' | 'list'>('focus');
  const [listFilter, setListFilter] = useState<'open' | 'completed' | 'exceptions'>('open');
  const [focusIdx, setFocusIdx] = useState(0);

  const [weighJobId, setWeighJobId] = useState<string | null>(null);
  const [exceptionJobId, setExceptionJobId] = useState<string | null>(null);
  const [exceptionReason, setExceptionReason] = useState<ExceptionReason>('customer_unavailable');
  const [tag, setTag] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerMode, setScannerMode] = useState<'lot' | 'job' | 'any'>('any');
  const [lotForHandover, setLotForHandover] = useState<MaterialLot | null>(null);
  const [receipt, setReceipt] = useState<{ jobId: string; kg: number; offline: boolean; code?: string; lotId?: string } | null>(null);
  const [announce, setAnnounce] = useState('');

  const todayJobs = useMemo(() => jobs.filter((j) => ACTIVE.includes(j.status) || /today/i.test(j.scheduledWindow)), [jobs]);
  const active = useMemo(() => jobs.filter((j) => ACTIVE.includes(j.status)), [jobs]);
  const doneToday = todayJobs.filter((j) => !ACTIVE.includes(j.status)).length;
  const idx = active.length ? Math.min(focusIdx, active.length - 1) : 0;
  const current = active[idx];
  const weighJob = jobs.find((j) => j.id === weighJobId) ?? null;
  const exceptionJob = jobs.find((j) => j.id === exceptionJobId) ?? null;
  const awaitingHandover = lots.filter(canHandOverToHub);
  const handoverLots = [...lots].sort((a, b) => Number(canHandOverToHub(b)) - Number(canHandOverToHub(a)));

  const EXCEPTIONS: { id: ExceptionReason; en: string; bn: string }[] = [
    { id: 'customer_unavailable', en: 'Customer is not home', bn: 'গ্রাহক বাসায় নেই' },
    { id: 'inaccessible', en: 'I could not get in', bn: 'ভেতরে ঢুকতে পারিনি' },
    { id: 'contaminated_stream', en: 'Material is dirty or wrong', bn: 'উপাদান নোংরা বা ভুল' },
    { id: 'cancelled_at_door', en: 'Customer cancelled at the door', bn: 'দরজায় গ্রাহক বাতিল করেছেন' }
  ];

  const openWeigh = (job: PickupJob) => {
    setTag(`TAG-${job.id.replace(/^JOB-/, '')}-${(job.expectedMaterials[0] || 'PET_BOTTLES').split('_')[0]}`);
    setWeighJobId(job.id);
  };

  const handleAccept = (job: PickupJob) => {
    acceptJob(job.id);
    setAnnounce(t(`Job accepted: ${job.customerAddress}`, `কাজ গ্রহণ করা হয়েছে: ${job.customerAddress}`));
  };

  const handleWeighConfirm = (job: PickupJob, r: WeighResult) => {
    completeJob(job.id, {
      outcome: r.partial ? 'PARTIALLY_COLLECTED' : 'COLLECTED',
      materialWeights: [{ category: r.material, weightKg: r.kg, bagCount: r.bags }],
      totalWeightKg: r.kg,
      weightMethod: r.basis,
      photoEvidenceRecorded: r.photo,
      uncollectedNotes: r.partial ? r.note : '',
      contaminationObservation: ''
    });
    setReceipt({ jobId: job.id, kg: r.kg, offline: isOfflineMode });
    setWeighJobId(null);
    setAnnounce(
      isOfflineMode
        ? t(`${r.kg} kg saved on phone, will sync`, `${fmtNum(r.kg, 'bn')} কেজি ফোনে সংরক্ষিত, পরে সিঙ্ক হবে`)
        : t(`${r.kg} kg recorded`, `${fmtNum(r.kg, 'bn')} কেজি রেকর্ড হয়েছে`)
    );
  };

  const handleScanResult = (scannedText: string, matchedLot?: MaterialLot, matchedJob?: PickupJob) => {
    if (matchedLot) setLotForHandover(matchedLot);
    else if (matchedJob) openWeigh(matchedJob);
    else {
      const lot = lots.find((l) => l.id.toLowerCase() === scannedText.toLowerCase());
      if (lot) setLotForHandover(lot);
      else setTag(scannedText);
    }
  };

  const submitException = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exceptionJobId) return;
    recordJobException(exceptionJobId, exceptionReason);
    setExceptionJobId(null);
    setAnnounce(t('Marked as not collected. The operator has been told.', 'সংগ্রহ হয়নি বলে চিহ্নিত। অপারেটরকে জানানো হয়েছে।'));
  };

  // The receipt shows the job's own report once it lands in state.
  const receiptJob = receipt ? jobs.find((j) => j.id === receipt.jobId) : undefined;

  const TABS: { id: Destination; en: string; bn: string; icon: React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }>; badge?: number }[] = [
    { id: 'jobs', en: 'Jobs', bn: 'কাজ', icon: Briefcase, badge: active.length },
    { id: 'route', en: 'Route', bn: 'রুট', icon: Navigation },
    { id: 'handovers', en: 'Hub drop-off', bn: 'হাবে জমা', icon: PackageCheck, badge: awaitingHandover.length },
    { id: 'account', en: 'Me', bn: 'আমি', icon: User }
  ];

  /* ---------------- focus card ---------------- */
  const FocusCard = () => {
    if (receipt && receiptJob?.fieldReport) {
      const fr = receiptJob.fieldReport;
      return (
        <section aria-labelledby="cf-done" className="cf-card relative space-y-4 p-5 text-center">
          <Confetti count={26} top="22%" />
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full" style={{ background: 'var(--prim)', color: 'var(--prim-fg)' }}>
            <CheckCircle size={44} aria-hidden="true" />
          </div>
          <div>
            <h2 id="cf-done" className="font-display text-[2.3em] font-extrabold leading-none">
              {fmtNum(fr.totalWeightKg, lang)} {t('kg', 'কেজি')}
            </h2>
            <p className="mt-1 text-[1.05em] font-bold">
              {receipt.offline ? t('Saved on phone — will sync', 'ফোনে সংরক্ষিত — পরে সিঙ্ক হবে') : t('Recorded. Nice work.', 'রেকর্ড হয়েছে। দারুণ কাজ।')}
            </p>
          </div>
          <dl className="cf-soft grid grid-cols-2 gap-3 p-3 text-left text-[.9em]">
            <div><dt className="cf-muted">{t('Customer code', 'গ্রাহক কোড')}</dt><dd className="font-mono font-extrabold">{fr.customerAckCode}</dd></div>
            <div><dt className="cf-muted">{t('Lot', 'লট')}</dt><dd className="break-all font-mono font-extrabold">{fr.batchLotId}</dd></div>
          </dl>
          <p className="cf-muted text-[.9em]">{t('Next: bring it to the hub — see “Hub drop-off”.', 'এরপর: হাবে নিয়ে যান — “হাবে জমা” দেখুন।')}</p>
          <button type="button" className="cf-btn cf-btn-primary w-full !min-h-[64px] !text-[1.1em]" onClick={() => setReceipt(null)} data-testid="receipt-next">
            {active.length ? t('Next job', 'পরের কাজ') : t('Finish', 'শেষ')} <ChevronRight size={22} aria-hidden="true" />
          </button>
        </section>
      );
    }

    if (!current) {
      return (
        <section className="cf-card overflow-hidden">
          <RickshawBand height={22} />
          <div className="p-2">
            <EmptyState
              title={t('All done for today', 'আজকের কাজ শেষ')}
              body={t('Every job is collected or reported. Bring the bags to the hub and you are finished.', 'সব কাজ সংগৃহীত বা জানানো হয়েছে। ব্যাগগুলো হাবে নিয়ে গেলেই শেষ।')}
              action={
                <button type="button" className="cf-btn cf-btn-primary" onClick={() => setDest('handovers')}>
                  <PackageCheck size={20} aria-hidden="true" /> {t('Go to hub drop-off', 'হাবে জমা দিতে যান')}
                </button>
              }
            />
          </div>
        </section>
      );
    }

    const pending = current.status === 'PENDING';
    return (
      <section aria-labelledby="cf-addr" className="cf-card space-y-4 p-5" key={current.id}>
        <div className="flex items-center justify-between gap-2">
          <p className="cf-chip !py-1 !pl-3" data-testid="job-progress">
            {t(`Job ${doneToday + idx + 1} of ${todayJobs.length}`, `${fmtNum(doneToday + idx + 1, 'bn')} / ${fmtNum(todayJobs.length, 'bn')} নম্বর কাজ`)}
          </p>
          <span className="cf-chip !py-1" style={{ background: 'transparent' }}>
            <Clock size={16} aria-hidden="true" /> {windowText(current.scheduledWindow, lang)}
          </span>
        </div>

        <div>
          <p className="cf-muted flex items-center gap-1 text-[.85em] font-bold uppercase tracking-wide">
            <MapPin size={14} aria-hidden="true" /> {pending ? t('New job — go here', 'নতুন কাজ — এখানে যান') : t('You accepted this — go here', 'আপনি নিয়েছেন — এখানে যান')}
          </p>
          <h2 id="cf-addr" className="mt-1 font-display text-[1.9em] font-extrabold leading-[1.1]" style={{ overflowWrap: 'anywhere' }}>
            {current.customerAddress}
          </h2>
        </div>

        <div className="cf-soft flex items-start gap-3 p-3.5">
          <KeyRound size={22} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="cf-muted text-[.8em] font-bold uppercase tracking-wide">{t('How to get in', 'কীভাবে ঢুকবেন')}</p>
            <p className="text-[1.05em] font-semibold leading-snug">{current.accessNotes}</p>
          </div>
        </div>

        <MaterialChips materials={current.expectedMaterials} lang={lang} big />

        <a href={`tel:${current.customerPhone.replace(/\s/g, '')}`} className="cf-btn !justify-start" aria-label={t(`Call customer ${current.customerPhone}`, `গ্রাহককে ফোন করুন ${current.customerPhone}`)}>
          <Phone size={20} aria-hidden="true" /> {t('Call', 'ফোন')} · <span className="font-mono">{current.customerPhone}</span>
        </a>

        <div className="pt-1">
          {pending ? (
            <SwipeToComplete
              key={`${current.id}-accept`}
              lang={lang}
              label={t('Swipe to accept', 'গ্রহণ করতে সোয়াইপ করুন')}
              altLabel={t('Accept job', 'কাজ গ্রহণ করুন')}
              onComplete={() => handleAccept(current)}
            />
          ) : (
            <SwipeToComplete
              key={`${current.id}-weigh`}
              lang={lang}
              label={t('Swipe when you have the bags', 'ব্যাগ হাতে পেলে সোয়াইপ করুন')}
              altLabel={t('Weigh & collect', 'ওজন করে সংগ্রহ')}
              onComplete={() => openWeigh(current)}
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="cf-btn !text-[.95em]"
            onClick={() => {
              setExceptionReason('customer_unavailable');
              setExceptionJobId(current.id);
            }}
          >
            <Ban size={18} aria-hidden="true" /> {t("Can't collect", 'সংগ্রহ হচ্ছে না')}
          </button>
          <button type="button" className="cf-btn !text-[.95em]" onClick={() => setFocusIdx((idx + 1) % Math.max(1, active.length))} disabled={active.length < 2}>
            {t('Next job', 'পরের কাজ')} <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </section>
    );
  };

  return (
    <div className="cf-root mx-auto max-w-xl space-y-4 rounded-[32px] sm:p-2" data-sun={sun ? '1' : '0'}>
      <style>{COLLECTOR_CSS}</style>
      <div className="sr-only" role="status" aria-live="polite">{announce}</div>

      {/* Destinations */}
      <nav className="cf-card grid grid-cols-4 gap-1 p-1.5" aria-label={t('Collector sections', 'সংগ্রাহক বিভাগ')}>
        {TABS.map((d) => {
          const on = dest === d.id;
          const Icon = d.icon;
          return (
            <button
              key={d.id}
              type="button"
              aria-current={on ? 'page' : undefined}
              onClick={() => setDest(d.id)}
              className="relative flex min-h-[60px] flex-col items-center justify-center gap-0.5 rounded-[20px] px-1 text-[.78em] font-extrabold leading-tight"
              style={on ? { background: 'var(--prim)', color: 'var(--prim-fg)' } : undefined}
            >
              <Icon size={22} aria-hidden={true} />
              <span>{t(d.en, d.bn)}</span>
              {!!d.badge && (
                <span className="absolute right-1.5 top-1 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[.8em] font-extrabold" style={{ background: on ? 'var(--prim-fg)' : 'var(--prim)', color: on ? 'var(--prim)' : 'var(--prim-fg)' }}>
                  {fmtNum(d.badge, lang)}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Status strip: sync + sun + camera */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={isOfflineMode}
          onClick={() => setIsOfflineMode(!isOfflineMode)}
          className="cf-btn !min-h-[48px] flex-1 !px-3 !text-[.85em]"
          title={t('Pretend there is no signal', 'সিগন্যাল নেই এমন ভান করুন')}
        >
          {isOfflineMode ? <WifiOff size={18} aria-hidden="true" /> : <Wifi size={18} aria-hidden="true" />}
          {isOfflineMode ? t('No signal (test)', 'সিগন্যাল নেই (পরীক্ষা)') : t('Online', 'অনলাইন')}
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={sun}
          onClick={() => setSun(!sun)}
          className="cf-btn !min-h-[48px] flex-1 !px-3 !text-[.85em]"
          data-testid="sun-toggle"
          style={sun ? { background: 'var(--prim)', color: 'var(--prim-fg)' } : undefined}
        >
          <Sun size={18} aria-hidden="true" /> {t('Sun mode', 'রোদে পড়ার মোড')}
        </button>
        <button
          type="button"
          className="cf-btn !min-h-[48px] !w-14 !px-0"
          aria-label={t('Scan a QR code', 'কিউআর স্ক্যান করুন')}
          onClick={() => {
            setScannerMode('any');
            setIsScannerOpen(true);
          }}
        >
          <Camera size={20} aria-hidden="true" />
        </button>
      </div>

      <SyncBanner lang={lang} offline={isOfflineMode} queued={offlineQueueCount} onSync={syncOfflineQueue} />

      {/* ============ JOBS ============ */}
      {dest === 'jobs' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h1 className="font-display text-[1.35em] font-extrabold">{t("Today's jobs", 'আজকের কাজ')}</h1>
            <div className="flex gap-1 rounded-full p-1" style={{ border: 'var(--bw) solid var(--line)' }} role="group" aria-label={t('View', 'দেখার ধরন')}>
              {(['focus', 'list'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  onClick={() => setView(v)}
                  className="flex min-h-11 items-center gap-1.5 rounded-full px-3.5 text-[.85em] font-extrabold"
                  style={view === v ? { background: 'var(--prim)', color: 'var(--prim-fg)' } : undefined}
                >
                  {v === 'list' && <List size={16} aria-hidden="true" />}
                  {v === 'focus' ? t('One at a time', 'একটা একটা') : t('All', 'সব')}
                </button>
              ))}
            </div>
          </div>

          {view === 'focus' && (
            <>
              {/* progress dots */}
              <ol className="flex gap-1.5" aria-hidden="true">
                {todayJobs.map((j) => (
                  <li key={j.id} className="h-2 flex-1 rounded-full" style={{ background: !ACTIVE.includes(j.status) ? 'var(--prim)' : j.id === current?.id ? 'var(--acc)' : 'var(--line)', border: 'var(--bw) solid var(--line)' }} />
                ))}
              </ol>
              <FocusCard />
            </>
          )}

          {view === 'list' && (
            <>
              <div className="grid grid-cols-3 gap-1" role="group" aria-label={t('Job filter', 'কাজের ফিল্টার')}>
                {([
                  ['open', 'To do', 'বাকি', active.length],
                  ['completed', 'Done', 'শেষ', jobs.filter((j) => j.status === 'COMPLETED').length],
                  ['exceptions', 'Not collected', 'সংগ্রহ হয়নি', jobs.filter((j) => j.status === 'EXCEPTION').length]
                ] as const).map(([id, en, bn, n]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={listFilter === id}
                    onClick={() => setListFilter(id)}
                    className="cf-btn !min-h-[52px] !px-1 !text-[.82em]"
                    style={listFilter === id ? { background: 'var(--prim)', color: 'var(--prim-fg)' } : undefined}
                  >
                    {t(en, bn)} ({fmtNum(n, lang)})
                  </button>
                ))}
              </div>
              {(() => {
                const rows = jobs.filter((j) => (listFilter === 'open' ? ACTIVE.includes(j.status) : listFilter === 'completed' ? j.status === 'COMPLETED' : j.status === 'EXCEPTION'));
                if (!rows.length)
                  return (
                    <EmptyState
                      title={listFilter === 'open' ? t('Nothing left to do', 'আর কোনো কাজ বাকি নেই') : listFilter === 'completed' ? t('No pickups finished yet', 'এখনো কোনো পিকআপ শেষ হয়নি') : t('No missed pickups', 'কোনো পিকআপ বাদ যায়নি')}
                      body={listFilter === 'completed' ? t('Finished pickups appear here with their weight.', 'শেষ হওয়া পিকআপ ওজনসহ এখানে দেখা যাবে।') : t('Good. New jobs show up here as they are assigned.', 'ভালো। নতুন কাজ বরাদ্দ হলে এখানে আসবে।')}
                    />
                  );
                return rows.map((job) => (
                  <article key={job.id} className="cf-card space-y-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-[1.1em] font-extrabold leading-snug">{job.customerAddress}</h2>
                      <span className="cf-muted shrink-0 font-mono text-[.75em]">{job.id.replace('JOB-', '')}</span>
                    </div>
                    <p className="cf-muted flex items-center gap-1.5 text-[.9em] font-semibold"><Clock size={14} aria-hidden="true" /> {windowText(job.scheduledWindow, lang)}</p>
                    <MaterialChips materials={job.expectedMaterials} lang={lang} />
                    {ACTIVE.includes(job.status) ? (
                      <button
                        type="button"
                        className="cf-btn cf-btn-primary w-full"
                        onClick={() => {
                          setFocusIdx(Math.max(0, active.findIndex((a) => a.id === job.id)));
                          setView('focus');
                        }}
                      >
                        {t('Open this job', 'এই কাজ খুলুন')} <ChevronRight size={18} aria-hidden="true" />
                      </button>
                    ) : job.status === 'COMPLETED' && job.fieldReport ? (
                      <p className="flex items-center gap-2 font-extrabold">
                        <CheckCircle size={18} aria-hidden="true" /> {fmtNum(job.fieldReport.totalWeightKg, lang)} {t('kg', 'কেজি')} · {job.outcome ? t(...OUTCOME_LABEL[job.outcome]) : ''}
                        {job.fieldReport.syncStatus === 'pending_sync_offline' && <span className="cf-chip !py-0.5 !text-[.8em]">{t('on phone', 'ফোনে')}</span>}
                      </p>
                    ) : (
                      <p className="flex items-center gap-2 font-extrabold"><Ban size={18} aria-hidden="true" /> {job.outcome ? t(...OUTCOME_LABEL[job.outcome]) : job.exceptionReason?.replace(/_/g, ' ')}</p>
                    )}
                  </article>
                ));
              })()}
            </>
          )}
        </div>
      )}

      {/* ============ ROUTE ============ */}
      {dest === 'route' && (
        <section className="space-y-3" aria-labelledby="cf-route">
          <div>
            <h1 id="cf-route" className="font-display text-[1.35em] font-extrabold">{t('Your route today', 'আজকের রুট')}</h1>
            <p className="cf-muted text-[.9em]">{t('Stops in the order planned for your trike.', 'ট্রাইকের জন্য ঠিক করা ক্রমে স্টপ।')}</p>
          </div>
          {todayJobs.length === 0 ? (
            <EmptyState title={t('No stops yet', 'এখনো কোনো স্টপ নেই')} body={t('When the operator assigns jobs, your route appears here.', 'অপারেটর কাজ দিলে রুট এখানে দেখা যাবে।')} />
          ) : (
            <ol className="space-y-2">
              {todayJobs.map((job, i) => (
                <li key={job.id} className="cf-card flex items-start gap-3 p-4" style={!ACTIVE.includes(job.status) ? { opacity: 0.6 } : undefined}>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg font-extrabold" style={{ background: 'var(--prim)', color: 'var(--prim-fg)' }}>{fmtNum(i + 1, lang)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold leading-snug">{job.customerAddress}</p>
                    <p className="cf-muted text-[.88em]">{windowText(job.scheduledWindow, lang)}</p>
                    <div className="mt-2"><MaterialChips materials={job.expectedMaterials} lang={lang} /></div>
                  </div>
                  {!ACTIVE.includes(job.status) && <CheckCircle size={22} aria-label={t('Finished', 'শেষ')} />}
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      {/* ============ HUB DROP-OFF ============ */}
      {dest === 'handovers' && (
        <section className="space-y-3" aria-labelledby="cf-hub">
          <div>
            <h1 id="cf-hub" className="font-display text-[1.35em] font-extrabold">{t('Hub drop-off', 'হাবে জমা')}</h1>
            <p className="cf-muted text-[.9em]">{t('Bring each lot to the Gulshan hub. The hub scale confirms the weight.', 'প্রতিটি লট গুলশান হাবে আনুন। হাবের স্কেল ওজন নিশ্চিত করে।')}</p>
          </div>
          <button type="button" className="cf-btn cf-btn-primary w-full" onClick={() => { setScannerMode('lot'); setIsScannerOpen(true); }}>
            <Camera size={20} aria-hidden="true" /> {t('Scan the lot tag', 'লটের ট্যাগ স্ক্যান করুন')}
          </button>
          {handoverLots.length === 0 ? (
            <EmptyState title={t('Nothing to drop off', 'জমা দেওয়ার কিছু নেই')} body={t('Once you collect a pickup, its lot waits here for the hub.', 'পিকআপ সংগ্রহ করলে তার লট এখানে হাবের জন্য অপেক্ষা করবে।')} />
          ) : (
            handoverLots.map((lot) => (
              <article key={lot.id} className="cf-card space-y-2 p-4">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white"><MaterialGlyph material={lot.material} size={22} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold leading-tight">{t(MATERIALS[lot.material].en, MATERIALS[lot.material].bn)}</p>
                    <p className="cf-muted flex items-center gap-1 font-mono text-[.75em]"><QrCode size={12} aria-hidden="true" /> {lot.id}</p>
                  </div>
                  <span className="font-mono text-[.8em] font-bold cf-muted">{lot.evidenceLevel}</span>
                </div>
                <p className="text-[.95em]">
                  {t('You weighed', 'আপনার ওজন')}: <strong>{fmtNum(lot.initialFieldWeightKg, lang)} {t('kg', 'কেজি')}</strong>
                  {' · '}
                  {t('Hub scale', 'হাবের স্কেল')}: <strong>{lot.verifiedHubWeightKg ? `${fmtNum(lot.verifiedHubWeightKg, lang)} ${t('kg', 'কেজি')}` : t('not yet', 'এখনো না')}</strong>
                </p>
                {isOverTolerance(lot.discrepancyPercentage) && (
                  <p className="cf-calm flex items-center gap-2 p-2.5 text-[.88em] font-semibold">
                    <AlertTriangle size={16} aria-hidden="true" /> {t(`Weights differ by ${lot.discrepancyPercentage}%. A supervisor will look at it.`, `ওজনে ${fmtNum(String(lot.discrepancyPercentage), lang)}% পার্থক্য। সুপারভাইজার দেখবেন।`)}
                  </p>
                )}
                {canHandOverToHub(lot) ? (
                  <button type="button" className="cf-btn cf-btn-primary w-full" onClick={() => setLotForHandover(lot)}>{t('Hand over at hub', 'হাবে হস্তান্তর')}</button>
                ) : (
                  <p className="cf-muted flex items-center gap-1.5 text-[.9em] font-bold"><CheckCircle size={16} aria-hidden="true" /> {t('Handed over', 'হস্তান্তরিত')}</p>
                )}
              </article>
            ))
          )}
        </section>
      )}

      {/* ============ ME ============ */}
      {dest === 'account' && (
        <section className="cf-card space-y-1 p-5" aria-labelledby="cf-me">
          <h1 id="cf-me" className="font-display text-[1.35em] font-extrabold">{t('Me & my equipment', 'আমি ও আমার সরঞ্জাম')}</h1>
          <dl className="divide-y" style={{ borderColor: 'var(--line)' }}>
            {[
              [t('Name', 'নাম'), 'Tariq Hossain · #TH-882'],
              [t('Vehicle', 'যানবাহন'), t('Electric cargo trike #DH-14', 'বৈদ্যুতিক কার্গো ট্রাইক #DH-14')],
              [t('Scale', 'স্কেল'), t('Certified hanging scale HS-50', 'সনদপ্রাপ্ত ঝুলন্ত স্কেল HS-50')],
              [t('Scale checked', 'স্কেল পরীক্ষা'), t('9 days ago · good for 30 days (sample)', '৯ দিন আগে · ৩০ দিন বৈধ (নমুনা)')]
            ].map(([k, v]) => (
              <div key={k} className="flex flex-wrap justify-between gap-x-4 py-3" style={{ borderColor: 'var(--line)' }}>
                <dt className="cf-muted font-semibold">{k}</dt>
                <dd className="font-extrabold">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* ============ SHEETS ============ */}
      {weighJob && (
        <WeighPad
          key={weighJob.id}
          lang={lang}
          who={weighJob.customerAddress.split(',')[0]}
          materials={weighJob.expectedMaterials}
          offline={isOfflineMode}
          tag={tag}
          onTag={setTag}
          onScan={() => {
            setScannerMode('any');
            setIsScannerOpen(true);
          }}
          onCancel={() => setWeighJobId(null)}
          onConfirm={(r) => handleWeighConfirm(weighJob, r)}
        />
      )}

      {exceptionJob && (
        <Sheet label={t("Can't collect — why?", 'সংগ্রহ হচ্ছে না — কেন?')} onClose={() => setExceptionJobId(null)}>
          <form onSubmit={submitException} className="space-y-3">
            <div>
              <h2 className="font-display text-[1.3em] font-extrabold">{t("Why can't you collect?", 'কেন সংগ্রহ করতে পারছেন না?')}</h2>
              <p className="cf-muted text-[.9em]">{exceptionJob.customerAddress}</p>
            </div>
            <fieldset className="space-y-2">
              <legend className="sr-only">{t('Reason', 'কারণ')}</legend>
              {EXCEPTIONS.map((r) => (
                <label key={r.id} className="cf-card flex min-h-[60px] cursor-pointer items-center gap-3 !rounded-2xl px-4 font-extrabold" style={exceptionReason === r.id ? { background: 'var(--prim)', color: 'var(--prim-fg)' } : undefined}>
                  <input type="radio" name="cf-exc" checked={exceptionReason === r.id} onChange={() => setExceptionReason(r.id)} className="h-5 w-5" />
                  {t(r.en, r.bn)}
                </label>
              ))}
            </fieldset>
            <p className="cf-muted text-[.88em]">{t('The booking is marked missed and the operator is told straight away.', 'বুকিং মিসড হিসেবে চিহ্নিত হবে এবং অপারেটর সাথে সাথে জানবেন।')}</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" className="cf-btn" onClick={() => setExceptionJobId(null)}>{t('Cancel', 'বাতিল')}</button>
              <button type="submit" className="cf-btn cf-btn-primary">{t('Report it', 'জানিয়ে দিন')}</button>
            </div>
          </form>
        </Sheet>
      )}

      <QrCodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanResult={handleScanResult}
        mode={scannerMode}
        title={scannerMode === 'lot' ? t('Scan the lot tag', 'লটের ট্যাগ স্ক্যান করুন') : scannerMode === 'job' ? t('Scan the booking ticket', 'বুকিং টিকিট স্ক্যান করুন') : t('Scan a QR code', 'কিউআর স্ক্যান করুন')}
      />
      <LotHandoverModal isOpen={Boolean(lotForHandover)} onClose={() => setLotForHandover(null)} lot={lotForHandover} />
    </div>
  );
};
