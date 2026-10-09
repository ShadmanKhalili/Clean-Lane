import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../utils/translations';
import {
  X,
  HelpCircle,
  Phone,
  AlertCircle,
  FileText,
  ChevronRight,
  MessageSquare,
  CheckCircle2,
  Clock,
  Scale,
  Sparkles
} from 'lucide-react';

interface HelpDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFileDispute: (bookingId?: string) => void;
  onOpenSortingGuide?: () => void;
  bookingIdContext?: string;
}

export const HelpDrawerModal: React.FC<HelpDrawerModalProps> = ({
  isOpen,
  onClose,
  onOpenFileDispute,
  onOpenSortingGuide,
  bookingIdContext
}) => {
  const { lang, bookings } = useApp();
  const t = useTranslation(lang);
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);

  if (!isOpen) return null;

  const faqs = [
    {
      qEn: 'What materials qualify for circular rewards?',
      qBn: 'কোন কোন উপাদান সার্কুলার রিওয়ার্ড পয়েন্টের জন্য যোগ্য?',
      aEn: 'Clean, dry and segregated plastic bottles (PET), cardboard & delivery boxes (OCC), aluminum cans, and rigid containers (HDPE). No wet food waste or contaminated items.',
      aBn: 'শুকনো, পরিষ্কার ও আলাদা করা প্লাস্টিক বোতল (PET), কার্টন ও ডেলিভারি বক্স (OCC), ক্যান এবং রিজিড প্লাস্টিক। ভেজা খাবারের বর্জ্য নেওয়া হয় না।'
    },
    {
      qEn: 'How are materials weighed at my doorstep?',
      qBn: 'আমার দরজায় বর্জ্য কীভাবে ওজন করা হয়?',
      aEn: 'Our certified collector uses a digital hanging scale in your presence. The weight is recorded on device and verified at the neighborhood receiving hub.',
      aBn: 'আমাদের সার্টিফাইড কালেক্টর ডিজিটাল ঝুলন্ত স্কেলের মাধ্যমে সরাসরি আপনার সামনে ওজন মেপে সিস্টেমে রেকর্ড করেন।'
    },
    {
      qEn: 'When are points credited to my balance?',
      qBn: 'পয়েন্ট কখন আমার ব্যালেন্সে যুক্ত হবে?',
      aEn: 'Points appear as "Pending" immediately after collection, and unlock as "Available" as soon as the aggregation hub confirms the digital scale weight.',
      aBn: 'সংগ্রহের পরপরই পয়েন্ট "হাবে যাচাইাধীন" হিসেবে দেখায় এবং একত্রীকরণ হাবে ওজন নিশ্চিত হওয়ার সাথে সাথে "উপলব্ধ" ব্যালেন্সে যোগ হয়।'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF9F5] w-full max-w-md h-full flex flex-col border-l border-[#EDE4D8] shadow-2xl text-[#202B38] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#EDE4D8] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#25345C] text-[#C9F1DC] flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#202B38]">{t.help}</h2>
              <span className="text-xs text-[#53616D]">
                {lang === 'en' ? 'Support, FAQs & Disputes' : 'সহায়তা, প্রশ্ন ও অভিযোগ'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#FAF5EC] hover:bg-[#EDE4D8] flex items-center justify-center text-[#53616D] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Direct Emergency Contact Box */}
          <div className="p-4 bg-white rounded-2xl border border-[#EDE4D8] flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C9F1DC] text-[#12613F] flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-[#202B38] block">
                  {lang === 'en' ? 'Dispatch Helpline' : 'ডোরস্টেপ হেল্পলাইন'}
                </span>
                <span className="text-xs font-mono text-[#12613F] font-bold">
                  +880 9612-253265 (CLEAN)
                </span>
                <span className="text-[11px] text-[#53616D] block">
                  {lang === 'en' ? 'Daily 8:00 AM – 6:00 PM' : 'প্রতিদিন সকাল ৮:০০ – সন্ধ্যা ৬:০০'}
                </span>
              </div>
            </div>
          </div>

          {/* Report an Issue with a Collection */}
          <div className="p-4 bg-white rounded-2xl border border-[#EDE4D8] space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span className="font-bold text-sm text-[#202B38]">
                {lang === 'en' ? 'Report an Issue with a Pickup' : 'সংগ্রহ সংক্রান্ত সমস্যা বা অভিযোগ'}
              </span>
            </div>
            <p className="text-xs text-[#53616D] leading-relaxed">
              {lang === 'en'
                ? 'Did your collector not arrive during the scheduled window, or is there a discrepancy with your certified scale weight?'
                : 'কালেক্টর কি নির্ধারিত সময়ে আসেননি, অথবা স্কেলের ওজনে কোনো অমিল রয়েছে?'}
            </p>

            <button
              onClick={() => {
                onClose();
                onOpenFileDispute(bookingIdContext || bookings[0]?.id);
              }}
              className="w-full py-2.5 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-[#C9F1DC]" />
              <span>{t.getHelp}</span>
            </button>
          </div>

          {/* Quick Answers / FAQs */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#53616D] uppercase tracking-wider block">
              {lang === 'en' ? 'Common Questions' : 'সাধারণ প্রশ্নাবলী'}
            </span>

            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#EDE4D8] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setSelectedFaq(selectedFaq === idx ? null : idx)}
                  className="w-full p-3.5 text-left font-bold text-[#202B38] flex items-center justify-between gap-2 cursor-pointer hover:bg-[#FAF5EC]/50"
                >
                  <span>{lang === 'en' ? faq.qEn : faq.qBn}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-[#53616D] shrink-0 transition-transform ${
                      selectedFaq === idx ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {selectedFaq === idx && (
                  <div className="p-3.5 pt-0 text-xs text-[#53616D] leading-relaxed border-t border-[#FAF5EC]">
                    {lang === 'en' ? faq.aEn : faq.aBn}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sorting Guide Link */}
          {onOpenSortingGuide && (
            <button
              onClick={() => {
                onClose();
                onOpenSortingGuide();
              }}
              className="w-full p-3.5 bg-white border border-[#EDE4D8] rounded-2xl flex items-center justify-between text-left hover:bg-[#FAF5EC] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-[#12613F]" />
                <span className="font-bold text-[#202B38]">{t.sortingGuide}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#53616D]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
