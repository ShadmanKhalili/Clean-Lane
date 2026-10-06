import React, { useState } from 'react';
import { TOKENS } from '../../theme/tokens';
import { ContinuousLoopLine } from './ContinuousLoopLine';
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Scale,
  Truck,
  Gift,
  ShieldCheck,
  FileText,
  RotateCcw,
  ExternalLink
} from 'lucide-react';

interface InvestorLoopDemonstratorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InvestorLoopDemonstrator: React.FC<InvestorLoopDemonstratorProps> = ({
  isOpen,
  onClose
}) => {
  const [activeStage, setActiveStage] = useState<1 | 2 | 3 | 4 | 5>(1);

  if (!isOpen) return null;

  const stageDetails: Record<
    1 | 2 | 3 | 4 | 5,
    {
      title: string;
      tagline: string;
      customerExperience: string;
      operationalReality: string;
      dataProof: { label: string; value: string }[];
      quote: string;
    }
  > = {
    1: {
      title: '1. I Booked a Pickup',
      tagline: 'Everyday Household Booking',
      customerExperience:
        'Customer in Gulshan North selects bottles and boxes in 3 taps. Estimated window chosen without needing technical knowledge or scale tare weights.',
      operationalReality:
        'Booking created with state "Pickup requested" (E0). Geocoded within designated clean lane corridor. Vehicle capacity reserved for Enterprise Route #1.',
      dataProof: [
        { label: 'Booking ID', value: 'CL-BK-9281' },
        { label: 'Corridor', value: 'Gulshan-2 Block D' },
        { label: 'Expected Streams', value: 'PET Bottles, Cardboard' },
        { label: 'Evidence Level', value: 'E0 (Requested)' }
      ],
      quote: 'Clean collection starts with one obvious action, not a recycling lecture.'
    },
    2: {
      title: '2. My Collector Came',
      tagline: 'Doorstep Physical Custody Transfer',
      customerExperience:
        'Collector Tariq arrives in the scheduled morning window with clean canvas bags. Customer receives immediate mobile confirmation with portable scale estimate.',
      operationalReality:
        'Field collector logs custody event. Portable scale reading: 6.8 kg. Offline idempotency ensures no duplicate records even during weak telco signal.',
      dataProof: [
        { label: 'Custodian', value: 'Collector Tariq (#DH-14)' },
        { label: 'Field Weight', value: '6.8 kg (Portable Hook Scale)' },
        { label: 'Status', value: 'Collected (E1)' },
        { label: 'Offline Sync', value: 'Idempotent Sync Verified' }
      ],
      quote: 'Collected is never claimed as recycled. Truth begins at the doorstep.'
    },
    3: {
      title: '3. My Materials Were Checked',
      tagline: 'Certified Hub Intake & Digital Platform Scale',
      customerExperience:
        'Customer receives scale receipt notification: Gross weight verified at Gulshan Central Aggregation Hub.',
      operationalReality:
        'Hub platform scale certification #GW-01 records 6.5 kg verified weight (0.3 kg tare bag deduction). Lot LOT-PET-2026-10-001 created. Points transition from Pending Hold to Available.',
      dataProof: [
        { label: 'Verified Hub Weight', value: '6.50 kg Net' },
        { label: 'Scale ID', value: 'GW-01 (Calibrated Oct 2026)' },
        { label: 'Status', value: 'Quantity Confirmed (E2)' },
        { label: 'Discrepancy Check', value: '4.4% (Within ±5% Tolerance)' }
      ],
      quote: 'Certified scales create the unshakeable foundation for circular credibility.'
    },
    4: {
      title: '4. I Earned Points',
      tagline: 'Circular Rewards Balance Unlocked',
      customerExperience:
        'Customer sees celebratory lime highlight: +325 circular points moved to Available balance. Ready to spend on Chaldal groceries or bKash partner vouchers.',
      operationalReality:
        'Points ledger entry committed under Rule v1.2 (50 pts/kg for PET). Points cannot be spent until E2 verification is complete. Sponsored by Clean Lane Partner Fund.',
      dataProof: [
        { label: 'Points Awarded', value: '+325 pts Available' },
        { label: 'Rule Applied', value: 'RULES_V1.2_PET_50' },
        { label: 'Sponsor', value: 'Clean Lane Circular Fund' },
        { label: 'Status', value: 'Available (Spendable)' }
      ],
      quote: 'Rewards motivate everyday participation without confusing points with cash.'
    },
    5: {
      title: '5. I Can See What Happened Next',
      tagline: 'End-to-End Mill Traceability & EPR Defense',
      customerExperience:
        'Customer can view plain-language recovery timeline: "PET bottles arrived at Akij Synthetic Fibres. Flakes processed into new food-grade resin."',
      operationalReality:
        'Processor disposition recorded: 5.98 kg rPET flakes yielded (0.52 kg moisture/capping loss accounted for). Sealed evidence package E5 generated for Bangladesh Solid Waste Management Rules 2021.',
      dataProof: [
        { label: 'Processor Mill', value: 'Akij Synthetic Fibres Ltd' },
        { label: 'Output Yield', value: '5.98 kg Flakes (92% Yield)' },
        { label: 'Evidence Sealed', value: 'EPR-E5-2026-BANGLADESH' },
        { label: 'Status', value: 'Processing Outcome Confirmed (E4)' }
      ],
      quote: 'A continuous loop line connects the household hand to the verified recycling mill.'
    }
  };

  const current = stageDetails[activeStage];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#F8F7F1] rounded-3xl shadow-2xl max-w-2xl w-full max-h-[94vh] flex flex-col border border-[#E8E5DA] overflow-hidden text-[#172521]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#E8E5DA] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#124B3A] text-[#CBEA70] flex items-center justify-center font-bold text-sm">
              CL
            </div>
            <div>
              <span className="font-bold text-sm text-[#172521] block">
                Everyday Circularity: Interactive Loop Walkthrough
              </span>
              <span className="text-[11px] text-[#53625C]">
                Investor & Evaluator 5-Stage Transformation
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Continuous Loop Line Component */}
        <div className="px-6 pt-5 pb-3 bg-white border-b border-[#E8E5DA] shrink-0">
          <ContinuousLoopLine
            currentStage={activeStage}
            interactive={true}
            onSelectStage={(s) => setActiveStage(s)}
          />
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Header of Active Stage */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#147D79] font-mono block">
                Stage {activeStage} of 5 · {current.tagline}
              </span>
              <h3 className="text-xl font-bold text-[#124B3A] mt-0.5">{current.title}</h3>
            </div>
            <div className="px-3 py-1 rounded-full bg-[#CBEA70]/40 border border-[#CBEA70] text-xs font-bold text-[#124B3A] shrink-0">
              Verified Pipeline
            </div>
          </div>

          {/* Customer Experience vs Operational Reality */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer layer */}
            <div className="p-4 bg-white rounded-2xl border border-[#E8E5DA] shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold text-[#147D79] uppercase tracking-wider block font-mono">
                EVERYDAY CUSTOMER LAYER
              </span>
              <p className="text-xs text-[#172521] leading-relaxed">
                {current.customerExperience}
              </p>
            </div>

            {/* Operational reality */}
            <div className="p-4 bg-white rounded-2xl border border-[#E8E5DA] shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold text-[#124B3A] uppercase tracking-wider block font-mono">
                UNDERLYING EVIDENCE REALITY
              </span>
              <p className="text-xs text-[#53625C] leading-relaxed">
                {current.operationalReality}
              </p>
            </div>
          </div>

          {/* Live Data Proofs */}
          <div className="p-4 bg-[#FFFFFF] rounded-2xl border border-[#E8E5DA] space-y-2.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
              SYSTEM AUDIT LEDGER ATTRIBUTES
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
              {current.dataProof.map((dp, i) => (
                <div key={i} className="p-2.5 bg-[#F8F7F1] rounded-xl border border-[#E8E5DA]">
                  <span className="text-[10px] font-sans text-[#879690] block mb-0.5 truncate">
                    {dp.label}
                  </span>
                  <span className="font-bold text-[#172521] block truncate">{dp.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quote Banner */}
          <div className="p-3.5 bg-[#F2F7E9] rounded-2xl border border-[#CBEA70]/60 flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-[#124B3A] shrink-0" />
            <p className="text-xs font-medium text-[#124B3A] italic">"{current.quote}"</p>
          </div>
        </div>

        {/* Footer Navigation Controls */}
        <div className="p-4 px-6 border-t border-[#E8E5DA] bg-white flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            disabled={activeStage === 1}
            onClick={() => setActiveStage((prev) => (prev > 1 ? ((prev - 1) as any) : prev))}
            className="min-h-[44px] px-4 py-2 rounded-2xl border border-[#E8E5DA] text-xs font-bold text-[#53625C] hover:bg-[#F8F7F1] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setActiveStage(s as any)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  activeStage === s ? 'bg-[#124B3A] w-6' : 'bg-[#E8E5DA] hover:bg-[#879690]'
                }`}
              />
            ))}
          </div>

          {activeStage < 5 ? (
            <button
              type="button"
              onClick={() => setActiveStage((prev) => (prev < 5 ? ((prev + 1) as any) : prev))}
              className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-[#124B3A] hover:bg-[#0D382B] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Next Stage</span>
              <ArrowRight className="w-4 h-4 text-[#CBEA70]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-6 py-2.5 rounded-2xl bg-[#124B3A] hover:bg-[#0D382B] text-white text-xs font-bold cursor-pointer"
            >
              Complete Tour
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
