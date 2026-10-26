import React, { useState, Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from './utils/translations';

// Role-specific portals and traceability views are lazy-loaded so the initial
// bundle only ships the shared shell + customer app. This cuts the first-load
// JS by roughly half for any given visitor.
const CustomerApp = lazy(() =>
  import('./components/customer/CustomerApp').then((m) => ({ default: m.CustomerApp }))
);
const CollectorFieldApp = lazy(() =>
  import('./components/collector/CollectorFieldApp').then((m) => ({ default: m.CollectorFieldApp }))
);
const AggregationHub = lazy(() =>
  import('./components/aggregator/AggregationHub').then((m) => ({ default: m.AggregationHub }))
);
const ProcessorFacility = lazy(() =>
  import('./components/processor/ProcessorFacility').then((m) => ({ default: m.ProcessorFacility }))
);
const OperatorDashboard = lazy(() =>
  import('./components/operator/OperatorDashboard').then((m) => ({ default: m.OperatorDashboard }))
);
const BrandEPRPortal = lazy(() =>
  import('./components/brand/BrandEPRPortal').then((m) => ({ default: m.BrandEPRPortal }))
);
const ChainOfCustodyView = lazy(() =>
  import('./components/traceability/ChainOfCustodyView').then((m) => ({ default: m.ChainOfCustodyView }))
);
const EvidenceModelView = lazy(() =>
  import('./components/traceability/EvidenceModelView').then((m) => ({ default: m.EvidenceModelView }))
);

const ViewFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center gap-3 py-24 text-[#53616D]" role="status" aria-live="polite">
    <span className="w-8 h-8 rounded-full border-2 border-[#C9F1DC] border-t-[#12613F] animate-spin motion-reduce:animate-none" />
    <span className="text-xs font-medium tracking-wide">Loading view…</span>
  </div>
);

const MainContent: React.FC = () => {
  const { role, activeToast, lang, resetDemoData } = useApp();
  const [activeTab, setActiveTab] = useState<string>(
    () => window.location.hash.replace(/^#\/?/, '') || 'overview'
  );
  const t = useTranslation(lang);

  // Keep the URL hash in sync so deep links and browser reloads restore the
  // last-viewed portal (e.g. #/traceability).
  React.useEffect(() => {
    const onHashChange = () => {
      setActiveTab(window.location.hash.replace(/^#\/?/, '') || 'overview');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigateTab = (tab: string) => {
    setActiveTab(tab);
    if (window.location.hash !== `#/${tab}`) {
      window.history.replaceState(null, '', `#/${tab}`);
    }
  };

  const renderActiveView = () => {
    if (activeTab === 'rewards') {
      return <CustomerApp initialTab="rewards" onNavigateTab={navigateTab} />;
    }
    if (activeTab === 'activity') {
      return <CustomerApp initialTab="activity" onNavigateTab={navigateTab} />;
    }
    if (activeTab === 'services') {
      return <CustomerApp initialTab="home" onNavigateTab={navigateTab} />;
    }
    if (activeTab === 'account') {
      return <CustomerApp initialTab="home" onNavigateTab={navigateTab} />;
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
        return <CustomerApp initialTab="home" onNavigateTab={navigateTab} />;
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
        return <CustomerApp initialTab="home" onNavigateTab={navigateTab} />;
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
      <Header activeTab={activeTab} setActiveTab={navigateTab} />

      {/* Main Content Area */}
      <main className="flex-1 w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl">
        <Suspense fallback={<ViewFallback />}>{renderActiveView()}</Suspense>
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
              onClick={() => navigateTab('evidence_model')}
              className="hover:text-[#25345C] underline underline-offset-4 cursor-pointer font-medium"
            >
              {lang === 'en' ? 'Evidence Protocol (E0–E5)' : 'প্রমাণ মানদণ্ড (E0–E5)'}
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => {
                if (window.confirm(
                  lang === 'en'
                    ? 'Reset all demo data to its original state?'
                    : 'সমস্ত ডেমো তথ্য পূর্বাবস্থায় ফিরিয়ে আনবেন?'
                )) {
                  resetDemoData();
                }
              }}
              className="hover:text-[#25345C] underline underline-offset-4 cursor-pointer font-medium"
            >
              {lang === 'en' ? 'Reset demo data' : 'ডেমো রিসেট'}
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
