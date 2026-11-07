import React, { useEffect, useState } from 'react';
import { assessScaleReading, SCALE_TOLERANCE_PERCENT } from '../../domain/rules';
import { canHandOverToHub } from '../../domain/lots';
import { MaterialLot } from '../../types';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { QrCode, Scale, CheckCircle2, AlertTriangle, Building, ShieldCheck } from 'lucide-react';

interface LotHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  lot: MaterialLot | null;
}

export const LotHandoverModal: React.FC<LotHandoverModalProps> = ({ isOpen, onClose, lot }) => {
  const { lang, verifyHubScaleWeight } = useApp();
  const t = (en: string, bn: string) => (lang === 'en' ? en : bn);

  const [hubScaleWeight, setHubScaleWeight] = useState<number>(0);
  const [notes, setNotes] = useState<string>('Platform scale calibrated tare weight verified.');

  // Re-initialise whenever a different lot is opened (the lot is null on first render).
  useEffect(() => {
    if (lot) setHubScaleWeight(lot.initialFieldWeightKg);
  }, [lot?.id, isOpen]);

  if (!lot) return null;

  const eligible = canHandOverToHub(lot);
  const { deltaKg, deltaPercent, isDiscrepant } = assessScaleReading(lot.initialFieldWeightKg || 0, hubScaleWeight);

  const handleSubmitHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eligible || !(hubScaleWeight > 0)) return;
    verifyHubScaleWeight(lot.id, hubScaleWeight, notes);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="md"
      title={t('Lot handover to hub', 'হাবে লট হস্তান্তর')}
      description={t('Hand the bag to the hub and record the certified scale reading', 'ব্যাগ হাবে দিন এবং সনদপ্রাপ্ত স্কেলের ওজন লিখুন')}
    >
      <form onSubmit={handleSubmitHandover} className="space-y-4 text-xs" id="lot-handover-form">
        <div className="p-4 bg-[#FFF9F0] border border-[#EDE4D8] rounded-2xl space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono font-bold text-sm text-[#25345C] flex items-center gap-1.5">
              <QrCode className="w-4 h-4" aria-hidden="true" /> {lot.id}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              {lot.currentCustodian}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1 border-t border-[#EDE4D8]">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">{t('Material Stream', 'উপাদান')}</span>
              <strong className="text-slate-800 text-xs">{lot.material.replace(/_/g, ' ')}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">{t('Field Net Weight', 'মাঠ পর্যায়ে ওজন')}</span>
              <strong className="text-slate-800 text-xs">{lot.initialFieldWeightKg} kg</strong>
            </div>
          </div>
        </div>

        {!eligible && (
          <div role="alert" className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 font-semibold">
            {t(
              'This lot is no longer in collector custody, so it cannot be handed over again.',
              'এই লটটি আর সংগ্রাহকের হেফাজতে নেই, তাই আবার হস্তান্তর করা যাবে না।'
            )}
          </div>
        )}

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-[#25345C]" aria-hidden="true" />
            <div>
              <span className="font-bold text-slate-900 block text-xs">Gulshan Aggregation Hub #3</span>
              <span className="text-[11px] text-slate-500">Certified Platform Weighmaster GW-01</span>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold shrink-0">
            E2
          </span>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="hub-scale-weight" className="font-bold text-slate-900 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-[#25345C]" aria-hidden="true" />
              <span>{t('Certified Hub Platform Scale Weight (kg) *', 'হাব স্কেলের ওজন (কেজি) *')}</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">Tare Deducted</span>
          </label>
          <input
            id="hub-scale-weight"
            type="number"
            step="0.1"
            min="0.1"
            max="5000"
            value={hubScaleWeight}
            onChange={(e) => setHubScaleWeight(parseFloat(e.target.value) || 0)}
            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-base font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#25345C] min-h-11"
            required
          />
        </div>

        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs ${
            isDiscrepant ? 'bg-amber-50 border-amber-300 text-amber-950' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}
        >
          {isDiscrepant ? (
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
          )}
          <div>
            <span className="font-bold block">
              Delta: {deltaKg > 0 ? `+${deltaKg.toFixed(1)}` : deltaKg.toFixed(1)} kg ({deltaPercent.toFixed(1)}%)
            </span>
            <span className="text-[11px] text-slate-600">
              {isDiscrepant
                ? t(
                    `Exceeds the ±${SCALE_TOLERANCE_PERCENT}% tolerance. An audit flag will be attached.`,
                    `±${SCALE_TOLERANCE_PERCENT}% সহনশীলতা ছাড়িয়েছে। অডিট ফ্ল্যাগ যুক্ত হবে।`
                  )
                : t(`Within the ±${SCALE_TOLERANCE_PERCENT}% tare/gross tolerance.`, `±${SCALE_TOLERANCE_PERCENT}% সহনশীলতার মধ্যে।`)}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="handover-notes" className="font-bold text-slate-700 block">
            {t('Weighmaster & Custody Notes', 'ওজনকারীর নোট')}
          </label>
          <textarea
            id="handover-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
            placeholder="Record scale certification number, moisture condition or lot tags..."
          />
        </div>

        <div className="pt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-11 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
          >
            {t('Cancel', 'বাতিল')}
          </button>
          <button
            type="submit"
            disabled={!eligible || !(hubScaleWeight > 0)}
            className="flex-1 min-h-11 bg-[#25345C] hover:bg-[#1B2644] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 text-[#C9F1DC]" aria-hidden="true" />
            <span>{t('Confirm Hub Handover', 'হাব হস্তান্তর নিশ্চিত করুন')}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
