import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EvidenceBadge } from '../common/EvidenceBadge';
import { isReadyForProcessing } from '../../domain/lots';
import { KNOWN_PROCESSORS, PROCESS_TYPE_LABELS, defaultProcessorForLot, routeFor } from './materialRouting';
import { Factory, FileText, RefreshCcw } from 'lucide-react';

export const ProcessorFacility: React.FC = () => {
  const {
    lots,
    processingDispositions,
    recordProcessingOutcome,
    lang
  } = useApp();
  const t = (en: string, bn: string) => (lang === 'en' ? en : bn);

  const [selectedLotId, setSelectedLotId] = useState<string>('');
  const [processorName, setProcessorName] = useState<string>('Bengal Polymers & Flake Mill');
  const [processType, setProcessType] = useState<
    'MECHANICAL_PET_FLAKING' | 'HDPE_PELLETIZING' | 'PULPING_AND_CORRUGATING' | 'ALUMINUM_SMELTING'
  >('MECHANICAL_PET_FLAKING');
  const [outputYieldKg, setOutputYieldKg] = useState<number>(0);
  const [processLossKg, setProcessLossKg] = useState<number>(0);
  const [certId, setCertId] = useState<string>(`CERT-DISP-BP-${Math.floor(1000 + Math.random() * 9000)}`);

  // Leaf lots (never a parent whose children were sorted out) with no outcome on record yet.
  const eligibleLots = lots.filter((l) => isReadyForProcessing(l, processingDispositions));
  const selectedLot = lots.find((l) => l.id === selectedLotId);
  const receivedKg = selectedLot ? selectedLot.verifiedHubWeightKg ?? selectedLot.initialFieldWeightKg : 0;
  const accountedKg = Number((outputYieldKg + processLossKg).toFixed(2));
  const massError = !selectedLot
    ? null
    : outputYieldKg < 0 || processLossKg < 0
    ? t('Yield and loss cannot be negative.', 'আউটপুট ও ক্ষতি ঋণাত্মক হতে পারে না।')
    : accountedKg > receivedKg + 0.001
    ? t(
        `Yield + loss (${accountedKg} kg) exceeds the ${receivedKg} kg received. Reduce one of them.`,
        `আউটপুট + ক্ষতি (${accountedKg} কেজি) প্রাপ্ত ${receivedKg} কেজির বেশি।`
      )
    : null;

  const handleLotChange = (lotId: string) => {
    setSelectedLotId(lotId);
    const chosen = lots.find((l) => l.id === lotId);
    if (chosen) {
      const w = chosen.verifiedHubWeightKg ?? chosen.initialFieldWeightKg;
      const route = routeFor(chosen.material);
      setProcessType(route.processType);
      setProcessorName(defaultProcessorForLot(chosen));
      setOutputYieldKg(Number((w * 0.92).toFixed(1)));
      setProcessLossKg(Number((w - Number((w * 0.92).toFixed(1))).toFixed(1)));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLotId || massError) return;

    recordProcessingOutcome(
      selectedLotId,
      processorName,
      processType,
      outputYieldKg,
      processLossKg,
      certId
    );

    setSelectedLotId('');
    setCertId(`CERT-DISP-BP-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Factory className="w-4 h-4 text-indigo-700" />
            <span className="font-semibold text-slate-800">Licensed Recycler Facility</span>
            <span aria-hidden="true">·</span>
            <span>Department of Environment Licensed Mill (Savar & Narayanganj)</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            {t('Processor Receipt & Final Recovery Disposition', 'রিসাইক্লার মিল ও প্রক্রিয়াকরণ ফলাফল')}
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Document mechanical recycling conversion, actual yield, and process loss. Advances lot to <strong>Evidence Level E4 (Processing outcome confirmed)</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Processing Disposition Form */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-800 rounded-lg">
              <RefreshCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Record Processing Outcome</h3>
              <p className="text-xs text-slate-500">Seal E4 Final Recovery Milestone</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label htmlFor="proc-lot" className="block font-medium text-slate-700 mb-1">
                {t('Select Incoming Bale / Lot *', 'আগত বেল / লট নির্বাচন *')}
              </label>
              <select
                id="proc-lot"
                required
                value={selectedLotId}
                onChange={(e) => handleLotChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 min-h-11 font-mono text-slate-900"
              >
                <option value="">-- Choose eligible lot --</option>
                {eligibleLots.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.id} · {lot.verifiedHubWeightKg || lot.initialFieldWeightKg} kg ({lot.material})
                  </option>
                ))}
              </select>
              {eligibleLots.length === 0 && (
                <p className="text-[11px] text-slate-500 mt-1">No lots are waiting for processing. Dispatch a lot from the aggregation hub.</p>
              )}
            </div>

            <div>
              <label htmlFor="proc-facility" className="block font-medium text-slate-700 mb-1">
                Processing Facility & Line
              </label>
              <input
                id="proc-facility"
                type="text"
                list="proc-facility-list"
                required
                value={processorName}
                onChange={(e) => setProcessorName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 min-h-11 text-slate-800"
              />
              <datalist id="proc-facility-list">
                {KNOWN_PROCESSORS.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>

            <div>
              <label htmlFor="proc-type" className="block font-medium text-slate-700 mb-1">Conversion Technology</label>
              <select
                id="proc-type"
                value={processType}
                onChange={(e) => setProcessType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 min-h-11 text-slate-800 font-medium"
              >
                {(Object.keys(PROCESS_TYPE_LABELS) as (keyof typeof PROCESS_TYPE_LABELS)[]).map((k) => (
                  <option key={k} value={k}>{PROCESS_TYPE_LABELS[k]}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="proc-yield" className="block font-medium text-slate-700 mb-1">
                  Finished Yield (kg) *
                </label>
                <input
                  id="proc-yield"
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  aria-invalid={Boolean(massError)}
                  value={outputYieldKg}
                  onChange={(e) => setOutputYieldKg(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label htmlFor="proc-loss" className="block font-medium text-slate-700 mb-1">
                  Process Loss (kg) *
                </label>
                <input
                  id="proc-loss"
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  aria-invalid={Boolean(massError)}
                  value={processLossKg}
                  onChange={(e) => setProcessLossKg(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            {selectedLot && (
              <div
                role={massError ? 'alert' : 'status'}
                className={`p-3 rounded-xl border text-[11px] ${
                  massError ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span className="font-mono">Received {receivedKg} kg · yield + loss {accountedKg} kg</span>
                {massError && <div className="font-semibold mt-1">{massError}</div>}
              </div>
            )}

            <div>
              <label htmlFor="proc-cert" className="block font-medium text-slate-700 mb-1">
                Disposition Certificate ID *
              </label>
              <input
                id="proc-cert"
                type="text"
                required
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900"
              />
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900 text-[11px] leading-relaxed">
              <strong>E4 Milestone Policy:</strong> Only after this step is the material verified as genuinely recovered and recycled. Customer timeline will update to "Processing outcome confirmed".
            </div>

            <button
              type="submit"
              disabled={!selectedLotId || Boolean(massError)}
              className={`w-full min-h-11 rounded-xl font-semibold shadow-xs transition-colors ${
                selectedLotId && !massError
                  ? 'bg-indigo-700 hover:bg-indigo-800 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {t('Issue Certificate & Confirm E4', 'সনদ ইস্যু করে E4 নিশ্চিত করুন')}
            </button>
          </form>
        </div>

        {/* Confirmed Dispositions Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Verified Processing Dispositions Ledger (E4)
          </h3>

          <div className="space-y-3">
            {processingDispositions.map((disp) => (
              <div
                key={disp.id}
                className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/20 space-y-2 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-700" />
                    <span className="font-mono font-bold text-slate-900">{disp.dispositionCertificateId}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-slate-500">Lot: {disp.lotId}</span>
                  </div>
                  <EvidenceBadge level="E4" />
                </div>

                <div className="flex flex-wrap items-center gap-4 text-slate-600">
                  <span>Facility: <strong className="text-slate-800">{disp.processorName}</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>Type: <strong className="text-slate-800">{disp.processType.replace(/_/g, ' ')}</strong></span>
                </div>

                <div className="pt-2 border-t border-indigo-100/70 flex items-center justify-between font-mono">
                  <div className="text-emerald-800 font-bold">
                    Finished Recovered Yield: {disp.outputYieldKg} kg
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Process Loss: {disp.processLossKg} kg ({disp.completedAt.split('T')[0]})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
