import React, { useState } from 'react';
import { assessScaleReading, isOverTolerance } from '../../domain/rules';
import { canHandOverToHub, isReadyToSort, isSplit } from '../../domain/lots';
import { useApp } from '../../context/AppContext';
import { EvidenceBadge } from '../common/EvidenceBadge';
import { Modal } from '../common/Modal';
import { KNOWN_PROCESSORS, defaultProcessorForLot, routeFor } from '../processor/materialRouting';
import hubImg from '../../assets/images/facility_aggregation_hub_1791258410874.jpg';
import {
  Scale,
  Split,
  Truck,
  Building2,
  Trash2
} from 'lucide-react';

export const AggregationHub: React.FC = () => {
  const {
    lots,
    verifyHubScaleWeight,
    resolveDiscrepancy,
    commitSorting,
    dispatchLotToProcessor,
    lang
  } = useApp();
  const t = (en: string, bn: string) => (lang === 'en' ? en : bn);

  const [activeTab, setActiveTab] = useState<'intake' | 'discrepancies' | 'sorting'>('intake');

  // Intake State
  const [selectedLotId, setSelectedLotId] = useState<string>('');
  const [hubScaleWeight, setHubScaleWeight] = useState<number>(14.0);
  const [scaleNotes, setScaleNotes] = useState<string>('Platform scale #GW-01 calibration valid');

  // Discrepancy Resolution State
  const [discrepancyLotId, setDiscrepancyLotId] = useState<string | null>(null);
  const [resolutionReason, setResolutionReason] = useState<string>('');

  // Sorting Transformation State
  const [sortingLotId, setSortingLotId] = useState<string>('');
  const [gradeAWeight, setGradeAWeight] = useState<number>(0);
  const [coloredWeight, setColoredWeight] = useState<number>(0);
  const [residueKg, setResidueKg] = useState<number>(0);
  const [dispatchTargets, setDispatchTargets] = useState<Record<string, string>>({});
  const [residueDesc, setResidueDesc] = useState<string>(
    'Non-recyclable adhesive labels and moisture loss residue recorded in environmental waste ledger.'
  );

  const pendingIntakeLots = lots.filter(canHandOverToHub);
  const discrepantLots = lots.filter((l) => isOverTolerance(l.discrepancyPercentage) && !l.discrepancyResolved);
  const readyToSortLots = lots.filter(isReadyToSort);
  // Leaf lots at the hub at E2 can leave for a recycler; E3 lots are shown as already dispatched.
  const dispatchableLots = lots.filter(
    (l) => l.currentCustodian === 'AGGREGATION_HUB' && l.evidenceLevel === 'E2' && !isSplit(l)
  );
  const inTransitLots = lots.filter((l) => l.evidenceLevel === 'E3' && !isSplit(l));

  const sortingLot = lots.find((l) => l.id === sortingLotId);
  const sortingRoute = sortingLot ? routeFor(sortingLot.material) : null;
  const sortingInputKg = sortingLot ? sortingLot.verifiedHubWeightKg ?? sortingLot.initialFieldWeightKg : 0;
  const sortingOutputKg = gradeAWeight + coloredWeight + residueKg;
  const sortingGapKg = Number((sortingInputKg - sortingOutputKg).toFixed(2));
  const sortingBalanceError = !sortingLot
    ? null
    : sortingGapKg < -0.05
    ? t(
        `Outputs (${sortingOutputKg.toFixed(1)} kg) exceed the input lot (${sortingInputKg} kg). Reduce a fraction.`,
        `আউটপুট (${sortingOutputKg.toFixed(1)} কেজি) ইনপুট লটের (${sortingInputKg} কেজি) চেয়ে বেশি।`
      )
    : sortingGapKg > 0.5
    ? t(
        `${sortingGapKg.toFixed(1)} kg of the input is unaccounted for. Allocate it to a fraction or to residue.`,
        `ইনপুটের ${sortingGapKg.toFixed(1)} কেজি হিসাবে নেই। কোনো ভগ্নাংশ বা অবশিষ্টে যোগ করুন।`
      )
    : null;

  const intakeLot = lots.find((l) => l.id === selectedLotId);
  const intakeAssessment = intakeLot ? assessScaleReading(intakeLot.initialFieldWeightKg, hubScaleWeight) : null;

  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLotId) return;
    verifyHubScaleWeight(selectedLotId, hubScaleWeight, scaleNotes);
    setSelectedLotId('');
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discrepancyLotId || !resolutionReason.trim()) return;
    resolveDiscrepancy(discrepancyLotId, resolutionReason);
    setDiscrepancyLotId(null);
    setResolutionReason('');
  };

  const handleSortSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sortingLotId) return;

    const parent = lots.find((l) => l.id === sortingLotId);
    if (!parent || sortingBalanceError || !sortingRoute) return;

    commitSorting(
      sortingLotId,
      [
        {
          materialGrade: sortingRoute.primary.grade,
          outputWeightKg: gradeAWeight,
          childLotId: `${sortingLotId}-A`,
          destinationProcessor: sortingRoute.primary.processor
        },
        {
          materialGrade: sortingRoute.secondary.grade,
          outputWeightKg: coloredWeight,
          childLotId: `${sortingLotId}-B`,
          destinationProcessor: sortingRoute.secondary.processor
        }
      ],
      residueKg,
      residueDesc
    );

    setSortingLotId('');
  };

  const handleDispatch = (lotId: string, fallback: string) => {
    dispatchLotToProcessor(lotId, dispatchTargets[lotId] || fallback);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
            <Building2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            <span className="font-semibold text-slate-800">Gulshan Aggregation Hub #3</span>
            <span aria-hidden="true">·</span>
            <span>Weighmaster: Rahmat Ali (ID #WM-44)</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-medium">Scale #GW-01 certified</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            {t('Aggregation Intake, Scale Verification & Sorting', 'একত্রীকরণ কেন্দ্র: গ্রহণ, স্কেল যাচাই ও বাছাই')}
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            PRD § 9 & Journey C: Certified reception weights without overwriting field records. Full residue accounting prevents unverified material loss.
          </p>
        </div>

        {/* Facility Spotlight Pill */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-200">
            <img
              src={hubImg}
              alt="Gulshan Aggregation Hub #3 weighing and sorting floor"
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-[11px] leading-tight pr-2">
            <span className="font-semibold text-slate-800 block">Hub Scale Station #GW-01</span>
            <span className="text-slate-500">OIML R76 Class III Certified</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 w-full md:w-auto" role="tablist" aria-label={t('Hub sections', 'হাব বিভাগ')}>
          {([
            { id: 'intake', en: `Scale Intake (${pendingIntakeLots.length})`, bn: `স্কেল গ্রহণ (${pendingIntakeLots.length})` },
            { id: 'discrepancies', en: `Discrepancies (${discrepantLots.length})`, bn: `অসঙ্গতি (${discrepantLots.length})` },
            { id: 'sorting', en: `Sorting & Dispatch (${readyToSortLots.length + dispatchableLots.length})`, bn: `বাছাই ও প্রেরণ (${readyToSortLots.length + dispatchableLots.length})` }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2 sm:px-3 min-h-11 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors cursor-pointer leading-tight ${
                activeTab === tab.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t(tab.en, tab.bn)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Scale Intake */}
      {activeTab === 'intake' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Intake Verification Form */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Platform Scale Intake</h3>
                <p className="text-xs text-slate-500">Advance Lot from E1 to E2</p>
              </div>
            </div>

            <form onSubmit={handleIntakeSubmit} className="space-y-4 text-xs">
              <div>
                <label htmlFor="intake-lot" className="block font-medium text-slate-700 mb-1">
                  {t('Select Incoming Batch Lot *', 'আগত লট নির্বাচন করুন *')}
                </label>
                <select
                  id="intake-lot"
                  required
                  value={selectedLotId}
                  onChange={(e) => {
                    setSelectedLotId(e.target.value);
                    const chosen = lots.find((l) => l.id === e.target.value);
                    if (chosen) setHubScaleWeight(chosen.initialFieldWeightKg);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 min-h-11 font-mono text-slate-900"
                >
                  <option value="">-- Choose incoming lot --</option>
                  {pendingIntakeLots.map((lot) => (
                    <option key={lot.id} value={lot.id}>
                      {lot.id} · {lot.material} ({lot.initialFieldWeightKg} kg field)
                    </option>
                  ))}
                </select>
              </div>

              {selectedLotId && (
                <>
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-slate-600">
                    <div className="flex justify-between">
                      <span>Collector:</span>
                      <span className="font-medium text-slate-900">
                        {lots.find((l) => l.id === selectedLotId)?.primaryCollector}
                      </span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span>Field Recorded Weight:</span>
                      <span className="font-bold text-slate-900">
                        {lots.find((l) => l.id === selectedLotId)?.initialFieldWeightKg} kg
                      </span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="intake-weight" className="block font-medium text-slate-700 mb-1">
                      Certified Scale Weight (kg) *
                    </label>
                    <input
                      id="intake-weight"
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      value={hubScaleWeight}
                      onChange={(e) => setHubScaleWeight(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-3 font-mono text-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Real-time Delta Indicator */}
                  {intakeAssessment && (
                    <div
                      className={`p-3 rounded-xl border text-xs ${
                        intakeAssessment.isDiscrepant
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      }`}
                    >
                      <div className="flex justify-between font-mono font-bold">
                        <span>Discrepancy Delta:</span>
                        <span>
                          {intakeAssessment.deltaKg > 0 ? `+${intakeAssessment.deltaKg.toFixed(1)}` : intakeAssessment.deltaKg.toFixed(1)} kg ({intakeAssessment.deltaPercent.toFixed(1)}%)
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] leading-tight">
                        {intakeAssessment.isDiscrepant
                          ? 'Variance exceeds the ±5% threshold. Will be flagged for supervisor review.'
                          : 'Within allowable ±5% moisture and portable scale calibration tolerance.'}
                      </p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="intake-notes" className="block font-medium text-slate-700 mb-1">
                      Scale Calibration Log / Notes
                    </label>
                    <input
                      id="intake-notes"
                      type="text"
                      value={scaleNotes}
                      onChange={(e) => setScaleNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!(hubScaleWeight > 0)}
                    className="w-full min-h-11 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                  >
                    {t('Confirm Weight & Advance to E2', 'ওজন নিশ্চিত করে E2-তে উন্নীত করুন')}
                  </button>
                </>
              )}
            </form>
          </div>

          {/* Incoming Lots Queue Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Active Lots at Aggregation Hub
            </h3>
            {pendingIntakeLots.length === 0 && (
              <p className="text-xs text-slate-500">No lots are waiting for the scale. Collectors hand lots over from the field app.</p>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Batch Lot ID</th>
                    <th className="py-2.5 px-3">Material</th>
                    <th className="py-2.5 px-3">Field (E1)</th>
                    <th className="py-2.5 px-3">Hub (E2)</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {lots.map((lot) => (
                    <tr key={lot.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-3 font-bold text-slate-900">{lot.id}</td>
                      <td className="py-3 px-3 font-sans text-slate-700">
                        {lot.material.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{lot.initialFieldWeightKg} kg</td>
                      <td className="py-3 px-3 text-slate-900 font-bold">
                        {lot.verifiedHubWeightKg ? `${lot.verifiedHubWeightKg} kg` : '—'}
                      </td>
                      <td className="py-3 px-3 font-sans">
                        {isOverTolerance(lot.discrepancyPercentage) ? (
                          <span className="text-amber-700 font-semibold text-[11px]">
                            Discrepancy ({lot.discrepancyPercentage}%)
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[11px]">{lot.currentCustodian}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <EvidenceBadge level={lot.evidenceLevel} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Discrepancy Manager */}
      {activeTab === 'discrepancies' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Weight Discrepancy & Variance Resolver
            </h3>
            <p className="text-xs text-slate-500">
              PRD § T-03: When receiving party records a different weight, both values are preserved without overwriting history.
            </p>
          </div>

          <div className="space-y-3">
            {discrepantLots.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl text-xs text-slate-500">
                No unresolved discrepancies currently flagged.
              </div>
            ) : (
              discrepantLots.map((lot) => (
                <div
                  key={lot.id}
                  className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{lot.id}</span>
                      <span className="text-amber-800 font-semibold font-mono">
                        Delta: {lot.discrepancyPercentage}%
                      </span>
                    </div>
                    <div className="text-slate-600">
                      Field Weight: <span className="font-mono font-bold">{lot.initialFieldWeightKg} kg</span> vs
                      Hub Platform Scale: <span className="font-mono font-bold">{lot.verifiedHubWeightKg} kg</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Collector: {lot.primaryCollector} · Source Booking: {lot.sourceBookingId}
                    </div>
                  </div>

                  <button
                    onClick={() => setDiscrepancyLotId(lot.id)}
                    className="px-4 min-h-11 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs shadow-xs self-start sm:self-auto cursor-pointer"
                  >
                    Resolve Discrepancy
                  </button>
                </div>
              ))
            )}
          </div>

          <Modal
            open={Boolean(discrepancyLotId)}
            onClose={() => setDiscrepancyLotId(null)}
            size="sm"
            title="Resolve Weight Discrepancy"
            description={`Document the physical or environmental reason for the variance on lot ${discrepancyLotId}.`}
          >
            <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
              <div>
                <label htmlFor="resolution-reason" className="block font-medium text-slate-700 mb-1">
                  Resolution Reason / Audit Explanation *
                </label>
                <textarea
                  id="resolution-reason"
                  rows={3}
                  required
                  value={resolutionReason}
                  onChange={(e) => setResolutionReason(e.target.value)}
                  placeholder="e.g. Moisture evaporation observed in uncrushed PET bottles during warm transit; calibrated scale log GW-01 confirmed."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => setDiscrepancyLotId(null)} className="px-4 min-h-11 bg-white border border-slate-300 text-slate-700 rounded-lg cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 min-h-11 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold cursor-pointer">
                  Commit Resolution to Audit Log
                </button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {/* Tab 3: Sorting Transformation & Residue Accounting */}
      {activeTab === 'sorting' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-cyan-50 text-cyan-800 rounded-lg">
                <Split className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Sorting & Residue Split</h3>
                <p className="text-xs text-slate-500">PRD § T-04: Split lots into clean fractions</p>
              </div>
            </div>

            <form onSubmit={handleSortSubmit} className="space-y-4 text-xs">
              <div>
                <label htmlFor="sort-lot" className="block font-medium text-slate-700 mb-1">{t('Input Lot *', 'ইনপুট লট *')}</label>
                <select
                  id="sort-lot"
                  required
                  value={sortingLotId}
                  onChange={(e) => {
                    setSortingLotId(e.target.value);
                    const chosen = lots.find((l) => l.id === e.target.value);
                    if (chosen) {
                      const w = chosen.verifiedHubWeightKg ?? chosen.initialFieldWeightKg;
                      const a = Number((w * 0.8).toFixed(1));
                      const b = Number((w * 0.15).toFixed(1));
                      setGradeAWeight(a);
                      setColoredWeight(b);
                      setResidueKg(Number((w - a - b).toFixed(1)));
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 min-h-11 font-mono text-slate-900"
                >
                  <option value="">-- Choose verified E2 lot --</option>
                  {readyToSortLots.map((lot) => (
                    <option key={lot.id} value={lot.id}>
                      {lot.id} · {lot.verifiedHubWeightKg} kg ({lot.material})
                    </option>
                  ))}
                </select>
              </div>

              {sortingLotId && (
                <>
                  <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                    <span className="font-semibold text-slate-800 block">Output Fractions</span>
                    <div>
                      <label htmlFor="sort-a" className="block text-slate-600 mb-1">
                        {sortingRoute?.primary.grade} (kg):
                      </label>
                      <p className="text-[10px] text-slate-500 mb-1">→ {sortingRoute?.primary.processor}</p>
                      <input
                        id="sort-a"
                        type="number"
                        step="0.1"
                        min="0"
                        required
                        value={gradeAWeight}
                        onChange={(e) => setGradeAWeight(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label htmlFor="sort-b" className="block text-slate-600 mb-1">
                        {sortingRoute?.secondary.grade} (kg):
                      </label>
                      <p className="text-[10px] text-slate-500 mb-1">→ {sortingRoute?.secondary.processor}</p>
                      <input
                        id="sort-b"
                        type="number"
                        step="0.1"
                        min="0"
                        required
                        value={coloredWeight}
                        onChange={(e) => setColoredWeight(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                    <span className="font-semibold text-rose-900 flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      Residue & Contamination Accounting (PRD § T-05)
                    </span>
                    <p className="text-[11px] text-rose-950">
                      Material must never vanish from the accounting ledger.
                    </p>
                    <div>
                      <label htmlFor="sort-residue" className="block text-rose-900 mb-1">Unusable Residue (kg):</label>
                      <input
                        id="sort-residue"
                        type="number"
                        step="0.1"
                        min="0"
                        required
                        value={residueKg}
                        onChange={(e) => setResidueKg(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-rose-300 rounded-lg p-2 font-mono font-bold text-rose-900"
                      />
                    </div>

                    <div>
                      <label htmlFor="sort-residue-note" className="block text-rose-900 mb-1">Residue Destination / RDF Note:</label>
                      <input
                        id="sort-residue-note"
                        type="text"
                        value={residueDesc}
                        onChange={(e) => setResidueDesc(e.target.value)}
                        className="w-full bg-white border border-rose-300 rounded-lg p-2 text-slate-800 text-[11px]"
                      />
                    </div>
                  </div>

                  <div
                    role={sortingBalanceError ? 'alert' : 'status'}
                    className={`p-3 rounded-xl border text-[11px] font-mono ${
                      sortingBalanceError ? 'bg-amber-50 border-amber-300 text-amber-950' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <div>
                      Input {sortingInputKg} kg · Outputs + residue {sortingOutputKg.toFixed(1)} kg · Gap {sortingGapKg.toFixed(1)} kg
                    </div>
                    {sortingBalanceError ? (
                      <div className="font-sans mt-1">{sortingBalanceError}</div>
                    ) : (
                      <div className="font-sans mt-1">{t('Mass balance reconciles.', 'ভরের হিসাব মিলেছে।')}</div>
                    )}
                    {sortingGapKg > 0.5 && (
                      <button
                        type="button"
                        onClick={() => setResidueKg(Number((residueKg + sortingGapKg).toFixed(1)))}
                        className="mt-2 px-3 min-h-11 bg-white border border-amber-400 text-amber-900 rounded-lg font-sans font-semibold cursor-pointer"
                      >
                        {t('Record the gap as residue', 'পার্থক্য অবশিষ্ট হিসেবে লিখুন')}
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={Boolean(sortingBalanceError)}
                    className="w-full min-h-11 bg-cyan-800 hover:bg-cyan-900 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                  >
                    {t('Commit Transformation & Child Lots', 'বাছাই নিশ্চিত করুন ও চাইল্ড লট তৈরি করুন')}
                  </button>
                </>
              )}
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {t('Downstream Dispatch Manifests (E3 Staging)', 'ডাউনস্ট্রিম প্রেরণ ম্যানিফেস্ট (E3)')}
            </h3>
            <p className="text-xs text-slate-500">
              Hub-verified leaf lots ready for licensed recyclers. Dispatch records a custody event and advances the lot to E3.
            </p>

            <div className="space-y-3">
              {dispatchableLots.length === 0 && (
                <div className="p-6 text-center bg-slate-50 rounded-xl text-xs text-slate-500">
                  No E2 lots are waiting at the hub. Weigh a lot in, or sort one into fractions.
                </div>
              )}
              {dispatchableLots.map((lot) => {
                const fallback = defaultProcessorForLot(lot);
                const kg = lot.verifiedHubWeightKg ?? lot.initialFieldWeightKg;
                return (
                  <div
                    key={lot.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-mono font-bold text-slate-900 break-all">{lot.id}</div>
                        <div className="text-slate-600 mt-0.5">{routeFor(lot.material).label} · {lot.location}</div>
                        <div className="text-slate-500 text-[11px]">
                          {lot.parentLotId ? `Sorted from ${lot.parentLotId} · ` : ''}Certified mass: {kg} kg
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <EvidenceBadge level={lot.evidenceLevel} />
                        <span className="font-mono font-bold text-slate-900">{kg} kg</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-end gap-2">
                      <div className="flex-1">
                        <label htmlFor={`dispatch-${lot.id}`} className="block text-[11px] font-medium text-slate-600 mb-1">
                          {t('Destination processor', 'গন্তব্য প্রসেসর')}
                        </label>
                        <select
                          id={`dispatch-${lot.id}`}
                          value={dispatchTargets[lot.id] ?? fallback}
                          onChange={(e) => setDispatchTargets((prev) => ({ ...prev, [lot.id]: e.target.value }))}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2 min-h-11 text-slate-800"
                        >
                          {Array.from(new Set([fallback, ...KNOWN_PROCESSORS])).map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDispatch(lot.id, fallback)}
                        className="px-4 min-h-11 bg-cyan-800 hover:bg-cyan-900 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Truck className="w-4 h-4" aria-hidden="true" />
                        {t('Dispatch to processor', 'প্রসেসরে প্রেরণ')}
                      </button>
                    </div>
                  </div>
                );
              })}

              {inTransitLots.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    {t('Dispatched (E3)', 'প্রেরিত (E3)')}
                  </h4>
                  <ul className="space-y-1.5">
                    {inTransitLots.map((lot) => (
                      <li key={lot.id} className="flex items-center justify-between gap-2 text-xs px-3 py-2 rounded-lg border border-slate-200">
                        <span className="font-mono font-bold text-slate-800 break-all">{lot.id}</span>
                        <span className="text-slate-500 text-right">{lot.location}</span>
                        <EvidenceBadge level={lot.evidenceLevel} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
