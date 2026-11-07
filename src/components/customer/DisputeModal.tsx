import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { AlertCircle, Phone, Camera, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatBookingDate } from './dates';
import { useCustomerData } from './useCustomerData';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string;
}

type ComplaintType = 'MISSED_COLLECTION' | 'WEIGHT_DISCREPANCY' | 'POINTS_CALCULATION' | 'BEHAVIOR' | 'OTHER';

const ISSUE_CHOICES: Array<{ id: ComplaintType; labelEn: string; labelBn: string; descEn: string; descBn: string }> = [
  {
    id: 'MISSED_COLLECTION',
    labelEn: 'Collector did not arrive',
    labelBn: 'কালেক্টর উপস্থিত হননি',
    descEn: 'Window passed without collection attempt',
    descBn: 'নির্ধারিত সময় পেরিয়ে গেছে কিন্তু কেউ আসেননি'
  },
  {
    id: 'WEIGHT_DISCREPANCY',
    labelEn: 'Weight or points seem incorrect',
    labelBn: 'ওজন বা পয়েন্ট অমিল',
    descEn: 'Discrepancy between home measurement and receipt',
    descBn: 'বাসার ওজন ও রসিদের ওজনে অমিল'
  },
  {
    id: 'POINTS_CALCULATION',
    labelEn: 'Material was left behind',
    labelBn: 'উপকরণ রেখে যাওয়া হয়েছে',
    descEn: 'Eligible segregated stream was rejected',
    descBn: 'আলাদা করা উপযুক্ত উপাদান নেওয়া হয়নি'
  },
  {
    id: 'BEHAVIOR',
    labelEn: 'Staff or access conduct',
    labelBn: 'আচরণ বা প্রবেশ সংক্রান্ত সমস্যা',
    descEn: 'Punctuality, identification, or property care',
    descBn: 'সময়ানুবর্তিতা, পরিচয় বা সম্পত্তির যত্ন'
  },
  {
    id: 'OTHER',
    labelEn: 'Other question or problem',
    labelBn: 'অন্যান্য জিজ্ঞাসা বা সমস্যা',
    descEn: 'General service or location inquiry',
    descBn: 'সাধারণ সেবা বা ঠিকানা সংক্রান্ত জিজ্ঞাসা'
  }
];

/** "+880 1712 345678" -> "+880 17•• •••678" */
const maskPhone = (phone: string) => phone.replace(/(\d{2})\d+(\d{3})$/, '$1•• •••$2');

/**
 * The form lives in a child component so every open starts from fresh props
 * (the Modal unmounts its children while closed).
 */
