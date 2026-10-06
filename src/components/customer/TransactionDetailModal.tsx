import React from 'react';
import { Booking } from '../../types';
import { useApp } from '../../context/AppContext';
import { EvidenceBadge } from '../common/EvidenceBadge';
import { StatusTracker } from '../common/StatusTracker';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Scale,
  DollarSign,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface TransactionDetailModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onReportIssue: (bookingId: string) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  booking,
  isOpen,
  onClose,
  onReportIssue
}) => {
  const { lang } = useApp();

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-900 text-sm">{booking.id}</span>
              <EvidenceBadge level={booking.evidenceLevel} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {booking.scheduledDate} · {booking.scheduledTimeWindow}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content (Wireframe C13) */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600">
          {/* Recovery Progress Stepper */}
          <div>
            <span className="font-semibold text-slate-800 uppercase text-[10px] tracking-wider block mb-2">
              Recovery Progress (PRD § 9.3)
            </span>
            <StatusTracker currentLevel={booking.evidenceLevel} notes={booking.notes} />
          </div>

          {/* 1. Service Outcome */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block text-xs">1. Service Outcome</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block">Status:</span>
                <span className="font-semibold text-slate-800">{booking.status.replace(/_/g, ' ')}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Assigned Collector:</span>
                <span className="font-medium text-slate-800">{booking.collectorName || 'Scheduled route'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block">Location:</span>
                <span className="font-medium text-slate-800 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {booking.address}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Material Record */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block text-xs">2. Material Record</span>
            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Requested Categories:</span>
                <span className="text-slate-800 font-semibold">
                  {booking.materials.map((m) => m.category.replace('_', ' ')).join(', ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pickup Basis (Field E1):</span>
                <span className="text-slate-900 font-bold">
                  {booking.fieldWeightKg ? `${booking.fieldWeightKg} kg (Portable scale)` : 'Pending collection'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Confirmed Weight (Hub E2):</span>
                <span className="text-emerald-800 font-bold">
                  {booking.confirmedWeightKg ? `${booking.confirmedWeightKg} kg (Platform scale)` : 'Awaiting hub scale verification'}
                </span>
              </div>
              {booking.discrepancyFlag && (
                <div className="p-2.5 bg-amber-50 rounded-lg text-amber-900 text-[11px] font-sans border border-amber-200">
                  ⚠️ Scale discrepancy flagged between doorstep and certified hub platform scale. Reviewed under moisture loss policy.
                </div>
              )}
            </div>
          </div>

          {/* 3. Financial Record (PRD § 12 Distinct Ledgers) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block text-xs">3. Financial Record & Rewards Ledger</span>
            <div className="grid grid-cols-3 gap-2 font-mono">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-sans">SERVICE FEE</span>
                <span className="font-bold text-slate-900">৳{booking.serviceFeeBdt}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-sans">MATERIAL BUYOUT</span>
                <span className="font-bold text-emerald-800">
                  {booking.materialPayoutBdt ? `৳${booking.materialPayoutBdt}` : '৳0'}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-sans">POINTS STATUS</span>
                <span className={`font-bold ${booking.pointsStatus === 'available' ? 'text-emerald-800' : 'text-amber-700'}`}>
                  {booking.earnedPoints} pts ({booking.pointsStatus})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              onReportIssue(booking.id);
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs text-rose-700 hover:text-rose-800 font-semibold cursor-pointer"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Report an issue (PRD C18)</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
