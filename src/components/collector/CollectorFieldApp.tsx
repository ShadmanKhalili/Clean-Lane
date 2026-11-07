import React, { useState } from 'react';
import { isOverTolerance } from '../../domain/rules';
import { canHandOverToHub } from '../../domain/lots';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { MaterialCategory, PickupJob, MaterialLot } from '../../types';
import { MATERIAL_TAXONOMY } from '../../data/mockData';
import { QrCodeScannerModal } from './QrCodeScannerModal';
import { LotHandoverModal } from './LotHandoverModal';
import {
  Briefcase,
  Navigation,
  PackageCheck,
  User,
  Wifi,
  WifiOff,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Scale,
  Camera,
  AlertTriangle,
  RefreshCw,
  QrCode,
  Check,
  Ban
} from 'lucide-react';

export const CollectorFieldApp: React.FC = () => {
  const {
    jobs,
    lots,
    acceptJob,
    completeJob,
    recordJobException,
    isOfflineMode,
    setIsOfflineMode,
    offlineQueueCount,
    syncOfflineQueue,
    lang
  } = useApp();

  // 4 Destinations: Jobs | Route | Handovers | Account
  const [activeDestination, setActiveDestination] = useState<'jobs' | 'route' | 'handovers' | 'account'>('jobs');

  // Job List Filter (O01: Assigned | In progress | Completed | Exceptions)
  const [jobFilter, setJobFilter] = useState<'assigned' | 'in_progress' | 'completed' | 'exceptions'>('assigned');

  // Active Job Detail & Modal State
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isPickupModalOpen, setIsPickupModalOpen] = useState<boolean>(false);

  // QR Code Camera Scanner & Handover Modal States
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [scannerMode, setScannerMode] = useState<'lot' | 'job' | 'any'>('lot');
  const [selectedLotForHandover, setSelectedLotForHandover] = useState<MaterialLot | null>(null);
  const [associatedBagBarcode, setAssociatedBagBarcode] = useState<string>('');

  // Form State for O03 & O04: Pickup Outcome & Material Capture
  const [pickupOutcome, setPickupOutcome] = useState<
    'COLLECTED' | 'PARTIALLY_COLLECTED' | 'CUSTOMER_UNAVAILABLE' | 'CANNOT_ACCESS' | 'MATERIAL_UNSUITABLE'
  >('COLLECTED');

  const [selectedMaterial, setSelectedMaterial] = useState<MaterialCategory>('PET_BOTTLES');
  const [weightKg, setWeightKg] = useState<number>(6.5);
  const [bagCount, setBagCount] = useState<number>(2);
  const [weightBasis, setWeightBasis] = useState<'field_scale' | 'estimate' | 'not_measured'>('field_scale');
  const [photoRecorded, setPhotoRecorded] = useState<boolean>(true);
  const [uncollectedNotes, setUncollectedNotes] = useState<string>('');
  const [contaminationObservation, setContaminationObservation] = useState<string>('');

  const [exceptionJobId, setExceptionJobId] = useState<string | null>(null);
  const [exceptionReason, setExceptionReason] = useState<
    'customer_unavailable' | 'inaccessible' | 'contaminated_stream' | 'cancelled_at_door'
  >('customer_unavailable');
  // The bag barcode is not part of completeJob's report, so it is kept for the on-screen receipt only.
  const [lastPickup, setLastPickup] = useState<{ jobId: string; barcode: string } | null>(null);
  const t = (en: string, bn: string) => (lang === 'en' ? en : bn);

  const currentJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];
  const exceptionJob = jobs.find((j) => j.id === exceptionJobId) || null;
  const lastPickupJob = lastPickup ? jobs.find((j) => j.id === lastPickup.jobId) : undefined;
  const handoverLots = [...lots].sort((a, b) => Number(canHandOverToHub(b)) - Number(canHandOverToHub(a)));
  const awaitingHandoverCount = lots.filter(canHandOverToHub).length;

  const EXCEPTION_REASONS: { id: typeof exceptionReason; en: string; bn: string }[] = [
    { id: 'customer_unavailable', en: 'Customer unavailable', bn: 'গ্রাহক অনুপস্থিত' },
    { id: 'inaccessible', en: 'Cannot access premises', bn: 'প্রবেশ করা যায়নি' },
    { id: 'contaminated_stream', en: 'Material contaminated / unsuitable', bn: 'উপাদান দূষিত / অনুপযুক্ত' },
    { id: 'cancelled_at_door', en: 'Customer cancelled at the door', bn: 'দরজায় গ্রাহক বাতিল করেছেন' }
  ];

  // Calibration is shown relative to today so the demo never displays an expired date.
  const calibratedDaysAgo = 9;
  const calibrationDate = new Date(Date.now() - calibratedDaysAgo * 86400000).toISOString().slice(0, 10);

  const filteredJobs = jobs.filter((j) => {
    if (jobFilter === 'assigned') return j.status === 'PENDING';
    if (jobFilter === 'in_progress') return j.status === 'ACCEPTED' || j.status === 'EN_ROUTE';
    if (jobFilter === 'completed') return j.status === 'COMPLETED';
    if (jobFilter === 'exceptions') return j.status === 'EXCEPTION';
    return true;
  });

  const handleOpenPickupFlow = (job: PickupJob) => {
    setSelectedJobId(job.id);
    setSelectedMaterial(job.expectedMaterials[0] || 'PET_BOTTLES');
    setPickupOutcome('COLLECTED');
    setWeightKg(6.5);
    setBagCount(2);
    setWeightBasis('field_scale');
    setAssociatedBagBarcode(`TAG-${job.id.replace(/^JOB-/, '')}-${(job.expectedMaterials[0] || 'PET_BOTTLES').split('_')[0]}`);
    setUncollectedNotes('');
    setContaminationObservation('');
    setIsPickupModalOpen(true);
  };

  const handleScanResult = (scannedText: string, matchedLot?: MaterialLot, matchedJob?: PickupJob) => {
    if (matchedLot) {
      setSelectedLotForHandover(matchedLot);
    } else if (matchedJob) {
      handleOpenPickupFlow(matchedJob);
    } else {
      // Check if scannedText starts with LOT- or JOB-
      const lot = lots.find((l) => l.id.toLowerCase() === scannedText.toLowerCase());
      if (lot) {
        setSelectedLotForHandover(lot);
      } else {
        setAssociatedBagBarcode(scannedText);
      }
    }
  };

  const handlePickupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) return;

    completeJob(selectedJobId, {
      outcome: pickupOutcome,
      materialWeights: [{ category: selectedMaterial, weightKg, bagCount }],
      totalWeightKg: pickupOutcome === 'COLLECTED' || pickupOutcome === 'PARTIALLY_COLLECTED' ? weightKg : 0,
      weightMethod: weightBasis,
      photoEvidenceRecorded: photoRecorded,
      uncollectedNotes,
      contaminationObservation
    });

    setLastPickup({ jobId: selectedJobId, barcode: associatedBagBarcode.trim() });
    setJobFilter('completed');
    setIsPickupModalOpen(false);
  };

  const handleAccept = (job: PickupJob) => {
    acceptJob(job.id);
    setJobFilter('in_progress');
  };

  const handleExceptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exceptionJobId) return;
    recordJobException(exceptionJobId, exceptionReason);
    setExceptionJobId(null);
    setJobFilter('exceptions');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 4 Collector Destinations Tab Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="grid grid-cols-4 sm:flex sm:items-center gap-1" role="tablist" aria-label={t('Collector sections', 'সংগ্রাহক বিভাগ')}>
          {[
            { id: 'jobs', labelEn: 'Jobs', labelBn: 'কাজের তালিকা', icon: Briefcase },
            { id: 'route', labelEn: 'Route', labelBn: 'রুট ম্যাপ', icon: Navigation },
            { id: 'handovers', labelEn: `Handovers (${awaitingHandoverCount})`, labelBn: `হ্যান্ডওভার (${awaitingHandoverCount})`, icon: PackageCheck },
            { id: 'account', labelEn: 'Account', labelBn: 'অ্যাকাউন্ট', icon: User }
          ].map((dest) => {
            const Icon = dest.icon;
            const isActive = activeDestination === dest.id;
            return (
              <button
                key={dest.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveDestination(dest.id as any)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-3.5 min-h-12 sm:min-h-11 rounded-xl text-[11px] sm:text-xs font-semibold text-center leading-tight transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} aria-hidden="true" />
                <span>{lang === 'en' ? dest.labelEn : dest.labelBn}</span>
              </button>
            );
          })}
        </div>

        {/* Offline Mode Switcher & Sync Status (PRD O01) */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Quick Camera QR Code Scanner Trigger */}
          <button
            onClick={() => {
              setScannerMode('any');
              setIsScannerOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 min-h-11 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors"
            title={lang === 'en' ? 'Scan QR Code via Device Camera' : 'ডিভাইস ক্যামেরা দিয়ে কিউআর কোড স্ক্যান করুন'}
          >
            <Camera className="w-3.5 h-3.5 text-[#C9F1DC]" />
            <span>{lang === 'en' ? 'Scan QR' : 'কিউআর স্ক্যান'}</span>
          </button>

          <button
            onClick={() => setIsOfflineMode(!isOfflineMode)}
            className={`flex items-center gap-1.5 px-3 min-h-11 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              isOfflineMode
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isOfflineMode ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>
              {isOfflineMode
                ? lang === 'en' ? 'Offline Mode' : 'অফলাইন মোড'
                : lang === 'en' ? 'Online' : 'অনলাইন'}
            </span>
          </button>

          {offlineQueueCount > 0 && (
            <button
              onClick={syncOfflineQueue}
              className="flex items-center gap-1 px-3 min-h-11 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? `Sync (${offlineQueueCount})` : `সিঙ্ক (${offlineQueueCount})`}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESTINATION 1: JOBS (Wireframes O01 & O02) */}
      {/* ========================================================================= */}
      {activeDestination === 'jobs' && (
        <div className="space-y-4">
          {/* Header & Sub-Filter Tabs (PRD O01: Assigned | In progress | Completed | Exceptions) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
                {lang === 'en' ? 'FIELD WORKER DISPATCH' : 'মাঠকর্মী ডিসপ্যাচ ও কার্যতালিকা'}
              </span>
              <h1 className="text-lg font-bold text-slate-900">
                {lang === 'en' ? "Today's Collections" : 'আজকের সংগৃহীতব্য কাজ'}
              </h1>
            </div>

            <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl text-[11px] sm:text-xs font-semibold" role="group" aria-label={t('Job filter', 'কাজের ফিল্টার')}>
              {[
                { id: 'assigned', labelEn: 'Assigned', labelBn: 'বরাদ্দকৃত' },
                { id: 'in_progress', labelEn: 'In Progress', labelBn: 'চলমান' },
                { id: 'completed', labelEn: 'Completed', labelBn: 'সম্পন্ন' },
                { id: 'exceptions', labelEn: 'Exceptions', labelBn: 'ব্যতিক্রম' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setJobFilter(f.id as any)}
                  aria-pressed={jobFilter === f.id}
                  className={`px-1 sm:px-3 min-h-11 rounded-lg transition-colors cursor-pointer ${
                    jobFilter === f.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang === 'en' ? f.labelEn : f.labelBn} ({jobs.filter((j) => (f.id === 'assigned' ? j.status === 'PENDING' : f.id === 'in_progress' ? j.status === 'ACCEPTED' || j.status === 'EN_ROUTE' : f.id === 'completed' ? j.status === 'COMPLETED' : j.status === 'EXCEPTION')).length})
                </button>
              ))}
            </div>
          </div>

          {lastPickup && lastPickupJob?.fieldReport && (
            <div role="status" className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-950 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                  {t('Pickup recorded', 'পিকআপ রেকর্ড হয়েছে')} · {lastPickupJob.id}
                </span>
                <button
                  type="button"
                  onClick={() => setLastPickup(null)}
                  aria-label={t('Dismiss summary', 'সারাংশ বন্ধ করুন')}
                  className="w-11 h-11 -m-2 flex items-center justify-center rounded-lg hover:bg-emerald-100 cursor-pointer"
                >
                  <span aria-hidden="true">✕</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono">
                <span>{t('Lot', 'লট')}: <strong>{lastPickupJob.fieldReport.batchLotId}</strong></span>
                <span>{t('Weight', 'ওজন')}: <strong>{lastPickupJob.fieldReport.totalWeightKg} kg</strong></span>
                <span>{t('Customer ack', 'গ্রাহক কোড')}: <strong>{lastPickupJob.fieldReport.customerAckCode}</strong></span>
                <span>{t('Sync', 'সিঙ্ক')}: <strong>{lastPickupJob.fieldReport.syncStatus === 'synced' ? 'synced' : 'pending'}</strong></span>
                {lastPickup.barcode && (
                  <span className="col-span-2 break-all">{t('Sack tag scanned', 'স্ক্যান করা ব্যাগ ট্যাগ')}: <strong>{lastPickup.barcode}</strong></span>
                )}
              </div>
              <p className="text-[11px] text-emerald-900/80">
                {t('Next: take this lot to the hub — see the Handovers tab.', 'এরপর: লটটি হাবে নিয়ে যান — হ্যান্ডওভার ট্যাব দেখুন।')}
              </p>
            </div>
          )}

          {/* Sync Status Banner */}
          <div className="px-4 py-2 bg-slate-100 rounded-xl text-xs text-slate-600 flex items-center justify-between">
            <span className="font-mono">
              Sync status: {offlineQueueCount === 0 ? '✓ All records synchronized' : `⚠ ${offlineQueueCount} pending offline records`}
            </span>
            <span className="text-[11px] text-slate-400">Large touch targets enabled</span>
          </div>

          {/* Jobs List (PRD O01 & O02) */}
          <div className="space-y-3">
            {filteredJobs.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
                No jobs found in this category.
              </div>
            ) : (
              filteredJobs.map((job) => {
                const isCompleted = job.status === 'COMPLETED';
                const isException = job.status === 'EXCEPTION';

                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                          <span className="font-bold text-slate-900">{job.id}</span>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {job.scheduledWindow}
                          </span>
                        </div>

                        <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>{job.customerAddress}</span>
                        </div>

                        <div className="text-xs text-slate-600 flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.customerPhone}</span>
                        </div>

                        {/* Access Note excerpt */}
                        <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                          <span className="font-semibold text-slate-700">Access Note: </span>
                          {job.accessNotes}
                        </div>

                        {/* Expected Materials */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 pt-1">
                          <span className="font-medium text-slate-700">Expected:</span>
                          {job.expectedMaterials.map((m) => (
                            <span key={m} className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-700">
                              {m.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Button - Large Touch Target (PRD O01 priority) */}
                      <div className="sm:text-right shrink-0">
                        {!isCompleted && !isException ? (
                          <div className="flex flex-col gap-2 w-full sm:w-52">
                            {job.status === 'PENDING' ? (
                              <button
                                onClick={() => handleAccept(job)}
                                className="w-full px-5 min-h-12 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-xl text-sm font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                              >
                                <Check className="w-4 h-4" aria-hidden="true" />
                                <span>{t('Accept job', 'কাজ গ্রহণ করুন')}</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenPickupFlow(job)}
                                className="w-full px-5 min-h-12 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                              >
                                <Scale className="w-4 h-4" aria-hidden="true" />
                                <span>{t('Weigh & Pickup', 'ওজন ও পিকআপ')}</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setExceptionReason('customer_unavailable');
                                setExceptionJobId(job.id);
                              }}
                              className="w-full px-4 min-h-11 bg-white border border-rose-300 text-rose-800 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Ban className="w-4 h-4" aria-hidden="true" />
                              <span>{t("Can't collect", 'সংগ্রহ করা যাচ্ছে না')}</span>
                            </button>
                          </div>
                        ) : isCompleted ? (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                              <span>{job.outcome || 'COLLECTED'}</span>
                            </span>
                            {job.fieldReport && (
                              <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                                {job.fieldReport.totalWeightKg} kg ({job.fieldReport.weightMethod})
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                            {job.outcome?.replace(/_/g, ' ') || job.exceptionReason?.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESTINATION 2: ROUTE (Wireframe Route) */}
      {/* ========================================================================= */}
      {activeDestination === 'route' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Ordered Driving Route</h2>
            <p className="text-xs text-slate-500">
              Sequence planned for Dhaka Clean Lane Sector North-1 (Tariq Hossain Vehicle #DH-14).
            </p>
          </div>

          <div className="space-y-3">
            {jobs.map((job, idx) => (
              <div
                key={job.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3 text-xs"
              >
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-mono font-bold shrink-0">
                  {idx + 1}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{job.customerAddress}</span>
                    <span className="font-mono text-slate-500">{job.scheduledWindow.split(' ')[0]}</span>
                  </div>
                  <p className="text-slate-600">{job.accessNotes}</p>
                  <div className="text-slate-400 text-[11px]">
                    Expected: {job.expectedMaterials.join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESTINATION 3: HANDOVERS (Wireframe O06 Handover Queue) */}
      {/* ========================================================================= */}
      {activeDestination === 'handovers' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Handover Queue & Hub Reception (PRD O06)</h2>
              <p className="text-xs text-slate-500">
                Scan QR barcodes on vehicle lots for instant custody transfer to Gulshan Aggregation Hub #3.
              </p>
            </div>

            <button
              onClick={() => {
                setScannerMode('lot');
                setIsScannerOpen(true);
              }}
              className="px-4 min-h-11 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors shrink-0"
            >
              <Camera className="w-4 h-4 text-[#C9F1DC]" />
              <span>Scan Lot QR Tag (Camera)</span>
            </button>
          </div>

          <div className="space-y-3">
            {handoverLots.map((lot) => (
              <div
                key={lot.id}
                className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5 text-xs shadow-2xs hover:border-slate-400 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <QrCode className="w-4 h-4 text-[#25345C]" />
                    <span className="font-mono font-bold text-slate-900">{lot.id}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-600 font-semibold">{lot.material.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Custodian: {lot.currentCustodian}
                    </span>
                    {canHandOverToHub(lot) ? (
                      <button
                        onClick={() => setSelectedLotForHandover(lot)}
                        className="px-3 min-h-11 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
                      >
                        <Scale className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{t('Verify Handover', 'হস্তান্তর যাচাই')}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-500">
                        {t('Handed over', 'হস্তান্তরিত')} · {lot.evidenceLevel}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-slate-700 pt-1 border-t border-slate-100">
                  <div>
                    Field Net Weight: <strong>{lot.initialFieldWeightKg} kg</strong>
                  </div>
                  <div>
                    Hub Platform Scale: <strong>{lot.verifiedHubWeightKg ? `${lot.verifiedHubWeightKg} kg` : 'Awaiting scale'}</strong>
                  </div>
                </div>

                {isOverTolerance(lot.discrepancyPercentage) && (
                  <div className="p-2.5 bg-amber-50 rounded-lg text-amber-900 text-[11px] flex items-center gap-1.5 border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Discrepancy Flag: Delta {lot.discrepancyPercentage}% recorded. Requires supervisor signoff.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESTINATION 4: ACCOUNT */}
      {/* ========================================================================= */}
      {activeDestination === 'account' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
          <h2 className="text-base font-bold text-slate-900">{t('Collector Profile & Equipment', 'সংগ্রাহক প্রোফাইল ও সরঞ্জাম')}</h2>
          <div className="space-y-2 divide-y divide-slate-100">
            <div className="pt-2 flex justify-between">
              <span className="text-slate-500">Worker ID:</span>
              <span className="font-mono font-bold text-slate-900">COL-TARIQ-01 (#TH-882)</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-500">Assigned Vehicle:</span>
              <span className="font-semibold text-slate-800">Electric Cargo Trike #DH-14</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-500">Portable Scale Model:</span>
              <span className="font-semibold text-slate-800">Certified Hanging Scale HS-50</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-500">{t('Scale last calibrated:', 'স্কেল সর্বশেষ ক্যালিব্রেট:')}</span>
              <span className="font-mono text-emerald-800 font-bold text-right">
                {calibrationDate} ({t(`${calibratedDaysAgo} days ago · valid 30 days · sample`, `${calibratedDaysAgo} দিন আগে · ৩০ দিন বৈধ · নমুনা`)})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PICKUP OUTCOME & MATERIAL CAPTURE (Wireframes O03, O04, O05) */}
      {/* ========================================================================= */}
      <Modal
        open={isPickupModalOpen && Boolean(currentJob)}
        onClose={() => setIsPickupModalOpen(false)}
        size="md"
        dismissible={false}
        title={currentJob?.customerAddress}
        description={t('Pickup execution (PRD O03–O05)', 'পিকআপ সম্পাদন (PRD O03–O05)')}
        closeLabel={t('Close pickup form', 'পিকআপ ফর্ম বন্ধ করুন')}
      >
        <form onSubmit={handlePickupSubmit} className="space-y-4 text-xs">
          <fieldset>
            <legend className="block font-bold text-slate-900 mb-2">{t('1. Collection Outcome *', '১. সংগ্রহের ফলাফল *')}</legend>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'COLLECTED', label: 'Collected', bn: 'সংগৃহীত' },
                { id: 'PARTIALLY_COLLECTED', label: 'Partially Collected', bn: 'আংশিক সংগৃহীত' },
                { id: 'CUSTOMER_UNAVAILABLE', label: 'Customer Unavailable', bn: 'গ্রাহক অনুপস্থিত' },
                { id: 'CANNOT_ACCESS', label: 'Cannot Access', bn: 'প্রবেশ করা যায়নি' },
                { id: 'MATERIAL_UNSUITABLE', label: 'Material Unsuitable', bn: 'উপাদান অনুপযুক্ত' }
              ].map((out) => (
                <button
                  key={out.id}
                  type="button"
                  aria-pressed={pickupOutcome === out.id}
                  onClick={() => setPickupOutcome(out.id as any)}
                  className={`p-2.5 min-h-11 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                    pickupOutcome === out.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t(out.label, out.bn)}
                </button>
              ))}
            </div>
          </fieldset>

          {(pickupOutcome === 'COLLECTED' || pickupOutcome === 'PARTIALLY_COLLECTED') && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div>
                <label htmlFor="pickup-material" className="block font-medium text-slate-700 mb-1">{t('Material Fraction', 'উপাদানের ধরন')}</label>
                <select
                  id="pickup-material"
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value as MaterialCategory)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 min-h-11 text-slate-800 font-medium"
                >
                  {Object.values(MATERIAL_TAXONOMY).map((mat) => (
                    <option key={mat.id} value={mat.id}>
                      {mat.name} ({mat.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="pickup-weight" className="block font-medium text-slate-700 mb-1">{t('Quantity (kg) *', 'পরিমাণ (কেজি) *')}</label>
                  <input
                    id="pickup-weight"
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 min-h-11 font-mono text-base font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label htmlFor="pickup-bags" className="block font-medium text-slate-700 mb-1">{t('Container Count', 'ব্যাগের সংখ্যা')}</label>
                  <input
                    id="pickup-bags"
                    type="number"
                    min="1"
                    required
                    value={bagCount}
                    onChange={(e) => setBagCount(parseInt(e.target.value) || 1)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 min-h-11 font-mono text-base font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="pickup-basis" className="block font-medium text-slate-700 mb-1">{t('Measurement Basis *', 'পরিমাপের ভিত্তি *')}</label>
                <select
                  id="pickup-basis"
                  value={weightBasis}
                  onChange={(e) => setWeightBasis(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 min-h-11 text-slate-800"
                >
                  <option value="field_scale">Certified Portable Scale (HS-50)</option>
                  <option value="estimate">Field Visual Estimate (Marked as unmeasured)</option>
                  <option value="not_measured">Not Measured at Doorstep</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  PRD O04 Guardrail: An estimated weight is never presented downstream as a confirmed scale weight.
                </span>
              </div>

              {pickupOutcome === 'PARTIALLY_COLLECTED' && (
                <div>
                  <label htmlFor="pickup-uncollected" className="block font-medium text-amber-800 mb-1">
                    {t('Uncollected Items & Reason (PRD Flow E)', 'যা সংগ্রহ হয়নি ও কারণ')}
                  </label>
                  <input
                    id="pickup-uncollected"
                    type="text"
                    value={uncollectedNotes}
                    onChange={(e) => setUncollectedNotes(e.target.value)}
                    placeholder="e.g. Cardboard collected; wet milk cartons left behind."
                    className="w-full bg-white border border-amber-300 rounded-lg p-2 min-h-11 text-slate-800"
                  />
                </div>
              )}

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="pickup-barcode" className="font-bold text-slate-900 block text-xs">{t('Physical Sack Barcode / Tag ID', 'ব্যাগের বারকোড / ট্যাগ আইডি')}</label>
                  <button
                    type="button"
                    onClick={() => {
                      setScannerMode('any');
                      setIsScannerOpen(true);
                    }}
                    className="text-[11px] font-bold text-[#25345C] hover:underline flex items-center gap-1 cursor-pointer min-h-11 px-1"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#25345C]" aria-hidden="true" />
                    <span>{t('Scan Barcode (Camera)', 'বারকোড স্ক্যান')}</span>
                  </button>
                </div>
                <input
                  id="pickup-barcode"
                  type="text"
                  value={associatedBagBarcode}
                  onChange={(e) => setAssociatedBagBarcode(e.target.value)}
                  placeholder="e.g. TAG-101-PET"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 min-h-11 font-mono text-xs text-slate-900"
                />
              </div>

              <label htmlFor="pickup-photo" className="flex items-center justify-between p-3 min-h-11 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <span className="font-medium text-slate-700">{t('Photo Proof Captured', 'ছবির প্রমাণ নেওয়া হয়েছে')}</span>
                <input
                  id="pickup-photo"
                  type="checkbox"
                  checked={photoRecorded}
                  onChange={(e) => setPhotoRecorded(e.target.checked)}
                  className="w-5 h-5 text-emerald-600 rounded"
                />
              </label>
            </div>
          )}

          {pickupOutcome !== 'COLLECTED' && pickupOutcome !== 'PARTIALLY_COLLECTED' && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label htmlFor="pickup-reason" className="block font-medium text-slate-700">{t('Reason & Guidance Note', 'কারণ ও নির্দেশনা')}</label>
              <textarea
                id="pickup-reason"
                rows={2}
                value={uncollectedNotes}
                onChange={(e) => setUncollectedNotes(e.target.value)}
                placeholder="e.g. Mixed bio-waste present; provided guidance on rinsing."
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              />
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPickupModalOpen(false)}
              className="px-4 min-h-11 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium cursor-pointer"
            >
              {t('Cancel', 'বাতিল')}
            </button>
            <button
              type="submit"
              className="px-5 min-h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
            >
              {isOfflineMode ? t('Save Locally on Device', 'ডিভাইসে সংরক্ষণ') : t('Submit Pickup', 'পিকআপ জমা দিন')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(exceptionJob)}
        onClose={() => setExceptionJobId(null)}
        size="sm"
        title={t("Can't collect — reason", 'সংগ্রহ করা যাচ্ছে না — কারণ')}
        description={exceptionJob?.customerAddress}
        closeLabel={t('Close', 'বন্ধ করুন')}
      >
        <form onSubmit={handleExceptionSubmit} className="space-y-3 text-xs">
          <fieldset className="space-y-2">
            <legend className="sr-only">{t('Reason', 'কারণ')}</legend>
            {EXCEPTION_REASONS.map((r) => (
              <label
                key={r.id}
                className={`flex items-center gap-3 p-3 min-h-11 rounded-xl border cursor-pointer font-semibold ${
                  exceptionReason === r.id ? 'border-rose-500 bg-rose-50 text-rose-950' : 'border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="exception-reason"
                  value={r.id}
                  checked={exceptionReason === r.id}
                  onChange={() => setExceptionReason(r.id)}
                  className="w-4 h-4"
                />
                {t(r.en, r.bn)}
              </label>
            ))}
          </fieldset>
          <p className="text-[11px] text-slate-500">
            {t('The booking is marked missed and the operator is alerted.', 'বুকিং মিসড হিসেবে চিহ্নিত হবে এবং অপারেটরকে জানানো হবে।')}
          </p>
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => setExceptionJobId(null)} className="px-4 min-h-11 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium cursor-pointer">
              {t('Cancel', 'বাতিল')}
            </button>
            <button type="submit" className="px-5 min-h-11 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold cursor-pointer">
              {t('Record exception', 'ব্যতিক্রম রেকর্ড করুন')}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* QR CODE CAMERA SCANNER MODAL */}
      {/* ========================================================================= */}
      <QrCodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanResult={handleScanResult}
        mode={scannerMode}
        title={
          scannerMode === 'lot'
            ? 'Scan Lot Handover QR Tag'
            : scannerMode === 'job'
            ? 'Scan Customer Booking Ticket'
            : 'Scan QR Barcode'
        }
      />

      {/* ========================================================================= */}
      {/* HUB HANDOVER & PLATFORM SCALE VERIFICATION MODAL */}
      {/* ========================================================================= */}
      <LotHandoverModal
        isOpen={Boolean(selectedLotForHandover)}
        onClose={() => setSelectedLotForHandover(null)}
        lot={selectedLotForHandover}
      />
    </div>
  );
};
