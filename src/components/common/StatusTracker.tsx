import React from 'react';
import { EvidenceLevel, EVIDENCE_LEVELS } from '../../types';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface StatusTrackerProps {
  currentLevel: EvidenceLevel;
  className?: string;
  notes?: string;
}

export const StatusTracker: React.FC<StatusTrackerProps> = ({ currentLevel, className = '', notes }) => {
  const { lang } = useApp();
  const levels: EvidenceLevel[] = ['E0', 'E1', 'E2', 'E3', 'E4'];

  const levelOrder: Record<EvidenceLevel, number> = {
    E0: 0,
    E1: 1,
    E2: 2,
    E3: 3,
    E4: 4,
    E5: 5
  };

  const currentIndex = levelOrder[currentLevel];

  return (
    <div className={`p-4 bg-white rounded-xl border border-slate-200 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {lang === 'en' ? 'Evidence Milestones' : 'প্রমাণ মাইলফলক'}
        </span>
        <span className="text-xs font-mono text-slate-500">
          Level {currentLevel} · {EVIDENCE_LEVELS[currentLevel].customerLabel}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2 relative">
        {levels.map((lvl, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const info = EVIDENCE_LEVELS[lvl];

          return (
            <div key={lvl} className="flex flex-col items-center text-center">
              <div className="relative mb-2 flex items-center justify-center">
                {isCompleted ? (
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    isCurrent ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {isCurrent ? <Clock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-4 h-4" />}
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                    <Circle className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <span className={`text-[11px] font-bold font-mono ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                {lvl}
              </span>
              <span className={`text-[10px] leading-tight line-clamp-2 mt-0.5 ${isCurrent ? 'font-semibold text-emerald-800' : 'text-slate-500'}`}>
                {lang === 'en' ? info.customerLabel : info.customerLabelBn}
              </span>
            </div>
          );
        })}
      </div>

      {notes && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-start gap-1.5">
          <span className="text-slate-400 font-medium">Audit note:</span>
          <span className="text-slate-700">{notes}</span>
        </div>
      )}
    </div>
  );
};
