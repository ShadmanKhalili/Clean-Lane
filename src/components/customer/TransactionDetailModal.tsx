import React, { useState } from 'react';
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
  ArrowRight,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Coins,
  Truck,
  Building
} from 'lucide-react';
import { BOOKING_CUSTOMER_STATUS_MAP, getCustomerStatusLabel } from '../../utils/statusDictionary';

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
  const { lang, custodyEvents } = useApp();
  const [showAdvancedDepth, setShowAdvancedDepth] = useState(false);

  if (!isOpen || !booking) return null;

  const statusInfo = BOOKING_CUSTOMER_STATUS_MAP[booking.status] || {
    customerLabelEn: booking.status,
    customerLabelBn: booking.status,
    whatHappenedEn: 'Service event recorded.',
    whatHappenedBn: 'সেবা কার্যক্রম নথিভুক্ত হয়েছে।',
    whatHappensNextEn: 'Next milestone pending.',
    whatHappensNextBn: 'পরবর্তী ধাপ অপেক্ষমান।'
  };

  const linkedCustodyEvents = custodyEvents.filter((e) => e.lotId.includes(booking.id.slice(-4)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[94vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-900 text-sm">{booking.id}</span>
              <EvidenceBadge level={booking.evidenceLevel} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {booking.scheduledDate} · {booking.scheduledTimeWindow}
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-600 flex-1">
          {/* Recovery Milestone Tracker */}
          <div>
            <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block mb-2 font-mono">
              {lang === 'en' ? 'Collection & Recovery Progress' : 'সংগ্রহ ও প্রক্রিয়াকরণ অগ্রগতি'}
            </span>
            <StatusTracker currentLevel={booking.evidenceLevel} notes={booking.notes} />
          </div>

          {/* 1. Default Layer: Collection Outcome & Plain-Language Status */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-900 text-xs block">
              {lang === 'en' ? '1. Collection Outcome' : '১. সংগ্রহের ফলাফল'}
            </span>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{lang === 'en' ? 'Status:' : 'বর্তমান অবস্থা:'}</span>
                <span className="font-bold text-slate-900 text-sm">
                  {getCustomerStatusLabel(booking.status, lang)}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 leading-relaxed text-[11px] space-y-1">
                <p>
                  <strong>{lang === 'en' ? 'What happened:' : 'যা ঘটেছে:'}</strong>{' '}
                  {lang === 'bn' ? statusInfo.whatHappenedBn : statusInfo.whatHappenedEn}
                </p>
                <p className="text-slate-500">
                  <strong>{lang === 'en' ? 'What happens next:' : 'পরবর্তী পদক্ষেপ:'}</strong>{' '}
                  {lang === 'bn' ? statusInfo.whatHappensNextBn : statusInfo.whatHappensNextEn}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Confirmed Quantity & Points Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 font-mono">
            <span className="font-bold text-slate-900 text-xs font-sans block">
              {lang === 'en' ? '2. Measured Weight & Points' : '২. পরিমাপকৃত ওজন ও পয়েন্ট'}
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="font-sans text-[10px] text-slate-500 block mb-0.5">
                  {lang === 'en' ? 'CONFIRMED WEIGHT' : 'নিশ্চিত ওজন'}
                </span>
                <span className="text-lg font-bold text-slate-900 block">
                  {booking.confirmedWeightKg
                    ? `${booking.confirmedWeightKg} kg`
                    : booking.fieldWeightKg
                    ? `${booking.fieldWeightKg} kg (Field)`
                    : lang === 'en' ? 'Pending intake' : 'যাচাই বাকি'}
                </span>
                <span className="font-sans text-[10px] text-slate-400 block mt-0.5">
                  {booking.confirmedWeightKg
                    ? 'Certified platform scale (E2)'
                    : 'Portable collector scale'}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="font-sans text-[10px] text-emerald-800 block mb-0.5">
                  {lang === 'en' ? 'REWARD POINTS' : 'রিওয়ার্ড পয়েন্ট'}
                </span>
                <span className="text-lg font-bold text-emerald-950 block">
                  +{booking.earnedPoints || 0} pts
                </span>
                <span className="font-sans text-[10px] text-slate-500 block mt-0.5">
                  Status:{' '}
                  <strong className="text-emerald-800 uppercase font-sans">
                    {booking.pointsStatus}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Progressive Disclosure Action: "See transaction details" */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvancedDepth(!showAdvancedDepth)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors"
            >
              <span>
                {showAdvancedDepth
                  ? lang === 'en' ? 'Hide technical measurements & history' : 'বিস্তারিত লুকান'
                  : lang === 'en' ? 'See detailed measurements, custody & audit history' : 'বিস্তারিত পরিমাপ ও চেইন অব কাস্টডি দেখুন'}
              </span>
              {showAdvancedDepth ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
          </div>

          {/* ===================================================================== */}
          {/* ADVANCED DEPTH (Progressive disclosure for power users & audits) */}
          {/* ===================================================================== */}
          {showAdvancedDepth && (
            <div className="space-y-4 pt-2 border-t border-slate-200 animate-fade-in font-mono text-xs">
              {/* Material Categories breakdown */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 font-sans block text-[11px]">
                  STREAM ALLOCATION & DISPOSITION
                </span>
                <div className="space-y-1.5 text-slate-700">
                  {booking.materials.map((m) => (
                    <div key={m.category} className="flex justify-between items-center text-[11px]">
                      <span>{m.category.replace(/_/g, ' ')}</span>
                      <span className="font-bold text-slate-900">
                        {booking.confirmedWeightKg
                          ? `${(booking.confirmedWeightKg / booking.materials.length).toFixed(1)} kg allocated`
                          : m.approximateBandKg}
                      </span>
                    </div>
                  ))}
                  <p className="font-sans text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                    PRD § C13 Rule: If material streams were weighed in mixed tare before segregation, weights reflect batch balance. No false precision is inferred.
                  </p>
                </div>
              </div>

              {/* Financial Ledger */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-900 font-sans block text-[11px]">
                  FINANCIAL TRANSFERS
                </span>
                <div className="flex justify-between text-slate-700 text-[11px]">
                  <span>Service Fee Charged:</span>
                  <span className="font-bold text-slate-900">৳{booking.serviceFeeBdt || 0}</span>
                </div>
                <div className="flex justify-between text-slate-700 text-[11px]">
                  <span>Material Value Credited:</span>
                  <span className="font-bold text-emerald-800">
                    {booking.materialPayoutBdt ? `৳${booking.materialPayoutBdt}` : 'Pending settlement'}
                  </span>
                </div>
              </div>

              {/* Custody events */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 font-sans block text-[11px]">
                  CHAIN OF CUSTODY TIMELINE
                </span>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-[11px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5" />
                    <div>
                      <span className="font-bold text-slate-900">E0: Pickup Requested</span>
                      <span className="text-slate-400 block text-[10px]">{booking.createdAt}</span>
                    </div>
                  </div>
                  {booking.fieldWeightKg && (
                    <div className="flex items-start gap-2 text-[11px]">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5" />
                      <div>
                        <span className="font-bold text-slate-900">E1: Field Collection Logged</span>
                        <span className="text-slate-600 block text-[10px]">
                          Collector: {booking.collectorName || 'Tariq Hossain'} · {booking.fieldWeightKg} kg
                        </span>
                      </div>
                    </div>
                  )}
                  {booking.confirmedWeightKg && (
                    <div className="flex items-start gap-2 text-[11px]">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5" />
                      <div>
                        <span className="font-bold text-slate-900">E2: Hub Scale Verified</span>
                        <span className="text-slate-600 block text-[10px]">
                          Gulshan Hub Scale #2 · {booking.confirmedWeightKg} kg platform weight
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM ACTION BAR (C13 Primary Action: "Get help with this collection") */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              onReportIssue(booking.id);
            }}
            className="min-h-[48px] px-5 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
          >
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>{lang === 'en' ? 'Get help with this collection' : 'এই সংগ্রহ নিয়ে সহায়তা নিন'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs sm:text-sm font-bold cursor-pointer transition-all"
          >
            {lang === 'en' ? 'Close' : 'বন্ধ করুন'}
          </button>
        </div>
      </div>
    </div>
  );
};
