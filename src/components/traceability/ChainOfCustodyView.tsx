import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EvidenceBadge } from '../common/EvidenceBadge';
import { ShieldCheck, GitBranch, Scale, Truck, ArrowRight, Hash, Clock, MapPin } from 'lucide-react';

export const ChainOfCustodyView: React.FC = () => {
  const { lots, custodyEvents, sortingTransformations, processingDispositions, lang } = useApp();
  const [selectedLotId, setSelectedLotId] = useState<string>(lots[0]?.id || '');

  const selectedLot = lots.find((l) => l.id === selectedLotId);
  const relevantEvents = custodyEvents.filter((e) => e.lotId === selectedLotId);
  const relevantSorting = sortingTransformations.filter((s) => s.inputLotId === selectedLotId);
  const relevantDisposition = processingDispositions.filter((p) => p.lotId === selectedLotId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <GitBranch className="w-4 h-4 text-emerald-700" />
          <span className="font-semibold text-slate-800">Immutable Custody Chain</span>
          <span aria-hidden="true">·</span>
          <span>Digital Traceability Ledger</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
          {lang === 'en' ? 'Material Lot Custody & Transformation Inspector' : 'ম্যাটেরিয়াল লট কাস্টডি ও রূপান্তর ট্র্যাকার'}
        </h1>
        <p className="text-xs text-slate-500 max-w-2xl">
          PRD § 9.2: Every material lot preserves its physical sender, receiver, certified scale measurement, transformation splits, and cryptographic hash proof.
        </p>

        {/* Lot Selector */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
          {lots.map((lot) => (
            <button
              key={lot.id}
              onClick={() => setSelectedLotId(lot.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors whitespace-nowrap ${
                selectedLotId === lot.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {lot.id} ({lot.material.split('_')[0]})
            </button>
          ))}
        </div>
      </div>

      {selectedLot && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lot Profile Card */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  ACTIVE LOT IDENTIFIER
                </span>
                <h3 className="text-lg font-bold font-mono text-slate-900">{selectedLot.id}</h3>
              </div>
              <EvidenceBadge level={selectedLot.evidenceLevel} />
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Material Category:</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {selectedLot.material.replace('_', ' ')}
                </span>
              </div>
              <div className="pt-2 flex justify-between font-mono">
                <span className="text-slate-500">Field Weight (E1):</span>
                <span className="font-bold text-slate-900">{selectedLot.initialFieldWeightKg} kg</span>
              </div>
              <div className="pt-2 flex justify-between font-mono">
                <span className="text-slate-500">Certified Hub Scale (E2):</span>
                <span className="font-bold text-emerald-800">
                  {selectedLot.verifiedHubWeightKg ? `${selectedLot.verifiedHubWeightKg} kg` : 'Pending E2'}
                </span>
              </div>
              {selectedLot.discrepancyPercentage !== undefined && (
                <div className="pt-2 flex justify-between font-mono">
                  <span className="text-slate-500">Scale Variance Delta:</span>
                  <span
                    className={`font-bold ${
                      Math.abs(selectedLot.discrepancyPercentage) > 5 ? 'text-amber-700' : 'text-slate-700'
                    }`}
                  >
                    {selectedLot.discrepancyPercentage}%
                  </span>
                </div>
              )}
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Current Custodian:</span>
                <span className="font-medium text-slate-800">{selectedLot.currentCustodian}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Physical Location:</span>
                <span className="font-medium text-slate-800 text-right truncate max-w-[180px]">
                  {selectedLot.location}
                </span>
              </div>
            </div>

            {selectedLot.parentLotId && (
              <div className="p-3 bg-cyan-50 border border-cyan-100 rounded-xl text-xs text-cyan-950">
                <strong>Parent Lot Link: </strong>
                <span className="font-mono">{selectedLot.parentLotId}</span>
              </div>
            )}
          </div>

          {/* Custody Timeline & Handovers */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900">
              Chain of Custody Events & Physical Transfers
            </h3>

            <div className="space-y-4">
              {relevantEvents.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl text-xs text-slate-500">
                  Initial field batch creation recorded. Awaiting platform scale intake event.
                </div>
              ) : (
                relevantEvents.map((evt, idx) => (
                  <div
                    key={evt.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-mono font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-900">{evt.sender}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-slate-900">{evt.receiver}</span>
                      </div>
                      <EvidenceBadge level={evt.evidenceLevelResult} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 font-mono text-[11px] pt-1 border-t border-slate-200/60">
                      <div>
                        Quantity: <strong className="text-slate-900">{evt.quantityKg} kg</strong>
                      </div>
                      <div>
                        Location: <span className="font-sans">{evt.location}</span>
                      </div>
                      <div className="sm:col-span-2">
                        Method: <span className="font-sans">{evt.measurementMethod}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-mono">
                      <span>Hash: {evt.signatureOrHash}</span>
                      <span>{evt.timestamp.replace('T', ' ').slice(0, 19)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sorting transformation info if exists */}
            {relevantSorting.length > 0 && (
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Documented Sorting Splits (PRD § T-04)
                </h4>
                {relevantSorting.map((sort) => (
                  <div key={sort.id} className="p-4 bg-cyan-50/40 border border-cyan-100 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between font-mono">
                      <span className="font-bold text-slate-900">Transformation #{sort.id}</span>
                      <span>Gross Input: {sort.inputWeightKg} kg</span>
                    </div>
                    <div className="space-y-1">
                      {sort.outputs.map((out, i) => (
                        <div key={i} className="flex justify-between text-slate-700">
                          <span>• {out.materialGrade}</span>
                          <span className="font-mono font-bold">{out.outputWeightKg} kg ({out.childLotId})</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-1 text-[11px] text-rose-800">
                      <strong>Residue Accounted: </strong> {sort.residueContaminationKg} kg ({sort.residueDisposition})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
