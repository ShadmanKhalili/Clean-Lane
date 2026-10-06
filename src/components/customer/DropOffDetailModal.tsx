import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DropOffPoint, MaterialCategory } from '../../types';
import { MATERIAL_TAXONOMY } from '../../data/mockData';
import {
  MapPin,
  Clock,
  ShieldCheck,
  Scale,
  X,
  CheckCircle,
  QrCode,
  Info,
  Navigation
} from 'lucide-react';

interface DropOffDetailModalProps {
  point: DropOffPoint | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DropOffDetailModal: React.FC<DropOffDetailModalProps> = ({
  point,
  isOpen,
  onClose
}) => {
  const { lang, recordDropOffDeposit } = useApp();
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialCategory>('PET_BOTTLES');
  const [depositWeightKg, setDepositWeightKg] = useState<number>(4.2);
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositSuccessCode, setDepositSuccessCode] = useState<string | null>(null);

  if (!isOpen || !point) return null;

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordDropOffDeposit(point.id, selectedMaterial, depositWeightKg);
    setDepositSuccessCode(`RECEIPT-DP-${Math.floor(100000 + Math.random() * 900000)}`);
    setIsDepositing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-semibold text-emerald-800 uppercase tracking-wider block">
              APPROVED DROP-OFF POINT (PRD C17)
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              {lang === 'en' ? point.name : point.nameBn}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600">
          {/* Location & Directions */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 block text-sm">{point.address}</span>
                <span className="text-slate-500 font-mono text-[11px]">Zone ID: {point.zoneId}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 text-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{point.operatingHours}</span>
            </div>
          </div>

          {/* Accepted Materials List */}
          <div>
            <span className="font-semibold text-slate-800 block mb-2">Accepted Material Categories:</span>
            <div className="grid grid-cols-2 gap-2 font-mono">
              {point.acceptedMaterials.map((mat) => {
                const info = MATERIAL_TAXONOMY[mat];
                return (
                  <div key={mat} className="p-2.5 rounded-lg border border-slate-200 bg-white">
                    <span className="font-bold text-slate-900 block text-[11px]">
                      {info?.name.split(' ')[0] || mat}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium font-sans">
                      Clean & dry required
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Receipt Confirmation Protocol (PRD Flow C) */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/70 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-950">
              <Scale className="w-4 h-4 text-emerald-700" />
              <span>How Receipt is Confirmed (PRD C17)</span>
            </div>
            <p className="text-emerald-900 leading-relaxed text-[11px]">
              {point.receiptConfirmationMethod}. An operator uses a certified platform scale to weigh your deposit on arrival. A customer QR code simplifies your identification, but physical scale weighing is mandatory to advance material to <strong>Evidence Level E2 (Quantity Confirmed)</strong>.
            </p>
          </div>

          <div className="text-slate-500 text-[11px]">
            <strong>Accessibility & Parking: </strong>
            {point.accessibilityNotes}
          </div>

          {/* Interactive Deposit Simulation (Flow C) */}
          {!depositSuccessCode ? (
            <div className="pt-2 border-t border-slate-200">
              {!isDepositing ? (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Visiting this station now?</span>
                  <button
                    onClick={() => setIsDepositing(true)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-xs transition-colors"
                  >
                    Simulate Deposit at Station
                  </button>
                </div>
              ) : (
                <form onSubmit={handleDepositSubmit} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="font-semibold text-slate-900">Station Intake Scale Simulation</div>
                  <div>
                    <label className="block text-slate-700 mb-1">Material Deposited</label>
                    <select
                      value={selectedMaterial}
                      onChange={(e) => setSelectedMaterial(e.target.value as MaterialCategory)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                    >
                      {point.acceptedMaterials.map((mat) => (
                        <option key={mat} value={mat}>
                          {mat.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Scale Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      value={depositWeightKg}
                      onChange={(e) => setDepositWeightKg(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsDepositing(false)}
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-700 text-white rounded-lg font-semibold"
                    >
                      Confirm Scale Intake & Credit Points
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2 text-emerald-900">
              <div className="flex items-center gap-2 font-bold text-emerald-950">
                <CheckCircle className="w-5 h-5 text-emerald-700" />
                <span>Deposit Confirmed (Level E2)</span>
              </div>
              <p className="text-[11px]">
                Measured {depositWeightKg} kg at {point.name}. Scale ticket hash generated and eligible recovery points are now immediately available in your balance.
              </p>
              <div className="font-mono text-xs font-bold bg-white p-2 rounded-lg border border-emerald-200 text-slate-900">
                Receipt Code: {depositSuccessCode}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Operator: {point.operatorName}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
