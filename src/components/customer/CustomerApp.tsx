import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking, DropOffPoint, MaterialCategory } from '../../types';
import { MATERIAL_TAXONOMY } from '../../data/mockData';
import { EvidenceBadge } from '../common/EvidenceBadge';
import { StatusTracker } from '../common/StatusTracker';
import { NewBookingModal } from './NewBookingModal';
import { MaterialGuideModal } from './MaterialGuideModal';
import { DisputeModal } from './DisputeModal';
import { OnboardingFlowModal } from './OnboardingFlowModal';
import { TransactionDetailModal } from './TransactionDetailModal';
import { DropOffDetailModal } from './DropOffDetailModal';
import { OrganisationDashboardView } from './OrganisationDashboardView';
import { speakInstruction } from '../../utils/statusDictionary';
import { ContinuousLoopLine } from '../common/ContinuousLoopLine';
import {
  Home,
  Layers,
  Clock,
  Gift,
  User,
  Plus,
  Calendar,
  MapPin,
  ChevronRight,
  Coins,
  ShieldCheck,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Filter,
  CheckCircle2,
  Building,
  Store,
  Compass,
  FileText,
  Search,
  Sparkles
} from 'lucide-react';

interface CustomerAppProps {
  initialTab?: 'home' | 'services' | 'activity' | 'rewards' | 'account';
}

