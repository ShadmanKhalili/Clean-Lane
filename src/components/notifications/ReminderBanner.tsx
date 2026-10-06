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
        : `Reminder: Your collection is scheduled for tomorrow ${booking.scheduledDate} during ${booking.scheduledTimeWindow}. Please rinse and flatten your recyclables in separate bags for full points.`;

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
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#25345C] text-white px-2 py-0.5 rounded-full">
                {lang === 'en' ? '24-Hour Automated Reminder' : 'স্বয়ংক্রিয় ২৪ ঘণ্টা পূর্বের অ্যালার্ট'}
              </span>
              <span className="text-[10px] font-bold text-[#12613F] bg-[#C9F1DC] px-2 py-0.5 rounded-full">
                SMS & App Sent
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-[#202B38]">
              {lang === 'en' ? (
                <>
                  Collection Tomorrow:{' '}
                  <span className="text-[#25345C] underline decoration-[#F5BF55]">
                    {booking.scheduledDate} ({booking.scheduledTimeWindow})
                  </span>
                </>
              ) : (
                <>
                  আগামীকাল সংগ্রহ:{' '}
                  <span className="text-[#25345C]">
                    {booking.scheduledDate} ({booking.scheduledTimeWindow})
                  </span>
                </>
              )}
            </h3>

            <p className="text-xs text-[#53616D] leading-relaxed max-w-xl">
              {lang === 'en'
                ? `Please rinse, flatten, and separate your ${materialsCount} scheduled recyclable stream(s). Clean materials guarantee 100% verified points & instant scale approval.`
                : `আপনার ${materialsCount}টি বর্জ্যের ধরন ধুয়ে ও চ্যাপ্টা করে আলাদা রাখুন যাতে সম্পূর্ণ পয়েন্ট নিশ্চিত হয়।`}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg self-start sm:self-auto cursor-pointer"
          title="Dismiss reminder"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-[#EDE4D8] flex flex-wrap items-center justify-between gap-2.5 relative z-10">
        <div className="flex flex-wrap items-center gap-2">
          {/* View Preparation Steps */}
          <button
            onClick={() => onOpenPreparation(booking)}
            className="px-4 py-2 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer min-h-[40px]"
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
            className="px-3 py-2 bg-white hover:bg-[#FAF5EC] border border-[#EDE4D8] text-[#25345C] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[40px]"
          >
            <Volume2
              className={`w-3.5 h-3.5 ${
                speaking ? 'text-rose-600 animate-pulse' : 'text-[#25345C]'
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
          onClick={onOpenNotifications}
          className="text-xs font-bold text-[#25345C] hover:text-[#1B2644] flex items-center gap-1 cursor-pointer py-1 px-2"
        >
          <span>{lang === 'en' ? 'SMS & Notification Center' : 'এসএমএস ও নোটিফিকেশন'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
