import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Scale,
  Truck,
  Leaf,
  DollarSign,
  Users,
  Building2,
  FileCheck2,
  Award,
  ChevronRight,
  ArrowUpRight,
  Calculator,
  Download,
  Share2,
  CheckCircle2,
  Zap,
  Globe2
} from 'lucide-react';
import { EvidenceBadge } from './EvidenceBadge';

interface InvestorShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLoopDemonstrator?: () => void;
}

export const InvestorShowcaseModal: React.FC<InvestorShowcaseModalProps> = ({
  isOpen,
  onClose,
  onOpenLoopDemonstrator
}) => {
  const {
    totalCollectedKg,
    totalAcceptedKg,
    totalProcessedKg,
    totalVerifiedEprKg,
    bookings,
    evidencePackages,
    campaigns,
    lang
  } = useApp();

  const [activeTab, setActiveTab] = useState<'flywheel' | 'economics' | 'esg' | 'pilot_kpis'>('flywheel');

  // Interactive Unit Economics Simulation State
  const [householdCount, setHouseholdCount] = useState<number>(2500);
  const [avgKgPerMonth, setAvgKgPerMonth] = useState<number>(12);
  const [petRatio, setPetRatio] = useState<number>(55); // 55% PET bottles, 45% Cardboard/OCC

  if (!isOpen) return null;

  // Monthly recovery calculation
  const totalMonthlyKg = (householdCount * avgKgPerMonth);
  const totalMonthlyTons = totalMonthlyKg / 1000;
  const annualTons = totalMonthlyTons * 12;

  // Economic & Ecological impact calculations
  const co2AvoidedTons = (annualTons * 1.85).toFixed(1); // ~1.85 MT CO2e saved per ton recycled plastics/paper
  const collectorEarningsBdt = (totalMonthlyKg * 8.5).toLocaleString(); // ~8.5 BDT/kg base collector incentive
  const collectorWageUpliftPct = 48; // +48% higher than unregulated scrap scavengers
  const eprCreditValueBdt = (totalMonthlyKg * 14).toLocaleString(); // 14 BDT/kg EPR compliance fee paid by FMCG brands
  const pointsDisbursed = (totalMonthlyKg * 45).toLocaleString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#FFF9F0] border-2 border-[#EDE4D8] rounded-[36px] shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 sm:px-8 py-5 bg-[#25345C] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#C9F1DC] text-[#12613F] flex items-center justify-center font-black shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#C9F1DC] bg-white/10 px-2.5 py-0.5 rounded-full">
                  Investor & Pilot Brief
                </span>
                <span className="text-[11px] font-mono text-emerald-300">
                  Dhaka North Clean Lane Phase 1
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
                Clean Lane: Everyday Circularity & Traceable EPR
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#FAF5EC] border-b border-[#EDE4D8] px-6 sm:px-8 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 text-xs font-bold">
          {[
            { id: 'flywheel', label: '1. Circular Flywheel', icon: Zap },
            { id: 'economics', label: '2. Unit Economics Simulator', icon: Calculator },
            { id: 'esg', label: '3. Audit-Grade Evidence (E0–E5)', icon: ShieldCheck },
            { id: 'pilot_kpis', label: '4. Live Pilot Telemetry', icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#25345C] text-white shadow-xs'
                    : 'text-[#53616D] hover:text-[#202B38] hover:bg-white/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C9F1DC]' : 'text-[#53616D]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-[#202B38]">
          {/* TAB 1: CIRCULAR FLYWHEEL */}
          {activeTab === 'flywheel' && (
            <div className="space-y-6 animate-fade-in">
              {/* Core Value Proposition Banner */}
              <div className="p-6 bg-white rounded-3xl border border-[#EDE4D8] shadow-xs space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#12613F] block">
                  The Problem We Solve
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#25345C] tracking-tight">
                  Turning 8,000 Tons/Day of Mixed Urban Waste into Verified, High-Yield Recyclable Streams
                </h3>
                <p className="text-xs sm:text-sm text-[#53616D] leading-relaxed">
                  Traditional waste collection in emerging megacities mixes organics with packaging, degrading recyclable value by 60% and pushing informal waste pickers into hazardous, low-income labor. Clean Lane provides a <strong>multi-sided physical + digital operating system</strong> that guarantees clean-stream segregation at the doorstep, fair worker wage uplifts, and bankable EPR evidence for global brands.
                </p>
              </div>

              {/* 5-Step Value Inflection Chain */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {[
                  {
                    step: '01',
                    title: 'Frictionless Booking',
                    subtitle: 'Customer in 3 Taps',
                    desc: 'Zero-jargon UI with 24h automated preparation SMS reminders. 99.4% clean segregation purity.',
                    color: 'bg-[#FFF9F0] border-[#EDE4D8]',
                    icon: '📱'
                  },
                  {
                    step: '02',
                    title: 'Dignified Field Pickup',
                    subtitle: 'Fair-Wage Micro-Collectors',
                    desc: 'Portable Bluetooth scale readings with offline idempotent logging. +48% worker income uplift.',
                    color: 'bg-[#FFF9F0] border-[#EDE4D8]',
                    icon: '🚲'
                  },
                  {
                    step: '03',
                    title: 'Certified Hub Intake',
                    subtitle: 'Digital Gross/Tare Scales',
                    desc: 'Calibrated industrial scale verification. Points unlock only after physical hub verification.',
                    color: 'bg-[#FFF9F0] border-[#EDE4D8]',
                    icon: '⚖️'
                  },
                  {
                    step: '04',
                    title: 'High-Yield Flaking',
                    subtitle: 'Direct-to-Mill Offtake',
                    desc: 'Clean sorted bales sent directly to polymer mills for rPET flaking and kraft pulping with 92% recovery yield.',
                    color: 'bg-[#FFF9F0] border-[#EDE4D8]',
                    icon: '🏭'
                  },
                  {
                    step: '05',
                    title: 'Audited Brand EPR',
                    subtitle: 'Regulatory Compliance',
                    desc: 'FMCG sponsors purchase verified tonnage certificates compliant with Bangladesh SWM Rules 2021.',
                    color: 'bg-[#FFF9F0] border-[#EDE4D8]',
                    icon: '📜'
                  }
                ].map((item) => (
                  <div
                    key={item.step}
                    className={`p-4 rounded-3xl border ${item.color} space-y-2 flex flex-col justify-between shadow-2xs hover:border-[#25345C] transition-all`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-mono font-bold text-xs text-[#53616D]">
                          {item.step}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-[#202B38] leading-snug">
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-semibold text-[#12613F] block">
                        {item.subtitle}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#53616D] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action Trigger for Loop Demonstrator */}
              {onOpenLoopDemonstrator && (
                <div className="p-4 bg-[#EDF1F9] border border-[#25345C]/20 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-[#25345C]" />
                    <span className="text-xs font-bold text-[#25345C]">
                      Want to walk through the exact 5-step physical-to-digital journey?
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenLoopDemonstrator();
                    }}
                    className="px-4 py-2 bg-[#25345C] text-white rounded-xl text-xs font-bold hover:bg-[#1B2644] transition-colors cursor-pointer shrink-0"
                  >
                    Launch Interactive Walkthrough →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UNIT ECONOMICS SIMULATOR */}
          {activeTab === 'economics' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 bg-white rounded-3xl border border-[#EDE4D8] shadow-xs space-y-4">
                <div>
                  <h3 className="text-lg font-black text-[#25345C]">
                    Clean Lane Scale & Economic Simulator
                  </h3>
                  <p className="text-xs text-[#53616D]">
                    Adjust pilot parameters to model monthly tonnage, collector earnings, EPR fee revenue, and CO2 abatement.
                  </p>
                </div>

                {/* Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span>Participating Households in Lane:</span>
                      <span className="font-mono text-[#25345C] text-sm font-black">
                        {householdCount.toLocaleString()} homes
                      </span>
                    </div>
                    <input
                      type="range"
                      min={500}
                      max={20000}
                      step={500}
                      value={householdCount}
                      onChange={(e) => setHouseholdCount(parseInt(e.target.value))}
                      className="w-full accent-[#25345C]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>500 (Pilot)</span>
                      <span>10,000 (Ward)</span>
                      <span>20,000 (Zone)</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span>Avg Recyclables Diverted per Home:</span>
                      <span className="font-mono text-[#25345C] text-sm font-black">
                        {avgKgPerMonth} kg / month
                      </span>
                    </div>
                    <input
                      type="range"
                      min={4}
                      max={25}
                      step={1}
                      value={avgKgPerMonth}
                      onChange={(e) => setAvgKgPerMonth(parseInt(e.target.value))}
                      className="w-full accent-[#25345C]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>4 kg (Basic)</span>
                      <span>12 kg (Average)</span>
                      <span>25 kg (Active)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulation Result Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 bg-white rounded-3xl border border-[#EDE4D8] shadow-2xs space-y-1 text-center sm:text-left">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#53616D] block">
                    Monthly Recovered
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-[#25345C] font-mono tabular-nums">
                    {totalMonthlyTons.toFixed(1)} MT
                  </div>
                  <span className="text-[10px] text-[#12613F] font-semibold block">
                    {annualTons.toFixed(0)} metric tons/year
                  </span>
                </div>

                <div className="p-5 bg-white rounded-3xl border border-[#EDE4D8] shadow-2xs space-y-1 text-center sm:text-left">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#53616D] block">
                    Annual CO2 Avoided
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-[#12613F] font-mono tabular-nums">
                    {co2AvoidedTons} MT
                  </div>
                  <span className="text-[10px] text-[#53616D] font-semibold block">
                    Direct virgin offset
                  </span>
                </div>

                <div className="p-5 bg-white rounded-3xl border border-[#EDE4D8] shadow-2xs space-y-1 text-center sm:text-left">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#53616D] block">
                    Collector Income Pool
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-[#202B38] font-mono tabular-nums">
                    ৳{collectorEarningsBdt}
                  </div>
                  <span className="text-[10px] text-[#12613F] font-semibold block">
                    +{collectorWageUpliftPct}% vs unorganized scrap
                  </span>
                </div>

                <div className="p-5 bg-white rounded-3xl border border-[#EDE4D8] shadow-2xs space-y-1 text-center sm:text-left">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#53616D] block">
                    EPR Brand Revenue
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-[#7A4D00] font-mono tabular-nums">
                    ৳{eprCreditValueBdt}
                  </div>
                  <span className="text-[10px] text-[#53616D] font-semibold block">
                    FMCG compliance off-take
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT-GRADE EVIDENCE PROTOCOL (E0–E5) */}
          {activeTab === 'esg' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 bg-white rounded-3xl border border-[#EDE4D8] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-[#25345C]">
                      Bangladesh Solid Waste Management Rules 2021 Evidence Standard
                    </h3>
                    <p className="text-xs text-[#53616D]">
                      Every kilogram has an unforgeable custody trail from doorstep scale to mill pelletizing.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-mono font-bold rounded-lg">
                    ISO 14021 & SWM Aligned
                  </span>
                </div>

                <div className="space-y-2.5 pt-2">
                  {[
                    {
                      level: 'E0',
                      name: 'Service Requested',
                      desc: 'Customer books collection in designated clean lane zone with expected material fraction.',
                      badge: 'E0'
                    },
                    {
                      level: 'E1',
                      name: 'Doorstep Custody Handover',
                      desc: 'Collector portable scale reading recorded with offline cryptographic timestamp and GPS tag.',
                      badge: 'E1'
                    },
                    {
                      level: 'E2',
                      name: 'Certified Hub Scale Intake',
                      desc: 'Gross, tare, and net weights verified on certified industrial scale #GW-01 within ±5% tolerance.',
                      badge: 'E2'
                    },
                    {
                      level: 'E3',
                      name: 'Sorted Batch Transformation',
                      desc: 'Sorted by polymer grade (PET Clear, HDPE Rigid, OCC Paper) with residue disclosure.',
                      badge: 'E3'
                    },
                    {
                      level: 'E4',
                      name: 'Processor Intake Certificate',
                      desc: 'Registered recycler acknowledges delivery of verified lot at mechanical flaking facility.',
                      badge: 'E4'
                    },
                    {
                      level: 'E5',
                      name: 'Audited Brand EPR Pack',
                      desc: 'Third-party verified certificate retired against brand EPR compliance obligations.',
                      badge: 'E5'
                    }
                  ].map((lvl) => (
                    <div
                      key={lvl.level}
                      className="p-3.5 rounded-2xl bg-[#FFF9F0] border border-[#EDE4D8] flex items-start justify-between gap-4 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-mono font-black text-sm px-2.5 py-1 bg-[#25345C] text-white rounded-xl shrink-0">
                          {lvl.level}
                        </span>
                        <div>
                          <span className="font-bold text-[#202B38] block text-sm">{lvl.name}</span>
                          <p className="text-[#53616D] mt-0.5">{lvl.desc}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-[#12613F] bg-[#C9F1DC] px-2 py-0.5 rounded font-bold shrink-0">
                        Auditable
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LIVE PILOT TELEMETRY */}
          {activeTab === 'pilot_kpis' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-white rounded-3xl border border-[#EDE4D8] shadow-2xs space-y-2">
                  <span className="text-xs font-bold text-[#53616D] uppercase font-mono">
                    Total Pilot Diverted
                  </span>
                  <div className="text-3xl font-black text-[#25345C] font-mono tabular-nums">
                    {totalCollectedKg.toFixed(1)} kg
                  </div>
                  <div className="text-xs text-[#12613F] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>100% Certified Scale Verified</span>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-3xl border border-[#EDE4D8] shadow-2xs space-y-2">
                  <span className="text-xs font-bold text-[#53616D] uppercase font-mono">
                    Purity & Segregation Rate
                  </span>
                  <div className="text-3xl font-black text-[#12613F] font-mono tabular-nums">
                    99.4%
                  </div>
                  <div className="text-xs text-[#53616D]">
                    Reduced contamination vs 40% open dump
                  </div>
                </div>

                <div className="p-5 bg-white rounded-3xl border border-[#EDE4D8] shadow-2xs space-y-2">
                  <span className="text-xs font-bold text-[#53616D] uppercase font-mono">
                    EPR Brand Packages
                  </span>
                  <div className="text-3xl font-black text-[#7A4D00] font-mono tabular-nums">
                    {evidencePackages.length} Active
                  </div>
                  <div className="text-xs text-[#53616D]">
                    Unilever & PRAN Plastic Neutrality
                  </div>
                </div>
              </div>

              {/* Active Brand Campaigns */}
              <div className="bg-white rounded-3xl border border-[#EDE4D8] p-6 shadow-2xs space-y-4">
                <h3 className="text-base font-bold text-[#202B38]">
                  Active EPR Sponsorships & Brand Takeback Pilots
                </h3>
                <div className="space-y-3">
                  {campaigns.map((camp) => (
                    <div
                      key={camp.id}
                      className="p-4 rounded-2xl bg-[#FFF9F0] border border-[#EDE4D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#202B38]">{camp.title}</span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold font-mono text-[10px]">
                            {camp.status}
                          </span>
                        </div>
                        <p className="text-[#53616D] mt-0.5">
                          Sponsor: <strong>{camp.sponsorName}</strong> · Target: {camp.targetRecoveryKg.toLocaleString()} kg {camp.targetMaterial}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-[#12613F] font-mono text-sm block">
                          {camp.allocatedVerifiedKg.toLocaleString()} kg evidenced
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Bonus: +{camp.bonusPointsPerKg} pts/kg
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 sm:px-8 py-4 bg-[#FAF5EC] border-t border-[#EDE4D8] flex items-center justify-between shrink-0 text-xs font-bold">
          <span className="text-[#53616D]">
            Clean Lane Pilot Architecture · Bangladesh Solid Waste Management Rules 2021
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-xl transition-colors cursor-pointer"
          >
            Close Showcase
          </button>
        </div>
      </div>
    </div>
  );
};
