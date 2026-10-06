import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  AlertCircle,
  HelpCircle,
  Phone,
  Camera,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Clock
} from 'lucide-react';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({ isOpen, onClose, bookingId }) => {
  const { lang, bookings, fileComplaint } = useApp();

  const [selectedBooking, setSelectedBooking] = useState(bookingId || bookings[0]?.id || '');
  const [complaintType, setComplaintType] = useState<
    'MISSED_COLLECTION' | 'WEIGHT_DISCREPANCY' | 'POINTS_CALCULATION' | 'BEHAVIOR' | 'OTHER'
  >('MISSED_COLLECTION');
  const [description, setDescription] = useState('');
  const [photoAdded, setPhotoAdded] = useState(false);

  // Post-submission state
  const [caseSubmittedRef, setCaseSubmittedRef] = useState<string | null>(null);

  if (!isOpen) return null;

  const linkedBookingObj = bookings.find((b) => b.id === selectedBooking);

  const issueChoices: Array<{
    id: typeof complaintType;
    labelEn: string;
    labelBn: string;
    descEn: string;
  }> = [
    {
      id: 'MISSED_COLLECTION',
      labelEn: 'Collector did not arrive',
      labelBn: 'কালেক্টর উপস্থিত হননি',
      descEn: 'Window passed without collection attempt'
    },
    {
      id: 'WEIGHT_DISCREPANCY',
      labelEn: 'Weight or points seem incorrect',
      labelBn: 'ওজন বা পয়েন্ট অমিল',
      descEn: 'Discrepancy between home measurement and receipt'
    },
    {
      id: 'POINTS_CALCULATION',
      labelEn: 'Material was left behind',
      labelBn: 'উপকরণ রেখে যাওয়া হয়েছে',
      descEn: 'Eligible segregated stream was rejected'
    },
    {
      id: 'BEHAVIOR',
      labelEn: 'Staff or access conduct',
      labelBn: 'আচরণ বা প্রবেশ সংক্রান্ত সমস্যা',
      descEn: 'Punctuality, identification, or property care'
    },
    {
      id: 'OTHER',
      labelEn: 'Other question or problem',
      labelBn: 'অন্যান্য জিজ্ঞাসা বা সমস্যা',
      descEn: 'General service or location inquiry'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const caseRef = `CASE-${Date.now().toString().slice(-5)}`;
    fileComplaint(complaintType, description || 'Customer submitted issue via Clean Lane app.', selectedBooking);
    setCaseSubmittedRef(caseRef);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[94vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {lang === 'en' ? 'Help & Support Issue' : 'সহায়তা ও অভিযোগ'}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {caseSubmittedRef ? `Ref: ${caseSubmittedRef}` : 'Screen C18'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-700 flex-1">
          {caseSubmittedRef ? (
            /* Post-Submission State (PRD C18 requirement) */
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {lang === 'en' ? 'Support Case Received' : 'অভিযোগ গৃহীত হয়েছে'}
                </h4>
                <p className="text-slate-500 text-xs mt-1">
                  {lang === 'en'
                    ? 'Our Clean Lane dispatch team has logged your case for immediate review.'
                    : 'আমাদের ডিসপ্যাচ টিম আপনার বিষয়টি অগ্রাধিকার ভিত্তিতে পর্যালোচনা করছে।'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Case Reference:</span>
                  <span className="font-bold text-slate-900">{caseSubmittedRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Status:</span>
                  <span className="font-bold text-amber-800 font-sans">SUBMITTED (In queue)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Updates sent to:</span>
                  <span className="text-slate-700">+880 17•• •••877 (SMS)</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full min-h-[48px] px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold cursor-pointer transition-all"
                >
                  {lang === 'en' ? 'Return to Home' : 'হোমে ফিরে যান'}
                </button>
              </div>
            </div>
          ) : (
            /* Submission Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Linked Booking Context (Prefilled automatically) */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {lang === 'en' ? 'Linked Booking / Collection' : 'সম্পর্কিত বুকিং'}
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 text-xs">
                    {selectedBooking || 'General Account Inquiry'}
                  </span>
                  {linkedBookingObj && (
                    <span className="text-slate-500 text-[11px]">
                      {linkedBookingObj.scheduledDate} · {linkedBookingObj.address.split(',')[0]}
                    </span>
                  )}
                </div>
              </div>

              {/* Recognisable Issue Choices (C18 cards) */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 block text-xs">
                  {lang === 'en' ? 'What went wrong?' : 'কী সমস্যা হয়েছে?'}
                </label>
                <div className="space-y-2">
                  {issueChoices.map((choice) => (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => setComplaintType(choice.id)}
                      className={`w-full p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-start justify-between min-h-[48px] ${
                        complaintType === choice.id
                          ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">
                          {lang === 'en' ? choice.labelEn : choice.labelBn}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {choice.descEn}
                        </span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          complaintType === choice.id
                            ? 'border-emerald-600 bg-emerald-600'
                            : 'border-slate-300'
                        }`}
                      >
                        {complaintType === choice.id && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Short Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block text-xs">
                  {lang === 'en' ? 'Additional details (optional)' : 'বিস্তারিত বিবরণ (ঐচ্ছিক)'}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    lang === 'en'
                      ? 'e.g. Collector was delayed past 11:30 AM without notice...'
                      : 'সংক্ষিপ্ত বিবরণ লিখুন...'
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Optional Photo */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-slate-500" />
                  <span className="text-xs text-slate-700 font-medium">
                    {lang === 'en' ? 'Attach photo proof' : 'ছবি যোগ করুন'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPhotoAdded(!photoAdded)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border ${
                    photoAdded
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {photoAdded
                    ? lang === 'en' ? 'Photo attached' : 'ছবি যুক্ত হয়েছে'
                    : lang === 'en' ? '+ Add photo' : '+ ছবি দিন'}
                </button>
              </div>

              {/* Assisted Phone Support Path */}
              <div className="p-3 bg-slate-100 rounded-2xl flex items-center justify-between text-[11px] text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <span>{lang === 'en' ? 'Prefer speaking to support?' : 'সাপোর্টে কথা বলতে চান?'}</span>
                </div>
                <a href="tel:09612253265" className="font-bold text-emerald-800 hover:underline">
                  09612-253265
                </a>
              </div>

              {/* Primary Action Button (C18 specification: "Send issue") */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full min-h-[48px] px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                >
                  <span>{lang === 'en' ? 'Send issue' : 'অভিযোগ পাঠান'}</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
