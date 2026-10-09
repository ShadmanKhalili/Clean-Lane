import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MaterialCategory } from '../../types';
import { useTranslation } from '../../utils/translations';
import { X, Calendar, Check, RefreshCw, Sparkles, Building, CheckCircle2 } from 'lucide-react';

interface RecurringServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecurringServiceModal: React.FC<RecurringServiceModalProps> = ({ isOpen, onClose }) => {
  const { lang, savedLocations, selectedLocationId, requestRecurringService, showToast } = useApp();
  const t = useTranslation(lang);

  const currentLocation = savedLocations.find((l) => l.id === selectedLocationId) || savedLocations[0];

  const [frequency, setFrequency] = useState<'weekly' | 'biweekly'>('weekly');
  const [preferredDay, setPreferredDay] = useState<'monday' | 'wednesday' | 'friday'>('wednesday');
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialCategory[]>([
    'PET_BOTTLES',
    'CARDBOARD_OCC'
  ]);
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const toggleMaterial = (cat: MaterialCategory) => {
    if (selectedMaterials.includes(cat)) {
      if (selectedMaterials.length > 1) {
        setSelectedMaterials(selectedMaterials.filter((m) => m !== cat));
      }
    } else {
      setSelectedMaterials([...selectedMaterials, cat]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestRecurringService(currentLocation.label, frequency, selectedMaterials, notes);
    setIsSubmitted(true);
    showToast(
      lang === 'en'
        ? 'Regular recurring collection request registered!'
        : 'নিয়মিত বর্জ্য সংগ্রহের অনুরোধ গ্রহণ করা হয়েছে!'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-[#EDE4D8] shadow-2xl max-w-md w-full overflow-hidden text-[#202B38]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EDE4D8] bg-[#FFF9F0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#25345C] text-[#C9F1DC] flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#202B38]">
                {t.arrangeRegularCollection}
              </h3>
              <span className="text-xs text-[#53616D]">{currentLocation.label}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white border border-[#EDE4D8] flex items-center justify-center text-[#53616D] hover:bg-[#FAF5EC] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        {isSubmitted ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#C9F1DC] text-[#12613F] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-[#202B38]">
                {lang === 'en' ? 'Recurring Schedule Confirmed' : 'নিয়মিত সময়সূচী নিবন্ধিত হয়েছে'}
              </h4>
              <p className="text-xs text-[#53616D]">
                {lang === 'en'
                  ? `Your collector will visit ${currentLocation.label} on a ${frequency} basis.`
                  : `আপনার ঠিকানায় প্রতি ${frequency === 'weekly' ? 'সপ্তাহে' : 'দুই সপ্তাহে'} নিয়মিত পিকআপ পরিচালিত হবে।`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-[#25345C] text-white rounded-2xl font-bold text-xs"
            >
              {lang === 'en' ? 'Done' : 'সম্পন্ন'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
            <div className="space-y-2">
              <span className="font-bold text-[#202B38] block">
                {lang === 'en' ? 'Pickup Frequency' : 'সংগ্রহের পৌনঃপুনিকতা'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFrequency('weekly')}
                  className={`p-3 rounded-2xl border text-center font-bold transition-all cursor-pointer ${
                    frequency === 'weekly'
                      ? 'bg-[#25345C] text-white border-[#25345C] shadow-2xs'
                      : 'bg-[#FAF5EC] text-[#202B38] border-[#EDE4D8]'
                  }`}
                >
                  {lang === 'en' ? 'Weekly (প্রতি সপ্তাহে)' : 'সাপ্তাহিক'}
                </button>
                <button
                  type="button"
                  onClick={() => setFrequency('biweekly')}
                  className={`p-3 rounded-2xl border text-center font-bold transition-all cursor-pointer ${
                    frequency === 'biweekly'
                      ? 'bg-[#25345C] text-white border-[#25345C] shadow-2xs'
                      : 'bg-[#FAF5EC] text-[#202B38] border-[#EDE4D8]'
                  }`}
                >
                  {lang === 'en' ? 'Bi-Weekly (২ সপ্তাহে একবার)' : 'পাক্ষিক'}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-[#202B38] block">
                {lang === 'en' ? 'Preferred Collection Day' : 'পছন্দের সংগ্রহের বার'}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'monday', label: lang === 'en' ? 'Monday' : 'সোমবার' },
                  { id: 'wednesday', label: lang === 'en' ? 'Wednesday' : 'বুধবার' },
                  { id: 'friday', label: lang === 'en' ? 'Friday' : 'শুক্রবার' }
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setPreferredDay(d.id as any)}
                    className={`p-2.5 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                      preferredDay === d.id
                        ? 'bg-[#12613F] text-white border-[#12613F]'
                        : 'bg-white text-[#53616D] border-[#EDE4D8]'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-[#202B38] block">
                {lang === 'en' ? 'Regular Material Streams' : 'নিয়মিত উপাদানসমূহ'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'PET_BOTTLES', label: lang === 'en' ? 'Plastic bottles' : 'প্লাস্টিক বোতল' },
                  { id: 'CARDBOARD_OCC', label: lang === 'en' ? 'Paper & cardboard' : 'কাগজ ও কার্টন' },
                  { id: 'ALUMINUM_CANS', label: lang === 'en' ? 'Cans & metal' : 'ক্যান ও টিন' },
                  { id: 'HDPE_RIGID', label: lang === 'en' ? 'Rigid containers' : 'কঠিন প্লাস্টিক' }
                ].map((m) => {
                  const isSelected = selectedMaterials.includes(m.id as MaterialCategory);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleMaterial(m.id as MaterialCategory)}
                      className={`p-2.5 rounded-xl border text-left font-bold flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FAF5EC] border-[#25345C] text-[#25345C]'
                          : 'bg-white border-[#EDE4D8] text-[#53616D]'
                      }`}
                    >
                      <span>{m.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#12613F]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-2xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              {lang === 'en' ? 'Confirm Regular Service' : 'নিয়মিত সেবা নিশ্চিত করুন'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
