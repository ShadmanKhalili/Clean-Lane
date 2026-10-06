import React from 'react';
import { useApp } from '../../context/AppContext';
import { EVIDENCE_LEVELS, EvidenceLevel } from '../../types';
import { ShieldCheck, AlertOctagon, CheckCircle2, Scale, BookOpen } from 'lucide-react';

export const EvidenceModelView: React.FC = () => {
  const { lang } = useApp();

  const rules: EvidenceLevel[] = ['E0', 'E1', 'E2', 'E3', 'E4', 'E5'];

  const bannedPrematurePhrases: Record<EvidenceLevel, string> = {
    E0: 'Never say: "Recycled", "Collected", or "Diverted from landfill".',
    E1: 'Never say: "Recycled", "Diverted", or "EPR obligation fulfilled". Only "Collected".',
    E2: 'Never say: "Processed" or "Carbon offset generated". Only "Quantity confirmed".',
    E3: 'Never say: "Recycling completed". Only "Entered approved recovery chain".',
    E4: 'Can say: "Processing outcome confirmed". Not automatically certified for third-party regulatory claims without E5 package.',
    E5: 'Full defensible wording authorized for specified brand/producer campaign.'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Truth in Claims & Anti-Greenwashing Standard</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {lang === 'en' ? 'Evidence Taxonomy & Claims Protocol (E0–E5)' : 'প্রমাণ স্তর ও সত্যনিষ্ঠ দাবি মানদণ্ড'}
        </h1>
        <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
          <strong>The Critical Distinction (PRD § 1.3):</strong> A collection request is not a pickup. A pickup is not a confirmed weight. A confirmed weight is not an approved recovery chain entry. Entering a recovery chain is not a confirmed processing outcome. And a processing outcome is not an unallocated EPR claim.
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="space-y-4">
        {rules.map((lvl) => {
          const info = EVIDENCE_LEVELS[lvl];
          const banned = bannedPrematurePhrases[lvl];

          return (
            <div
              key={lvl}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-sm">
                    {lvl}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{info.customerLabel}</h3>
                    <span className="text-xs text-slate-500 font-mono">
                      {lang === 'en' ? info.allowedWording : info.customerLabelBn}
                    </span>
                  </div>
                </div>

                <div className="text-xs font-mono text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg self-start sm:self-auto">
                  Permitted Wording: "{info.allowedWording}"
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="font-semibold text-slate-700 block">
                    Underlying Physical Milestone:
                  </span>
                  <p className="text-slate-600 leading-relaxed">{info.description}</p>
                </div>

                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl space-y-1">
                  <span className="font-semibold text-rose-900 flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                    Prohibited Premature Claims (PRD § 3)
                  </span>
                  <p className="text-rose-950 text-[11px] leading-relaxed">{banned}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ten Product Principles Box */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 space-y-4">
        <h3 className="text-lg font-bold tracking-tight">The 10 Clean Lane Architectural Principles (PRD § 3)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div>
            <strong className="text-white block mb-0.5">1. Service first</strong>
            A reward cannot compensate for an unreliable collection.
          </div>
          <div>
            <strong className="text-white block mb-0.5">2. Truthful status</strong>
            Never label a pickup as recycling or verified recovery.
          </div>
          <div>
            <strong className="text-white block mb-0.5">3. Low-friction participation</strong>
            Customers shouldn't need a waste degree to separate materials cleanly.
          </div>
          <div>
            <strong className="text-white block mb-0.5">4. Worker-inclusive design</strong>
            Field workflow works under real street conditions with offline resilience.
          </div>
          <div>
            <strong className="text-white block mb-0.5">5. Configurable commercial models</strong>
            Maintain distinct ledgers for service fees, material buyback, and points.
          </div>
          <div>
            <strong className="text-white block mb-0.5">6. No double counting</strong>
            Material cannot independently generate incompatible claims for multiple partners.
          </div>
          <div>
            <strong className="text-white block mb-0.5">7. Visible corrections</strong>
            Amendments create an audit trail; they do not silently erase history.
          </div>
          <div>
            <strong className="text-white block mb-0.5">8. Privacy by design</strong>
            Customer addresses are not exposed to downstream recycling mills.
          </div>
          <div>
            <strong className="text-white block mb-0.5">9. Operationally bounded launch</strong>
            Only offer bookings where a verified route and recovery partner exist.
          </div>
          <div>
            <strong className="text-white block mb-0.5">10. Evidence proportional to claims</strong>
            Stronger claims require stronger reviewed records.
          </div>
        </div>
      </div>
    </div>
  );
};
