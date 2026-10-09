import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { useTranslation } from '../../utils/translations';
import {
  ShieldCheck,
  WifiOff,
  Sparkles,
  HelpCircle,
  User,
  Home,
  Gift,
  Clock,
  Compass,
  FileCheck2,
  ChevronDown
} from 'lucide-react';
import { InvestorLoopDemonstrator } from './InvestorLoopDemonstrator';
import { InvestorShowcaseModal } from './InvestorShowcaseModal';
import { AccountDrawerModal } from '../customer/AccountDrawerModal';
import { HelpDrawerModal } from '../customer/HelpDrawerModal';
import { OnboardingFlowModal } from '../customer/OnboardingFlowModal';
import { DisputeModal } from '../customer/DisputeModal';
import { MaterialGuideModal } from '../customer/MaterialGuideModal';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const {
    role,
    setRole,
    lang,
    setLang,
    isOfflineMode,
    offlineQueueCount,
    syncOfflineQueue,
    savedLocations,
    selectedLocationId
  } = useApp();

  const t = useTranslation(lang);

  // Header Modals
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [isSortingGuideOpen, setIsSortingGuideOpen] = useState(false);
  const [isDemonstratorOpen, setIsDemonstratorOpen] = useState(false);
  const [isInvestorShowcaseOpen, setIsInvestorShowcaseOpen] = useState(false);

  const isCustomerRole = role.startsWith('customer');

  const roleLabels: Record<UserRole, { en: string; bn: string }> = {
    customer_household: { en: 'Household Resident', bn: 'বাসাবাড়ির বাসিন্দা' },
    customer_apartment: { en: 'Apartment Committee', bn: 'ভবন ব্যবস্থাপনা' },
    customer_business: { en: 'Business / Café', bn: 'ব্যবসা প্রতিষ্ঠান' },
    collector: { en: 'Field Collector', bn: 'মাঠ সংগ্রাহক' },
    aggregator: { en: 'Aggregation Hub', bn: 'একত্রীকরণ কেন্দ্র' },
    processor: { en: 'Processor / Recycler', bn: 'রিসাইক্লার মিল' },
    operator: { en: 'Operations Admin', bn: 'অপারেশনস অ্যাডমিন' },
    brand_partner: { en: 'Brand / EPR Partner', bn: 'ব্র্যান্ড ও ইপিআর পার্টনার' }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-[#EDE4D8] shadow-2xs">
        {/* Offline Alert Banner if collector */}
        {isOfflineMode && role === 'collector' && (
          <div className="bg-[#B46A14] text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-white" />
              <span>
                {lang === 'en'
                  ? `Field Offline Simulation Active · ${offlineQueueCount} records queued`
                  : `অফলাইন মোড সক্রিয় · ${offlineQueueCount} রেকর্ড জমা রয়েছে`}
              </span>
            </div>
            <button
              onClick={syncOfflineQueue}
              className="px-2.5 py-0.5 bg-[#172521] text-white rounded-lg text-xs hover:bg-black transition-colors cursor-pointer"
            >
              {lang === 'en' ? 'Reconnect & Sync' : 'পুনঃসংযোগ ও সিঙ্ক'}
            </button>
          </div>
        )}

        {/* Top Bar: Brand, 3 Navigation Tabs, Help & Account */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className="text-left group flex items-center gap-2.5 cursor-pointer"
            >
              <div className="relative w-9 h-9 rounded-2xl bg-[#124B3A] flex items-center justify-center text-white font-bold text-sm shadow-xs overflow-hidden shrink-0">
                <svg
                  viewBox="0 0 36 36"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full p-1"
                >
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
                <span className="text-lg font-bold tracking-tight text-[#172521] group-hover:text-[#124B3A] transition-colors leading-tight block">
                  {t.appTitle}
                </span>
                <span className="hidden sm:inline-block text-[11px] text-[#53625C] leading-none">
                  {lang === 'en' ? 'Everyday Circularity' : 'সার্কুলার বর্জ্য ব্যবস্থাপনা'}
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Three Tabs Only (For Customer View) */}
          {isCustomerRole ? (
            <nav className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-[#53625C]">
              {/* Tab 1: Home */}
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'overview'
                    ? 'bg-[#124B3A] text-white shadow-xs font-bold'
                    : 'hover:text-[#172521] hover:bg-[#F8F7F1]'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>{t.home}</span>
              </button>

              {/* Tab 2: Rewards */}
              <button
                onClick={() => setActiveTab('rewards')}
                className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'rewards'
                    ? 'bg-[#124B3A] text-white shadow-xs font-bold'
                    : 'hover:text-[#172521] hover:bg-[#F8F7F1]'
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>{t.rewards}</span>
              </button>

              {/* Tab 3: My activity */}
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'activity'
                    ? 'bg-[#124B3A] text-white shadow-xs font-bold'
                    : 'hover:text-[#172521] hover:bg-[#F8F7F1]'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{t.myActivity}</span>
              </button>
            </nav>
          ) : (
            /* Dedicated Navigation for Operational Actors */
            <nav className="hidden md:flex items-center gap-2 text-sm font-semibold text-[#53625C]">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-[#124B3A] text-white shadow-xs font-bold'
                    : 'hover:text-[#172521] hover:bg-[#F8F7F1]'
                }`}
              >
                {role === 'collector'
                  ? t.fieldJobs
                  : role === 'aggregator'
                  ? t.hubIntake
                  : role === 'processor'
                  ? t.millProcessing
                  : role === 'brand_partner'
                  ? t.eprCampaigns
                  : t.commandCenter}
              </button>

              <button
                onClick={() => setActiveTab('traceability')}
                className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'traceability'
                    ? 'bg-[#124B3A] text-white shadow-xs font-bold'
                    : 'hover:text-[#172521] hover:bg-[#F8F7F1]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t.chainOfCustody}</span>
              </button>
            </nav>
          )}

          {/* Zone 3: Actions - Help & Account (Paired Icons + Labels) */}
          <div className="flex items-center gap-2">
            {/* Help Button (In Header) */}
            <button
              onClick={() => setIsHelpOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EDE4D8] bg-white hover:bg-[#FAF5EC] text-xs font-bold text-[#202B38] transition-colors cursor-pointer shadow-2xs"
              title={t.help}
            >
              <HelpCircle className="w-4 h-4 text-[#25345C]" />
              <span className="hidden sm:inline">{t.help}</span>
            </button>

            {/* Account Button (In Header) */}
            <button
              onClick={() => setIsAccountOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25345C] hover:bg-[#1B2644] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              title={t.account}
            >
              <User className="w-4 h-4 text-[#C9F1DC]" />
              <span className="hidden sm:inline">{t.account}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-[#EDE4D8] bg-white hover:bg-[#F8F7F1] text-[#172521] transition-colors cursor-pointer"
              title="Switch language / ভাষা পরিবর্তন"
            >
              {lang === 'en' ? 'বাংলা' : 'EN'}
            </button>
          </div>
        </div>
      </header>

      {/* Account Drawer Modal */}
      <AccountDrawerModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        onOpenOnboarding={() => {
          setIsAccountOpen(false);
          setIsOnboardingOpen(true);
        }}
        onOpenEvidenceModel={() => {
          setIsAccountOpen(false);
          setActiveTab('evidence_model');
        }}
        onOpenTour={() => {
          setIsAccountOpen(false);
          setIsDemonstratorOpen(true);
        }}
        onOpenInvestorBrief={() => {
          setIsAccountOpen(false);
          setIsInvestorShowcaseOpen(true);
        }}
      />

      {/* Help Drawer Modal */}
      <HelpDrawerModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onOpenFileDispute={(bId) => {
          setIsHelpOpen(false);
          setIsDisputeOpen(true);
        }}
        onOpenSortingGuide={() => {
          setIsHelpOpen(false);
          setIsSortingGuideOpen(true);
        }}
      />

      {/* Onboarding / Add Address Modal */}
      <OnboardingFlowModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onProceedToBooking={() => {
          setIsOnboardingOpen(false);
          setActiveTab('overview');
        }}
      />

      {/* Dispute Modal */}
      <DisputeModal
        isOpen={isDisputeOpen}
        onClose={() => setIsDisputeOpen(false)}
      />

      {/* Sorting Guide Modal */}
      <MaterialGuideModal
        isOpen={isSortingGuideOpen}
        onClose={() => setIsSortingGuideOpen(false)}
      />

      {/* 5-Step Tour Modal */}
      <InvestorLoopDemonstrator
        isOpen={isDemonstratorOpen}
        onClose={() => setIsDemonstratorOpen(false)}
      />

      {/* Investor Brief Modal */}
      <InvestorShowcaseModal
        isOpen={isInvestorShowcaseOpen}
        onClose={() => setIsInvestorShowcaseOpen(false)}
        onOpenLoopDemonstrator={() => setIsDemonstratorOpen(true)}
      />
    </>
  );
};
