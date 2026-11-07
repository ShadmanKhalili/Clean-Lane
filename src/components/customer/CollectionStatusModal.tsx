import React, { useState } from 'react';
import { ChevronDown, ChevronUp, LifeBuoy, ShieldCheck, XCircle } from 'lucide-react';
import { pointsForWeight, pointsToTaka } from '../../domain/rules';
import { Booking } from '../../types';
import { useApp } from '../../context/AppContext';
import { JourneyLine } from '../../design/JourneyLine';
import { Term } from '../../design/Glossary';
import { Modal } from '../common/Modal';
import { CancelPickupDialog } from './CancelPickupDialog';
import { MaterialChips, useJourney } from './BookingBits';
import { formatBookingDate, formatDateTime } from './dates';
import { isCancellable } from './useCustomerData';
import { DANGER_GHOST, GHOST, SECONDARY, nf, taka } from './ui';

interface CollectionStatusModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onGetHelp: (bookingId?: string) => void;
}

const Body: React.FC<{ booking: Booking; onClose: () => void; onGetHelp: (id?: string) => void }> = ({ booking, onClose, onGetHelp }) => {
  const { lang, custodyEvents, lots, rewards } = useApp();
  const en = lang === 'en';
  const journey = useJourney(booking);
  const [showDetails, setShowDetails] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const dateLabel = formatBookingDate(booking.scheduledDate, lang);
  const out = journey.outcome;

  const headline =
    out === 'cancelled' ? (en ? 'This pickup was cancelled' : 'এই পিকআপ বাতিল হয়েছে')
    : out === 'missed' ? (en ? 'We missed this pickup' : 'এই পিকআপটি ছুটে গেছে')
    : out === 'disputed' ? (en ? 'We are looking into this pickup' : 'আমরা এই পিকআপটি দেখছি')
    : out === 'under_review' ? (en ? 'We are double-checking the weight' : 'আমরা ওজন আবার যাচাই করছি')
    : out === 'complete' ? (en ? 'All done. Your bag has been recycled' : 'সম্পন্ন। আপনার ব্যাগ রিসাইকেল হয়েছে')
    : booking.confirmedWeightKg ? (en ? `${booking.confirmedWeightKg} kg confirmed at the hub` : `হাবে ${nf(booking.confirmedWeightKg, lang, 1)} কেজি নিশ্চিত হয়েছে`)
    : booking.status === 'COLLECTED' ? (en ? 'Your bag has been picked up' : 'আপনার ব্যাগ সংগ্রহ হয়েছে')
    : booking.status === 'EN_ROUTE' ? (en ? 'Your collector is on the way' : 'আপনার সংগ্রাহক আসছেন')
    : en ? `Booked for ${dateLabel}` : `${dateLabel}-এর জন্য বুক করা হয়েছে`;

  const subline =
    out === 'cancelled' ? (en ? 'You can book a new pickup whenever you like.' : 'যখন ইচ্ছা নতুন পিকআপ বুক করতে পারবেন।')
    : out === 'missed' || out === 'disputed' ? (en ? 'A person at Clean Lane will help. You can also talk to us.' : 'ক্লিন লেনের একজন সদস্য সাহায্য করবেন। আপনি আমাদের সাথেও কথা বলতে পারেন।')
    : out === 'under_review' ? (en ? 'Your points are safe. We will update this page.' : 'আপনার পয়েন্ট নিরাপদ। আমরা এই পাতা হালনাগাদ করব।')
    : booking.status === 'REQUESTED' || booking.status === 'CONFIRMED' || booking.status === 'COLLECTOR_ASSIGNED'
    ? en ? `Collector comes ${booking.scheduledTimeWindow}.` : `সংগ্রাহক আসবেন ${booking.scheduledTimeWindow}।`
    : '';

  const lotIds = new Set(lots.filter((l) => l.sourceBookingId === booking.id).map((l) => l.id));
  const handovers = custodyEvents.filter((e) => lotIds.has(e.lotId)).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const weighedKg = booking.confirmedWeightKg ?? booking.fieldWeightKg;
  const pts = booking.earnedPoints ?? (weighedKg !== undefined ? pointsForWeight(weighedKg) : undefined);
  const worth = pts !== undefined ? pointsToTaka(pts, rewards) : null;
  const pending = booking.pointsStatus === 'pending' || booking.pointsStatus === 'potential';

  return (
    <>
      <div className="space-y-4 text-[#124B3A]">
        <div className="rounded-3xl bg-[#EAF5C9] p-5">
          <h3 className="font-display text-2xl font-extrabold leading-tight">{headline}</h3>
          {subline && <p className="mt-1 text-sm font-medium text-[#124B3A]/75">{subline}</p>}
          <MaterialChips booking={booking} size="md" className="mt-3" />
        </div>

        <JourneyLine stops={journey.stops} lang={lang} orientation="vertical" muted={out === 'cancelled' || out === 'missed'} className="px-1" />

        {pts !== undefined && out !== 'cancelled' && out !== 'missed' && (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#FAF9F5] p-4 ring-1 ring-[#124B3A]/10">
            <div>
              <p className="text-xs font-bold text-[#124B3A]/60">{en ? 'Points for this pickup' : 'এই পিকআপের পয়েন্ট'}</p>
              <p className="font-display text-2xl font-extrabold">+{nf(pts, lang)}</p>
              {worth !== null && <p className="text-sm font-semibold text-[#124B3A]/70">≈ {taka(worth, lang)} {en ? 'in vouchers' : 'ভাউচারে'}</p>}
            </div>
            <p className="max-w-[170px] text-right text-xs font-semibold leading-snug text-[#124B3A]/70">
              {pending ? (
                <>
                  <Term id="pendingPoints" lang={lang}>{en ? 'Pending points' : 'অপেক্ষমাণ পয়েন্ট'}</Term>
                  {en ? ': spendable once the ' : ': খরচ করা যাবে '}
                  <Term id="hubScale" lang={lang}>{en ? 'hub scale' : 'হাবের স্কেল'}</Term>
                  {en ? ' confirms the weight.' : ' ওজন নিশ্চিত করলে।'}
                </>
              ) : (
                en ? 'Ready to spend in Rewards.' : 'রিওয়ার্ডে খরচের জন্য প্রস্তুত।'
              )}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setShowDetails(!showDetails)} aria-expanded={showDetails} className={SECONDARY}>
            {showDetails ? (en ? 'Hide details' : 'বিবরণ লুকান') : en ? 'See the details' : 'বিবরণ দেখুন'}
            {showDetails ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
          </button>
          <button type="button" onClick={() => { onClose(); onGetHelp(booking.id); }} className={GHOST}>
            <LifeBuoy className="h-4 w-4" aria-hidden="true" />
            {en ? 'Talk to us' : 'আমাদের জানান'}
          </button>
          {isCancellable(booking) && (
            <button type="button" onClick={() => setCancelOpen(true)} className={DANGER_GHOST}>
              <XCircle className="h-4 w-4" aria-hidden="true" />
              {en ? 'Cancel pickup' : 'পিকআপ বাতিল করুন'}
            </button>
          )}
        </div>

        {out === 'cancelled' && booking.notes && <p className="rounded-2xl bg-[#FAF9F5] p-3 text-sm text-[#53616D]">{booking.notes}</p>}

        {showDetails && (
          <div className="cl-rise space-y-3 text-sm">
            <dl className="space-y-2 rounded-2xl bg-white p-4 ring-1 ring-[#124B3A]/10">
              <Row l={en ? 'When' : 'কখন'} v={`${dateLabel} · ${booking.scheduledTimeWindow}`} />
              {booking.collectorName && <Row l={en ? 'Collector' : 'সংগ্রাহক'} v={booking.collectorName} />}
              <Row l={en ? 'Weighed at your door' : 'দরজায় ওজন'} v={booking.fieldWeightKg ? `${nf(booking.fieldWeightKg, lang, 1)} kg` : en ? 'Not yet' : 'এখনো নয়'} />
              <Row
                l={<Term id="hubScale" lang={lang}>{en ? 'Weighed at the hub' : 'হাবে ওজন'}</Term>}
                v={booking.confirmedWeightKg ? `${nf(booking.confirmedWeightKg, lang, 1)} kg` : en ? 'Not yet' : 'এখনো নয়'}
              />
              {typeof booking.rejectedWeightKg === 'number' && booking.rejectedWeightKg > 0 && (
                <Row
                  l={<Term id="contamination" lang={lang}>{en ? 'Could not be recycled' : 'রিসাইকেল করা যায়নি'}</Term>}
                  v={`${nf(booking.rejectedWeightKg, lang, 1)} kg${booking.rejectedReason ? ` · ${booking.rejectedReason}` : ''}`}
                />
              )}
              <Row l={en ? 'Service fee' : 'সেবা ফি'} v={booking.serviceFeeBdt > 0 ? taka(booking.serviceFeeBdt, lang) : en ? 'Free' : 'বিনামূল্যে'} />
            </dl>
            <p className="px-1 text-xs font-medium text-[#124B3A]/65">
              {en ? 'The two weights can differ a little. Within ' : 'দুই ওজনে সামান্য পার্থক্য হতেই পারে। '}
              <Term id="weightTolerance" lang={lang}>±5%</Term>
              {en ? ' is normal. More than that, a person checks.' : '-এর মধ্যে স্বাভাবিক। এর বেশি হলে একজন যাচাই করেন।'}
            </p>

            <div className="rounded-2xl bg-white p-4 ring-1 ring-[#124B3A]/10">
              <p className="font-bold">{en ? 'Who has handled your bag' : 'কার কার হাত ঘুরেছে'}</p>
              {handovers.length === 0 ? (
                <p className="mt-1 text-xs text-[#124B3A]/65">{en ? 'Nothing yet. Each handover shows up here after pickup.' : 'এখনো কিছু নেই। পিকআপের পর প্রতিটি হস্তান্তর এখানে দেখা যাবে।'}</p>
              ) : (
                <ol className="mt-2 space-y-2">
                  {handovers.map((e) => (
                    <li key={e.id} className="rounded-xl bg-[#FAF9F5] p-2.5 text-xs">
                      <span className="block font-bold">{e.sender} → {e.receiver}</span>
                      <span className="block text-[#124B3A]/65">{formatDateTime(e.timestamp, lang)} · {e.location} · {nf(e.quantityKg, lang, 1)} kg</span>
                    </li>
                  ))}
                </ol>
              )}
              {handovers.length > 0 && (
                <p className="mt-2 flex items-start gap-1.5 text-[11px] font-medium text-[#124B3A]/65">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>
                    {en ? 'Every handover is sealed with a ' : 'প্রতিটি হস্তান্তর সিল করা আছে '}
                    <Term id="fingerprint" lang={lang}>{en ? 'fingerprint' : 'ফিঙ্গারপ্রিন্টে'}</Term>
                    {en ? ' so it cannot be quietly changed.' : ' যাতে গোপনে বদলানো না যায়।'}
                  </span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      <CancelPickupDialog booking={cancelOpen ? booking : null} onClose={() => setCancelOpen(false)} />
    </>
  );
};

const Row: React.FC<{ l: React.ReactNode; v: React.ReactNode }> = ({ l, v }) => (
  <div className="flex items-baseline justify-between gap-3">
    <dt className="text-[#124B3A]/65">{l}</dt>
    <dd className="text-right font-bold">{v}</dd>
  </div>
);

export const CollectionStatusModal: React.FC<CollectionStatusModalProps> = ({ booking, isOpen, onClose, onGetHelp }) => {
  const { lang } = useApp();
  if (!isOpen || !booking) return null;
  return (
    <Modal
      open
      onClose={onClose}
      title={lang === 'en' ? 'Your pickup' : 'আপনার পিকআপ'}
      description={lang === 'en' ? `Reference #${booking.id}` : `রেফারেন্স #${booking.id}`}
      closeLabel={lang === 'en' ? 'Close' : 'বন্ধ করুন'}
    >
      <Body booking={booking} onClose={onClose} onGetHelp={onGetHelp} />
    </Modal>
  );
};
