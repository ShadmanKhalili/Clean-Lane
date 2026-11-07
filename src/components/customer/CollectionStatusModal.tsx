import React, { useState } from 'react';
import { pointsForWeight } from '../../domain/rules';
import { Booking } from '../../types';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../utils/translations';
import { EvidenceBadge } from '../common/EvidenceBadge';
import { Modal } from '../common/Modal';
import { BrandJourneyDevice } from '../common/BrandJourneyDevice';
import { CancelPickupDialog } from './CancelPickupDialog';
import { formatBookingDate, formatDateTime } from './dates';
import { isCancellable } from './useCustomerData';
import { HelpCircle, ChevronDown, ChevronUp, ShieldCheck, XCircle } from 'lucide-react';

interface CollectionStatusModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onGetHelp: (bookingId?: string) => void;
}

export const CollectionStatusModal: React.FC<CollectionStatusModalProps> = ({
  booking,
  isOpen,
  onClose,
  onGetHelp
}) => {
  const { lang, custodyEvents, lots } = useApp();
  const t = useTranslation(lang);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  if (!isOpen || !booking) return null;

  // Real audit state logic
  const isRequested = booking.status === 'REQUESTED';
  const isConfirmed = booking.status === 'CONFIRMED' || booking.status === 'COLLECTOR_ASSIGNED';
  const isEnRoute = booking.status === 'EN_ROUTE';
  const isCollected = booking.status === 'COLLECTED';
  const isQuantityUnderReview = booking.status === 'QUANTITY_UNDER_REVIEW';
  const isQuantityConfirmed = booking.status === 'QUANTITY_CONFIRMED' || booking.status === 'ENTERED_RECOVERY_CHAIN' || booking.status === 'PROCESSED';
  const isProcessed = booking.status === 'PROCESSED';
  const isMissedOrDisputed = booking.status === 'MISSED' || booking.status === 'DISPUTED';
  const isCancelled = booking.status === 'CANCELLED';
  const canCancel = isCancellable(booking);
  const dateLabel = formatBookingDate(booking.scheduledDate, lang);

  // Primary short answer computation
  const getPrimaryStatusBadge = () => {
    if (isCancelled) return { text: lang === 'en' ? 'CANCELLED' : 'বাতিল করা হয়েছে', color: 'bg-slate-200 text-slate-800' };
    if (isProcessed) return { text: lang === 'en' ? 'PROCESSED AT MILL' : 'মিলে প্রক্রিয়াজাত সম্পন্ন', color: 'bg-emerald-900 text-emerald-100' };
    if (isQuantityConfirmed) return { text: lang === 'en' ? 'QUANTITY CONFIRMED' : 'ওজন নিশ্চিত করা হয়েছে', color: 'bg-[#C9F1DC] text-[#12613F]' };
    if (isQuantityUnderReview) return { text: lang === 'en' ? 'UNDER SCALE CHECK' : 'স্কেল যাচাই চলছে', color: 'bg-amber-100 text-amber-900' };
    if (isCollected) return { text: lang === 'en' ? 'COLLECTED' : 'সংগ্রহ সম্পন্ন', color: 'bg-[#25345C] text-white' };
    if (isEnRoute) return { text: lang === 'en' ? 'COLLECTOR EN ROUTE' : 'কালেক্টর পথে আছেন', color: 'bg-blue-100 text-blue-900' };
    if (isConfirmed) return { text: lang === 'en' ? 'PICKUP CONFIRMED' : 'পিকআপ নিশ্চিত', color: 'bg-emerald-100 text-emerald-900' };
    if (isMissedOrDisputed) return { text: lang === 'en' ? 'ATTENTION REQUIRED' : 'পর্যালোচনাধীন', color: 'bg-amber-600 text-white' };
    return { text: lang === 'en' ? 'REQUESTED' : 'অনুরোধ গৃহীত', color: 'bg-slate-100 text-slate-800' };
  };

  const getPrimaryHeadline = () => {
    if (isCancelled) return lang === 'en' ? 'This pickup was cancelled.' : 'এই পিকআপটি বাতিল করা হয়েছে।';
    if (isProcessed) return lang === 'en' ? 'Materials converted to certified flake batches.' : 'বর্জ্য সফলভাবে প্রক্রিয়াজাত করে ফ্লেক্সে রূপান্তর করা হয়েছে।';
    if (isQuantityConfirmed)
      return booking.confirmedWeightKg
        ? lang === 'en'
          ? `${booking.confirmedWeightKg} kg verified at platform scale.`
          : `${booking.confirmedWeightKg} কেজি সার্টিফাইড স্কেলে নিশ্চিত হয়েছে।`
        : lang === 'en'
        ? 'Quantity confirmed at platform scale.'
        : 'সার্টিফাইড স্কেলে পরিমাণ নিশ্চিত হয়েছে।';
    if (isCollected || isQuantityUnderReview) return lang === 'en' ? 'Your materials were picked up.' : 'আপনার বর্জ্য সফলভাবে সংগ্রহ করা হয়েছে।';
    if (isEnRoute) return lang === 'en' ? 'Collector is approaching your address.' : 'কালেক্টর আপনার ঠিকানার দিকে আসছেন।';
    if (isConfirmed) return lang === 'en' ? `Scheduled for ${dateLabel}.` : `${dateLabel} তারিখের জন্য নির্ধারিত।`;
    if (isMissedOrDisputed) return lang === 'en' ? 'Pickup was flagged for operator review.' : 'সংগ্রহটি পর্যালোচনার জন্য চিহ্নিত রয়েছে।';
    return lang === 'en' ? 'Pickup request received by dispatch.' : 'অনুরোধটি গ্রহণ করা হয়েছে।';
  };

  const getNextStepNotice = () => {
    if (isCancelled) return lang === 'en' ? 'You can book a new pickup whenever you are ready.' : 'প্রস্তুত হলে যেকোনো সময় নতুন পিকআপ বুক করতে পারবেন।';
    if (isProcessed) return lang === 'en' ? 'Next: Audited certificate archived for EPR reporting.' : 'পরবর্তী: অডিট সার্টিফিকেট ডিজিটাল খতিয়ানে সংরক্ষিত।';
    if (isQuantityConfirmed) return lang === 'en' ? 'Next: Points added to your Available balance.' : 'পরবর্তী: পয়েন্ট আপনার উপলব্ধ ব্যালেন্সে যোগ করা হয়েছে।';
    if (isCollected || isQuantityUnderReview) return lang === 'en' ? 'Next: We are checking the quantity at the receiving hub.' : 'পরবর্তী: আমরা একত্রীকরণ কেন্দ্রে ডিজিটাল স্কেলে পরিমাণ যাচাই করছি।';
    if (isEnRoute) return lang === 'en' ? 'Next: Collector will weigh materials in your presence.' : 'পরবর্তী: কালেক্টর আপনার সামনে ঝুলন্ত স্কেলে ওজন করবেন।';
    if (isConfirmed) return lang === 'en' ? `Next: Collector will arrive during ${booking.scheduledTimeWindow}.` : `পরবর্তী: কালেক্টর ${booking.scheduledTimeWindow} সময়ে পৌঁছাবেন।`;
    if (isMissedOrDisputed) return lang === 'en' ? 'Next: Dispatch operator is reviewing audit evidence.' : 'পরবর্তী: অপারেটর অডিট ট্রেইল পর্যালোচনা করে সমাধান জানাবেন।';
    return lang === 'en' ? 'Next: Vehicle route will be confirmed.' : 'পরবর্তী: এলাকা ভিত্তিক কালেক্টর বরাদ্দ করা হবে।';
  };

  const badge = getPrimaryStatusBadge();
  const headline = getPrimaryHeadline();
  const nextStep = getNextStepNotice();

  // Custody trail: only lots that came from THIS booking, oldest first.
  const bookingLotIds = new Set(lots.filter((l) => l.sourceBookingId === booking.id).map((l) => l.id));
  const relatedCustody = custodyEvents
    .filter((e) => bookingLotIds.has(e.lotId))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const weighedKg = booking.confirmedWeightKg ?? booking.fieldWeightKg;
  const pointsLabel = booking.pointsStatus
    ? {
        potential: lang === 'en' ? 'Expected after scale check' : 'স্কেল যাচাইয়ের পর প্রত্যাশিত',
        pending: lang === 'en' ? 'Pending hub verification' : 'হাব যাচাইয়ের অপেক্ষায়',
        available: lang === 'en' ? 'Available' : 'উপলব্ধ',
        reversed: lang === 'en' ? 'Reversed' : 'বাতিল',
        redeemed: lang === 'en' ? 'Redeemed' : 'রিডিম করা হয়েছে'
      }[booking.pointsStatus]
    : '';

  return (
    <>
      <Modal
        open
        onClose={onClose}
        title={t.checkACollection}
        description={lang === 'en' ? `Pickup Ref: #${booking.id}` : `পিকআপ রেফারেন্স: #${booking.id}`}
        closeLabel={t.close}
      >
        <div className="space-y-5 text-xs text-[#202B38]">
          {/* One answer first */}
          <div className="p-6 bg-[#FAF9F5] rounded-3xl border border-[#EDE4D8] text-center space-y-3 shadow-2xs">
            {!isCancelled && !isMissedOrDisputed && (
              <BrandJourneyDevice currentStep={isQuantityConfirmed ? 3 : isCollected || isQuantityUnderReview ? 2 : 1} size="compact" />
            )}
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider ${badge.color}`}>
              {badge.text}
            </span>

            <div className="space-y-1">
              <h4 className="text-xl font-black text-[#202B38] tracking-tight">{headline}</h4>
              <p className="text-xs text-[#53616D] font-medium max-w-sm mx-auto">{nextStep}</p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                aria-expanded={showDetails}
                className="w-full sm:flex-1 py-3 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>{showDetails ? (lang === 'en' ? 'Hide details' : 'বিবরণ লুকান') : t.seeDetails}</span>
                {showDetails ? <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" /> : <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGetHelp(booking.id);
                }}
                className="w-full sm:w-auto px-5 py-3 bg-white border border-[#EDE4D8] hover:bg-[#FAF5EC] text-[#25345C] rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-amber-700" aria-hidden="true" />
                <span>{t.getHelp}</span>
              </button>
            </div>

            {canCancel && (
              <button
                type="button"
                onClick={() => setIsCancelOpen(true)}
                className="text-xs font-bold text-rose-700 hover:underline flex items-center gap-1 mx-auto cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{lang === 'en' ? 'Cancel pickup' : 'পিকআপ বাতিল করুন'}</span>
              </button>
            )}
          </div>

          {isCancelled && booking.notes && (
            <p className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[#53616D]">{booking.notes}</p>
          )}

          {showDetails && (
            <div className="space-y-4 pt-1 animate-fade-in">
              <span className="text-[11px] font-bold text-[#53616D] uppercase tracking-wider block">
                {lang === 'en' ? 'Collection record & measurement basis' : 'সংগ্রহ রেকর্ড ও পরিমাপ ভিত্তি'}
              </span>

              <div className="p-4 bg-white rounded-2xl border border-[#EDE4D8] space-y-2.5">
                <div className="flex justify-between items-center gap-3">
                  <span className="text-[#53616D]">{lang === 'en' ? 'Collection window:' : 'সংগ্রহের সময়:'}</span>
                  <span className="font-bold text-right">
                    {dateLabel} · {booking.scheduledTimeWindow}
                  </span>
                </div>
                {booking.collectorName && (
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-[#53616D]">{lang === 'en' ? 'Collector:' : 'সংগ্রাহক:'}</span>
                    <span className="font-bold text-right">{booking.collectorName}</span>
                  </div>
                )}
                <div className="flex justify-between items-center gap-3">
                  <span className="text-[#53616D]">{lang === 'en' ? 'Confirmed quantity:' : 'নিশ্চিত ওজন:'}</span>
                  <span className="font-mono font-bold text-sm text-[#12613F] text-right">
                    {booking.confirmedWeightKg
                      ? `${booking.confirmedWeightKg} kg`
                      : lang === 'en'
                      ? 'Not yet confirmed at hub scale'
                      : 'হাব স্কেলে এখনো নিশ্চিত হয়নি'}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-3 text-[11px]">
                  <span className="text-[#53616D]">{lang === 'en' ? 'Collector field weight:' : 'সংগ্রাহকের মাঠ ওজন:'}</span>
                  <span className="font-mono text-[#202B38]">
                    {booking.fieldWeightKg ? `${booking.fieldWeightKg} kg` : lang === 'en' ? 'Not yet weighed' : 'এখনো ওজন করা হয়নি'}
                  </span>
                </div>
                {typeof booking.rejectedWeightKg === 'number' && booking.rejectedWeightKg > 0 && (
                  <div className="flex justify-between items-center gap-3 text-[11px]">
                    <span className="text-[#53616D]">{lang === 'en' ? 'Rejected / contaminated:' : 'বর্জনীয় উপাদান:'}</span>
                    <span className="font-mono text-amber-800 font-bold text-right">
                      {booking.rejectedWeightKg} kg{booking.rejectedReason ? ` · ${booking.rejectedReason}` : ''}
                    </span>
                  </div>
                )}
                {weighedKg === undefined && (
                  <p className="text-[11px] text-[#53616D]">
                    {lang === 'en'
                      ? 'Your materials have not been weighed yet. The collector weighs them at your door.'
                      : 'আপনার বর্জ্য এখনো ওজন করা হয়নি। সংগ্রাহক দরজায় ওজন করবেন।'}
                  </p>
                )}
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#EDE4D8] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#53616D]">{t.serviceFee}:</span>
                  <span className="font-mono font-bold text-[#12613F]">
                    {booking.serviceFeeBdt > 0 ? `৳${booking.serviceFeeBdt}` : lang === 'en' ? '৳0 (free doorstep recovery)' : '৳০ (বিনামূল্যে ডোরস্টেপ সংগ্রহ)'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#53616D]">{lang === 'en' ? 'Reward points:' : 'রিওয়ার্ড পয়েন্ট:'}</span>
                  <span className="font-mono font-bold text-[#25345C]">
                    {booking.earnedPoints !== undefined || weighedKg !== undefined
                      ? `${isCancelled ? '' : '+'}${booking.earnedPoints ?? pointsForWeight(weighedKg ?? 0)} pts`
                      : '—'}
                  </span>
                </div>
                {pointsLabel && !isCancelled && (
                  <div className="flex justify-between items-center text-[11px] pt-1 border-t border-[#FAF5EC]">
                    <span className="text-[#53616D]">{lang === 'en' ? 'Points status:' : 'পয়েন্ট অবস্থা:'}</span>
                    <span className="font-bold text-[#12613F]">{pointsLabel}</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#EDE4D8] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#202B38]">{lang === 'en' ? 'Chain of custody' : 'কাস্টডি চেইন ও হস্তান্তর'}</span>
                  <EvidenceBadge level={booking.evidenceLevel || 'E0'} />
                </div>

                {relatedCustody.length === 0 ? (
                  <p className="text-[11px] text-[#53616D]">
                    {lang === 'en'
                      ? 'No custody handovers recorded yet. They appear here once your materials are collected.'
                      : 'এখনো কোনো হস্তান্তর রেকর্ড হয়নি। বর্জ্য সংগ্রহের পর এখানে দেখা যাবে।'}
                  </p>
                ) : (
                  <ol className="space-y-2 text-[11px] text-[#53616D]">
                    {relatedCustody.map((e) => (
                      <li key={e.id} className="p-2.5 bg-[#FAF9F5] rounded-xl border border-[#EDE4D8] space-y-0.5">
                        <div className="font-bold text-[#202B38]">
                          {e.sender} → {e.receiver}
                        </div>
                        <div>
                          {formatDateTime(e.timestamp, lang)} · {e.location}
                        </div>
                        <div className="font-mono">
                          {e.quantityKg} kg · {e.measurementMethod}
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              {relatedCustody.length > 0 && (
                <div className="p-3 bg-[#FAF5EC] rounded-2xl border border-[#EDE4D8] flex items-center gap-2 text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-[#12613F] shrink-0" aria-hidden="true" />
                  <span className="text-[#53616D]">
                    {lang === 'en' ? 'Latest record hash: ' : 'সর্বশেষ রেকর্ড হ্যাশ: '}
                    <strong className="font-mono text-[#25345C] break-all">{relatedCustody[relatedCustody.length - 1].signatureOrHash}</strong>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      <CancelPickupDialog
        booking={isCancelOpen ? booking : null}
        onClose={() => setIsCancelOpen(false)}
      />
    </>
  );
};
