import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, TrendingUp, Droplets, Trees, ChevronDown, ChevronUp, Leaf } from 'lucide-react';
import { impactForKg } from '../customer/impact';
import { useCustomerData } from '../customer/useCustomerData';

interface EnvironmentalImpactWidgetProps {
  className?: string;
  defaultExpanded?: boolean;
}

/**
 * Clean Lane Verified Circular Impact Widget
 * Live ESG, Carbon Avoidance & Landfill Diversion Metrics
 * Features Progressive Disclosure (Glance Banner -> Expanded Ledger)
 */
export const EnvironmentalImpactWidget: React.FC<EnvironmentalImpactWidgetProps> = ({
  className = '',
  defaultExpanded = false
}) => {
  const { bookings, lang } = useApp();
  const { confirmedKg: myKg, customer } = useCustomerData();
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [viewScope, setViewScope] = useState<'mine' | 'network'>('mine');

  // Hub-scale-confirmed mass only. "Mine" is the signed-in customer; "network" is every customer in the demo data.
  const networkKg = bookings.reduce((sum, b) => sum + (b.status === 'CANCELLED' || b.status === 'MISSED' ? 0 : b.confirmedWeightKg || 0), 0);
  const activeKg = viewScope === 'mine' ? myKg : networkKg;
  const { co2eKg, landfillM3, bottles } = impactForKg(activeKg);
  const co2AvoidedKg = co2eKg.toFixed(1);
  const plasticBottlesEquivalent = bottles;
  const landfillSpaceSavedM3 = landfillM3.toFixed(2);
  const isOrg = customer.customerType === 'apartment' || customer.customerType === 'business';

  return (
    <div
      className={`bg-white rounded-3xl border border-[#EDE4D8] shadow-2xs overflow-hidden text-[#202B38] transition-all ${className}`}
    >
      {/* 1-Line Calm Glance Banner (Always Visible) */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#FFF9F0] via-white to-[#F6FCF8]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[#C9F1DC] text-[#12613F] flex items-center justify-center shrink-0 shadow-2xs">
            <Leaf className="w-5 h-5 text-[#12613F]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-[#202B38]">
                {lang === 'en' ? 'Verified Circularity Impact' : 'পরিবেশগত সার্কুলার অর্জন'}
              </span>
              <span className="text-[10px] font-mono text-[#12613F] bg-[#C9F1DC] px-2 py-0.2 rounded-md font-bold">
                {lang === 'en' ? 'Hub-scale confirmed' : 'হাব স্কেলে নিশ্চিত'}
              </span>
            </div>
            <p className="text-xs text-[#53616D] mt-0.5">
              {myKg > 0 ? (
                <>
                  <strong className="text-[#12613F] font-mono">{myKg.toFixed(1)} kg</strong> {lang === 'en' ? 'diverted from landfill' : 'ল্যান্ডফিল থেকে সরানো'} ·{' '}
                  <strong className="text-[#25345C] font-mono">≈ {impactForKg(myKg).co2eKg.toFixed(1)} kg</strong> CO₂e {lang === 'en' ? 'avoided' : 'সাশ্রয়'}
                </>
              ) : lang === 'en' ? (
                'Your impact appears here after your first weighed pickup.'
              ) : (
                'প্রথম ওজন করা পিকআপের পর আপনার প্রভাব এখানে দেখা যাবে।'
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl border border-[#EDE4D8] bg-white hover:bg-[#FAF5EC] text-xs font-bold text-[#25345C] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs shrink-0 active:scale-95"
        >
          <span>
            {isExpanded
              ? lang === 'en'
                ? 'Hide Impact Details'
                : 'বিবরণ লুকান'
              : lang === 'en'
              ? 'View ESG Ledger'
              : 'ইএসজি খতিয়ান দেখুন'}
          </span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Comprehensive ESG & Carbon Ledger */}
      {isExpanded && (
        <div className="p-5 sm:p-6 border-t border-[#EDE4D8] space-y-4 animate-fade-in bg-white">
          {/* Scope Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#FAF5EC]">
            <div>
              <span className="text-xs font-bold text-[#202B38]">
                {lang === 'en' ? 'Audited Landfill Diversion & Emission Models' : 'যাচাইকৃত বর্জ্য অপসারণ ও কার্বন সাশ্রয়ের মডেল'}
              </span>
              <p className="text-[11px] text-[#53616D]">
                {lang === 'en'
                  ? 'Calculated based on certified digital platform scale intake at Aggregation Hub'
                  : 'একত্রীকরণ কেন্দ্রে ডিজিটাল স্কেলের পরিমাপ অনুযায়ী প্রণীত'}
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-[#FFF9F0] border border-[#EDE4D8] rounded-2xl text-xs font-semibold self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewScope('mine')}
                aria-pressed={viewScope === 'mine'}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  viewScope === 'mine'
                    ? 'bg-[#25345C] text-white shadow-2xs'
                    : 'text-[#53616D] hover:text-[#202B38]'
                }`}
              >
                {isOrg ? (lang === 'en' ? 'My site' : 'আমাদের সাইট') : lang === 'en' ? 'My household' : 'আমার বাসা'}
              </button>
              <button
                type="button"
                onClick={() => setViewScope('network')}
                aria-pressed={viewScope === 'network'}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  viewScope === 'network'
                    ? 'bg-[#25345C] text-white shadow-2xs'
                    : 'text-[#53616D] hover:text-[#202B38]'
                }`}
              >
                {lang === 'en' ? 'All Clean Lane customers' : 'সব ক্লিন লেন গ্রাহক'}
              </button>
            </div>
          </div>

          {/* 4 Core ESG Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
            {/* Metric 1: Landfill Diverted */}
            <div className="p-4 rounded-2xl bg-[#FFF9F0] border border-[#EDE4D8] flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#12613F]">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                  {lang === 'en' ? 'Diverted' : 'অপসারিত'}
                </span>
                <ShieldCheck className="w-4 h-4 text-[#12613F]" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black font-mono text-[#25345C] tabular-nums">
                  {activeKg.toFixed(1)}
                </span>
                <span className="text-xs font-bold text-[#53616D] ml-1">kg</span>
              </div>
              <span className="text-[11px] text-[#53616D] mt-1 leading-snug">
                {lang === 'en' ? 'Kept out of the landfill' : 'ল্যান্ডফিল থেকে সরানো'}
              </span>
            </div>

            {/* Metric 2: CO2e Avoided */}
            <div className="p-4 rounded-2xl bg-[#FFF9F0] border border-[#EDE4D8] flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#25345C]">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                  {lang === 'en' ? 'Carbon Avoided' : 'কার্বন সাশ্রয়'}
                </span>
                <Trees className="w-4 h-4 text-[#25345C]" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black font-mono text-[#25345C] tabular-nums">
                  {co2AvoidedKg}
                </span>
                <span className="text-xs font-bold text-[#53616D] ml-1">kg CO₂e</span>
              </div>
              <span className="text-[11px] text-[#53616D] mt-1 leading-snug">
                {lang === 'en' ? 'Avoided virgin resin emissions' : 'নতুন প্লাস্টিক উৎপাদন নির্গমন রোধ'}
              </span>
            </div>

            {/* Metric 3: Bottles Recovered */}
            <div className="p-4 rounded-2xl bg-[#FFF9F0] border border-[#EDE4D8] flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#12613F]">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                  {lang === 'en' ? 'Bottles Equivalent' : 'বোতল পুনরুদ্ধার'}
                </span>
                <Droplets className="w-4 h-4 text-[#12613F]" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black font-mono text-[#202B38] tabular-nums">
                  {plasticBottlesEquivalent.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-[#53616D] ml-1">units</span>
              </div>
              <span className="text-[11px] text-[#53616D] mt-1 leading-snug">
                {lang === 'en' ? 'Approx. 500 ml bottles of material' : 'আনুমানিক ৫০০ মি.লি. বোতলের সমপরিমাণ'}
              </span>
            </div>

            {/* Metric 4: Landfill Space */}
            <div className="p-4 rounded-2xl bg-[#FFF9F0] border border-[#EDE4D8] flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#7A4D00]">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                  {lang === 'en' ? 'Landfill Saved' : 'জমি সাশ্রয়'}
                </span>
                <TrendingUp className="w-4 h-4 text-[#F5BF55]" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black font-mono text-[#202B38] tabular-nums">
                  {landfillSpaceSavedM3}
                </span>
                <span className="text-xs font-bold text-[#53616D] ml-1">m³</span>
              </div>
              <span className="text-[11px] text-[#53616D] mt-1 leading-snug">
                {lang === 'en' ? 'Municipal volume preserved' : 'নগর বর্জ্য ভূমির আয়তন সাশ্রয়'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#FAF5EC] text-xs text-[#53616D]">
            {lang === 'en'
              ? 'Based on weights confirmed at Clean Lane hub scales. Cancelled and missed pickups are excluded.'
              : 'ক্লিন লেন হাব স্কেলে নিশ্চিত ওজনের ভিত্তিতে। বাতিল ও ছুটে যাওয়া পিকআপ বাদ।'}
          </div>
        </div>
      )}
    </div>
  );
};
