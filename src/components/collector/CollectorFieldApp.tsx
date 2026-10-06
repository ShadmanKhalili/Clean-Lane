import React, { useState } from 'react';
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
  FileText,
  Truck,
  Check,
  ArrowRight,
  AlertCircle,
  ScanLine,
  Sparkles
} from 'lucide-react';

export const CollectorFieldApp: React.FC = () => {
  const {
    jobs,
    lots,
    acceptJob,
    completeJob,
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

  const currentJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  const filteredJobs = jobs.filter((j) => {
    if (jobFilter === 'assigned') return j.status === 'ACCEPTED' || j.status === 'PENDING';
    if (jobFilter === 'in_progress') return j.status === 'EN_ROUTE';
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
    setAssociatedBagBarcode(`TAG-${job.id.slice(-4)}-${job.expectedMaterials[0] || 'PET'}`);
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

    setIsPickupModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 4 Collector Destinations Tab Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'jobs', label: 'Jobs (O01)', icon: Briefcase },
            { id: 'route', label: 'Route', icon: Navigation },
            { id: 'handovers', label: `Handovers (${lots.filter(l => l.currentCustodian === 'COLLECTOR').length})`, icon: PackageCheck },
            { id: 'account', label: 'Account', icon: User }
          ].map((dest) => {
            const Icon = dest.icon;
            const isActive = activeDestination === dest.id;
            return (
              <button
                key={dest.id}
                onClick={() => setActiveDestination(dest.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{dest.label}</span>
              </button>
            );
          })}
        </div>

        {/* Offline Mode Switcher & Sync Status (PRD O01) */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Quick Camera QR Code Scanner Trigger */}
          <button
            onClick={() => {
              setScannerMode('any');
              setIsScannerOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors"
            title="Scan QR Code via Device Camera"
          >
            <Camera className="w-3.5 h-3.5 text-[#C9F1DC]" />
            <span>Scan QR</span>
          </button>

          <button
            onClick={() => setIsOfflineMode(!isOfflineMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              isOfflineMode
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isOfflineMode ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>{isOfflineMode ? 'Offline Mode' : 'Online'}</span>
          </button>

          {offlineQueueCount > 0 && (
            <button
              onClick={syncOfflineQueue}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync ({offlineQueueCount})</span>
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
                FIELD WORKER WORKSPACE (PRD O01)
              </span>
              <h1 className="text-lg font-bold text-slate-900">Today's Collections</h1>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
              {[
                { id: 'assigned', label: 'Assigned' },
                { id: 'in_progress', label: 'In Progress' },
                { id: 'completed', label: 'Completed' },
                { id: 'exceptions', label: 'Exceptions' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setJobFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    jobFilter === f.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

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
                          <button
                            onClick={() => handleOpenPickupFlow(job)}
                            className="w-full sm:w-auto px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                          >
                            <Scale className="w-4 h-4" />
                            <span>Weigh & Pickup</span>
                          </button>
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
              className="px-4 py-2.5 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors shrink-0"
            >
              <Camera className="w-4 h-4 text-[#C9F1DC]" />
              <span>Scan Lot QR Tag (Camera)</span>
            </button>
          </div>

          <div className="space-y-3">
            {lots.map((lot) => (
              <div
                key={lot.id}
                className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5 text-xs shadow-2xs hover:border-slate-400 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-[#25345C]" />
                    <span className="font-mono font-bold text-slate-900">{lot.id}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-600 font-semibold">{lot.material.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Custodian: {lot.currentCustodian}
                    </span>
                    <button
                      onClick={() => setSelectedLotForHandover(lot)}
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Verify Handover</span>
                    </button>
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

                {lot.discrepancyPercentage !== undefined && Math.abs(lot.discrepancyPercentage) > 5 && (
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
          <h2 className="text-base font-bold text-slate-900">Collector Profile & Equipment</h2>
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
              <span className="text-slate-500">Scale Calibration Date:</span>
              <span className="font-mono text-emerald-800 font-bold">2026-10-01 (Valid 30 days)</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PICKUP OUTCOME & MATERIAL CAPTURE (Wireframes O03, O04, O05) */}
      {/* ========================================================================= */}
      {isPickupModalOpen && currentJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">
                  PICKUP EXECUTION (PRD O03–O05)
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{currentJob.customerAddress}</h3>
              </div>
              <button onClick={() => setIsPickupModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handlePickupSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* O03: Large Outcome Choices */}
              <div>
                <label className="block font-bold text-slate-900 mb-2">1. Collection Outcome *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'COLLECTED', label: 'Collected' },
                    { id: 'PARTIALLY_COLLECTED', label: 'Partially Collected' },
                    { id: 'CUSTOMER_UNAVAILABLE', label: 'Customer Unavailable' },
                    { id: 'CANNOT_ACCESS', label: 'Cannot Access' },
                    { id: 'MATERIAL_UNSUITABLE', label: 'Material Unsuitable' }
                  ].map((out) => (
                    <button
                      key={out.id}
                      type="button"
                      onClick={() => setPickupOutcome(out.id as any)}
                      className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                        pickupOutcome === out.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {out.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* If Collected or Partially Collected -> O04 Material Capture */}
              {(pickupOutcome === 'COLLECTED' || pickupOutcome === 'PARTIALLY_COLLECTED') && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Material Fraction</label>
                    <select
                      value={selectedMaterial}
                      onChange={(e) => setSelectedMaterial(e.target.value as MaterialCategory)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 font-medium"
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
                      <label className="block font-medium text-slate-700 mb-1">Quantity (kg) *</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        required
                        value={weightKg}
                        onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono text-base font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Container Count</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={bagCount}
                        onChange={(e) => setBagCount(parseInt(e.target.value) || 1)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono text-base font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Measurement Basis (PRD O04 Guardrail) */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Measurement Basis *</label>
                    <select
                      value={weightBasis}
                      onChange={(e) => setWeightBasis(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                    >
                      <option value="field_scale">Certified Portable Scale (HS-50)</option>
                      <option value="estimate">Field Visual Estimate (Marked as unmeasured)</option>
                      <option value="not_measured">Not Measured at Doorstep</option>
                    </select>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      PRD O04 Guardrail: An estimated weight is never presented downstream as a confirmed scale weight.
                    </span>
                  </div>

                  {pickupOutcome === 'PARTIALLY_COLLECTED' && (
                    <div>
                      <label className="block font-medium text-amber-800 mb-1">
                        Uncollected Items & Reason (PRD Flow E)
                      </label>
                      <input
                        type="text"
                        value={uncollectedNotes}
                        onChange={(e) => setUncollectedNotes(e.target.value)}
                        placeholder="e.g. Cardboard collected; wet milk cartons left behind."
                        className="w-full bg-white border border-amber-300 rounded-lg p-2 text-slate-800"
                      />
                    </div>
                  )}

                  {/* Associated Bag Barcode / Tag ID */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-900 block text-xs">Physical Sack Barcode / Tag ID</label>
                      <button
                        type="button"
                        onClick={() => {
                          setScannerMode('any');
                          setIsScannerOpen(true);
                        }}
                        className="text-[11px] font-bold text-[#25345C] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#25345C]" />
                        <span>Scan Barcode (Camera)</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={associatedBagBarcode}
                      onChange={(e) => setAssociatedBagBarcode(e.target.value)}
                      placeholder="e.g. TAG-101-PET"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-xs text-slate-900"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-medium text-slate-700">Photo Proof Captured</span>
                    <input
                      type="checkbox"
                      checked={photoRecorded}
                      onChange={(e) => setPhotoRecorded(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                  </div>
                </div>
              )}

              {/* If Exception Outcome */}
              {pickupOutcome !== 'COLLECTED' && pickupOutcome !== 'PARTIALLY_COLLECTED' && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block font-medium text-slate-700">Reason & Guidance Note</label>
                  <textarea
                    rows={2}
                    value={uncollectedNotes}
                    onChange={(e) => setUncollectedNotes(e.target.value)}
                    placeholder="e.g. Mixed bio-waste present; provided guidance on rinsing."
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPickupModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
                >
                  {isOfflineMode ? 'Save Locally on Device' : 'Submit Pickup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
