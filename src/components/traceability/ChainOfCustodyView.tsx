import React, { useState } from 'react';
import { isOverTolerance } from '../../domain/rules';
import { useApp } from '../../context/AppContext';
import { EvidenceBadge } from '../common/EvidenceBadge';
import { GitBranch, ArrowRight, Search, FileText } from 'lucide-react';
import { verifyLotUrl } from '../../live/routes';

export const ChainOfCustodyView: React.FC = () => {
  const { lots, custodyEvents, sortingTransformations, processingDispositions, lang } = useApp();
  const [selectedLotId, setSelectedLotId] = useState<string>(lots[0]?.id || '');

  const [query, setQuery] = useState<string>('');
  const t = (en: string, bn: string) => (lang === 'en' ? en : bn);

  const selectedLot = lots.find((l) => l.id === selectedLotId);
  const byTime = <T extends { timestamp: string }>(a: T, b: T) => a.timestamp.localeCompare(b.timestamp);
  const relevantEvents = custodyEvents.filter((e) => e.lotId === selectedLotId).sort(byTime);
  const parentLot = selectedLot?.parentLotId ? lots.find((l) => l.id === selectedLot.parentLotId) : undefined;
  const parentEvents = parentLot ? custodyEvents.filter((e) => e.lotId === parentLot.id).sort(byTime) : [];
  const childLots = (selectedLot?.childLotIds ?? [])
    .map((id) => lots.find((l) => l.id === id))
    .filter((l): l is NonNullable<typeof l> => Boolean(l));
  const relevantSorting = sortingTransformations.filter(
    (s) => s.inputLotId === selectedLotId || s.outputs.some((o) => o.childLotId === selectedLotId)
  );
  const relevantDisposition = processingDispositions.filter((p) => p.lotId === selectedLotId);

  // Search by lot id, source booking id or source job id.
  const q = query.trim().toLowerCase();
  const matchingLots = q
    ? lots.filter(
        (l) =>
          l.id.toLowerCase().includes(q) ||
          (l.sourceBookingId ?? '').toLowerCase().includes(q) ||
          (l.sourceJobId ?? '').toLowerCase().includes(q)
      )
    : lots;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <GitBranch className="w-4 h-4 text-emerald-700" aria-hidden="true" />
          <span className="font-semibold text-slate-800">Immutable Custody Chain</span>
          <span aria-hidden="true">·</span>
          <span>Digital Traceability Ledger</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
          {lang === 'en' ? 'Material Lot Custody & Transformation Inspector' : 'ম্যাটেরিয়াল লট কাস্টডি ও রূপান্তর ট্র্যাকার'}
        </h1>
        <p className="text-xs text-slate-500 max-w-2xl">
          Every material lot preserves its physical sender, receiver, certified scale measurement, transformation splits, and cryptographic hash proof.
        </p>

        {/* Search + Lot Selector */}
        <div className="relative mt-4 max-w-md">
          <label htmlFor="lot-search" className="sr-only">{t('Search lot or booking id', 'লট বা বুকিং আইডি খুঁজুন')}</label>
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" aria-hidden="true" />
          <input
            id="lot-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && matchingLots.length > 0) {
                e.preventDefault();
                setSelectedLotId(matchingLots[0].id);
              }
            }}
            placeholder={t('Search lot, booking or job id…', 'লট, বুকিং বা জব আইডি খুঁজুন…')}
            className="w-full pl-9 pr-3 min-h-11 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {matchingLots.length === 0 && (
            <span role="status" className="text-xs text-slate-500">No lot or booking matches “{query}”.</span>
          )}
          {matchingLots.map((lot) => (
            <button
              key={lot.id}
              type="button"
              aria-pressed={selectedLotId === lot.id}
              onClick={() => setSelectedLotId(lot.id)}
              className={`px-3 min-h-11 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                selectedLotId === lot.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {lot.parentLotId ? '↳ ' : ''}{lot.id} ({lot.material.split('_')[0]})
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
                <a
                  href={verifyLotUrl(selectedLot.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center min-h-11 text-xs font-semibold text-emerald-800 underline underline-offset-2"
                >
                  {lang === 'en' ? 'Verify journey ↗' : 'যাত্রা যাচাই ↗'}
                </a>
              </div>
              <EvidenceBadge level={selectedLot.evidenceLevel} />
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Material Category:</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {selectedLot.material.replace(/_/g, ' ')}
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
                      isOverTolerance(selectedLot.discrepancyPercentage) ? 'text-amber-700' : 'text-slate-700'
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

            {(selectedLot.sourceBookingId || selectedLot.sourceJobId) && (
              <div className="text-[11px] text-slate-500 font-mono">
                {selectedLot.sourceBookingId && <div>Booking: {selectedLot.sourceBookingId}</div>}
                {selectedLot.sourceJobId && <div>Job: {selectedLot.sourceJobId}</div>}
              </div>
            )}

            {/* Lineage: parent -> this lot -> child lots */}
            {(parentLot || selectedLot.parentLotId || childLots.length > 0) && (
              <div className="p-3 bg-cyan-50 border border-cyan-100 rounded-xl text-xs text-cyan-950 space-y-2">
                <strong className="block">Sorting lineage</strong>
                {selectedLot.parentLotId && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-cyan-800">Parent:</span>
                    <button
                      type="button"
                      onClick={() => setSelectedLotId(selectedLot.parentLotId!)}
                      className="font-mono underline min-h-11 px-1 cursor-pointer"
                    >
                      {selectedLot.parentLotId}
                    </button>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="font-mono font-bold">{selectedLot.id}</span>
                  </div>
                )}
                {childLots.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-cyan-800 block">Sorted into {childLots.length} child lot(s):</span>
                    {childLots.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedLotId(c.id)}
                        className="w-full flex items-center justify-between gap-2 font-mono min-h-11 px-2 rounded-lg bg-white/60 hover:bg-white cursor-pointer text-left"
                      >
                        <span className="underline break-all">{c.id}</span>
                        <span>{c.initialFieldWeightKg} kg · {c.evidenceLevel}</span>
                      </button>
                    ))}
                    {selectedLot.sortingLossResidueKg !== undefined && (
                      <div className="text-rose-800">Residue accounted: {selectedLot.sortingLossResidueKg} kg</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Custody Timeline & Handovers */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900">
              Chain of Custody Events & Physical Transfers
            </h3>

            {parentEvents.length > 0 && (
              <div className="p-3 rounded-xl border border-dashed border-cyan-300 bg-cyan-50/40 text-xs space-y-1">
                <strong className="text-cyan-950">Inherited from parent lot {parentLot?.id}</strong>
                <ul className="space-y-1 text-slate-600">
                  {parentEvents.map((evt) => (
                    <li key={evt.id} className="font-mono text-[11px]">
                      {evt.timestamp.replace('T', ' ').slice(0, 16)} · {evt.sender} → {evt.receiver} · {evt.quantityKg} kg · {evt.evidenceLevelResult}
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
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

                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 pt-1 text-[10px] text-slate-400 font-mono break-all">
                      <span>Hash: {evt.signatureOrHash}</span>
                      <span>{evt.timestamp.replace('T', ' ').slice(0, 19)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* E4 processing disposition */}
            {relevantDisposition.length > 0 && (
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Processing Outcome (E4)</h4>
                {relevantDisposition.map((d) => (
                  <div key={d.id} className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl text-xs space-y-1">
                    <div className="flex items-center gap-2 font-mono font-bold text-slate-900">
                      <FileText className="w-4 h-4 text-indigo-700" aria-hidden="true" /> {d.dispositionCertificateId}
                    </div>
                    <div className="text-slate-600">{d.processorName} · {d.processType.replace(/_/g, ' ')}</div>
                    <div className="font-mono text-slate-700">
                      Yield {d.outputYieldKg} kg · Loss {d.processLossKg} kg · {d.completedAt.slice(0, 10)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sorting transformation info if exists */}
            {relevantSorting.length > 0 && (
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Documented sorting splits
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