export const CustomerApp: React.FC<CustomerAppProps> = ({ initialTab = 'home' }) => {
  const {
    role,
    setRole,
    lang,
    setLang,
    bookings,
    pointsLedger,
    rewards,
    redemptions,
    customerAvailablePoints,
    customerPendingPoints,
    serviceZones,
    dropOffPoints,
    savedLocations,
    selectedLocationId,
    setSelectedLocationId,
    redeemReward
  } = useApp();

  // 5 Destinations: home | services | activity | rewards | account
  const [activeTab, setActiveTab] = useState<'home' | 'services' | 'activity' | 'rewards' | 'account'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [selectedBookingForDispute, setSelectedBookingForDispute] = useState<string | undefined>(undefined);
  const [inspectedBooking, setInspectedBooking] = useState<Booking | null>(null);
  const [selectedDropOffPoint, setSelectedDropOffPoint] = useState<DropOffPoint | null>(null);

  // Activity Tab filter
  const [activityFilter, setActivityFilter] = useState<'all' | 'upcoming' | 'completed' | 'needs_attention'>('all');

  // Services Drop-off filter
  const [dropOffMaterialFilter, setDropOffMaterialFilter] = useState<string>('all');

  // Rewards category filter
  const [rewardCategoryFilter, setRewardCategoryFilter] = useState<string>('all');

  // Rewards redemption state
  const [successCode, setSuccessCode] = useState<string | null>(null);

  // Location object
  const currentLocation =
    savedLocations.find((l) => l.id === selectedLocationId) || savedLocations[0];

  // Next booking calculation
  const nextBooking = bookings.find(
    (b) => b.status === 'CONFIRMED' || b.status === 'COLLECTOR_ASSIGNED' || b.status === 'REQUESTED'
  );

  // Confirmed material sum
  const confirmedKg = bookings.reduce((acc, b) => acc + (b.confirmedWeightKg || 0), 0);

  const handleOpenTransactionDetail = (booking: Booking) => {
    setInspectedBooking(booking);
  };

  const handleReportIssue = (bookingId: string) => {
    setSelectedBookingForDispute(bookingId);
    setIsDisputeModalOpen(true);
  };

  const handleRedeem = (rewardId: string) => {
    const res = redeemReward(rewardId);
    if (res.success && res.couponCode) {
      setSuccessCode(res.couponCode);
    }
  };

  return (
    <div className="space-y-6">
      {/* 5 Bottom-Navigation Tabs (Desktop top pill switcher + mobile bottom bar) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'home', label: lang === 'en' ? 'Home' : 'হোম', icon: Home },
            { id: 'services', label: lang === 'en' ? 'Services' : 'সেবাসমূহ', icon: Layers },
            { id: 'activity', label: lang === 'en' ? 'Activity' : 'অ্যাক্টিভিটি', icon: Clock },
            { id: 'rewards', label: lang === 'en' ? 'Rewards' : 'রিওয়ার্ডস', icon: Gift },
            { id: 'account', label: lang === 'en' ? 'Account' : 'অ্যাকাউন্ট', icon: User }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Launch Onboarding Button (to test Flow A) */}
        <button
          onClick={() => setIsOnboardingModalOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>Test Flow A (Onboarding & Check)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HOME (Wireframe C05) */}
      {/* ========================================================================= */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          {/* Conditional Priority Alert (PRD C05: Missed collection or unresolved issue replaces promo near top) */}
          {bookings.some((b) => b.status === 'MISSED' || b.status === 'DISPUTED') && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fade-in shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-amber-950 block text-sm">
                    {lang === 'en' ? 'Collection Attention Needed' : 'সংগ্রহ সংক্রান্ত সতর্কতা'}
                  </span>
                  <p className="text-amber-800 text-xs mt-0.5">
                    {lang === 'en'
                      ? 'A collection was missed or flagged for discrepancy. Dispatch operator is investigating.'
                      : 'একটি সংগ্রহ সম্পন্ন হতে পারেনি অথবা পর্যালোচনায় রয়েছে।'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const disputed = bookings.find((b) => b.status === 'MISSED' || b.status === 'DISPUTED');
                  handleReportIssue(disputed?.id || 'CL-BK-001');
                }}
                className="min-h-[44px] px-4 py-2 bg-amber-900 text-white hover:bg-amber-950 rounded-xl font-bold text-xs self-start sm:self-auto cursor-pointer"
              >
                {lang === 'en' ? 'Get Help with Issue' : 'সহায়তা নিন'}
              </button>
            </div>
          )}

          {/* Location Selector & Greeting Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              {/* Location Selector (PRD C05) */}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                <select
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className="text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500"
                >
                  {savedLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.label} — {loc.address.split(',')[0]}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  {currentLocation.status === 'available' ? 'Lane Active' : 'Limited'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Spoken Guidance Button on Home */}
                <button
                  type="button"
                  onClick={() => {
                    const text =
                      lang === 'bn'
                        ? `সুপ্রভাত। আপনার পরবর্তী বর্জ্য সংগ্রহ ${nextBooking ? nextBooking.scheduledDate : 'নির্ধারিত নেই'}। আপনার মোট নিশ্চিত বর্জ্য ${confirmedKg.toFixed(1)} কেজি এবং উপলব্ধ পয়েন্ট ${customerAvailablePoints}। নতুন সংগ্রহের জন্য বুক এ পিকআপ বাটন চাপুন।`
                        : `Good morning. Your next collection is ${nextBooking ? nextBooking.scheduledDate : 'not scheduled'}. You have ${confirmedKg.toFixed(1)} kilograms of confirmed material and ${customerAvailablePoints} available points. Tap Book a pickup to schedule a collection.`;
                    speakInstruction(text, lang);
                  }}
                  className="min-h-[40px] px-3 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 cursor-pointer"
                  title={lang === 'en' ? 'Listen to summary' : 'বিবরণ শুনুন'}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{lang === 'en' ? 'Listen' : 'শুনুন'}</span>
                </button>

                <div className="text-xs text-slate-500">
                  {lang === 'en' ? 'Zone:' : 'জোন:'} <strong className="text-slate-700">{currentLocation.zoneId}</strong>
                </div>
              </div>
            </div>

            {/* Greeting & Next Collection Card (PRD C05) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  {lang === 'en' ? 'Good morning' : 'সুপ্রভাত'}
                </span>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
                  {nextBooking ? (
                    <>
                      Your next collection: <span className="text-emerald-800">{nextBooking.scheduledDate}</span> ({nextBooking.scheduledTimeWindow.split('-')[0]})
                    </>
                  ) : (
                    'No active collection scheduled'
                  )}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  {nextBooking ? (
                    <span>Assigned route: {nextBooking.collectorName || 'Tariq Hossain (#DH-14)'}</span>
                  ) : (
                    'Book a scheduled collection or visit an approved neighborhood drop-off point.'
                  )}
                </p>
              </div>

              {nextBooking ? (
                <button
                  onClick={() => handleOpenTransactionDetail(nextBooking)}
                  className="min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold self-start md:self-auto cursor-pointer"
                >
                  View Booking Detail
                </button>
              ) : null}
            </div>

            {/* PROMINENT "BOOK A PICKUP" PRIMARY ACTION (PRD Section 2 & C05 Requirement) */}
            <div className="pt-2">
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 bg-[#124B3A] hover:bg-[#0D382B] text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2.5 shadow-sm cursor-pointer transition-all hover:scale-[1.01]"
              >
                <Plus className="w-5 h-5 text-[#CBEA70]" />
                <span>{lang === 'en' ? 'Book a pickup' : 'পিকআপ বুক করুন'}</span>
              </button>
            </div>
          </div>

          {/* Continuous Loop Signature Banner: "Everyday Circularity" */}
          <div className="bg-white rounded-3xl border border-[#E8E5DA] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#124B3A]" />
                <span className="text-xs font-bold text-[#124B3A] uppercase tracking-wider font-mono">
                  {lang === 'en' ? 'Everyday Circular Loop' : 'সার্কুলার লুপ অগ্রগতি'}
                </span>
              </div>
              <span className="text-[11px] text-[#53625C] font-mono">
                {nextBooking ? (nextBooking.confirmedWeightKg ? 'Stage 3: Verified' : 'Stage 1: Requested') : 'Ready to start'}
              </span>
            </div>
            <ContinuousLoopLine
              currentStage={nextBooking ? (nextBooking.confirmedWeightKg ? 3 : nextBooking.fieldWeightKg ? 2 : 1) : 1}
            />
          </div>

          {/* Your Circular Activity Card (PRD C05: Confirmed vs Available vs Pending) */}
          <div className="bg-white rounded-3xl border border-[#E8E5DA] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#172521]">Your Circular Activity</h2>
                <p className="text-xs text-[#53625C]">
                  Verified recovery kilograms and circular reward points.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('rewards')}
                className="min-h-[40px] px-3.5 py-1.5 text-xs font-bold text-[#124B3A] hover:text-[#0D382B] flex items-center gap-1 cursor-pointer bg-[#F2F7E9] hover:bg-[#E4F0D3] rounded-xl border border-[#CBEA70]"
              >
                <span>View Rewards</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#124B3A]" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
              {/* Metric 1: Confirmed Material */}
              <div className="p-4 bg-[#F8F7F1] rounded-2xl border border-[#E8E5DA]">
                <span className="text-[11px] font-sans text-[#53625C] block mb-0.5">
                  CONFIRMED RECOVERED MATERIAL
                </span>
                <span className="text-2xl font-bold text-[#172521] tabular-nums">
                  {confirmedKg.toFixed(1)} kg
                </span>
                <span className="text-[10px] font-sans text-[#879690] block mt-1">
                  Scale-verified at hub intake (E2)
                </span>
              </div>

              {/* Metric 2: Available Points with Fresh Lime highlight */}
              <div className="p-4 bg-[#F2F7E9] rounded-2xl border border-[#CBEA70]">
                <span className="text-[11px] font-sans text-[#124B3A] font-bold block mb-0.5">
                  AVAILABLE POINTS
                </span>
                <span className="text-2xl font-bold text-[#124B3A] tabular-nums">
                  {customerAvailablePoints} pts
                </span>
                <span className="text-[10px] font-sans text-[#147D79] block mt-1">
                  Ready to redeem in partner shop
                </span>
              </div>

              {/* Metric 3: Pending Points */}
              <div className="p-4 bg-[#F8F7F1] rounded-2xl border border-[#E8E5DA]">
                <span className="text-[11px] font-sans text-[#B46A14] font-bold block mb-0.5">
                  PENDING POINTS HOLD
                </span>
                <span className="text-2xl font-bold text-[#B46A14] tabular-nums">
                  {customerPendingPoints} pts
                </span>
                <span className="text-[10px] font-sans text-[#53625C] block mt-1 leading-snug">
                  {lang === 'en'
                    ? 'Points are pending until material weight and quality are verified at the receiving center.'
                    : 'একত্রীকরণ কেন্দ্রে ডিজিটাল স্কেলে পরিমাপের পর পয়েন্ট যুক্ত হবে।'}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity Feed (PRD C05) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
              <button
                onClick={() => setActiveTab('activity')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Full History →
              </button>
            </div>

            <div className="space-y-3">
              {bookings.slice(0, 3).map((b) => (
                <div
                  key={b.id}
                  onClick={() => handleOpenTransactionDetail(b)}
                  className="p-3.5 bg-slate-50/60 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer transition-colors text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{b.id}</span>
                      <EvidenceBadge level={b.evidenceLevel} interactive={false} />
                    </div>
                    <div className="text-slate-500">
                      {b.materials.map((m) => m.category.split('_')[0]).join(', ')} · {b.scheduledDate}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900">
                      {b.confirmedWeightKg ? `${b.confirmedWeightKg} kg confirmed` : b.fieldWeightKg ? `${b.fieldWeightKg} kg field` : 'Scheduled'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Segregation Tip Relevant to Lane (PRD C05) */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl flex items-start gap-3 text-xs text-emerald-950">
            <BookOpen className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Clean Lane Tip for Gulshan North:</span>
              <p className="text-[11px] leading-relaxed">
                Rinse beverage bottles before flattening. Soiled containers or mixed food scraps cause load rejection at the receiving hub.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SERVICES (Wireframes C06, C07, C17 Drop-Off Finder) */}
      {/* ========================================================================= */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Clean Lane Service Catalogue
            </h1>
            <p className="text-xs text-slate-500">
              PRD § C06: Select an approved pickup service, configure recurring building arrangements, or find neighborhood drop-off points.
            </p>
          </div>

          {/* Section 1: Pickup Services */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              1. Doorstep Pickup Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">Doorstep Recyclables Pickup</h3>
                    <span className="text-xs text-slate-500">Direct pickup for segregated household recyclables</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-800">৳0 Fee</span>
                </div>
                <div className="text-xs text-slate-600">
                  Accepted: PET bottles, clean cardboard, rigid HDPE, aluminum cans.
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                  <span className="text-emerald-700 font-medium">Rewards: 25-100 pts/kg</span>
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold"
                  >
                    Book Now
                  </button>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">Commercial / Bulky Lane</h3>
                    <span className="text-xs text-slate-500">Scheduled van collection for higher volumes</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-900">৳150 Fee</span>
                </div>
                <div className="text-xs text-slate-600">
                  Accepted: High-volume packaging boxes, office shredded paper, restaurant cans.
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                  <span className="text-slate-500">Material payout at ৳18-32/kg</span>
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold"
                  >
                    Book Batch
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Drop-Off Finder (Wireframe C17) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Find Approved Drop-Off Points (PRD C17)
                </h2>
                <p className="text-xs text-slate-500">
                  Walk-in recovery kiosks with certified intake scales and instant reward points.
                </p>
              </div>

              {/* Material Filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={dropOffMaterialFilter}
                  onChange={(e) => setDropOffMaterialFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5"
                >
                  <option value="all">All Materials</option>
                  <option value="PET_BOTTLES">PET Bottles</option>
                  <option value="CARDBOARD_OCC">Cardboard</option>
                  <option value="ALUMINUM_CANS">Aluminum Cans</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {dropOffPoints
                .filter(
                  (dp) =>
                    dropOffMaterialFilter === 'all' ||
                    dp.acceptedMaterials.includes(dropOffMaterialFilter as MaterialCategory)
                )
                .map((point) => (
                  <div
                    key={point.id}
                    onClick={() => setSelectedDropOffPoint(point)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="font-bold text-slate-900">{point.name}</span>
                        <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                          Approved
                        </span>
                      </div>
                      <p className="text-slate-600 pl-6">{point.address}</p>
                      <div className="text-slate-500 pl-6 text-[11px]">
                        Hours: {point.operatingHours} · Operator: {point.operatorName}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-6 sm:pl-0">
                      <span className="font-semibold text-emerald-700">View & Simulate Deposit</span>
                      <ArrowRight className="w-4 h-4 text-emerald-700" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ACTIVITY (Wireframes C12 Activity List & C13 Transaction Detail) */}
      {/* ========================================================================= */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Collection & Recovery Activity (PRD C12)
              </h1>
              <p className="text-xs text-slate-500">
                Real-time transaction status, scale measurements, and physical recovery milestones.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
              {[
                { id: 'all', label: 'All' },
                { id: 'upcoming', label: 'Upcoming' },
                { id: 'completed', label: 'Completed' },
                { id: 'needs_attention', label: 'Under Review' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActivityFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    activityFilter === f.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Activity List */}
          <div className="space-y-3">
            {bookings
              .filter((b) => {
                if (activityFilter === 'upcoming')
                  return b.status === 'CONFIRMED' || b.status === 'COLLECTOR_ASSIGNED' || b.status === 'REQUESTED';
                if (activityFilter === 'completed')
                  return b.status === 'PROCESSED' || b.status === 'QUANTITY_CONFIRMED' || b.status === 'COLLECTED';
                if (activityFilter === 'needs_attention')
                  return b.discrepancyFlag || b.status === 'QUANTITY_UNDER_REVIEW' || b.status === 'MISSED';
                return true;
              })
              .map((b) => (
                <div
                  key={b.id}
                  onClick={() => handleOpenTransactionDetail(b)}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer text-xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{b.id}</span>
                      <EvidenceBadge level={b.evidenceLevel} interactive={false} />
                      {b.discrepancyFlag && (
                        <span className="text-[11px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                          Under Review
                        </span>
                      )}
                    </div>
                    <div className="text-slate-600">
                      {b.materials.map((m) => m.category.replace('_', ' ')).join(', ')} · {b.scheduledDate}
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      {b.address}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900">
                        {b.confirmedWeightKg
                          ? `${b.confirmedWeightKg} kg (Confirmed)`
                          : b.fieldWeightKg
                          ? `${b.fieldWeightKg} kg (Field)`
                          : 'Pending pickup'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {b.pointsStatus === 'available' ? (
                          <span className="text-emerald-700 font-bold font-mono">+{b.earnedPoints} pts</span>
                        ) : (
                          <span className="text-amber-700 font-mono">~{b.earnedPoints} pts pending</span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: REWARDS (Wireframes C14, C15, C16) */}
      {/* ========================================================================= */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          {/* Rewards Overview Card (PRD C14: Available vs Pending strictly never combined) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide block">
                  Circular Rewards Ledger (PRD C14)
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
                  Points Balance & Circular Catalogue
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Points reflect verified post-consumer recovery behavior. Fully funded by Clean Lane partner programmes.
                </p>
              </div>

              {/* Balance Card */}
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Available to Spend</div>
                  <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                    {customerAvailablePoints}
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <div className="text-xs text-amber-800 font-medium">Pending Hold</div>
                  <div className="text-xl font-bold text-amber-900 font-mono tabular-nums">
                    {customerPendingPoints}
                  </div>
                </div>
              </div>
            </div>

            {/* How Points Work (PRD C14) */}
            <div className="p-3.5 bg-slate-50 rounded-xl text-xs text-slate-600 leading-relaxed border border-slate-100">
              <strong>How points work:</strong> Booking a collection puts points in <em>Pending Hold</em>. Points become <em>Available</em> only after certified hub platform scale verification (Evidence Level E2). Points never expire during active pilot participation.
            </div>
          </div>

          {/* Rewards Catalogue (Wireframe C16) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Rewards Catalogue</h2>
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                {['all', 'groceries', 'artisan', 'utility', 'donation'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setRewardCategoryFilter(c)}
                    className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                      rewardCategoryFilter === c
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewards
                .filter((r) => rewardCategoryFilter === 'all' || r.category === rewardCategoryFilter)
                .map((reward) => {
                  const canAfford = customerAvailablePoints >= reward.pointsCost;
                  return (
                    <div
                      key={reward.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between">
                          <span className="text-xs font-mono font-bold text-emerald-800 uppercase">
                            {reward.partnerName}
                          </span>
                          <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                            {reward.pointsCost} pts
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">{reward.title}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">{reward.description}</p>
                        <div className="text-[11px] text-slate-400 pt-1">
                          Value: ৳{reward.cashEquivalentBdt} · Valid {reward.validityDays} days · Funder: {reward.funder}
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                        <span className="text-[11px] text-slate-500">
                          {canAfford ? 'Eligible to redeem' : `Need ${reward.pointsCost - customerAvailablePoints} more available pts`}
                        </span>
                        <button
                          onClick={() => handleRedeem(reward.id)}
                          disabled={!canAfford}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                            canAfford
                              ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer shadow-xs'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          }`}
                        >
                          Redeem Voucher
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Points History Table (Wireframe C15) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">Points Earning & Ledger History (PRD C15)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {pointsLedger.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 text-slate-500">{entry.timestamp.split('T')[0]}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-800 max-w-sm truncate">{entry.description}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            entry.status === 'AVAILABLE'
                              ? 'bg-emerald-50 text-emerald-800'
                              : entry.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {entry.status}
                        </span>
                      </td>
                      <td className={`py-2.5 px-3 text-right font-bold ${entry.amount > 0 ? 'text-emerald-800' : 'text-slate-800'}`}>
                        {entry.amount > 0 ? `+${entry.amount}` : entry.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ACCOUNT & LOCATIONS (Wireframes C19, C04, B01-B04, C18) */}
      {/* ========================================================================= */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          {/* If Apartment or Business Account -> Embed Organisation Dashboard (B01-B04) */}
          {role === 'customer_apartment' || role === 'customer_business' ? (
            <OrganisationDashboardView />
          ) : (
            <>
              {/* Account Profile Header */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <User className="w-4 h-4 text-emerald-700" />
                    <span className="font-semibold text-slate-800">Nasreen Akhter</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">+880 1712 345678</span>
                  </div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
                    Account & Saved Locations (PRD C19)
                  </h1>
                  <p className="text-xs text-slate-500">
                    Manage service addresses, account permissions, and dispute requests.
                  </p>
                </div>

                {/* Account Type Switcher */}
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="text-slate-500">View as:</span>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800"
                  >
                    <option value="customer_household">Household Account</option>
                    <option value="customer_apartment">Apartment Committee Account</option>
                    <option value="customer_business">Business Account</option>
                  </select>
                </div>
              </div>

              {/* Saved Locations & Availability (Wireframe C04) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Saved Addresses & Service Availability</h2>
                    <p className="text-xs text-slate-500">
                      PRD C04: Check eligibility before promising a collection slot.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOnboardingModalOpen(true)}
                    className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Location</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {savedLocations.map((loc) => (
                    <div
                      key={loc.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{loc.label}</span>
                          {loc.isDefault && (
                            <span className="text-[10px] font-mono text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                              Default
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                              loc.status === 'available'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {loc.status === 'available' ? 'Eligible Zone' : 'Waitlist Expansion'}
                          </span>
                        </div>
                        <p className="text-slate-600">{loc.address}</p>
                        <div className="text-slate-400 text-[11px]">
                          Zone: {loc.zoneId} {loc.accessInstructions ? `· ${loc.accessInstructions}` : ''}
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedLocationId(loc.id)}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-colors self-start sm:self-auto ${
                          selectedLocationId === loc.id
                            ? 'bg-emerald-700 text-white'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {selectedLocationId === loc.id ? 'Selected' : 'Use this address'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Help & Support / Dispute Center (Wireframe C18) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Help, Dispute & Resolutions (PRD C18)</h2>
                    <p className="text-xs text-slate-500">
                      Challenge a missed pickup, wrong quantity, or delayed points confirmation.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedBookingForDispute(undefined);
                      setIsDisputeModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>File New Dispute</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}
      <NewBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onOpenRewards={() => setActiveTab('rewards')}
        onOpenHelp={(bookingId) => handleReportIssue(bookingId)}
      />
      <MaterialGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
      <OnboardingFlowModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        onProceedToBooking={() => setIsBookingModalOpen(true)}
      />
      <TransactionDetailModal
        booking={inspectedBooking}
        isOpen={Boolean(inspectedBooking)}
        onClose={() => setInspectedBooking(null)}
        onReportIssue={handleReportIssue}
      />
      <DropOffDetailModal
        point={selectedDropOffPoint}
        isOpen={Boolean(selectedDropOffPoint)}
        onClose={() => setSelectedDropOffPoint(null)}
      />
      <DisputeModal
        isOpen={isDisputeModalOpen}
        bookingId={selectedBookingForDispute}
        onClose={() => setIsDisputeModalOpen(false)}
      />
    </div>
  );
};
