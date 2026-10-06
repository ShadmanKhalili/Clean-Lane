import React, { useState } from 'react';
import { Booking } from '../../types';
import { useApp } from '../../context/AppContext';
import { EvidenceBadge } from '../common/EvidenceBadge';
import {
  X,
  CheckCircle2,
  Clock,
  MapPin,
  Scale,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Truck,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { BrandJourneyDevice } from '../common/BrandJourneyDevice';

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
  const [showFullJourney, setShowFullJourney] = useState(false);

  if (!isOpen || !booking) return null;

  const isCollected =
    booking.status === 'COLLECTED' ||
    booking.status === 'QUANTITY_CONFIRMED' ||
    booking.status === 'QUANTITY_UNDER_REVIEW' ||
    booking.status === 'ENTERED_RECOVERY_CHAIN' ||
    booking.status === 'PROCESSED';

  const isQuantityConfirmed =
    booking.status === 'QUANTITY_CONFIRMED' ||
    booking.status === 'ENTERED_RECOVERY_CHAIN' ||
    booking.status === 'PROCESSED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[94vh] flex flex-col border border-[#EDE4D8] overflow-hidden text-[#202B38]">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-[#EDE4D8] bg-[#FFF9F0] flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-mono text-[#53616D] uppercase block">
              {lang === 'en' ? `Reference: ${booking.id}` : `বুকিং আইডি: ${booking.id}`}
            </span>
            <h3 className="text-base font-bold text-[#25345C]">
              {lang === 'en' ? 'Your Collection Status' : 'বর্জ্য সংগ্রহের সার্বিক অগ্রগতি'}
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#53616D] hover:text-[#202B38] hover:bg-[#EDE4D8] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (R07: One answer, then detail) */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#202B38] flex-1">
          {/* Main Plain-Language Status Card */}
          <div className="p-5 bg-[#FFF9F0] rounded-3xl border border-[#EDE4D8] text-center space-y-2">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                isQuantityConfirmed
                  ? 'bg-[#C9F1DC] text-[#12613F]'
                  : isCollected
                  ? 'bg-[#25345C] text-white'
                  : 'bg-[#FFF9F0] border-2 border-[#25345C] text-[#25345C]'
              }`}
            >
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#53616D] block">
                {isQuantityConfirmed
                  ? lang === 'en'
                    ? 'QUANTITY CONFIRMED ✓'
                    : 'পরিমাণ নিশ্চিত করা হয়েছে ✓'
                  : isCollected
                  ? lang === 'en'
                    ? 'COLLECTED ✓'
                    : 'সংগ্রহ সম্পন্ন ✓'
                  : lang === 'en'
                  ? 'PICKUP REQUESTED'
                  : 'পিকআপের অনুরোধ করা হয়েছে'}
              </span>
              <h4 className="text-lg font-bold text-[#202B38] mt-0.5">
                {isQuantityConfirmed
                  ? lang === 'en'
                    ? `${booking.confirmedWeightKg || 6.5} kg verified at scale`
                    : `${booking.confirmedWeightKg || 6.5} কেজি স্কেলে যাচাইকৃত`
                  : isCollected
                  ? lang === 'en'
                    ? 'Your materials were picked up today'
                    : 'আপনার বর্জ্য সংগ্রহ করা হয়েছে'
                  : lang === 'en'
                  ? `Booked for ${booking.scheduledDate}`
                  : `${booking.scheduledDate} তারিখের জন্য বুকিং`}
              </h4>
              <p className="text-xs text-[#53616D] max-w-xs mx-auto mt-1">
                {isQuantityConfirmed
                  ? lang === 'en'
                    ? 'Points unlocked in your available balance. Ready to spend in Rewards store.'
                    : 'পয়েন্ট আপনার অ্যাকাউন্টে যোগ করা হয়েছে। রিওয়ার্ড ভাউচারে ব্যয় করতে পারেন।'
                  : isCollected
                  ? lang === 'en'
                    ? 'Next: We are checking the quantity on the digital platform scale at the hub.'
                    : 'পরবর্তী ধাপ: হাবে ডিজিটাল প্ল্যাটফর্ম স্কেলে চূড়ান্ত ওজন যাচাই করা হচ্ছে।'
                  : lang === 'en'
                  ? 'Next: Collector assigned before your pickup window.'
                  : 'পরবর্তী ধাপ: সংগ্রহের সময়ের আগে কালেক্টর নিযুক্ত করা হবে।'}
              </p>
            </div>
          </div>

          {/* 3-Part Journey Sequence */}
          <BrandJourneyDevice
            currentStep={isQuantityConfirmed ? 3 : isCollected ? 2 : 1}
            size="compact"
          />

          {/* Core Simple Summary */}
          <div className="p-4 bg-white rounded-2xl border border-[#EDE4D8] space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#53616D]">{lang === 'en' ? 'Materials:' : 'উপাদান:'}</span>
              <span className="font-bold text-[#202B38]">
                {booking.materials.map((m) => m.category.replace(/_/g, ' ')).join(', ')}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1.5 border-t border-[#EDE4D8]">
              <span className="text-[#53616D]">{lang === 'en' ? 'Address:' : 'ঠিকানা:'}</span>
              <span className="font-medium text-[#202B38]">{booking.address.split(',')[0]}</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1.5 border-t border-[#EDE4D8]">
              <span className="text-[#53616D]">{lang === 'en' ? 'Points Status:' : 'পয়েন্ট স্থিতি:'}</span>
              <span className="font-bold font-mono text-[#7A4D00]">
                {isQuantityConfirmed
                  ? lang === 'en'
                    ? `+${booking.earnedPoints || 325} pts Available`
                    : `+${booking.earnedPoints || 325} পয়েন্ট উপলব্ধ`
                  : lang === 'en'
                  ? `~${booking.earnedPoints || 325} pts Being Checked`
                  : `~${booking.earnedPoints || 325} পয়েন্ট যাচাইাধীন`}
              </span>
            </div>
          </div>

          {/* Progressive Disclosure: "See full journey v" */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowFullJourney(!showFullJourney)}
              className="w-full py-2.5 px-3.5 rounded-2xl border border-[#EDE4D8] hover:bg-[#FFF9F0] text-[#25345C] font-bold text-xs flex items-center justify-between cursor-pointer transition-colors"
            >
              <span>
                {showFullJourney
                  ? lang === 'en'
                    ? 'Hide full journey & audit logs'
                    : 'কাস্টডি জার্নি ও অডিট লগ লুকান'
                  : lang === 'en'
                  ? 'See full journey & scale proof ▾'
                  : 'সম্পূর্ণ কাস্টডি জার্নি ও স্কেল প্রমাণ দেখুন ▾'}
              </span>
              {showFullJourney ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Expanded Full Journey (E0-E5 technical depth) */}
          {showFullJourney && (
            <div className="p-4 bg-[#FFF9F0] rounded-2xl border border-[#EDE4D8] space-y-3 font-mono text-xs animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold font-sans text-[#202B38]">
                  {lang === 'en' ? 'TRACEABILITY LEDGER' : 'ট্রেসেবিলিটি লেজার'}
                </span>
                <EvidenceBadge level={booking.evidenceLevel} />
              </div>

              <div className="space-y-2 text-[#53616D]">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#25345C] mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold text-[#202B38] block font-sans">
                      {lang === 'en' ? 'E0: Pickup Booked' : 'E0: পিকআপ অনুরোধ করা হয়েছে'}
                    </span>
                    <span className="text-[10px]">{booking.createdAt}</span>
                  </div>
                </div>

                {isCollected && (
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#25345C] mt-1.5 shrink-0" />
                    <div>
                      <span className="font-bold text-[#202B38] block font-sans">
                        {lang === 'en'
                          ? `E1: Collected by ${booking.collectorName || 'Tariq Hossain'}`
                          : `E1: কালেক্টর ${booking.collectorName || 'তারিক হোসেন'} সংগ্রহ করেছেন`}
                      </span>
                      <span className="text-[10px]">
                        {lang === 'en'
                          ? `Portable scale reading: ${booking.fieldWeightKg || 6.8} kg`
                          : `ফিল্ড স্কেল ওজন: ${booking.fieldWeightKg || 6.8} কেজি`}
                      </span>
                    </div>
                  </div>
                )}

                {isQuantityConfirmed && (
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#12613F] mt-1.5 shrink-0" />
                    <div>
                      <span className="font-bold text-[#12613F] block font-sans">
                        {lang === 'en'
                          ? 'E2: Certified Platform Scale Verified'
                          : 'E2: সার্টিফাইড প্ল্যাটফর্ম স্কেলে ওজন নিশ্চিত'}
                      </span>
                      <span className="text-[10px]">
                        {lang === 'en'
                          ? `Gulshan Hub #GW-01 · Net: ${booking.confirmedWeightKg} kg`
                          : `গুলশান হাব #GW-01 · নিট ওজন: ${booking.confirmedWeightKg} কেজি`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 px-6 border-t border-[#EDE4D8] bg-white flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              onReportIssue(booking.id);
            }}
            className="min-h-[48px] px-4 py-2.5 rounded-2xl border border-[#EDE4D8] text-xs font-bold text-[#53616D] hover:bg-[#FFF9F0] flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{lang === 'en' ? 'Get help with this pickup' : 'এই সংগ্রহ সংক্রান্ত সহায়তা'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] px-6 py-2.5 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-2xl text-xs font-bold cursor-pointer transition-all"
          >
            {lang === 'en' ? 'Done' : 'ঠিক আছে'}
          </button>
        </div>
      </div>
    </div>
  );
};
