import React, { useState } from 'react';
import {
  Clock,
  Sparkles,
  FileCheck2,
  Volume2,
  ChevronRight,
  CheckCircle2,
  Smartphone,
  AlertCircle,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Booking } from '../../types';
import { daysFromToday, formatBookingDate } from '../customer/dates';

interface ReminderBannerProps {
  booking: Booking;
  onOpenPreparation: (booking: Booking) => void;
  onOpenNotifications: () => void;
}

export const ReminderBanner: React.FC<ReminderBannerProps> = ({
  booking,
  onOpenPreparation,
  onOpenNotifications
}) => {
  const { lang, notifications } = useApp();
  const [isDismissed, setIsDismissed] = useState(false);
  const isToday = daysFromToday(booking.scheduledDate) === 0;
  const dateText = `${formatBookingDate(booking.scheduledDate, lang)} (${booking.scheduledTimeWindow})`;
  const reminderSent = notifications.some((n) => n.bookingId === booking.id);
  const [speaking, setSpeaking] = useState(false);

  if (isDismissed) return null;

  // Check if booking is in an active state
  const isActive =
    booking.status === 'REQUESTED' ||
    booking.status === 'CONFIRMED' ||
    booking.status === 'COLLECTOR_ASSIGNED';

  if (!isActive) return null;

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const textToSpeak =
      lang === 'bn'
        ? `স্মারক: আগামীকাল ${booking.scheduledDate} তারিখে ${booking.scheduledTimeWindow} সময়ে আপনার বর্জ্য সংগ্রহ নির্ধারিত আছে। অনুগ্রহ করে বোতল ও কার্টুন চ্যাপ্টা করে আলাদা ব্যাগে প্রস্তুত রাখুন।`
        : `Reminder: Your collection is scheduled for ${isToday ? 'today' : 'tomorrow'}, ${formatBookingDate(booking.scheduledDate, 'en')}, during ${booking.scheduledTimeWindow}. Please rinse and flatten your recyclables in separate bags for full points.`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const materialsCount = booking.materials.length;

  return (
    <div className="p-4 sm:p-5 bg-gradient-to-br from-[#FEF8EB] via-[#FFF9F0] to-[#E8FAF1] border-2 border-[#F5BF55] rounded-3xl shadow-sm relative overflow-hidden animate-fade-in space-y-3">
      {/* Decorative accent background pill */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5BF55]/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#F5BF55] text-[#202B38] flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Clock className="w-5 h-5 text-[#202B38]" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#124B3A] text-white px-2 py-0.5 rounded-full">
                {lang === 'en' ? 'Pickup reminder' : 'পিকআপ রিমাইন্ডার'}
              </span>
              {reminderSent && (
                <span className="text-[10px] font-bold text-[#12613F] bg-[#C9F1DC] px-2 py-0.5 rounded-full">
                  {lang === 'en' ? 'Sent to your phone & app' : 'ফোন ও অ্যাপে পাঠানো হয়েছে'}
                </span>
              )}
            </div>

            <h3 className="text-sm sm:text-base font-bold text-[#202B38]">
              {lang === 'en' ? (
                <>
                  {isToday ? 'Collection today' : 'Collection tomorrow'}:{' '}
                  <span className="text-[#124B3A] underline decoration-[#F5BF55]">{dateText}</span>
                </>
              ) : (
                <>
                  {isToday ? 'আজ সংগ্রহ' : 'আগামীকাল সংগ্রহ'}: <span className="text-[#124B3A]">{dateText}</span>
                </>
              )}
            </h3>

            <p className="text-xs text-[#53616D] leading-relaxed max-w-xl">
              {lang === 'en'
                ? `Please rinse, flatten, and separate your ${materialsCount} scheduled recyclable stream(s). Clean, dry materials are weighed and credited without delays.`
                : `আপনার ${materialsCount}টি বর্জ্যের ধরন ধুয়ে ও চ্যাপ্টা করে আলাদা রাখুন যাতে সম্পূর্ণ পয়েন্ট নিশ্চিত হয়।`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg self-start sm:self-auto cursor-pointer"
          title={lang === 'en' ? 'Dismiss reminder' : 'রিমাইন্ডার সরান'}
          aria-label={lang === 'en' ? 'Dismiss reminder' : 'রিমাইন্ডার সরান'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-[#EDE4D8] flex flex-wrap items-center justify-between gap-2.5 relative z-10">
        <div className="flex flex-wrap items-center gap-2">
          {/* View Preparation Steps */}
          <button
            type="button"
            onClick={() => onOpenPreparation(booking)}
            className="px-4 py-2 bg-[#124B3A] hover:bg-[#0E3A2D] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer min-h-[40px]"
          >
            <FileCheck2 className="w-4 h-4 text-[#C9F1DC]" />
            <span>
              {lang === 'en'
                ? 'View Preparation Checklist'
                : 'প্রস্তুতি চেকলিস্ট দেখুন'}
            </span>
          </button>

          {/* Listen to instructions */}
          <button
            type="button"
            onClick={handleSpeak}
            className="px-3 py-2 bg-white hover:bg-[#FAF5EC] border border-[#EDE4D8] text-[#124B3A] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[40px]"
          >
            <Volume2
              className={`w-3.5 h-3.5 ${
                speaking ? 'text-rose-600 animate-pulse' : 'text-[#124B3A]'
              }`}
            />
            <span>
              {speaking
                ? lang === 'en'
                  ? 'Stop Audio'
                  : 'অডিও থামান'
                : lang === 'en'
                ? 'Listen'
                : 'শুনুন'}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenNotifications}
          className="text-xs font-bold text-[#124B3A] hover:text-[#0E3A2D] flex items-center gap-1 cursor-pointer py-1 px-2"
        >
          <span>{lang === 'en' ? 'SMS & Notification Center' : 'এসএমএস ও নোটিফিকেশন'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