const DisputeForm: React.FC<{ presetBookingId?: string; onClose: () => void }> = ({ presetBookingId, onClose }) => {
  const { lang, fileComplaint } = useApp();
  const { myBookings, customer } = useCustomerData();

  const initialBooking =
    presetBookingId && myBookings.some((b) => b.id === presetBookingId) ? presetBookingId : '';
  const [selectedBooking, setSelectedBooking] = useState(initialBooking);
  const [complaintType, setComplaintType] = useState<ComplaintType>('MISSED_COLLECTION');
  const [description, setDescription] = useState('');
  const [photoAdded, setPhotoAdded] = useState(false);
  const [caseRef, setCaseRef] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const note = photoAdded ? `${description} [Customer attached a photo]`.trim() : description;
    const id = fileComplaint(complaintType, note || 'Customer submitted issue via Clean Lane app.', selectedBooking || undefined);
    setCaseRef(id);
  };

  if (caseRef) {
    return (
      <div className="space-y-4 text-center py-2 text-xs">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
        </div>
        <div>
          <h4 className="text-base font-bold text-slate-900">{lang === 'en' ? 'Support case received' : 'অভিযোগ গৃহীত হয়েছে'}</h4>
          <p className="text-slate-500 text-xs mt-1">
            {lang === 'en'
              ? 'Our Clean Lane dispatch team has logged your case for review.'
              : 'আমাদের ডিসপ্যাচ টিম আপনার বিষয়টি পর্যালোচনার জন্য নথিভুক্ত করেছে।'}
          </p>
        </div>
        <dl className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2">
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">{lang === 'en' ? 'Case reference' : 'কেস রেফারেন্স'}</dt>
            <dd className="font-mono font-bold text-slate-900">{caseRef}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">{lang === 'en' ? 'Status' : 'অবস্থা'}</dt>
            <dd className="font-bold text-amber-800">{lang === 'en' ? 'Open — in queue' : 'গৃহীত — অপেক্ষমাণ'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">{lang === 'en' ? 'Updates sent to' : 'আপডেট যাবে'}</dt>
            <dd className="font-mono text-slate-700">{maskPhone(customer.phone)} (SMS)</dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[48px] px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold cursor-pointer transition-all"
        >
          {lang === 'en' ? 'Done' : 'সম্পন্ন'}
        </button>
      </div>
    );
  }

  const linked = myBookings.find((b) => b.id === selectedBooking);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
      <div className="space-y-1">
        <label htmlFor="dispute-booking" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
          {lang === 'en' ? 'Linked pickup' : 'সম্পর্কিত বুকিং'}
        </label>
        <select
          id="dispute-booking"
          value={selectedBooking}
          onChange={(e) => setSelectedBooking(e.target.value)}
          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
        >
          <option value="">{lang === 'en' ? 'General account question' : 'সাধারণ জিজ্ঞাসা (কোনো নির্দিষ্ট পিকআপ নয়)'}</option>
          {myBookings.map((b) => (
            <option key={b.id} value={b.id}>
              #{b.id} · {formatBookingDate(b.scheduledDate, lang)}
            </option>
          ))}
        </select>
        {linked && <p className="text-[11px] text-slate-500">{linked.address.split(',')[0]}</p>}
      </div>

      <fieldset className="space-y-2">
        <legend className="font-bold text-slate-800 text-xs mb-1">{lang === 'en' ? 'What went wrong?' : 'কী সমস্যা হয়েছে?'}</legend>
        {ISSUE_CHOICES.map((choice) => (
          <label
            key={choice.id}
            className={`w-full p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-start justify-between gap-3 min-h-[48px] ${
              complaintType === choice.id ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20' : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <span>
              <span className="font-bold text-slate-900 text-xs block">{lang === 'en' ? choice.labelEn : choice.labelBn}</span>
              <span className="text-[11px] text-slate-500 block">{lang === 'en' ? choice.descEn : choice.descBn}</span>
            </span>
            <input
              type="radio"
              name="complaint-type"
              value={choice.id}
              checked={complaintType === choice.id}
              onChange={() => setComplaintType(choice.id)}
              className="mt-0.5 accent-emerald-700"
            />
          </label>
        ))}
      </fieldset>

      <div className="space-y-1">
        <label htmlFor="dispute-details" className="font-bold text-slate-800 block text-xs">
          {lang === 'en' ? 'Additional details (optional)' : 'বিস্তারিত বিবরণ (ঐচ্ছিক)'}
        </label>
        <textarea
          id="dispute-details"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={lang === 'en' ? 'e.g. Collector was delayed past 11:30 AM without notice...' : 'সংক্ষিপ্ত বিবরণ লিখুন...'}
          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-slate-500" aria-hidden="true" />
          <span className="text-xs text-slate-700 font-medium">{lang === 'en' ? 'Attach photo proof' : 'ছবি যোগ করুন'}</span>
        </div>
        <button
          type="button"
          aria-pressed={photoAdded}
          onClick={() => setPhotoAdded(!photoAdded)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border ${
            photoAdded ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
          }`}
        >
          {photoAdded ? (lang === 'en' ? 'Photo attached' : 'ছবি যুক্ত হয়েছে') : lang === 'en' ? '+ Add photo' : '+ ছবি দিন'}
        </button>
      </div>

      <div className="p-3 bg-slate-100 rounded-2xl flex items-center justify-between text-[11px] text-slate-600">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-slate-500" aria-hidden="true" />
          <span>{lang === 'en' ? 'Prefer speaking to support?' : 'সাপোর্টে কথা বলতে চান?'}</span>
        </div>
        <a href="tel:09612253265" className="font-bold text-emerald-800 hover:underline">
          09612-253265
        </a>
      </div>

      <button
        type="submit"
        className="w-full min-h-[48px] px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
      >
        <span>{lang === 'en' ? 'Send issue' : 'অভিযোগ পাঠান'}</span>
        <ArrowRight className="w-4 h-4 text-emerald-400" aria-hidden="true" />
      </button>
    </form>
  );
};

export const DisputeModal: React.FC<DisputeModalProps> = ({ isOpen, onClose, bookingId }) => {
  const { lang } = useApp();
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700" aria-hidden="true" />
          {lang === 'en' ? 'Help & support issue' : 'সহায়তা ও অভিযোগ'}
        </span>
      }
      closeLabel={lang === 'en' ? 'Close' : 'বন্ধ করুন'}
    >
      <DisputeForm presetBookingId={bookingId} onClose={onClose} />
    </Modal>
  );
};
