import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { TOKENS } from '../../theme/tokens';
import { ShieldCheck, Wifi, WifiOff, Sparkles } from 'lucide-react';
import { InvestorLoopDemonstrator } from './InvestorLoopDemonstrator';
import { InvestorShowcaseModal } from './InvestorShowcaseModal';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { role, setRole, lang, setLang, isOfflineMode, offlineQueueCount, syncOfflineQueue } = useApp();
  const [isDemonstratorOpen, setIsDemonstratorOpen] = useState(false);
  const [isInvestorShowcaseOpen, setIsInvestorShowcaseOpen] = useState(false);

  const roleLabels: Record<UserRole, { en: string; bn: string }> = {
    customer_household: { en: 'Household Resident', bn: 'বাসাবাড়ির বাসিন্দা' },
    customer_apartment: { en: 'Apartment Manager', bn: 'ভবন ব্যবস্থাপনা' },
    customer_business: { en: 'Business / Café', bn: 'ব্যবসা প্রতিষ্ঠান' },
    collector: { en: 'Field Collector', bn: 'মাঠ সংগ্রাহক' },
    aggregator: { en: 'Aggregation Hub', bn: 'একত্রীকরণ কেন্দ্র' },
    processor: { en: 'Processor / Recycler', bn: 'রিসাইক্লার মিল' },
    operator: { en: 'Operations Admin', bn: 'অপারেশনস অ্যাডমিন' },
    brand_partner: { en: 'Brand / EPR Partner', bn: 'ব্র্যান্ড ও ইপিআর পার্টনার' }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-[#E8E5DA] shadow-2xs">
        {/* Offline Alert Banner if collector */}
        {isOfflineMode && role === 'collector' && (
          <div className="bg-[#B46A14] text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-white" />
              <span>Field Offline Simulation Active · {offlineQueueCount} records queued on device</span>
            </div>
            <button
              onClick={syncOfflineQueue}
              className="px-2.5 py-0.5 bg-[#172521] text-white rounded-lg text-xs hover:bg-black transition-colors cursor-pointer"
            >
              Reconnect & Sync
            </button>
          </div>
        )}

        {/* Main Top Bar Contract: Zone 1 (Brand) - Zone 2 (Nav links) - Zone 3 (Actions) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Zone 1: Brand Wordmark with Signature Continuous Loop Symbol */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('overview')}
              className="text-left group flex items-center gap-3 cursor-pointer"
            >
              {/* Loop Emblem: Deep forest green with Fresh Lime loop accent */}
              <div className="relative w-9 h-9 rounded-2xl bg-[#124B3A] flex items-center justify-center text-white font-bold text-sm shadow-xs overflow-hidden">
                <svg
                  viewBox="0 0 36 36"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full p-1"
                >
                  {/* Continuous loop line glyph */}
                  <path
                    d="M 10 18 C 10 12, 18 12, 18 18 C 18 24, 26 24, 26 18 C 26 12, 18 12, 18 18 C 18 24, 10 24, 10 18 Z"
                    stroke="#CBEA70"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="26" cy="18" r="2" fill="#FFFFFF" />
                </svg>
              </div>

              <div>
                <span className="text-lg font-bold tracking-tight text-[#172521] group-hover:text-[#124B3A] transition-colors leading-tight">
                  Clean Lane
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs text-[#53625C]">
                  {lang === 'en' ? 'Everyday Circularity' : 'সার্কুলার রিকভারি'}
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#53625C]">
            <button
              onClick={() => setActiveTab('overview')}
              className={`transition-colors hover:text-[#172521] cursor-pointer ${
                activeTab === 'overview' ? 'text-[#124B3A] font-bold' : ''
              }`}
            >
              {role.startsWith('customer')
                ? lang === 'en' ? 'My Services' : 'আমার সেবা'
                : role === 'collector'
                ? lang === 'en' ? 'Field Jobs' : 'মাঠের কাজ'
                : role === 'aggregator'
                ? lang === 'en' ? 'Hub Intake' : 'কেন্দ্র ইনটেক'
                : role === 'processor'
                ? lang === 'en' ? 'Mill Processing' : 'মিল প্রসেসিং'
                : role === 'brand_partner'
                ? lang === 'en' ? 'EPR & Campaigns' : 'ইপিআর ও ক্যাম্পেইন'
                : lang === 'en' ? 'Command Center' : 'কমান্ড সেন্টার'}
            </button>

            {role.startsWith('customer') && (
              <button
                onClick={() => setActiveTab('rewards')}
                className={`transition-colors hover:text-[#172521] cursor-pointer ${
                  activeTab === 'rewards' ? 'text-[#124B3A] font-bold' : ''
                }`}
              >
                {lang === 'en' ? 'Circular Rewards' : 'রিওয়ার্ড শপ'}
              </button>
            )}

            <button
              onClick={() => setActiveTab('traceability')}
              className={`transition-colors hover:text-[#172521] cursor-pointer ${
                activeTab === 'traceability' ? 'text-[#124B3A] font-bold' : ''
              }`}
            >
              {lang === 'en' ? 'Chain of Custody' : 'কাস্টডি রেকর্ড'}
            </button>

            <button
              onClick={() => setActiveTab('evidence_model')}
              className={`transition-colors hover:text-[#172521] cursor-pointer ${
                activeTab === 'evidence_model' ? 'text-[#124B3A] font-bold' : ''
              }`}
            >
              {lang === 'en' ? 'Evidence Standard (E0–E5)' : 'প্রমাণ মানদণ্ড'}
            </button>
          </nav>

          {/* Zone 3: Actions (Interactive Tour, Investor Brief, Role Switcher, Language) */}
          <div className="flex items-center gap-2">
            {/* Investor Brief & Economics Button */}
            <button
              onClick={() => setIsInvestorShowcaseOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25345C] hover:bg-[#1B2644] text-[#C9F1DC] text-xs font-bold transition-all cursor-pointer shadow-2xs border border-[#C9F1DC]/30"
              title="Launch Investor Brief, Unit Economics & ESG Evidence Showcase"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C9F1DC]" />
              <span className="hidden sm:inline">Investor Brief</span>
            </button>

            {/* Circularity 5-Step Tour Button */}
            <button
              onClick={() => setIsDemonstratorOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF5EC] hover:bg-[#EDE4D8] text-[#25345C] border border-[#EDE4D8] text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Launch 5-Stage Everyday Circularity Walkthrough"
            >
              <span>5-Step Tour</span>
            </button>

            {/* Role Selector */}
            <div className="relative">
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value as UserRole);
                  setActiveTab('overview');
                }}
                className="text-xs font-semibold text-[#172521] bg-[#F8F7F1] hover:bg-[#EFECE3] border border-[#E8E5DA] rounded-xl px-3 py-2 cursor-pointer focus:ring-2 focus:ring-[#124B3A] transition-colors"
                aria-label="Select platform perspective"
              >
                <optgroup label="Customer Perspectives">
                  <option value="customer_household">{roleLabels.customer_household[lang]}</option>
                  <option value="customer_apartment">{roleLabels.customer_apartment[lang]}</option>
                  <option value="customer_business">{roleLabels.customer_business[lang]}</option>
                </optgroup>
                <optgroup label="Operational Actors">
                  <option value="collector">{roleLabels.collector[lang]}</option>
                  <option value="aggregator">{roleLabels.aggregator[lang]}</option>
                  <option value="processor">{roleLabels.processor[lang]}</option>
                </optgroup>
                <optgroup label="Governance & Partners">
                  <option value="operator">{roleLabels.operator[lang]}</option>
                  <option value="brand_partner">{roleLabels.brand_partner[lang]}</option>
                </optgroup>
              </select>
            </div>

            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-[#E8E5DA] bg-white hover:bg-[#F8F7F1] text-[#172521] transition-colors cursor-pointer"
              title="Switch language"
            >
              {lang === 'en' ? 'বাংলা' : 'English'}
            </button>
          </div>
        </div>
      </header>

      {/* Investor & Customer Loop Demonstrator Modal */}
      <InvestorLoopDemonstrator
        isOpen={isDemonstratorOpen}
        onClose={() => setIsDemonstratorOpen(false)}
      />

      {/* Investor Brief & Scale Economics Modal */}
      <InvestorShowcaseModal
        isOpen={isInvestorShowcaseOpen}
        onClose={() => setIsInvestorShowcaseOpen(false)}
        onOpenLoopDemonstrator={() => setIsDemonstratorOpen(true)}
      />
    </>
  );
};
