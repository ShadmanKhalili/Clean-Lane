import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Booking } from '../../types';
import { Modal } from '../common/Modal';
import { formatBookingDate } from './dates';

interface CancelPickupDialogProps {
  booking: Booking | null;
  onClose: () => void;
  /** Called after the booking has been cancelled. */
  onCancelled?: (bookingId: string) => void;
}

const REASONS: { id: string; en: string; bn: string }[] = [
  { id: 'plans_changed', en: 'My plans changed', bn: 'আমার পরিকল্পনা বদলেছে' },
  { id: 'not_enough', en: 'Not enough material yet', bn: 'এখনো যথেষ্ট পরিমাণ জমেনি' },
  { id: 'wrong_slot', en: 'Booked the wrong day or time', bn: 'ভুল দিন বা সময়ে বুক করেছি' },
  { id: 'mistake', en: 'Booked by mistake', bn: 'ভুলে বুক হয়ে গেছে' },
  { id: 'other', en: 'Another reason', bn: 'অন্য কারণ' }
];

/** Reason picker + explicit confirm step for cancelling an upcoming pickup. */
export const CancelPickupDialog: React.FC<CancelPickupDialogProps> = ({ booking, onClose, onCancelled }) => {
  const { lang, cancelBooking } = useApp();
  const [reasonId, setReasonId] = useState<string>('');
  const [otherText, setOtherText] = useState('');
  const [confirming, setConfirming] = useState(false);

  // Children unmount with the Modal, but this wrapper stays mounted — reset on every close.
  const close = () => {
    setReasonId('');
    setOtherText('');
    setConfirming(false);
    onClose();
  };

  if (!booking) return null;

  const reason = REASONS.find((r) => r.id === reasonId);
  const reasonText = reason ? (reason.id === 'other' && otherText.trim() ? otherText.trim() : reason.en) : '';
  const canContinue = Boolean(reason) && (reason?.id !== 'other' || otherText.trim().length > 0);

  const confirm = () => {
    if (!reasonText) return;
    cancelBooking(booking.id, `Customer cancelled — ${reasonText}`);
    onCancelled?.(booking.id);
    close();
  };

  return (
    <Modal
      open
      onClose={close}
      size="sm"
      title={lang === 'en' ? 'Cancel this pickup?' : 'পিকআপ বাতিল করবেন?'}
      description={`#${booking.id} · ${formatBookingDate(booking.scheduledDate, lang)} · ${booking.scheduledTimeWindow}`}
      closeLabel={lang === 'en' ? 'Close' : 'বন্ধ করুন'}
      footer={
        <div className="flex flex-col-reverse sm:flex-row gap-2">
          <button
            type="button"
            onClick={confirming ? () => setConfirming(false) : close}
            className="flex-1 py-2.5 rounded-xl border border-[#EDE4D8] bg-white text-[#124B3A] font-bold text-xs hover:bg-[#FAF5EC] cursor-pointer"
          >
            {confirming ? (lang === 'en' ? 'Back' : 'পিছনে') : lang === 'en' ? 'Keep my pickup' : 'পিকআপ রাখুন'}
          </button>
          {confirming ? (
            <button
              type="button"
              onClick={confirm}
              className="flex-1 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs cursor-pointer"
            >
              {lang === 'en' ? 'Yes, cancel pickup' : 'হ্যাঁ, বাতিল করুন'}
            </button>
          ) : (
            <button
              type="button"
              disabled={!canContinue}
              onClick={() => setConfirming(true)}
              className="flex-1 py-2.5 rounded-xl bg-[#124B3A] hover:bg-[#0E3A2D] text-white font-bold text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {lang === 'en' ? 'Continue' : 'এগিয়ে যান'}
            </button>
          )}
        </div>
      }
    >
      {confirming ? (
        <div className="space-y-3 text-xs text-[#202B38]">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-amber-950 leading-relaxed">
              {lang === 'en'
                ? 'The collector will be told not to come. You can book a new pickup at any time.'
                : 'সংগ্রাহককে আসতে নিষেধ করে জানিয়ে দেওয়া হবে। আপনি যেকোনো সময় নতুন পিকআপ বুক করতে পারবেন।'}
            </p>
          </div>
          <p className="text-[#53616D]">
            {lang === 'en' ? 'Reason: ' : 'কারণ: '}
            <strong className="text-[#202B38]">{lang === 'en' || !reason || reason.id === 'other' ? reasonText : reason.bn}</strong>
          </p>
        </div>
      ) : (
        <fieldset className="space-y-2 text-xs">
          <legend className="font-bold text-[#202B38] mb-2">{lang === 'en' ? 'Why are you cancelling?' : 'কেন বাতিল করছেন?'}</legend>
          {REASONS.map((r) => (
            <label
              key={r.id}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${
                reasonId === r.id ? 'bg-[#FAF5EC] border-[#124B3A]' : 'bg-white border-[#EDE4D8] hover:bg-[#FAF9F5]'
              }`}
            >
              <input
                type="radio"
                name="cancel-reason"
                value={r.id}
                checked={reasonId === r.id}
                onChange={() => setReasonId(r.id)}
                className="accent-[#124B3A]"
              />
              <span className="font-semibold text-[#202B38]">{lang === 'en' ? r.en : r.bn}</span>
            </label>
          ))}
          {reasonId === 'other' && (
            <div>
              <label htmlFor="cancel-other" className="sr-only">
                {lang === 'en' ? 'Tell us the reason' : 'কারণটি লিখুন'}
              </label>
              <input
                id="cancel-other"
                type="text"
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                placeholder={lang === 'en' ? 'Tell us briefly' : 'সংক্ষেপে লিখুন'}
                className="w-full bg-[#FAF5EC] border border-[#EDE4D8] rounded-xl p-2.5 text-xs"
              />
            </div>
          )}
        </fieldset>
      )}
    </Modal>
  );
};
