import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { CustomerApp } from './components/customer/CustomerApp';
import { CollectorFieldApp } from './components/collector/CollectorFieldApp';
import { AggregationHub } from './components/aggregator/AggregationHub';
import { ProcessorFacility } from './components/processor/ProcessorFacility';
import { OperatorDashboard } from './components/operator/OperatorDashboard';
import { BrandEPRPortal } from './components/brand/BrandEPRPortal';
import { ChainOfCustodyView } from './components/traceability/ChainOfCustodyView';
import { EvidenceModelView } from './components/traceability/EvidenceModelView';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from './utils/translations';

const MainContent: React.FC = () => {
  const { role, activeToast, lang } = useApp();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const t = useTranslation(lang);

  const renderActiveView = () => {
    if (activeTab === 'rewards') {
      return <CustomerApp initialTab="rewards" onNavigateTab={setActiveTab} />;
    }
    if (activeTab === 'activity') {
      return <CustomerApp initialTab="activity" onNavigateTab={setActiveTab} />;
    }
    if (activeTab === 'services') {
      return <CustomerApp initialTab="home" onNavigateTab={setActiveTab} />;
    }
    if (activeTab === 'account') {
      return <CustomerApp initialTab="home" onNavigateTab={setActiveTab} />;
    }
    if (activeTab === 'traceability') {
      return <ChainOfCustodyView />;
    }
    if (activeTab === 'evidence_model') {
      return <EvidenceModelView />;
    }

    // Role-dependent views for 'overview'
    switch (role) {
      case 'customer_household':
      case 'customer_apartment':
      case 'customer_business':
        return <CustomerApp initialTab="home" onNavigateTab={setActiveTab} />;
      case 'collector':
        return <CollectorFieldApp />;
      case 'aggregator':
        return <AggregationHub />;
      case 'processor':
        return <ProcessorFacility />;
      case 'operator':
        return <OperatorDashboard />;
      case 'brand_partner':
        return <BrandEPRPortal />;
      default:
        return <CustomerApp initialTab="home" onNavigateTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-[#202B38] font-sans selection:bg-[#C9F1DC] selection:text-[#12613F]">
      {/* Toast Notification Container */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in max-w-sm">
          <div className="bg-[#172521] text-white text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-[#25345C]">
            <CheckCircle2 className="w-4 h-4 text-[#C9F1DC] shrink-0" />
            <span className="leading-snug">{activeToast}</span>
          </div>
        </div>
      )}

      {/* Single Unified Top Navigation Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl">
        {renderActiveView()}
      </main>

      {/* Clean Quiet Footer */}
      <footer className="bg-white border-t border-[#EDE4D8] mt-12 py-8 text-xs text-[#53616D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="font-bold text-[#202B38] tracking-tight">Clean Lane</span>
            <span aria-hidden="true">·</span>
            <span>
              {lang === 'en'
                ? 'Household Waste Services, Circular Rewards & Digital Recovery Traceability'
                : 'গৃহস্থালি বর্জ্য সেবা, সার্কুলার রিওয়ার্ড ও ডিজিটাল ট্রেসেবিলিটি ট্র্যাকিং'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[#53616D]">
            <span>
              {lang === 'en'
                ? 'Bangladesh Solid Waste Management Rules 2021 Reference'
                : 'বাংলাদেশ কঠিন বর্জ্য ব্যবস্থাপনা বিধিমালা ২০২১ অনুসরণে'}
            </span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveTab('evidence_model')}
              className="hover:text-[#25345C] underline underline-offset-4 cursor-pointer font-medium"
            >
              {lang === 'en' ? 'Evidence Protocol (E0–E5)' : 'প্রমাণ মানদণ্ড (E0–E5)'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
