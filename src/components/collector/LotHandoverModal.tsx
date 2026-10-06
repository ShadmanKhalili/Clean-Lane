import React, { useState } from 'react';
import { MaterialLot } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  QrCode,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Building,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  RefreshCw
} from 'lucide-react';

interface LotHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  lot: MaterialLot | null;
}

export const LotHandoverModal: React.FC<LotHandoverModalProps> = ({
  isOpen,
  onClose,
  lot
}) => {
  const { lang, verifyHubScaleWeight, showToast } = useApp();

  const [hubScaleWeight, setHubScaleWeight] = useState<number>(lot?.initialFieldWeightKg || 8.0);
  const [notes, setNotes] = useState<string>('Platform scale calibrated tare weight verified.');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !lot) return null;

  const fieldWeight = lot.initialFieldWeightKg || 0;
  const deltaKg = hubScaleWeight - fieldWeight;
  const deltaPct = fieldWeight > 0 ? (deltaKg / fieldWeight) * 100 : 0;
  const isHighDiscrepancy = Math.abs(deltaPct) > 5;

  const handleSubmitHandover = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    verifyHubScaleWeight(lot.id, hubScaleWeight, notes);
    showToast(`Lot ${lot.id} successfully handed over & scale verified at ${hubScaleWeight} kg!`);

    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-[#202B38]">
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#25345C] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#C9F1DC] text-[#12613F] flex items-center justify-center font-bold shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C9F1DC]">
                HUB CUSTODY TRANSFER (O06)
              </span>
              <h3 className="text-base font-bold text-white">Waste Lot Handover</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmitHandover} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Lot Summary Card */}
          <div className="p-4 bg-[#FFF9F0] border border-[#EDE4D8] rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-sm text-[#25345C]">{lot.id}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                {lot.currentCustodian}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1 border-t border-[#EDE4D8]">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Material Stream</span>
                <strong className="text-slate-800 text-xs">{lot.material.replace(/_/g, ' ')}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Field Net Weight</span>
                <strong className="text-slate-800 text-xs">{lot.initialFieldWeightKg} kg</strong>
              </div>
            </div>
          </div>

          {/* Receiving Hub Station */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-[#25345C]" />
              <div>
                <span className="font-bold text-slate-900 block text-xs">Gulshan Aggregation Hub #3</span>
                <span className="text-[11px] text-slate-500">Certified Platform Weighmaster GW-01</span>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
              E2 Evidence
            </span>
          </div>

          {/* Scale Verification Input */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-[#25345C]" />
                <span>Certified Hub Platform Scale Weight (kg) *</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">Tare Deducted</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="5000"
              value={hubScaleWeight}
              onChange={(e) => setHubScaleWeight(parseFloat(e.target.value) || 0)}
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-base font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#25345C]"
              required
            />
          </div>

          {/* Weight Discrepancy Indicator */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
              isHighDiscrepancy
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="flex items-center gap-2">
              {isHighDiscrepancy ? (
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              )}
              <div>
                <span className="font-bold block">
                  Delta: {deltaKg > 0 ? `+${deltaKg.toFixed(1)}` : deltaKg.toFixed(1)} kg ({deltaPct.toFixed(1)}%)
                </span>
                <span className="text-[11px] text-slate-600">
                  {isHighDiscrepancy
                    ? 'Discrepancy exceeds 5% tolerance threshold. Audit flag will be attached.'
                    : 'Within acceptable ±5% tare/gross tolerance standard.'}
                </span>
              </div>
            </div>
          </div>

          {/* Handover Notes */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Weighmaster & Custody Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
              placeholder="Record scale certification number, moisture condition or lot tags..."
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#C9F1DC]" />
                  <span>Confirm Hub Handover</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
