import React, { useState } from 'react';
import { EvidenceLevel, EVIDENCE_LEVELS } from '../../types';
import { useApp } from '../../context/AppContext';
import { Info, X, ShieldCheck } from 'lucide-react';

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

  return (
    <>
      <button
        type="button"
        onClick={() => interactive && setShowDetail(true)}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-medium ${style.bg} ${style.text} transition-opacity hover:opacity-85 text-left`}
        title={`Evidence Level ${level}: ${info.customerLabel}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
        <span className="font-mono font-bold tracking-tight">{level}</span>
        <span aria-hidden="true">·</span>
        <span>{lang === 'en' ? info.customerLabel : info.customerLabelBn}</span>
        {interactive && <Info className="w-3 h-3 ml-0.5 opacity-60" />}
      </button>

      {/* Truth in Labelling Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${style.bg}`}>
                  <ShieldCheck className={`w-5 h-5 ${style.text}`} />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900">
                    Evidence Level {level}: {info.customerLabel}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">
                    Truth in Labelling Protocol (PRD § 9.3)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-xs font-semibold text-slate-700 block mb-1">
                  What this milestone guarantees:
                </span>
                <p className="text-xs leading-relaxed text-slate-600">{info.description}</p>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1">
                  Allowed customer wording:
                </span>
                <p className="text-xs font-mono bg-emerald-50 text-emerald-800 p-2 rounded-md">
                  "{info.allowedWording}"
                </p>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-lg text-xs text-amber-900 leading-relaxed">
                <strong>PRD Rule § 1.3 Safeguard:</strong> The system strictly prohibits labeling a pickup as "recycled" or "recovery complete" before downstream E4 verification.
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowDetail(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
