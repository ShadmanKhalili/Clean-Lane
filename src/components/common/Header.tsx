import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  ShieldCheck,
  WifiOff,
  Sparkles,
  Bell,
  MoreVertical,
  Compass,
  Layers,
  FileCheck2,
  HelpCircle,
  MapPin,
  ChevronDown,
  Gift,
  Clock,
  Home,
  Check,
  Plus
} from 'lucide-react';
import { InvestorLoopDemonstrator } from './InvestorLoopDemonstrator';
import { InvestorShowcaseModal } from './InvestorShowcaseModal';
import { NotificationCenterModal } from '../notifications/NotificationCenterModal';
import { PreparationGuidanceModal } from '../notifications/PreparationGuidanceModal';
import { DisputeModal } from '../customer/DisputeModal';
import { OnboardingFlowModal } from '../customer/OnboardingFlowModal';
import { useTranslation } from '../../utils/translations';
import { AppNotification, Booking } from '../../types';

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
    notifications,
    savedLocations,
    selectedLocationId,
    setSelectedLocationId,
    bookings
  } = useApp();

  const t = useTranslation(lang);

  const [isDemonstratorOpen, setIsDemonstratorOpen] = useState(false);
  const [isInvestorShowcaseOpen, setIsInvestorShowcaseOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [prepModalNotif, setPrepModalNotif] = useState<AppNotification | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    if (isMoreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMoreMenuOpen]);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;
  const currentLocation =
    savedLocations.find((l) => l.id === selectedLocationId) || savedLocations[0];

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

  const isCustomerRole = role.startsWith('customer');

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-[#E8E5DA] shadow-2xs">
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

        {/* Main Top Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          {/* Brand Logo & Name */}
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

          {/* Primary Navigation Tabs (Focused, Uncluttered) */}
          <nav className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-[#53625C]">
            {/* Core Tab 1: Home / Main Role Perspective */}
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-[#124B3A] text-white shadow-xs font-bold'
                  : 'hover:text-[#172521] hover:bg-[#F8F7F1]'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>
                {isCustomerRole
                  ? t.home
                  : role === 'collector'
                  ? t.fieldJobs
                  : role === 'aggregator'
                  ? t.hubIntake
                  : role === 'processor'
                  ? t.millProcessing
                  : role === 'brand_partner'
                  ? t.eprCampaigns
                  : t.commandCenter}
              </span>
            </button>

            {/* Core Tab 2 for Customer: Rewards */}
            {isCustomerRole && (
              <button
                onClick={() => setActiveTab('rewards')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'rewards'
                    ? 'bg-[#124B3A] text-white shadow-xs font-bold'
                    : 'hover:text-[#172521] hover:bg-[#F8F7F1]'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>{t.rewards}</span>
              </button>
            )}

            {/* Core Tab 3 for Customer: Activity & History */}
            {isCustomerRole && (
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'activity'
                    ? 'bg-[#124B3A] text-white shadow-xs font-bold'
                    : 'hover:text-[#172521] hover:bg-[#F8F7F1]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{t.myActivity}</span>
              </button>
            )}

            {/* Common Core Tab: Traceability / Chain of Custody */}
            <button
              onClick={() => setActiveTab('traceability')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'traceability'
                  ? 'bg-[#124B3A] text-white shadow-xs font-bold'
                  : 'hover:text-[#172521] hover:bg-[#F8F7F1]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.chainOfCustody}</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Customer Service Address Chip (Compact, Clickable) */}
            {isCustomerRole && currentLocation && (
              <button
                onClick={() => setIsAddressModalOpen(true)}
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FAF5EC] hover:bg-[#EDE4D8] border border-[#EDE4D8] text-xs font-medium text-[#25345C] transition-colors cursor-pointer"
                title={t.selectAddress}
              >
                <MapPin className="w-3.5 h-3.5 text-[#12613F] shrink-0" />
                <span className="truncate max-w-[130px] font-semibold">
                  {currentLocation.label}
                </span>
                <ChevronDown className="w-3 h-3 text-[#53616D]" />
              </button>
            )}

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 rounded-xl text-[#172521] hover:bg-[#F8F7F1] transition-colors cursor-pointer"
              title={t.notifications}
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-[#172521]" />
              {unreadNotifCount > 0 && (
                <span className="absolute 1.5 top-1.5 right-1.5 w-2 h-2 bg-[#F5BF55] rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Role Switcher (Compact, High-Usability) */}
            <div className="relative">
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value as UserRole);
                  setActiveTab('overview');
                }}
                className="text-xs font-semibold text-[#172521] bg-[#F8F7F1] hover:bg-[#EFECE3] border border-[#E8E5DA] rounded-xl px-2.5 py-1.5 cursor-pointer focus:ring-2 focus:ring-[#124B3A] transition-colors"
                aria-label="Select role perspective"
              >
                <optgroup label={lang === 'en' ? 'Customer' : 'গ্রাহক'}>
                  <option value="customer_household">{roleLabels.customer_household[lang]}</option>
                  <option value="customer_apartment">{roleLabels.customer_apartment[lang]}</option>
                  <option value="customer_business">{roleLabels.customer_business[lang]}</option>
                </optgroup>
                <optgroup label={lang === 'en' ? 'Operations' : 'অপারেশন'}>
                  <option value="collector">{roleLabels.collector[lang]}</option>
                  <option value="aggregator">{roleLabels.aggregator[lang]}</option>
                  <option value="processor">{roleLabels.processor[lang]}</option>
                </optgroup>
                <optgroup label={lang === 'en' ? 'Governance & Brand' : 'গভর্ন্যান্স ও ব্র্যান্ড'}>
                  <option value="operator">{roleLabels.operator[lang]}</option>
                  <option value="brand_partner">{roleLabels.brand_partner[lang]}</option>
                </optgroup>
              </select>
            </div>

            {/* Language Switcher Button */}
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="px-2 py-1.5 text-xs font-bold rounded-xl border border-[#E8E5DA] bg-white hover:bg-[#F8F7F1] text-[#172521] transition-colors cursor-pointer"
              title="Switch language / ভাষা পরিবর্তন"
            >
              {lang === 'en' ? 'বাংলা' : 'English'}
            </button>

            {/* "More Options ▾" Dropdown Menu (Consolidates advanced/secondary tools) */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isMoreMenuOpen
                    ? 'bg-[#25345C] text-white border-[#25345C]'
                    : 'bg-white hover:bg-[#F8F7F1] border-[#E8E5DA] text-[#172521]'
                }`}
                title={t.moreMenu}
                aria-label="More options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMoreMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#EDE4D8] p-2 z-50 animate-fade-in text-xs space-y-1">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-[#53616D] uppercase tracking-wider border-b border-[#FAF5EC]">
                    {t.moreMenu}
                  </div>

                  {/* 5-Step Circularity Tour */}
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      setIsDemonstratorOpen(true);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left font-semibold text-[#202B38] hover:bg-[#FAF5EC] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Compass className="w-4 h-4 text-[#12613F]" />
                    <span>{t.fiveStepTour}</span>
                  </button>

                  {/* Investor Brief & Scale Economics */}
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      setIsInvestorShowcaseOpen(true);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left font-semibold text-[#202B38] hover:bg-[#FAF5EC] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#25345C]" />
                    <span>{t.investorBrief}</span>
                  </button>

                  {/* Evidence Protocol (E0–E5) */}
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      setActiveTab('evidence_model');
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left font-semibold text-[#202B38] hover:bg-[#FAF5EC] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <FileCheck2 className="w-4 h-4 text-[#12613F]" />
                    <span>{t.evidenceModel}</span>
                  </button>

                  {/* Drop-Off Hubs & Depots (for customer) */}
                  {isCustomerRole && (
                    <button
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        setActiveTab('services');
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left font-semibold text-[#202B38] hover:bg-[#FAF5EC] flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-[#53616D]" />
                      <span>{t.services}</span>
                    </button>
                  )}

                  {/* Multi-Site & Account Settings (for customer) */}
                  {isCustomerRole && (
                    <button
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        setActiveTab('account');
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left font-semibold text-[#202B38] hover:bg-[#FAF5EC] flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-[#53616D]" />
                      <span>{t.account}</span>
                    </button>
                  )}

                  {/* Help & Dispute Center */}
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      setIsDisputeModalOpen(true);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left font-semibold text-[#202B38] hover:bg-[#FAF5EC] flex items-center gap-2.5 transition-colors cursor-pointer border-t border-[#FAF5EC] pt-2"
                  >
                    <HelpCircle className="w-4 h-4 text-amber-700" />
                    <span>{t.helpAndSupport}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Address Switcher Modal (accessible from header or customer page) */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#EDE4D8] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EDE4D8] pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#25345C]" />
                <h3 className="text-base font-bold text-[#202B38]">{t.selectAddress}</h3>
              </div>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF5EC] flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {savedLocations.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => {
                    setSelectedLocationId(loc.id);
                    setIsAddressModalOpen(false);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedLocationId === loc.id
                      ? 'bg-[#FAF5EC] border-[#25345C] shadow-xs'
                      : 'bg-white border-[#EDE4D8] hover:border-[#25345C]/40'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#202B38]">{loc.label}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.2 rounded-md font-bold ${
                          loc.status === 'available'
                            ? 'bg-[#C9F1DC] text-[#12613F]'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {loc.status === 'available' ? t.activeLane : t.waitlist}
                      </span>
                    </div>
                    <p className="text-xs text-[#53616D]">{loc.address}</p>
                  </div>
                  {selectedLocationId === loc.id && (
                    <Check className="w-4 h-4 text-[#25345C] shrink-0" />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setIsAddressModalOpen(false);
                setIsOnboardingModalOpen(true);
              }}
              className="w-full py-2.5 bg-[#FAF5EC] hover:bg-[#EDE4D8] text-[#25345C] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addNewAddress}</span>
            </button>
          </div>
        </div>
      )}

      {/* Investor Loop Demonstrator Modal */}
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

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onOpenPreparation={(notif) => {
          setIsNotificationsOpen(false);
          setPrepModalNotif(notif);
        }}
      />

      {/* Preparation Guidance Modal */}
      {prepModalNotif && (
        <PreparationGuidanceModal
          isOpen={true}
          notification={prepModalNotif}
          booking={bookings.find((b) => b.id === prepModalNotif.bookingId) || bookings[0]}
          onClose={() => setPrepModalNotif(null)}
        />
      )}

      {/* Help / Dispute Modal */}
      <DisputeModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        bookingId={bookings[0]?.id}
      />

      {/* Onboarding / Add Address Modal */}
      <OnboardingFlowModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        onProceedToBooking={() => {
          setIsOnboardingModalOpen(false);
          setActiveTab('overview');
        }}
      />
    </>
  );
};
