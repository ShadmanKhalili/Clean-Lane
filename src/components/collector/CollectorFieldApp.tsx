import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MaterialCategory, PickupJob } from '../../types';
import { MATERIAL_TAXONOMY } from '../../data/mockData';
import {
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
  PackageCheck
} from 'lucide-react';

export const CollectorFieldApp: React.FC = () => {
  const {
    jobs,
    acceptJob,
    completeJob,
    recordJobException,
    isOfflineMode,
    setIsOfflineMode,
    offlineQueueCount,
    syncOfflineQueue,
    lang
  } = useApp();

  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [exceptionModalOpen, setExceptionModalOpen] = useState(false);

  // Field Form State
  const [weightKg, setWeightKg] = useState<number>(6.5);
  const [bagCount, setBagCount] = useState<number>(2);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialCategory>('PET_BOTTLES');
  const [weightMethod, setWeightMethod] = useState<
    'field_hanging_scale' | 'customer_estimate' | 'receiving_scale_delegated'
  >('field_hanging_scale');
  const [photoRecorded, setPhotoRecorded] = useState<boolean>(true);

  // Exception Form State
  const [exceptionReason, setExceptionReason] = useState<
    'customer_unavailable' | 'inaccessible' | 'contaminated_stream' | 'cancelled_at_door'
  >('customer_unavailable');

  const selectedJob = jobs.find((j) => j.id === activeJobId);

  const handleOpenComplete = (job: PickupJob) => {
    setActiveJobId(job.id);
    setSelectedMaterial(job.expectedMaterials[0] || 'PET_BOTTLES');
    setCompleteModalOpen(true);
  };

  const handleOpenException = (job: PickupJob) => {
    setActiveJobId(job.id);
    setExceptionModalOpen(true);
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJobId) return;

    completeJob(activeJobId, {
      materialWeights: [{ category: selectedMaterial, weightKg, bagCount }],
      totalWeightKg: weightKg,
      weightMethod,
      photoEvidenceRecorded: photoRecorded
    });

    setCompleteModalOpen(false);
    setActiveJobId(null);
  };

  const handleExceptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJobId) return;

    recordJobException(activeJobId, exceptionReason);
    setExceptionModalOpen(false);
    setActiveJobId(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Mobile Worker Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-800">Tariq Hossain</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">Vehicle #DH-14 (E-Trike)</span>
              <span aria-hidden="true">·</span>
              <span>Zone North-1</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
              {lang === 'en' ? 'Collector Route & Job Execution' : 'মাঠ সংগ্রাহক কাজ ও রুট তালিকা'}
            </h1>
            <p className="text-xs text-slate-500">
              PRD § 8: Worker-inclusive field workflow with offline resilience and verifiable batch tags.
            </p>
          </div>

          {/* Offline Mode Toggle & Sync Control */}
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setIsOfflineMode(!isOfflineMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isOfflineMode
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              {isOfflineMode ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              <span>{isOfflineMode ? 'Simulating Offline' : 'Online Mode'}</span>
            </button>

            {offlineQueueCount > 0 && (
              <button
                onClick={syncOfflineQueue}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync ({offlineQueueCount})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            {lang === 'en' ? 'Assigned Pickups Today' : 'আজকের নির্ধারিত কাজ'}
          </h2>
          <span className="text-xs font-mono text-slate-500">
            {jobs.filter((j) => j.status === 'COMPLETED').length} / {jobs.length} completed
          </span>
        </div>

        <div className="space-y-3">
          {jobs.map((job) => {
            const isCompleted = job.status === 'COMPLETED';
            const isException = job.status === 'EXCEPTION';
            const isPending = job.status === 'PENDING';
            const isAccepted = job.status === 'ACCEPTED';

            return (
              <div
                key={job.id}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-2xs ${
                  isCompleted
                    ? 'border-emerald-200/80 bg-emerald-50/20'
                    : isException
                    ? 'border-rose-200/80 bg-rose-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono font-semibold text-slate-900">{job.id}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{job.bookingId}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {job.scheduledWindow}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>{job.customerAddress}</span>
                      </div>
                      <div className="text-xs text-slate-600 flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.customerPhone}</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                      <span className="font-semibold text-slate-700">Access Notes: </span>
                      {job.accessNotes}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-medium text-slate-700">Expected:</span>
                      {job.expectedMaterials.map((mat) => (
                        <span key={mat} className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                          {mat.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions / Status Column */}
                  <div className="sm:text-right flex flex-col justify-between items-start sm:items-end gap-3 shrink-0">
                    <div>
                      {isCompleted ? (
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span>E1 Collected</span>
                          </span>
                          {job.fieldReport && (
                            <div className="text-xs font-mono font-bold text-slate-900 mt-1">
                              {job.fieldReport.totalWeightKg} kg · {job.fieldReport.materialWeights[0]?.bagCount || 1} bags
                            </div>
                          )}
                        </div>
                      ) : isException ? (
                        <span className="text-xs font-semibold text-rose-700">
                          Exception: {job.exceptionReason?.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-slate-500">
                          {isPending ? 'Pending acceptance' : 'In route'}
                        </span>
                      )}
                    </div>

                    {/* Operational Buttons */}
                    {!isCompleted && !isException && (
                      <div className="flex items-center gap-2">
                        {isPending && (
                          <button
                            onClick={() => acceptJob(job.id)}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs"
                          >
                            Accept Job
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenComplete(job)}
                          className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1"
                        >
                          <Scale className="w-3.5 h-3.5" />
                          <span>Weigh & Pickup</span>
                        </button>

                        <button
                          onClick={() => handleOpenException(job)}
                          className="px-2.5 py-1.5 text-slate-500 hover:text-rose-600 rounded-lg text-xs font-medium"
                          title="Log exception"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Handover Tag Card for Completed Pickups */}
                {isCompleted && job.fieldReport && (
                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs bg-white p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-slate-100 rounded-lg text-slate-700">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-slate-400 font-mono text-[10px] block">CUSTODY BATCH TAG</span>
                        <span className="font-mono font-bold text-slate-900">{job.fieldReport.batchLotId}</span>
                      </div>
                    </div>

                    <div className="text-slate-500 font-mono text-[11px]">
                      Ack Code: <span className="font-bold text-slate-800">{job.fieldReport.customerAckCode}</span>
                    </div>

                    <div className="text-[11px]">
                      {job.fieldReport.syncStatus === 'synced' ? (
                        <span className="text-emerald-700 font-medium">✓ Central Registry Synced</span>
                      ) : (
                        <span className="text-amber-700 font-medium">⚠ Stored in Local Offline Queue</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Field Pickup Execution Modal (PRD § 8.2) */}
      {completeModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Field Pickup & Weight</h3>
                <p className="text-xs text-slate-500">
                  Job {selectedJob.id} · {selectedJob.customerAddress}
                </p>
              </div>
              <button
                onClick={() => setCompleteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Material Fraction Present</label>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value as MaterialCategory)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 font-medium"
                >
                  {Object.values(MATERIAL_TAXONOMY).map((mat) => (
                    <option key={mat.id} value={mat.id}>
                      {mat.name} (Code: {mat.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Field Weight (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono text-base font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Container / Sacks</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={bagCount}
                    onChange={(e) => setBagCount(parseInt(e.target.value) || 1)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono text-base font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Weighing Method (PRD O-07)</label>
                <select
                  value={weightMethod}
                  onChange={(e) => setWeightMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                >
                  <option value="field_hanging_scale">Certified Portable Hanging Scale (Model HS-50)</option>
                  <option value="customer_estimate">Visual Band Estimate (Awaits hub scale)</option>
                  <option value="receiving_scale_delegated">Delegated to Hub Scale Directly</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-700" />
                  <span className="font-medium text-slate-700">Photo Proof Captured</span>
                </div>
                <input
                  type="checkbox"
                  checked={photoRecorded}
                  onChange={(e) => setPhotoRecorded(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
              </div>

              <div className="p-3 bg-slate-100 rounded-xl text-slate-600 text-[11px] leading-relaxed">
                <strong>Chain of Custody Protocol:</strong> This action issues Evidence Level <strong>E1 (Collected)</strong> and generates a tamper-evident batch tag for the aggregation hub handover. Customer points will remain held pending platform scale intake (E2).
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCompleteModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  Confirm & Generate Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exception Modal (PRD § 8.2) */}
      {exceptionModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Record Pickup Exception</h3>
            <p className="text-xs text-slate-500">
              Why could collection not be completed for {selectedJob.id}?
            </p>

            <form onSubmit={handleExceptionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Exception Category</label>
                <select
                  value={exceptionReason}
                  onChange={(e) => setExceptionReason(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                >
                  <option value="customer_unavailable">Customer Unavailable / Unreachable</option>
                  <option value="inaccessible">Premises Inaccessible (Gate locked / No security clearance)</option>
                  <option value="contaminated_stream">Contaminated / Mixed Bio-waste Stream</option>
                  <option value="cancelled_at_door">Customer Cancelled at Doorstep</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px]">
                Exception will notify the operations coordinator and customer with reschedule instructions.
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setExceptionModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-semibold"
                >
                  Log Exception
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
