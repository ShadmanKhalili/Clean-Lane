import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MaterialLot } from '../../types';
import { EvidenceBadge } from '../common/EvidenceBadge';
import {
  Scale,
  Split,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Building2,
  Trash2
} from 'lucide-react';

export const AggregationHub: React.FC = () => {
  const {
    lots,
    verifyHubScaleWeight,
    resolveDiscrepancy,
    commitSorting,
    lang
  } = useApp();

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
  const [gradeAWeight, setGradeAWeight] = useState<number>(10.5);
  const [coloredWeight, setColoredWeight] = useState<number>(2.5);
  const [residueKg, setResidueKg] = useState<number>(0.8);
  const [residueDesc, setResidueDesc] = useState<string>(
    'Non-recyclable adhesive labels and moisture loss residue recorded in environmental waste ledger.'
  );

  const pendingIntakeLots = lots.filter(
    (l) => l.evidenceLevel === 'E1' || !l.verifiedHubWeightKg
  );
  const discrepantLots = lots.filter(
    (l) => l.discrepancyPercentage !== undefined && !l.discrepancyResolved
  );
  const readyToSortLots = lots.filter(
    (l) => l.evidenceLevel === 'E2' && (!l.childLotIds || l.childLotIds.length === 0)
  );

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
    if (!parent) return;

    const parentWeight = parent.verifiedHubWeightKg || parent.initialFieldWeightKg;
    const totalOutput = gradeAWeight + coloredWeight + residueKg;

    if (Math.abs(totalOutput - parentWeight) > 0.5) {
      if (
        !confirm(
          `Mass balance note: Output sum (${totalOutput.toFixed(1)} kg) differs from input (${parentWeight.toFixed(
            1
          )} kg) by >0.5 kg. Proceed with documented mass discrepancy?`
        )
      ) {
        return;
      }
    }

    commitSorting(
      sortingLotId,
      [
        {
          materialGrade: 'Grade A Clear Flake Precursor (Food Grade Quality)',
          outputWeightKg: gradeAWeight,
          childLotId: `${sortingLotId}-A`,
          destinationProcessor: 'Bengal Polymers & Flake Mill'
        },
        {
          materialGrade: 'Color / Light Opaque Fraction',
          outputWeightKg: coloredWeight,
          childLotId: `${sortingLotId}-B`,
          destinationProcessor: 'National Textile Fiber Recycling'
        }
      ],
      residueKg,
      residueDesc
    );

    setSortingLotId('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Building2 className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold text-slate-800">Gulshan Aggregation Hub #3</span>
            <span aria-hidden="true">·</span>
            <span>Weighmaster: Rahmat Ali (ID #WM-44)</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-medium">Scale Calibrated 2026-10-01</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            {lang === 'en' ? 'Aggregation Intake, Scale Verification & Sorting' : 'একত্রীকরণ কেন্দ্র ও স্কেল যাচাইকরণ'}
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            PRD § 9 & Journey C: Certified reception weights without overwriting field records. Full residue accounting prevents unverified material loss.
          </p>
        </div>

        {/* Facility Spotlight Pill */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-200">
            <img
              src="/src/assets/images/facility_aggregation_hub_1791258410874.jpg"
              alt="Gulshan Hub"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="text-[11px] leading-tight pr-2">
            <span className="font-semibold text-slate-800 block">Hub Scale Station #GW-01</span>
            <span className="text-slate-500">OIML R76 Class III Certified</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('intake')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'intake'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Scale Intake ({pendingIntakeLots.length})
          </button>
          <button
            onClick={() => setActiveTab('discrepancies')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'discrepancies'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Discrepancies ({discrepantLots.length})
          </button>
          <button
            onClick={() => setActiveTab('sorting')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'sorting'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sorting & Residue ({readyToSortLots.length})
          </button>
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
                <label className="block font-medium text-slate-700 mb-1">
                  Select Incoming Batch Lot *
                </label>
                <select
                  required
                  value={selectedLotId}
                  onChange={(e) => {
                    setSelectedLotId(e.target.value);
                    const chosen = lots.find((l) => l.id === e.target.value);
                    if (chosen) setHubScaleWeight(chosen.initialFieldWeightKg);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono text-slate-900"
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
                    <label className="block font-medium text-slate-700 mb-1">
                      Certified Scale Weight (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={hubScaleWeight}
                      onChange={(e) => setHubScaleWeight(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-3 font-mono text-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Real-time Delta Indicator */}
                  {(() => {
                    const chosen = lots.find((l) => l.id === selectedLotId);
                    if (!chosen) return null;
                    const delta = hubScaleWeight - chosen.initialFieldWeightKg;
                    const deltaPct = ((delta / chosen.initialFieldWeightKg) * 100).toFixed(1);
                    const isHigh = Math.abs(parseFloat(deltaPct)) > 5.0;

                    return (
                      <div
                        className={`p-3 rounded-xl border text-xs ${
                          isHigh
                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        }`}
                      >
                        <div className="flex justify-between font-mono font-bold">
                          <span>Discrepancy Delta:</span>
                          <span>
                            {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)} kg ({deltaPct}%)
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] leading-tight">
                          {isHigh
                            ? '⚠️ Variance exceeds ±5% threshold! Will be flagged for supervisor review.'
                            : '✓ Within allowable ±5% moisture and portable scale calibration tolerance.'}
                        </p>
                      </div>
                    );
                  })()}

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Scale Calibration Log / Notes
                    </label>
                    <input
                      type="text"
                      value={scaleNotes}
                      onChange={(e) => setScaleNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                  >
                    Confirm Weight & Advance to E2
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
                        {lot.material.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{lot.initialFieldWeightKg} kg</td>
                      <td className="py-3 px-3 text-slate-900 font-bold">
                        {lot.verifiedHubWeightKg ? `${lot.verifiedHubWeightKg} kg` : '—'}
                      </td>
                      <td className="py-3 px-3 font-sans">
                        {lot.discrepancyPercentage !== undefined && Math.abs(lot.discrepancyPercentage) > 5 ? (
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
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs shadow-xs self-start sm:self-auto"
                  >
                    Resolve Discrepancy
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Discrepancy Resolution Modal */}
          {discrepancyLotId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
                <h4 className="text-base font-bold text-slate-900">Resolve Weight Discrepancy</h4>
                <p className="text-xs text-slate-500">
                  Document the physical or environmental reason for the variance on lot {discrepancyLotId}.
                </p>

                <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Resolution Reason / Audit Explanation *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={resolutionReason}
                      onChange={(e) => setResolutionReason(e.target.value)}
                      placeholder="e.g. Moisture evaporation observed in uncrushed PET bottles during warm transit; calibrated scale log GW-01 confirmed."
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setDiscrepancyLotId(null)}
                      className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold"
                    >
                      Commit Resolution to Audit Log
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
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
                <label className="block font-medium text-slate-700 mb-1">Input Lot *</label>
                <select
                  required
                  value={sortingLotId}
                  onChange={(e) => {
                    setSortingLotId(e.target.value);
                    const chosen = lots.find((l) => l.id === e.target.value);
                    if (chosen) {
                      const w = chosen.verifiedHubWeightKg || chosen.initialFieldWeightKg;
                      setGradeAWeight(Number((w * 0.8).toFixed(1)));
                      setColoredWeight(Number((w * 0.15).toFixed(1)));
                      setResidueKg(Number((w * 0.05).toFixed(1)));
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono text-slate-900"
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
                      <label className="block text-slate-600 mb-1">
                        Grade A Clear PET Precursor (kg):
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={gradeAWeight}
                        onChange={(e) => setGradeAWeight(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">
                        Colored / Mixed Plastic Fraction (kg):
                      </label>
                      <input
                        type="number"
                        step="0.1"
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
                      <label className="block text-rose-900 mb-1">Unusable Residue (kg):</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={residueKg}
                        onChange={(e) => setResidueKg(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-rose-300 rounded-lg p-2 font-mono font-bold text-rose-900"
                      />
                    </div>

                    <div>
                      <label className="block text-rose-900 mb-1">Residue Destination / RDF Note:</label>
                      <input
                        type="text"
                        value={residueDesc}
                        onChange={(e) => setResidueDesc(e.target.value)}
                        className="w-full bg-white border border-rose-300 rounded-lg p-2 text-slate-800 text-[11px]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-cyan-800 hover:bg-cyan-900 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                  >
                    Commit Transformation & Child Lots
                  </button>
                </>
              )}
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Downstream Dispatch Manifests (E3 Staging)
            </h3>
            <p className="text-xs text-slate-500">
              Sorted bales ready for licensed recyclers (Bengal Polymers, Meghna Paper, Savar Flake Line).
            </p>

            <div className="space-y-3">
              {lots
                .filter((l) => l.parentLotId)
                .map((child) => (
                  <div
                    key={child.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-slate-900">{child.id}</div>
                      <div className="text-slate-600 mt-0.5">{child.location}</div>
                      <div className="text-slate-400 text-[11px]">
                        Parent Lot: {child.parentLotId} · Certified Mass: {child.initialFieldWeightKg} kg
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <EvidenceBadge level={child.evidenceLevel} />
                      <span className="font-mono font-bold text-slate-900">
                        {child.initialFieldWeightKg} kg
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
