import React, { useState } from 'react';
import { MATERIAL_TAXONOMY } from '../../data/mockData';
import { MaterialCategory } from '../../types';
import { useApp } from '../../context/AppContext';
import { Check, X, AlertTriangle, Sparkles } from 'lucide-react';

interface MaterialGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory?: (category: MaterialCategory) => void;
}

export const MaterialGuideModal: React.FC<MaterialGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectCategory
}) => {
  const { lang } = useApp();
  const [selectedCat, setSelectedCat] = useState<MaterialCategory>('PET_BOTTLES');

  if (!isOpen) return null;

  const currentInfo = MATERIAL_TAXONOMY[selectedCat];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {lang === 'en' ? 'Clean Lane Material Segregation Guide' : 'ক্লিন লেন বর্জ্য পৃথকীকরণ নির্দেশিকা'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'en'
                ? 'Only clean, dry, and segregated materials enter the approved recovery chain.'
                : 'কেবলমাত্র পরিষ্কার, শুকনো ও আলাদা করা উপকরণ অনুমোদিত চেইনে নেওয়া হয়।'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto">
          {Object.values(MATERIAL_TAXONOMY).map((mat) => (
            <button
              key={mat.id}
              onClick={() => setSelectedCat(mat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCat === mat.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              {lang === 'en' ? mat.name.split(' ')[0] : mat.nameBn.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-slate-900">
                {lang === 'en' ? currentInfo.name : currentInfo.nameBn}
              </h4>
              <div className="text-xs text-slate-600 flex items-center gap-2">
                <span>Value: ৳{currentInfo.unitValueBdtPerKg}/kg</span>
                <span>·</span>
                <span className="font-semibold text-emerald-700">+{currentInfo.rewardPointsPerKg} pts/kg</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-1">{currentInfo.description}</p>
          </div>

          {/* Preparation Instructions */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs mb-1.5">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>{lang === 'en' ? 'Preparation Instructions' : 'প্রস্তুতির নিয়মাবলী'}</span>
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed">
              {lang === 'en' ? currentInfo.prepInstructions : currentInfo.prepInstructionsBn}
            </p>
          </div>

          {/* Prohibited Contaminants */}
          <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-4">
            <div className="flex items-center gap-2 text-rose-900 font-semibold text-xs mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{lang === 'en' ? 'Forbidden Contaminants (Will Cause Load Rejection)' : 'নিষিদ্ধ উপাদান (যা থাকলে গ্রহণ করা হবে না)'}</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-rose-950">
              {currentInfo.excludedContaminants.map((contam, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{contam}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* General Safe Clean Lane Rule */}
          <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600">
            <strong>Clean Lane Principle:</strong> Medical sharps, contaminated biological waste, wet kitchen garbage, and hazardous batteries must never be mixed into recovery sacks.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Guidelines approved for Dhaka Clean Lane Zone Pilot
          </span>
          <div className="flex items-center gap-2">
            {onSelectCategory && (
              <button
                onClick={() => {
                  onSelectCategory(selectedCat);
                  onClose();
                }}
                className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 transition-colors"
              >
                Select this category
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg text-xs font-medium hover:bg-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
