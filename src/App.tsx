import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { CheckCircle2 } from 'lucide-react';
import { AppView, buildSearch, isCustomerRole, normaliseView, readRoute } from './routing';
import { readPitchRoute, type PitchRoute } from './live/routes';

// Each workspace is a separate chunk: a collector on a 3G phone should not have
// to download the operator command centre or the brand EPR portal.
const CustomerApp = lazy(() => import('./components/customer/CustomerApp').then((m) => ({ default: m.CustomerApp })));
const CollectorFieldApp = lazy(() => import('./components/collector/CollectorFieldApp').then((m) => ({ default: m.CollectorFieldApp })));
const AggregationHub = lazy(() => import('./components/aggregator/AggregationHub').then((m) => ({ default: m.AggregationHub })));
const ProcessorFacility = lazy(() => import('./components/processor/ProcessorFacility').then((m) => ({ default: m.ProcessorFacility })));
const OperatorDashboard = lazy(() => import('./components/operator/OperatorDashboard').then((m) => ({ default: m.OperatorDashboard })));
const BrandEPRPortal = lazy(() => import('./components/brand/BrandEPRPortal').then((m) => ({ default: m.BrandEPRPortal })));
const ChainOfCustodyView = lazy(() => import('./components/traceability/ChainOfCustodyView').then((m) => ({ default: m.ChainOfCustodyView })));
const EvidenceModelView = lazy(() => import('./components/traceability/EvidenceModelView').then((m) => ({ default: m.EvidenceModelView })));

// Pitch screens: full-screen, no app chrome, each its own chunk.
const PitchStage = lazy(() => import('./live/ui/PitchStage'));
const JoinScreen = lazy(() => import('./live/ui/JoinScreen'));
const DriveScreen = lazy(() => import('./live/ui/DriveScreen'));
const VerifyPage = lazy(() => import('./verify/VerifyPage'));

const PitchScreen: React.FC<{ route: PitchRoute }> = ({ route }) => {
  const { lang } = useApp();
  useEffect(() => {
    document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
  }, [lang]);
  return (
    <ErrorBoundary lang={lang}>
      <Suspense fallback={<ViewFallback />}>
        {route.kind === 'stage' && <PitchStage />}
        {route.kind === 'join' && <JoinScreen room={route.room} />}
        {route.kind === 'drive' && <DriveScreen room={route.room} />}
        {(route.kind === 'verify-lot' || route.kind === 'verify-live') && <VerifyPage route={route} />}
      </Suspense>
    </ErrorBoundary>
  );
};

const ViewFallback: React.FC = () => (
  <div role="status" aria-live="polite" className="py-24 flex flex-col items-center gap-3 text-sm text-[#53616D]">
    <span className="w-8 h-8 rounded-full border-2 border-[#C9F1DC] border-t-[#12613F] animate-spin" aria-hidden="true" />
    <span>Loading…</span>
  </div>
);

/**
 * Keeps `role` + `view` in sync with `?as=…&view=…` so every screen is linkable,
 * survives refresh, and the browser back/forward buttons work.
 */
const useRoutedView = () => {
  const { role, setRole } = useApp();
  const [view, setViewState] = useState<AppView>(() => normaliseView(role, readRoute().view));

  // Any view that is not valid for the current role falls back to its overview,
  // e.g. switching from a customer on "Rewards" to the Collector role.
  const activeView = normaliseView(role, view);

  // Push history when role/view change from inside the app. The first sync
  // replaces the entry so "Back" leaves the app in one press.
  const isFirstSync = useRef(true);
  useEffect(() => {
    const next = buildSearch(role, activeView);
    if (next !== window.location.search) {
      const url = `${window.location.pathname}${next}${window.location.hash}`;
      if (isFirstSync.current) window.history.replaceState(null, '', url);
      else window.history.pushState(null, '', url);
    }
    isFirstSync.current = false;
  }, [role, activeView]);

  // Respond to back/forward.
  useEffect(() => {
    const onPop = () => {
      const route = readRoute();
      const nextRole = route.role ?? role;
      if (route.role && route.role !== role) setRole(route.role);
      setViewState(normaliseView(nextRole, route.view));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [role, setRole]);

  const setView = useCallback((next: string) => {
    setViewState(next as AppView);
    window.scrollTo({ top: 0 });
  }, []);

  return { view: activeView, setView };
};

const MainContent: React.FC = () => {
  const { role, activeToast, lang } = useApp();
  const { view, setView } = useRoutedView();

  useEffect(() => {
    document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
  }, [lang]);

  const renderActiveView = () => {
    if (view === 'evidence_model') return <EvidenceModelView />;
    if (view === 'traceability') return <ChainOfCustodyView />;

    if (isCustomerRole(role)) {
      const tab = view === 'rewards' ? 'rewards' : view === 'activity' ? 'activity' : 'home';
      return <CustomerApp initialTab={tab} onNavigateTab={setView} />;
    }

    switch (role) {
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
        return <CustomerApp initialTab="home" onNavigateTab={setView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-[#202B38] font-sans selection:bg-[#C9F1DC] selection:text-[#12613F]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-[#124B3A] focus:text-white focus:text-sm focus:font-bold"
      >
        {lang === 'en' ? 'Skip to content' : 'মূল বিষয়ে যান'}
      </a>

      {/* Toast — announced to screen readers */}
      <div aria-live="polite" role="status" className="fixed bottom-24 md:bottom-6 right-4 md:right-6 left-4 md:left-auto z-[80] flex justify-end pointer-events-none">
        {activeToast && (
          <div className="animate-fade-in max-w-sm bg-[#172521] text-white text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-[#25345C] pointer-events-auto">
            <CheckCircle2 className="w-4 h-4 text-[#C9F1DC] shrink-0" aria-hidden="true" />
            <span className="leading-snug">{activeToast}</span>
          </div>
        )}
      </div>

      <Header activeTab={view} setActiveTab={setView} />

      <main id="main" tabIndex={-1} className="flex-1 w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl outline-none">
        {/* Keyed by role+view so a crash in one workspace can be recovered by navigating away. */}
        <ErrorBoundary key={`${role}:${view}`} lang={lang}>
          <Suspense fallback={<ViewFallback />}>{renderActiveView()}</Suspense>
        </ErrorBoundary>
      </main>

      {/* Bottom padding on mobile customer views so the fixed tab bar never covers the footer. */}
      <footer className={`bg-white border-t border-[#EDE4D8] mt-12 py-8 text-xs text-[#53616D] ${isCustomerRole(role) ? 'pb-24 md:pb-8' : ''}`}>
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

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[#53616D]">
            <span>
              {lang === 'en'
                ? 'Bangladesh Solid Waste Management Rules 2021 Reference'
                : 'বাংলাদেশ কঠিন বর্জ্য ব্যবস্থাপনা বিধিমালা ২০২১ অনুসরণে'}
            </span>
            <span aria-hidden="true">·</span>
            {/* Evidence codes are for staff and brand reviewers; customers see plain wording. */}
            {!isCustomerRole(role) && (
              <button
                onClick={() => setView('evidence_model')}
                className="hover:text-[#25345C] underline underline-offset-4 cursor-pointer font-medium"
              >
                {lang === 'en' ? 'Evidence Protocol (E0–E5)' : 'প্রমাণ মানদণ্ড (E0–E5)'}
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  const pitchRoute = readPitchRoute();
  return <AppProvider>{pitchRoute ? <PitchScreen route={pitchRoute} /> : <MainContent />}</AppProvider>;
}
