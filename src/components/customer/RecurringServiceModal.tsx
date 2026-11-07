import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MaterialCategory } from '../../types';
import { useTranslation } from '../../utils/translations';
import { Modal } from '../common/Modal';
import { Check, CheckCircle2 } from 'lucide-react';

interface RecurringServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DAY_LABEL = {
  monday: { en: 'Monday', bn: 'সোমবার' },
  wednesday: { en: 'Wednesday', bn: 'বুধবার' },
  friday: { en: 'Friday', bn: 'শুক্রবার' }
} as const;

/** Form state lives here so it resets every time the modal opens. */
const RecurringForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { lang, savedLocations, selectedLocationId, requestRecurringService } = useApp();
  const currentLocation = savedLocations.find((l) => l.id === selectedLocationId) || savedLocations[0];

  const [frequency, setFrequency] = useState<'weekly' | 'biweekly'>('weekly');
  const [preferredDay, setPreferredDay] = useState<keyof typeof DAY_LABEL>('wednesday');
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialCategory[]>(['PET_BOTTLES', 'CARDBOARD_OCC']);
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleMaterial = (cat: MaterialCategory) => {
    if (selectedMaterials.includes(cat)) {
      if (selectedMaterials.length > 1) setSelectedMaterials(selectedMaterials.filter((m) => m !== cat));
    } else {
      setSelectedMaterials([...selectedMaterials, cat]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The preferred day is carried in the notes so the operator sees it.
    const noteText = [`Preferred day: ${DAY_LABEL[preferredDay].en}`, notes.trim()].filter(Boolean).join('. ');
    requestRecurringService(currentLocation.label, frequency, selectedMaterials, noteText);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4 py-2">
        <div className="w-12 h-12 rounded-full bg-[#C9F1DC] text-[#12613F] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h4 className="text-base font-bold text-[#202B38]">{lang === 'en' ? 'Request received' : 'অনুরোধ গৃহীত হয়েছে'}</h4>
          <p className="text-xs text-[#53616D]">
            {lang === 'en'
              ? `We have asked the operator to set up a ${frequency === 'weekly' ? 'weekly' : 'fortnightly'} pickup at ${currentLocation.label}, preferably on ${DAY_LABEL[preferredDay].en}s. You will get a confirmation once the schedule is approved.`
              : `${currentLocation.label} ঠিকানায় ${frequency === 'weekly' ? 'সাপ্তাহিক' : 'পাক্ষিক'} পিকআপ (পছন্দের বার: ${DAY_LABEL[preferredDay].bn}) চালুর অনুরোধ অপারেটরের কাছে পাঠানো হয়েছে। সূচি অনুমোদিত হলে আপনাকে জানানো হবে।`}
          </p>
        </div>
        <button type="button" onClick={onClose} className="w-full py-3 bg-[#124B3A] text-white rounded-2xl font-bold text-xs cursor-pointer">
          {lang === 'en' ? 'Done' : 'সম্পন্ন'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-xs">
      <fieldset className="space-y-2">
        <legend className="font-bold text-[#202B38] mb-2">{lang === 'en' ? 'Pickup frequency' : 'সংগ্রহের পৌনঃপুনিকতা'}</legend>
        <div className="grid grid-cols-2 gap-2">
          {(['weekly', 'biweekly'] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={frequency === f}
              onClick={() => setFrequency(f)}
              className={`p-3 rounded-2xl border text-center font-bold transition-all cursor-pointer ${
                frequency === f ? 'bg-[#124B3A] text-white border-[#124B3A] shadow-2xs' : 'bg-[#FAF5EC] text-[#202B38] border-[#EDE4D8]'
              }`}
            >
              {f === 'weekly' ? (lang === 'en' ? 'Weekly' : 'সাপ্তাহিক') : lang === 'en' ? 'Every 2 weeks' : 'পাক্ষিক (২ সপ্তাহে একবার)'}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="font-bold text-[#202B38] mb-2">{lang === 'en' ? 'Preferred collection day' : 'পছন্দের সংগ্রহের বার'}</legend>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(DAY_LABEL) as Array<keyof typeof DAY_LABEL>).map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={preferredDay === d}
              onClick={() => setPreferredDay(d)}
              className={`p-2.5 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                preferredDay === d ? 'bg-[#12613F] text-white border-[#12613F]' : 'bg-white text-[#53616D] border-[#EDE4D8]'
              }`}
            >
              {DAY_LABEL[d][lang]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="font-bold text-[#202B38] mb-2">{lang === 'en' ? 'Regular material streams' : 'নিয়মিত উপাদানসমূহ'}</legend>
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
                aria-pressed={isSelected}
                onClick={() => toggleMaterial(m.id as MaterialCategory)}
                className={`p-2.5 rounded-xl border text-left font-bold flex items-center justify-between transition-all cursor-pointer ${
                  isSelected ? 'bg-[#FAF5EC] border-[#124B3A] text-[#124B3A]' : 'bg-white border-[#EDE4D8] text-[#53616D]'
                }`}
              >
                <span>{m.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#12613F]" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-1">
        <label htmlFor="recurring-notes" className="font-bold text-[#202B38] block">
          {lang === 'en' ? 'Notes for the operator (optional)' : 'অপারেটরের জন্য মন্তব্য (ঐচ্ছিক)'}
        </label>
        <input
          id="recurring-notes"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-[#FAF5EC] border border-[#EDE4D8] rounded-xl p-2.5 text-xs"
        />
      </div>

      <button type="submit" className="w-full py-3.5 bg-[#124B3A] hover:bg-[#0E3A2D] text-white rounded-2xl font-bold text-xs shadow-xs transition-colors cursor-pointer">
        {lang === 'en' ? 'Request regular service' : 'নিয়মিত সেবার অনুরোধ করুন'}
      </button>
    </form>
  );
};

export const RecurringServiceModal: React.FC<RecurringServiceModalProps> = ({ isOpen, onClose }) => {
  const { lang, savedLocations, selectedLocationId } = useApp();
  const t = useTranslation(lang);
  const currentLocation = savedLocations.find((l) => l.id === selectedLocationId) || savedLocations[0];

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="sm"
      title={t.arrangeRegularCollection}
      description={currentLocation?.label}
      closeLabel={lang === 'en' ? 'Close' : 'বন্ধ করুন'}
    >
      <RecurringForm onClose={onClose} />
    </Modal>
  );
};
