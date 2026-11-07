import React, { useState } from 'react';
import { EvidenceLevel, EVIDENCE_LEVELS } from '../../types';
import { useApp } from '../../context/AppContext';
import { Info, ShieldCheck } from 'lucide-react';
import { Modal } from './Modal';

interface EvidenceBadgeProps {
  level: EvidenceLevel;
  interactive?: boolean;
}

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({ level, interactive = true }) => {
  const { lang } = useApp();
  const [showDetail, setShowDetail] = useState(false);
  const info = EVIDENCE_LEVELS[level];

  // Visual cues with anti-slop clean text & subtle color markers (no rounded candy pills)
  const levelStyles: Record<EvidenceLevel, { text: string; bg: string; dot: string }> = {
    E0: { text: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-400' },
    E1: { text: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
    E2: { text: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
    E3: { text: 'text-cyan-800', bg: 'bg-cyan-50', dot: 'bg-cyan-600' },
    E4: { text: 'text-indigo-800', bg: 'bg-indigo-50', dot: 'bg-indigo-600' },
    E5: { text: 'text-emerald-900', bg: 'bg-emerald-100', dot: 'bg-emerald-700' }
  };

  const style = levelStyles[level];

  const chipClass = `inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-medium ${style.bg} ${style.text} text-left`;
  const chipBody = (
    <>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      <span className="font-mono font-bold tracking-tight">{level}</span>
      <span aria-hidden="true">·</span>
      <span>{lang === 'en' ? info.customerLabel : info.customerLabelBn}</span>
      {interactive && <Info className="w-3 h-3 ml-0.5 opacity-60" aria-hidden="true" />}
    </>
  );

  return (
    <>
      {interactive ? (
        <button
          type="button"
          onClick={() => setShowDetail(true)}
          className={`${chipClass} transition-opacity hover:opacity-85 cursor-pointer`}
          title={`Evidence Level ${level}: ${info.customerLabel}`}
        >
          {chipBody}
        </button>
      ) : (
        // Non-interactive badges render as plain text so they can sit inside a clickable card.
        <span className={chipClass} title={`Evidence Level ${level}: ${info.customerLabel}`}>
          {chipBody}
        </span>
      )}

      <Modal
        open={showDetail}
        onClose={() => setShowDetail(false)}
        size="sm"
        title={
          <span className="flex items-center gap-2">
            <span className={`p-1.5 rounded-lg ${style.bg}`}>
              <ShieldCheck className={`w-4 h-4 ${style.text}`} aria-hidden="true" />
            </span>
            {lang === 'en' ? `Evidence Level ${level}: ${info.customerLabel}` : `প্রমাণ স্তর ${level}: ${info.customerLabelBn}`}
          </span>
        }
        closeLabel={lang === 'en' ? 'Close' : 'বন্ধ করুন'}
        footer={
          <button
            type="button"
            onClick={() => setShowDetail(false)}
            className="w-full px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            {lang === 'en' ? 'Close explanation' : 'বন্ধ করুন'}
          </button>
        }
      >
        <div className="space-y-3 text-sm text-slate-600">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-xs font-semibold text-slate-700 block mb-1">
              {lang === 'en' ? 'What this milestone guarantees:' : 'এই ধাপে যা নিশ্চিত করা হয়:'}
            </span>
            <p className="text-xs leading-relaxed text-slate-600">{info.description}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-700 block mb-1">
              {lang === 'en' ? 'Wording we use at this stage:' : 'এই ধাপে আমরা যে শব্দ ব্যবহার করি:'}
            </span>
            <p className="text-xs font-mono bg-emerald-50 text-emerald-800 p-2 rounded-md">
              “{lang === 'en' ? info.allowedWording : info.customerLabelBn}”
            </p>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-lg text-xs text-amber-900 leading-relaxed">
            {lang === 'en' ? (
              <>
                <strong>Truth in labelling:</strong> a pickup is never described as “recycled” or “recovery complete” before the recycler’s processing outcome (E4) is confirmed.
              </>
            ) : (
              <>
                <strong>সত্য তথ্যের নীতি:</strong> রিসাইক্লারের প্রক্রিয়াকরণ ফলাফল (E4) নিশ্চিত হওয়ার আগে কোনো পিকআপকে “রিসাইকেল সম্পন্ন” বলা হয় না।
              </>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};
