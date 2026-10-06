import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { CustomerApp } from './components/customer/CustomerApp';
import { RewardsStore } from './components/customer/RewardsStore';
import { CollectorFieldApp } from './components/collector/CollectorFieldApp';
import { AggregationHub } from './components/aggregator/AggregationHub';
import { ProcessorFacility } from './components/processor/ProcessorFacility';
import { OperatorDashboard } from './components/operator/OperatorDashboard';
import { BrandEPRPortal } from './components/brand/BrandEPRPortal';
import { ChainOfCustodyView } from './components/traceability/ChainOfCustodyView';
import { EvidenceModelView } from './components/traceability/EvidenceModelView';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

const MainContent: React.FC = () => {
  const { role, activeToast, lang } = useApp();
  const [activeTab, setActiveTab] = useState<string>('overview');

  const renderActiveView = () => {
    if (activeTab === 'rewards') {
      return <CustomerApp />;
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
        return <CustomerApp />;
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
        return <CustomerApp />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Toast Notification Container */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in max-w-sm">
          <div className="bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="leading-snug">{activeToast}</span>
          </div>
        </div>
      )}

      {/* Top Navigation Contract (PRD & Section 2) */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveView()}
      </main>

      {/* Clean Quiet Footer (Section 1.B Anti-slop Ban) */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 tracking-tight">Clean Lane</span>
            <span aria-hidden="true">·</span>
            <span>Waste Services, Circular Rewards and Recovery Traceability</span>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <span>Bangladesh Solid Waste Management Rules 2021 Reference</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveTab('evidence_model')}
              className="hover:text-slate-900 underline underline-offset-4"
            >
              Evidence Protocol (E0–E5)
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
