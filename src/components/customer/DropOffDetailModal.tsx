import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DropOffPoint, MaterialCategory } from '../../types';
import { MATERIAL_TAXONOMY } from '../../data/mockData';
import { pointsForWeight } from '../../domain/rules';
import { Modal } from '../common/Modal';
import { MapPin, Clock, Scale, CheckCircle } from 'lucide-react';

interface DropOffDetailModalProps {
  point: DropOffPoint | null;
  isOpen: boolean;
  onClose: () => void;
}

/** Deposit state lives here so it starts fresh every time the modal opens. */
const DropOffBody: React.FC<{ point: DropOffPoint; onClose: () => void }> = ({ point, onClose }) => {
  const { lang, recordDropOffDeposit } = useApp();
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialCategory>(point.acceptedMaterials[0] ?? 'PET_BOTTLES');
  const [depositWeightKg, setDepositWeightKg] = useState<string>('4.2');
  const [isDepositing, setIsDepositing] = useState(false);
  const [receipt, setReceipt] = useState<{ code: string; kg: number } | null>(null);

  const kg = parseFloat(depositWeightKg);
  const validKg = Number.isFinite(kg) && kg > 0;

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validKg) return;
    recordDropOffDeposit(point.id, selectedMaterial, kg);
    setReceipt({ code: `RECEIPT-DP-${Math.floor(100000 + Math.random() * 900000)}`, kg });
    setIsDepositing(false);
  };

  return (
    <div className="space-y-5 text-xs text-slate-600">
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
          <span className="font-semibold text-slate-800 block text-sm">{point.address}</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 text-slate-700">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
          <span>{point.operatingHours}</span>
        </div>
      </div>

      <div>
        <span className="font-semibold text-slate-800 block mb-2">{lang === 'en' ? 'Accepted materials' : 'গৃহীত উপাদান'}</span>
        <div className="grid grid-cols-2 gap-2">
          {point.acceptedMaterials.map((mat) => {
            const info = MATERIAL_TAXONOMY[mat];
            return (
              <div key={mat} className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <span className="font-bold text-slate-900 block text-[11px]">
                  {info ? (lang === 'en' ? info.name.split(' (')[0] : info.nameBn.split(' (')[0]) : mat}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium">{lang === 'en' ? 'Clean & dry required' : 'পরিষ্কার ও শুকনো হতে হবে'}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/70 rounded-xl space-y-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-emerald-950">
          <Scale className="w-4 h-4 text-emerald-700" aria-hidden="true" />
          <span>{lang === 'en' ? 'How your drop-off is confirmed' : 'আপনার জমা কীভাবে নিশ্চিত হয়'}</span>
        </div>
        <p className="text-emerald-900 leading-relaxed text-[11px]">
          {lang === 'en' ? (
            <>
              {point.receiptConfirmationMethod}. An operator weighs your deposit on a certified platform scale when you arrive. Points are credited from that
              scale weight.
            </>
          ) : (
            <>
              {point.receiptConfirmationMethod}। আপনি পৌঁছালে অপারেটর সার্টিফাইড প্ল্যাটফর্ম স্কেলে ওজন করবেন এবং সেই ওজন অনুযায়ী পয়েন্ট যোগ হবে।
            </>
          )}
        </p>
      </div>

      <div className="text-slate-500 text-[11px]">
        <strong>{lang === 'en' ? 'Access & parking: ' : 'প্রবেশ ও পার্কিং: '}</strong>
        {point.accessibilityNotes}
      </div>

      {!receipt ? (
        <div className="pt-2 border-t border-slate-200">
          {!isDepositing ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-slate-500">{lang === 'en' ? 'Demo: try a drop-off at this station' : 'ডেমো: এই স্টেশনে জমা দেওয়ার অভিজ্ঞতা দেখুন'}</span>
              <button
                type="button"
                onClick={() => setIsDepositing(true)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
              >
                {lang === 'en' ? 'Simulate deposit' : 'জমা সিমুলেট করুন'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleDepositSubmit} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="font-semibold text-slate-900">{lang === 'en' ? 'Station scale (simulated)' : 'স্টেশন স্কেল (সিমুলেটেড)'}</div>
              <div>
                <label htmlFor="dropoff-material" className="block text-slate-700 mb-1">
                  {lang === 'en' ? 'Material deposited' : 'জমা দেওয়া উপাদান'}
                </label>
                <select
                  id="dropoff-material"
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value as MaterialCategory)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                >
                  {point.acceptedMaterials.map((mat) => (
                    <option key={mat} value={mat}>
                      {mat.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="dropoff-kg" className="block text-slate-700 mb-1">
                  {lang === 'en' ? 'Scale weight (kg)' : 'স্কেলের ওজন (কেজি)'}
                </label>
                <input
                  id="dropoff-kg"
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={depositWeightKg}
                  onChange={(e) => setDepositWeightKg(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900"
                />
                {validKg && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    {lang === 'en' ? `Earns ${pointsForWeight(kg, 'dropOff')} points` : `${pointsForWeight(kg, 'dropOff')} পয়েন্ট পাবেন`}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsDepositing(false)}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-600 cursor-pointer"
                >
                  {lang === 'en' ? 'Cancel' : 'বাতিল'}
                </button>
                <button
                  type="submit"
                  disabled={!validKg}
                  className="px-4 py-1.5 bg-emerald-700 text-white rounded-lg font-semibold cursor-pointer disabled:opacity-40"
                >
                  {lang === 'en' ? 'Confirm weight & credit points' : 'ওজন নিশ্চিত করে পয়েন্ট নিন'}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2 text-emerald-900">
          <div className="flex items-center gap-2 font-bold text-emerald-950">
            <CheckCircle className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            <span>{lang === 'en' ? 'Deposit confirmed' : 'জমা নিশ্চিত হয়েছে'}</span>
          </div>
          <p className="text-[11px]">
            {lang === 'en'
              ? `Measured ${receipt.kg} kg at ${point.name}. ${pointsForWeight(receipt.kg, 'dropOff')} points are now available in your balance.`
              : `${point.nameBn}-এ ${receipt.kg} কেজি মাপা হয়েছে। ${pointsForWeight(receipt.kg, 'dropOff')} পয়েন্ট এখন আপনার ব্যালেন্সে উপলব্ধ।`}
          </p>
          <div className="font-mono text-xs font-bold bg-white p-2 rounded-lg border border-emerald-200 text-slate-900">
            {lang === 'en' ? 'Receipt code' : 'রসিদ কোড'}: {receipt.code}
          </div>
          <button type="button" onClick={onClose} className="text-xs font-bold text-emerald-900 underline cursor-pointer">
            {lang === 'en' ? 'Close' : 'বন্ধ করুন'}
          </button>
        </div>
      )}
    </div>
  );
};

export const DropOffDetailModal: React.FC<DropOffDetailModalProps> = ({ point, isOpen, onClose }) => {
  const { lang } = useApp();
  return (
    <Modal
      open={isOpen && Boolean(point)}
      onClose={onClose}
      title={point ? (lang === 'en' ? point.name : point.nameBn) : ''}
      description={point ? (lang === 'en' ? `Approved drop-off point · Operator: ${point.operatorName}` : `অনুমোদিত ড্রপ-অফ পয়েন্ট · পরিচালনায়: ${point.operatorName}`) : undefined}
      closeLabel={lang === 'en' ? 'Close' : 'বন্ধ করুন'}
    >
      {point && <DropOffBody key={point.id} point={point} onClose={onClose} />}
    </Modal>
  );
};
