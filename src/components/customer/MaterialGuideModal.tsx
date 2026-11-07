import React, { useState } from 'react';
import { MATERIAL_TAXONOMY } from '../../data/mockData';
import { MaterialCategory } from '../../types';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { X, AlertTriangle, Sparkles } from 'lucide-react';

interface MaterialGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory?: (category: MaterialCategory) => void;
}

export const MaterialGuideModal: React.FC<MaterialGuideModalProps> = ({ isOpen, onClose, onSelectCategory }) => {
  const { lang } = useApp();
  const [selectedCat, setSelectedCat] = useState<MaterialCategory>('PET_BOTTLES');

  const currentInfo = MATERIAL_TAXONOMY[selectedCat];

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="lg"
      title={lang === 'en' ? 'Clean Lane Material Segregation Guide' : 'ক্লিন লেন বর্জ্য পৃথকীকরণ নির্দেশিকা'}
      description={
        lang === 'en'
          ? 'Only clean, dry, and segregated materials enter the approved recovery chain.'
          : 'কেবলমাত্র পরিষ্কার, শুকনো ও আলাদা করা উপকরণ অনুমোদিত চেইনে নেওয়া হয়।'
      }
      closeLabel={lang === 'en' ? 'Close' : 'বন্ধ করুন'}
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            {lang === 'en' ? 'Guidelines approved for the Dhaka Clean Lane pilot' : 'ঢাকা ক্লিন লেন পাইলটের জন্য অনুমোদিত নির্দেশিকা'}
          </span>
          <div className="flex items-center gap-2">
            {onSelectCategory && (
              <button
                type="button"
                onClick={() => {
                  onSelectCategory(selectedCat);
                  onClose();
                }}
                className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                {lang === 'en' ? 'Select this category' : 'এই ধরনটি বেছে নিন'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg text-xs font-medium hover:bg-slate-300 transition-colors cursor-pointer"
            >
              {lang === 'en' ? 'Close' : 'বন্ধ করুন'}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 text-sm">
        <div role="tablist" aria-label={lang === 'en' ? 'Material type' : 'উপাদানের ধরন'} className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {Object.values(MATERIAL_TAXONOMY).map((mat) => (
            <button
              key={mat.id}
              type="button"
              role="tab"
              aria-selected={selectedCat === mat.id}
              onClick={() => setSelectedCat(mat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedCat === mat.id ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              {lang === 'en' ? mat.name.split(' ')[0] : mat.nameBn.split(' ')[0]}
            </button>
          ))}
        </div>

        <div role="tabpanel" className="space-y-5">
          <div>
            <h4 className="text-base font-semibold text-slate-900">{lang === 'en' ? currentInfo.name : currentInfo.nameBn}</h4>
            <p className="text-xs text-slate-600 mt-1">{currentInfo.description}</p>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs mb-1.5">
              <Sparkles className="w-4 h-4 text-emerald-700" aria-hidden="true" />
              <span>{lang === 'en' ? 'Preparation instructions' : 'প্রস্তুতির নিয়মাবলী'}</span>
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed">{lang === 'en' ? currentInfo.prepInstructions : currentInfo.prepInstructionsBn}</p>
          </div>

          <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-4">
            <div className="flex items-center gap-2 text-rose-900 font-semibold text-xs mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" aria-hidden="true" />
              <span>{lang === 'en' ? 'Not accepted (a load with these may be rejected)' : 'নিষিদ্ধ উপাদান (যা থাকলে গ্রহণ করা হবে না)'}</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-rose-950">
              {currentInfo.excludedContaminants.map((contam, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5 text-rose-600 shrink-0" aria-hidden="true" />
                  <span>{contam}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600">
            {lang === 'en' ? (
              <>
                <strong>Clean Lane principle:</strong> medical sharps, contaminated biological waste, wet kitchen garbage and hazardous batteries must never be mixed into recovery sacks.
              </>
            ) : (
              <>
                <strong>ক্লিন লেন নীতি:</strong> ধারালো চিকিৎসা সরঞ্জাম, দূষিত জৈব বর্জ্য, ভেজা রান্নাঘরের আবর্জনা ও ক্ষতিকর ব্যাটারি কখনোই সংগ্রহের বস্তায় মেশাবেন না।
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
