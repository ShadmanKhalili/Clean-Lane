import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { useTranslation } from '../../utils/translations';
import {
  X,
  User,
  Globe,
  Bell,
  Building,
  MapPin,
  Settings,
  Check,
  Plus,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Sparkles,
  Compass,
  FileCheck2,
  RefreshCw
} from 'lucide-react';

interface AccountDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOnboarding: () => void;
  onOpenEvidenceModel?: () => void;
  onOpenTour?: () => void;
  onOpenInvestorBrief?: () => void;
}

export const AccountDrawerModal: React.FC<AccountDrawerModalProps> = ({
  isOpen,
  onClose,
  onOpenOnboarding,
  onOpenEvidenceModel,
  onOpenTour,
  onOpenInvestorBrief
}) => {
  const {
    lang,
    setLang,
    role,
    setRole,
    savedLocations,
    selectedLocationId,
    setSelectedLocationId,
    notifications,
    notificationSettings,
    updateNotificationSettings,
    isOfflineMode,
    setIsOfflineMode,
    syncOfflineQueue,
    offlineQueueCount
  } = useApp();

  const t = useTranslation(lang);
  const [activeSection, setActiveSection] = useState<'profile' | 'locations' | 'organisation' | 'settings'>('profile');

  if (!isOpen) return null;

  const roleLabels: Record<UserRole, { en: string; bn: string }> = {
    customer_household: { en: 'Household Resident', bn: 'বাসাবাড়ির বাসিন্দা' },
    customer_apartment: { en: 'Apartment Committee', bn: 'ভবন ব্যবস্থাপনা কমিটি' },
    customer_business: { en: 'Business / Café', bn: 'ব্যবসা প্রতিষ্ঠান' },
    collector: { en: 'Field Collector', bn: 'মাঠ সংগ্রাহক' },
    aggregator: { en: 'Aggregation Hub', bn: 'একত্রীকরণ কেন্দ্র' },
    processor: { en: 'Processor / Recycler', bn: 'রিসাইক্লার মিল' },
    operator: { en: 'Operations Admin', bn: 'অপারেশনস অ্যাডমিন' },
    brand_partner: { en: 'Brand / EPR Partner', bn: 'ব্র্যান্ড ও ইপিআর পার্টনার' }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF9F5] w-full max-w-md h-full flex flex-col border-l border-[#EDE4D8] shadow-2xl text-[#202B38] overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 bg-white border-b border-[#EDE4D8] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#25345C] text-[#C9F1DC] flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#202B38]">{t.account}</h2>
              <span className="text-xs text-[#53616D]">Nasreen Akhter · +880 1712-345678</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#FAF5EC] hover:bg-[#EDE4D8] flex items-center justify-center text-[#53616D] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section Navigation Pills */}
        <div className="px-6 py-2.5 bg-white border-b border-[#EDE4D8] flex items-center gap-1.5 overflow-x-auto shrink-0 text-xs font-semibold">
          <button
            onClick={() => setActiveSection('profile')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeSection === 'profile'
                ? 'bg-[#25345C] text-white shadow-2xs'
                : 'text-[#53616D] hover:bg-[#FAF5EC]'
            }`}
          >
            {lang === 'en' ? 'Profile & Preferences' : 'প্রোফাইল ও পছন্দ'}
          </button>

          <button
            onClick={() => setActiveSection('locations')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeSection === 'locations'
                ? 'bg-[#25345C] text-white shadow-2xs'
                : 'text-[#53616D] hover:bg-[#FAF5EC]'
            }`}
          >
            {lang === 'en' ? 'Saved Locations' : 'সংরক্ষিত ঠিকানা'}
          </button>

          <button
            onClick={() => setActiveSection('organisation')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeSection === 'organisation'
                ? 'bg-[#25345C] text-white shadow-2xs'
                : 'text-[#53616D] hover:bg-[#FAF5EC]'
            }`}
          >
            {lang === 'en' ? 'Organisation' : 'প্রতিষ্ঠান'}
          </button>

          <button
            onClick={() => setActiveSection('settings')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeSection === 'settings'
                ? 'bg-[#25345C] text-white shadow-2xs'
                : 'text-[#53616D] hover:bg-[#FAF5EC]'
            }`}
          >
            {lang === 'en' ? 'Settings & System' : 'সিস্টেম সেটিংস'}
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* SECTION 1: PROFILE & LANGUAGE & NOTIFICATIONS */}
          {activeSection === 'profile' && (
            <div className="space-y-5 animate-fade-in">
              {/* Profile Card */}
              <div className="p-4 bg-white rounded-2xl border border-[#EDE4D8] space-y-3">
                <span className="text-[11px] font-bold text-[#53616D] uppercase tracking-wider block">
                  {lang === 'en' ? 'Contact Information' : 'যোগাযোগের তথ্য'}
                </span>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[#53616D]">{lang === 'en' ? 'Name' : 'নাম'}</span>
                    <span className="font-bold text-[#202B38]">Nasreen Akhter</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#53616D]">{lang === 'en' ? 'Phone' : 'মোবাইল'}</span>
                    <span className="font-mono font-bold text-[#202B38]">+880 1712-345678</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#53616D]">{lang === 'en' ? 'Customer ID' : 'গ্রাহক আইডি'}</span>
                    <span className="font-mono text-[#25345C]">CL-CUST-8841</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-[#FAF5EC]">
                    <span className="text-[#53616D]">{lang === 'en' ? 'Verification' : 'যাচাই অবস্থা'}</span>
                    <span className="font-bold text-[#12613F] bg-[#C9F1DC] px-2 py-0.5 rounded-md">
                      Verified Resident ✓
                    </span>
                  </div>
                </div>
              </div>

              {/* Language Selection */}
              <div className="p-4 bg-white rounded-2xl border border-[#EDE4D8] space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#25345C]" />
                  <span className="font-bold text-sm text-[#202B38]">
                    {lang === 'en' ? 'Interface Language' : 'ভাষার পছন্দ'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setLang('en')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                      lang === 'en'
                        ? 'bg-[#25345C] text-white border-[#25345C] shadow-2xs'
                        : 'bg-[#FAF5EC] text-[#202B38] border-[#EDE4D8] hover:bg-[#EDE4D8]'
                    }`}
                  >
                    <span>English</span>
                    {lang === 'en' && <Check className="w-3.5 h-3.5 text-[#C9F1DC]" />}
                  </button>
                  <button
                    onClick={() => setLang('bn')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                      lang === 'bn'
                        ? 'bg-[#25345C] text-white border-[#25345C] shadow-2xs'
                        : 'bg-[#FAF5EC] text-[#202B38] border-[#EDE4D8] hover:bg-[#EDE4D8]'
                    }`}
                  >
                    <span>বাংলা (Bengali)</span>
                    {lang === 'bn' && <Check className="w-3.5 h-3.5 text-[#C9F1DC]" />}
                  </button>
                </div>
              </div>

              {/* Notifications Settings */}
              <div className="p-4 bg-white rounded-2xl border border-[#EDE4D8] space-y-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#25345C]" />
                  <span className="font-bold text-sm text-[#202B38]">
                    {lang === 'en' ? 'Notifications & Reminders' : 'বিজ্ঞপ্তি ও অ্যালার্ট'}
                  </span>
                </div>
                <div className="space-y-2.5">
                  <label className="flex items-center justify-between p-2 rounded-xl bg-[#FAF5EC]/60 cursor-pointer">
                    <div>
                      <span className="font-bold text-[#202B38] block">
                        {lang === 'en' ? '24-hour Pickup Preparation SMS' : '২৪ ঘণ্টা পূর্বের প্রস্তুতি রিমাইন্ডার'}
                      </span>
                      <span className="text-[11px] text-[#53616D]">
                        {lang === 'en' ? 'SMS with window & bagging instructions' : 'সংগ্রহের সময় ও প্রস্তুতি চেকলিস্ট'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.reminder24h}
                      onChange={(e) => updateNotificationSettings({ reminder24h: e.target.checked })}
                      className="w-4 h-4 accent-[#12613F] rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl bg-[#FAF5EC]/60 cursor-pointer">
                    <div>
                      <span className="font-bold text-[#202B38] block">
                        {lang === 'en' ? 'Scale Weigh-In Confirmation' : 'স্কেল ওজন ও পয়েন্ট রসিদ এসএমএস'}
                      </span>
                      <span className="text-[11px] text-[#53616D]">
                        {lang === 'en' ? 'Instant points notification after weighing' : 'ওজন নিশ্চিত হওয়ার সাথে সাথে পয়েন্ট বিজ্ঞপ্তি'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.smsEnabled}
                      onChange={(e) => updateNotificationSettings({ smsEnabled: e.target.checked })}
                      className="w-4 h-4 accent-[#12613F] rounded"
                    />
                  </label>
                </div>
              </div>

              {/* Perspective Role Switcher (Preserves Full Multi-Actor System) */}
              <div className="p-4 bg-white rounded-2xl border border-[#EDE4D8] space-y-3">
                <span className="text-[11px] font-bold text-[#53616D] uppercase tracking-wider block">
                  {lang === 'en' ? 'Switch Platform Perspective' : 'প্ল্যাটফর্ম রোল পরিবর্তন'}
                </span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-[#FAF5EC] border border-[#EDE4D8] rounded-xl p-2.5 text-xs font-bold text-[#202B38] cursor-pointer"
                >
                  <optgroup label={lang === 'en' ? 'Customer Views' : 'গ্রাহক ভিউ'}>
                    <option value="customer_household">{roleLabels.customer_household[lang]}</option>
                    <option value="customer_apartment">{roleLabels.customer_apartment[lang]}</option>
                    <option value="customer_business">{roleLabels.customer_business[lang]}</option>
                  </optgroup>
                  <optgroup label={lang === 'en' ? 'Operational Staff' : 'অপারেশনস'}>
                    <option value="collector">{roleLabels.collector[lang]}</option>
                    <option value="aggregator">{roleLabels.aggregator[lang]}</option>
                    <option value="processor">{roleLabels.processor[lang]}</option>
                  </optgroup>
                  <optgroup label={lang === 'en' ? 'Governance' : 'গভর্ন্যান্স'}>
                    <option value="operator">{roleLabels.operator[lang]}</option>
                    <option value="brand_partner">{roleLabels.brand_partner[lang]}</option>
                  </optgroup>
                </select>
                <p className="text-[11px] text-[#53616D] leading-relaxed">
                  {lang === 'en'
                    ? 'Clean Lane maintains distinct consoles for field collectors, receiving hubs, recyclers, and municipal operators.'
                    : 'মাঠকর্মী, কেন্দ্র ইনটেক ও অ্যাডমিনদের জন্য আলাদা ইন্টারফেস বিদ্যমান।'}
                </p>
              </div>
            </div>
          )}

          {/* SECTION 2: SAVED LOCATIONS */}
          {activeSection === 'locations' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#202B38]">
                  {lang === 'en' ? 'Collection Addresses' : 'বর্জ্য সংগ্রহের ঠিকানাসমূহ'}
                </span>
                <button
                  onClick={onOpenOnboarding}
                  className="px-3 py-1.5 bg-[#25345C] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-[#1B2644]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Add Address' : 'নতুন ঠিকানা'}</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {savedLocations.map((loc) => (
                  <div
                    key={loc.id}
                    onClick={() => setSelectedLocationId(loc.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedLocationId === loc.id
                        ? 'bg-white border-[#25345C] shadow-xs'
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
            </div>
          )}

          {/* SECTION 3: ORGANISATION & MULTI-UNIT SITES */}
          {activeSection === 'organisation' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-white rounded-2xl border border-[#EDE4D8] space-y-3">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#25345C]" />
                  <span className="font-bold text-sm text-[#202B38]">
                    {lang === 'en' ? 'Apartment & Business Access' : 'ভবন ও প্রাতিষ্ঠানিক ব্যবস্থাপনা'}
                  </span>
                </div>
                <p className="text-xs text-[#53616D] leading-relaxed">
                  {lang === 'en'
                    ? 'For residential building committees, shared-bin compounds, and commercial food & beverage businesses.'
                    : 'আবাসিক ভবন কমিটি, শেয়ার্ড বিন এলাকা এবং বাণিজ্যিক খাদ্য ও ক্যাফে প্রতিষ্ঠানের জন্য।'}
                </p>

                <div className="p-3 bg-[#FAF5EC] rounded-xl space-y-2 border border-[#EDE4D8]">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#202B38]">Gulshan Parkview Committee</span>
                    <span className="text-[10px] font-mono bg-[#C9F1DC] text-[#12613F] px-2 py-0.5 rounded font-bold">
                      24 Units
                    </span>
                  </div>
                  <p className="text-[11px] text-[#53616D]">
                    {lang === 'en'
                      ? 'Building-level attribution rule active. Points credited to communal maintenance fund.'
                      : 'ভবন-স্তরের পয়েন্ট নিয়ম সক্রিয়। ফ্ল্যাট মালিক সমিতির ফান্ডে পয়েন্ট জমা হয়।'}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setRole('customer_apartment');
                      onClose();
                    }}
                    className="w-full py-2.5 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-xl font-bold text-xs transition-colors cursor-pointer text-center"
                  >
                    {lang === 'en' ? 'Open Committee Console' : 'কমিটি কনসোল ওপেন করুন'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: SYSTEM PROTOCOLS & ENTERPRISE TOOLS */}
          {activeSection === 'settings' && (
            <div className="space-y-3 animate-fade-in">
              <span className="text-[11px] font-bold text-[#53616D] uppercase tracking-wider block">
                {lang === 'en' ? 'System Verification Protocols' : 'সিস্টেম যাচাই প্রটোকল'}
              </span>

              {onOpenEvidenceModel && (
                <button
                  onClick={() => {
                    onOpenEvidenceModel();
                    onClose();
                  }}
                  className="w-full p-3.5 bg-white border border-[#EDE4D8] rounded-2xl flex items-center justify-between text-left hover:bg-[#FAF5EC] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <FileCheck2 className="w-4 h-4 text-[#12613F]" />
                    <div>
                      <span className="font-bold text-[#202B38] block">
                        {lang === 'en' ? 'Evidence Protocol (E0–E5)' : 'প্রমাণ মানদণ্ড (E0–E5)'}
                      </span>
                      <span className="text-[11px] text-[#53616D]">
                        {lang === 'en' ? 'Cryptographic scale weight and GPS ledger standards' : 'ডিজিটাল স্কেল ও জিপিএস প্রমাণপত্র অডিট মান'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#53616D]" />
                </button>
              )}

              {onOpenInvestorBrief && (
                <button
                  onClick={() => {
                    onOpenInvestorBrief();
                    onClose();
                  }}
                  className="w-full p-3.5 bg-white border border-[#EDE4D8] rounded-2xl flex items-center justify-between text-left hover:bg-[#FAF5EC] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#25345C]" />
                    <div>
                      <span className="font-bold text-[#202B38] block">
                        {lang === 'en' ? 'Investor Brief & Unit Economics' : 'ইনভেস্টর বিবরণ ও ইউনিট অর্থনীতি'}
                      </span>
                      <span className="text-[11px] text-[#53616D]">
                        {lang === 'en' ? 'Corridor economics, margin breakdown and EPR funding' : 'করিডোর অর্থনীতি ও সার্কুলার তহবিল মডেল'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#53616D]" />
                </button>
              )}

              {onOpenTour && (
                <button
                  onClick={() => {
                    onOpenTour();
                    onClose();
                  }}
                  className="w-full p-3.5 bg-white border border-[#EDE4D8] rounded-2xl flex items-center justify-between text-left hover:bg-[#FAF5EC] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Compass className="w-4 h-4 text-[#12613F]" />
                    <div>
                      <span className="font-bold text-[#202B38] block">
                        {lang === 'en' ? '5-Step Circularity Tour' : '৫-ধাপের সার্কুলার সফর'}
                      </span>
                      <span className="text-[11px] text-[#53616D]">
                        {lang === 'en' ? 'Demonstration of door-to-mill material journey' : 'ডোরস্টেপ থেকে রিসাইক্লার মিল পর্যন্ত রূপান্তর'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#53616D]" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
