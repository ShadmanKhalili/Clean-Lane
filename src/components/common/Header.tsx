import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { ShieldCheck, Wifi, WifiOff } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { role, setRole, lang, setLang, isOfflineMode, setIsOfflineMode, offlineQueueCount, syncOfflineQueue } = useApp();

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
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Offline Alert Banner if collector */}
      {isOfflineMode && role === 'collector' && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-slate-950" />
            <span>Field Offline Simulation Active · {offlineQueueCount} unsynchronized records queued locally</span>
          </div>
          <button
            onClick={syncOfflineQueue}
            className="px-2.5 py-0.5 bg-slate-950 text-white rounded text-xs hover:bg-slate-800 transition-colors"
          >
            Reconnect & Sync
          </button>
        </div>
      )}

      {/* Main Top Bar Contract: Zone 1 (Brand) - Zone 2 (Nav links) - Zone 3 (Actions) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className="text-left group flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              CL
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                Clean Lane
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-500">
                {lang === 'en' ? 'Recovery & Circular Traceability' : 'বর্জ্য পুনরুদ্ধার ও বৃত্তাকার ট্র্যাকিং'}
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('overview')}
            className={`transition-colors hover:text-slate-900 ${
              activeTab === 'overview' ? 'text-emerald-700 font-semibold' : ''
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
              className={`transition-colors hover:text-slate-900 ${
                activeTab === 'rewards' ? 'text-emerald-700 font-semibold' : ''
              }`}
            >
              {lang === 'en' ? 'Circular Rewards' : 'রিওয়ার্ড শপ'}
            </button>
          )}

          <button
            onClick={() => setActiveTab('traceability')}
            className={`transition-colors hover:text-slate-900 ${
              activeTab === 'traceability' ? 'text-emerald-700 font-semibold' : ''
            }`}
          >
            {lang === 'en' ? 'Chain of Custody' : 'কাস্টডি রেকর্ড'}
          </button>

          <button
            onClick={() => setActiveTab('evidence_model')}
            className={`transition-colors hover:text-slate-900 ${
              activeTab === 'evidence_model' ? 'text-emerald-700 font-semibold' : ''
            }`}
          >
            {lang === 'en' ? 'Evidence Standard (E0-E5)' : 'প্রমাণ মানদণ্ড'}
          </button>
        </nav>

        {/* Zone 3: Actions (Role Switcher & Language) */}
        <div className="flex items-center gap-3">
          {/* Role Selector */}
          <div className="relative">
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value as UserRole);
                setActiveTab('overview');
              }}
              className="text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg px-3 py-2 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-colors"
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
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            title="Switch language"
          >
            {lang === 'en' ? 'বাংলা' : 'English'}
          </button>
        </div>
      </div>
    </header>
  );
};
