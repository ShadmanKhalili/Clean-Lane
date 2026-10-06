import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking, DropOffPoint, MaterialCategory } from '../../types';
import { MATERIAL_TAXONOMY } from '../../data/mockData';
import { EvidenceBadge } from '../common/EvidenceBadge';
import { NewBookingModal } from './NewBookingModal';
import { MaterialGuideModal } from './MaterialGuideModal';
import { DisputeModal } from './DisputeModal';
import { OnboardingFlowModal } from './OnboardingFlowModal';
import { TransactionDetailModal } from './TransactionDetailModal';
import { DropOffDetailModal } from './DropOffDetailModal';
import { OrganisationDashboardView } from './OrganisationDashboardView';
import { speakInstruction } from '../../utils/statusDictionary';
import { NotificationCenterModal } from '../notifications/NotificationCenterModal';
import { PreparationGuidanceModal } from '../notifications/PreparationGuidanceModal';
import { ReminderBanner } from '../notifications/ReminderBanner';
import { AppNotification } from '../../types';
import {
  Home,
  Gift,
  Clock,
  MapPin,
  HelpCircle,
  Bell,
  Sparkles,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Filter,
  FileCheck2,
  Layers,
  Settings,
  User,
  Volume2,
  Info,
  Check,
  Building,
  RotateCcw,
  Smartphone,
  Monitor,
  Phone,
  Truck,
  Scale,
  Calendar
} from 'lucide-react';

interface CustomerAppProps {
  initialTab?: 'home' | 'rewards' | 'activity' | 'services' | 'account';
}

export const CustomerApp: React.FC<CustomerAppProps> = ({ initialTab = 'home' }) => {
  const {
    lang,
    role,
    setRole,
    bookings,
    pointsLedger,
    rewards,
    redemptions,
    customerAvailablePoints,
    customerPendingPoints,
    savedLocations,
    selectedLocationId,
    setSelectedLocationId,
    dropOffPoints,
    redeemReward,
    notifications,
    showToast
  } = useApp();

  // Navigation Tabs: home | rewards | activity | services | account
  const [activeTab, setActiveTab] = useState<'home' | 'rewards' | 'activity' | 'services' | 'account'>(
    initialTab
  );

  // Desktop Device Frame Preview mode toggle (Responsive auto vs simulated mobile frame)
  const [isSimulatedMobileFrame, setIsSimulatedMobileFrame] = useState<boolean>(false);

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
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isPrepModalOpen, setIsPrepModalOpen] = useState(false);
  const [isAreaSelectorOpen, setIsAreaSelectorOpen] = useState(false);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [selectedPrepNotif, setSelectedPrepNotif] = useState<AppNotification | null>(null);
  const [selectedPrepBooking, setSelectedPrepBooking] = useState<Booking | null>(null);
  const [selectedBookingForDispute, setSelectedBookingForDispute] = useState<string | undefined>(undefined);
  const [inspectedBooking, setInspectedBooking] = useState<Booking | null>(null);
  const [selectedDropOffPoint, setSelectedDropOffPoint] = useState<DropOffPoint | null>(null);

  // Unread notification count
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  // Activity filter
  const [activityFilter, setActivityFilter] = useState<'all' | 'upcoming' | 'completed' | 'attention'>('all');
  const [showActivityFilters, setShowActivityFilters] = useState(false);

  // Location object
  const currentLocation =
    savedLocations.find((l) => l.id === selectedLocationId) || savedLocations[0];

  // Active Upcoming Booking (For Hero Priority Rule)
  const nextBooking = bookings.find(
    (b) =>
      b.status === 'CONFIRMED' ||
      b.status === 'COLLECTOR_ASSIGNED' ||
      b.status === 'REQUESTED' ||
      b.status === 'EN_ROUTE'
  );

  // Latest completed booking (For "Last Result" Card)
  const lastCompletedBooking = bookings.find(
    (b) =>
      b.status === 'COLLECTED' ||
      b.status === 'QUANTITY_CONFIRMED' ||
      b.status === 'ENTERED_RECOVERY_CHAIN' ||
      b.status === 'PROCESSED'
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
      showToast(
        lang === 'en'
          ? `Voucher redeemed! Code: ${res.couponCode}`
          : `ভাউচার কোড: ${res.couponCode}`
      );
    }
  };

  // Spoken voice summary for accessibility
  const handleSpeakHomeSummary = () => {
    const text =
      lang === 'bn'
        ? `সুপ্রভাত। ${
            nextBooking
              ? `আপনার পরবর্তী বর্জ্য সংগ্রহ ${nextBooking.scheduledDate} তারিখে ${nextBooking.scheduledTimeWindow} সময়ে।`
              : 'বর্তমানে কোনো বর্জ্য সংগ্রহ নির্ধারিত নেই। পিকআপ বুক করতে বুক এ পিকআপ বাটন চাপুন।'
          } আপনার মোট উপলব্ধ পয়েন্ট ${customerAvailablePoints} এবং নিশ্চিত বর্জ্য ${confirmedKg.toFixed(1)} কেজি।`
        : `Good day. ${
            nextBooking
              ? `Your next collection is on ${nextBooking.scheduledDate} during ${nextBooking.scheduledTimeWindow}.`
              : 'No collection currently scheduled. Tap Book a pickup to schedule.'
          } You have ${customerAvailablePoints} available points and ${confirmedKg.toFixed(1)} kg confirmed materials.`;

    speakInstruction(text, lang);
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] text-[#202B38] font-sans selection:bg-[#C9F1DC]">
      {/* ========================================================================= */}
      {/* TOP DESKTOP / TABLET / MOBILE HEADER */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 bg-[#FFF9F0]/95 backdrop-blur-md border-b border-[#EDE4D8] px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Your Area & Lane Status */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAreaSelectorOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-[#EDE4D8] text-xs font-bold text-[#202B38] hover:bg-[#FAF5EC] transition-colors shadow-2xs cursor-pointer min-h-[44px]"
            >
              <MapPin className="w-4 h-4 text-[#25345C] shrink-0" />
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">
                    {currentLocation.label}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#53616D]" />
                </div>
                <span className="text-[10px] font-mono text-[#12613F] block font-semibold">
                  {currentLocation.status === 'available' ? '● Clean Lane Active' : '○ Waitlist'}
                </span>
              </div>
            </button>

            {/* Desktop Top Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#EDE4D8] shadow-2xs">
              {[
                { id: 'home', labelEn: 'Home', labelBn: 'হোম', icon: Home },
                { id: 'rewards', labelEn: 'Rewards', labelBn: 'রিওয়ার্ডস', icon: Gift },
                { id: 'activity', labelEn: 'My Activity', labelBn: 'কার্যক্রম', icon: Clock },
                { id: 'services', labelEn: 'Drop-Off & Services', labelBn: 'ড্রপ-অফ ও সেবা', icon: Layers },
                { id: 'account', labelEn: 'Account & Sites', labelBn: 'অ্যাকাউন্ট ও সাইট', icon: User }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#25345C] text-white shadow-xs'
                        : 'text-[#53616D] hover:text-[#202B38] hover:bg-[#FAF5EC]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C9F1DC]' : 'text-[#53616D]'}`} />
                    <span>{lang === 'en' ? tab.labelEn : tab.labelBn}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: Quick Action Controls & View Mode Toggle */}
          <div className="flex items-center gap-2">
            {/* Desktop Device Simulator Mode Toggle */}
            <div className="hidden lg:flex items-center bg-white rounded-2xl border border-[#EDE4D8] p-1 shadow-2xs text-xs font-bold text-[#53616D]">
              <button
                onClick={() => setIsSimulatedMobileFrame(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  !isSimulatedMobileFrame
                    ? 'bg-[#25345C] text-white shadow-xs'
                    : 'hover:text-[#202B38]'
                }`}
                title="Full Responsive Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop View</span>
              </button>
              <button
                onClick={() => setIsSimulatedMobileFrame(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  isSimulatedMobileFrame
                    ? 'bg-[#25345C] text-white shadow-xs'
                    : 'hover:text-[#202B38]'
                }`}
                title="Preview inside Mobile Phone Device Frame"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Phone Preview</span>
              </button>
            </div>

            {/* Spoken Guidance Audio */}
            <button
              onClick={handleSpeakHomeSummary}
              className="w-10 h-10 rounded-2xl bg-white border border-[#EDE4D8] text-[#25345C] hover:bg-[#FAF5EC] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              title={lang === 'en' ? 'Listen to spoken summary' : 'অডিও শুনুন'}
              aria-label="Listen"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* 24h Notification Bell */}
            <button
              onClick={() => setIsNotificationModalOpen(true)}
              className="relative w-10 h-10 rounded-2xl bg-white border border-[#EDE4D8] text-[#25345C] hover:bg-[#FAF5EC] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              title="Automated 24h Reminders & SMS Delivery"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F5BF55] text-[#202B38] text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Help / Dispute Button */}
            <button
              onClick={() => {
                setSelectedBookingForDispute(nextBooking?.id);
                setIsDisputeModalOpen(true);
              }}
              className="w-10 h-10 rounded-2xl bg-white border border-[#EDE4D8] text-[#25345C] hover:bg-[#FAF5EC] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              title={lang === 'en' ? 'Help & Support' : 'সহায়তা'}
              aria-label="Help"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Account & Details Button (Mobile Drawer) */}
            <button
              onClick={() => setIsDetailsDrawerOpen(true)}
              className="md:hidden w-10 h-10 rounded-2xl bg-[#25345C] text-white hover:bg-[#1B2644] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              title="Locations, Settings & Multi-Site Details"
              aria-label="Settings and Details"
            >
              <Settings className="w-4 h-4 text-[#C9F1DC]" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* WRAPPER: EITHER NATURAL RESPONSIVE LAYOUT OR PHONE SIMULATION FRAME */}
      {/* ========================================================================= */}
      <div
        className={
          isSimulatedMobileFrame
            ? 'py-8 flex items-center justify-center bg-slate-900/5'
            : 'w-full'
        }
      >
        <div
          className={
            isSimulatedMobileFrame
              ? 'w-[390px] h-[844px] bg-[#FFF9F0] rounded-[48px] border-[10px] border-slate-900 shadow-2xl overflow-y-auto relative flex flex-col'
              : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'
          }
        >
          {/* Simulated Mobile Status Notch Bar if in Phone Preview */}
          {isSimulatedMobileFrame && (
            <div className="sticky top-0 z-40 bg-[#FFF9F0] px-6 py-2 flex items-center justify-between text-[11px] font-bold text-slate-800 border-b border-[#EDE4D8]/60 shrink-0">
              <span>9:41</span>
              <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto -mt-1" />
              <div className="flex items-center gap-1">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: HOME (Responsive Multi-Column on Desktop / Single Column on Mobile) */}
          {/* ========================================================================= */}
          {activeTab === 'home' && (
            <div className="space-y-6 animate-fade-in pb-20 md:pb-6">
              {/* Conditional Priority Alert (Missed collection / Dispute) */}
              {bookings.some((b) => b.status === 'MISSED' || b.status === 'DISPUTED') && (
                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-3xl flex items-start justify-between gap-3 text-xs shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-amber-200 text-amber-950 flex items-center justify-center shrink-0 font-bold mt-0.5">
                      <AlertCircle className="w-5 h-5 text-amber-900" />
                    </div>
                    <div>
                      <span className="font-bold text-amber-950 block text-sm">
                        {lang === 'en' ? 'Attention on Collection' : 'সংগ্রহ সংক্রান্ত সতর্কতা'}
                      </span>
                      <p className="text-amber-800 text-xs mt-0.5 leading-relaxed">
                        {lang === 'en'
                          ? 'A recent pickup was flagged for discrepancy. Dispatch operator is investigating.'
                          : 'একটি সংগ্রহ পর্যালোচনাধীন রয়েছে।'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const disputed = bookings.find((b) => b.status === 'MISSED' || b.status === 'DISPUTED');
                      handleReportIssue(disputed?.id || 'CL-BK-001');
                    }}
                    className="px-3.5 py-2 bg-amber-900 text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer min-h-[44px]"
                  >
                    {lang === 'en' ? 'Get Help' : 'সহায়তা'}
                  </button>
                </div>
              )}

              {/* ----------------------------------------------------------------- */}
              {/* RESPONSIVE 12-COLUMN GRID (Graceful Reflow on Desktop / Stacked on Mobile) */}
              {/* ----------------------------------------------------------------- */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* PRIMARY ACTIONS & STREAMS (7 cols on lg, 8 cols on xl) */}
                <div className="col-span-12 lg:col-span-7 xl:col-span-8 space-y-6 min-w-0">
                  {/* HERO CASE A: UPCOMING PICKUP IS HERO ("What should I do now?") */}
                  {nextBooking ? (
                    <section className="bg-white rounded-3xl border-2 border-[#25345C] p-5 sm:p-7 md:p-8 shadow-md space-y-5 relative overflow-hidden">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#FAF5EC] pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#12613F] animate-pulse shrink-0" />
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#12613F]">
                            {lang === 'en' ? 'Next Scheduled Pickup' : 'পরবর্তী নির্ধারিত সংগ্রহ'}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-semibold text-[#53616D] bg-[#FAF5EC] px-3 py-1 rounded-xl">
                          Booking #{nextBooking.id}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-[#53616D] block">
                          {lang === 'en' ? 'Assigned Collection Window' : 'নির্ধারিত সময়সূচি'}
                        </span>
                        <h1 className="text-2xl sm:text-3xl xl:text-4xl font-black text-[#25345C] tracking-tight break-words">
                          {nextBooking.scheduledDate}{' '}
                          <span className="text-[#12613F] font-bold">
                            ({nextBooking.scheduledTimeWindow})
                          </span>
                        </h1>
                        <p className="text-xs sm:text-sm text-[#53616D] flex items-center gap-1.5 pt-1">
                          <MapPin className="w-4 h-4 text-[#25345C] shrink-0" />
                          <span className="break-words">{nextBooking.address}</span>
                        </p>
                      </div>

                      {/* Automated 24h Preparation Prompt Callout */}
                      <div className="p-4 bg-[#FEF8EB] border border-[#F5BF55] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                        <div className="flex items-start md:items-center gap-3 min-w-0">
                          <Sparkles className="w-5 h-5 text-[#F5BF55] shrink-0 mt-0.5 md:mt-0" />
                          <div className="min-w-0">
                            <span className="font-bold text-[#202B38] block">
                              {lang === 'en'
                                ? '24h Preparation Instructions Active'
                                : '২৪ ঘণ্টার প্রস্তুতি নির্দেশিকা সক্রিয়'}
                            </span>
                            <span className="text-[#53616D] text-[11px] leading-relaxed block">
                              {lang === 'en'
                                ? 'Rinse bottles, flatten cardboard boxes, and place bags 15 mins before arrival.'
                                : 'বোতল পরিষ্কার করুন, কার্টুন চ্যাপ্টা করুন এবং ১৫ মিনিট আগে প্রস্তুত রাখুন।'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPrepBooking(nextBooking);
                            setIsPrepModalOpen(true);
                          }}
                          className="w-full md:w-auto px-4 py-2.5 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shrink-0 min-h-[44px] flex items-center justify-center shadow-xs"
                        >
                          {lang === 'en' ? 'View Checklist' : 'চেকলিস্ট দেখুন'}
                        </button>
                      </div>

                      {/* Primary Desktop/Mobile Action Bar (Graceful reflow across screen widths) */}
                      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <button
                          onClick={() => handleOpenTransactionDetail(nextBooking)}
                          className="flex-1 min-h-[48px] px-5 py-3 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer transform active:scale-[0.99]"
                        >
                          <span>{lang === 'en' ? 'Track Live Collection Status' : 'সংগ্রহের লাইভ অগ্রগতি'}</span>
                          <ChevronRight className="w-4 h-4 text-[#C9F1DC]" />
                        </button>

                        <button
                          onClick={() => setIsBookingModalOpen(true)}
                          className="min-h-[48px] px-6 py-3 bg-white hover:bg-[#FAF5EC] border border-[#EDE4D8] text-[#25345C] rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{lang === 'en' ? 'Book Another Pickup' : 'নতুন পিকআপ'}</span>
                        </button>
                      </div>
                    </section>
                  ) : (
                    /* HERO CASE B: NO UPCOMING PICKUP -> "What would you like collected?" */
                    <section className="bg-white rounded-3xl border border-[#EDE4D8] p-5 sm:p-7 md:p-8 shadow-sm space-y-5">
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#12613F] block">
                          {lang === 'en' ? 'Clean Lane Doorstep Service' : 'ক্লিন লেন ডোরস্টেপ সেবা'}
                        </span>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#25345C] tracking-tight">
                          {lang === 'en'
                            ? 'What would you like collected?'
                            : 'কী ধরনের বর্জ্য দিতে চান?'}
                        </h1>
                        <p className="text-xs sm:text-sm text-[#53616D] max-w-xl leading-relaxed">
                          {lang === 'en'
                            ? 'Select your clean recyclables, choose a convenient collection window, and earn verified circular reward points at your doorstep.'
                            : 'আপনার পরিচ্ছন্ন বর্জ্য নির্বাচন করুন, সুবিধাজনক সময় বেছে নিন এবং ঘরে বসেই সার্কুলার পয়েন্ট অর্জন করুন।'}
                        </p>
                      </div>

                      {/* Friendly Material Visual Choices (Reflows cleanly without horizontal scrolling) */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                        <div
                          onClick={() => setIsBookingModalOpen(true)}
                          className="p-4 sm:p-5 rounded-3xl bg-[#FFF9F0] border border-[#EDE4D8] hover:border-[#25345C] transition-all text-center space-y-2 cursor-pointer group shadow-2xs"
                        >
                          <div className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">🧴</div>
                          <div>
                            <span className="text-sm font-bold text-[#202B38] block">
                              {lang === 'en' ? 'Plastic Bottles' : 'প্লাস্টিক বোতল'}
                            </span>
                            <span className="text-xs text-[#12613F] font-bold">50 pts / kg</span>
                          </div>
                        </div>

                        <div
                          onClick={() => setIsBookingModalOpen(true)}
                          className="p-4 sm:p-5 rounded-3xl bg-[#FFF9F0] border border-[#EDE4D8] hover:border-[#25345C] transition-all text-center space-y-2 cursor-pointer group shadow-2xs"
                        >
                          <div className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">📦</div>
                          <div>
                            <span className="text-sm font-bold text-[#202B38] block">
                              {lang === 'en' ? 'Cardboard & Paper' : 'কাগজ ও কার্টন'}
                            </span>
                            <span className="text-xs text-[#12613F] font-bold">25 pts / kg</span>
                          </div>
                        </div>

                        <div
                          onClick={() => setIsBookingModalOpen(true)}
                          className="p-4 sm:p-5 rounded-3xl bg-[#FFF9F0] border border-[#EDE4D8] hover:border-[#25345C] transition-all text-center space-y-2 cursor-pointer group shadow-2xs"
                        >
                          <div className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">🥫</div>
                          <div>
                            <span className="text-sm font-bold text-[#202B38] block">
                              {lang === 'en' ? 'Cans & Containers' : 'ক্যান ও পাত্র'}
                            </span>
                            <span className="text-xs text-[#12613F] font-bold">100 pts / kg</span>
                          </div>
                        </div>
                      </div>

                      {/* Primary Action Button (Prominent & Reachable) */}
                      <button
                        onClick={() => setIsBookingModalOpen(true)}
                        className="w-full min-h-[52px] px-6 py-3.5 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer transform active:scale-[0.99]"
                      >
                        <span>{lang === 'en' ? 'Book a pickup' : 'পিকআপ বুক করুন'}</span>
                        <ArrowRight className="w-5 h-5 text-[#C9F1DC]" />
                      </button>
                    </section>
                  )}

                  {/* Material Taxonomy Cards Grid */}
                  <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#EDE4D8] shadow-2xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h2 className="text-base font-bold text-[#202B38]">
                          {lang === 'en' ? 'Approved Clean Lane Streams' : 'অনুমোদিত বর্জ্য উপাদান'}
                        </h2>
                        <p className="text-xs text-[#53616D]">
                          Bangladesh Solid Waste Management Rules 2021 Segregated Streams
                        </p>
                      </div>
                      <button
                        onClick={() => setIsGuideModalOpen(true)}
                        className="text-xs font-bold text-[#25345C] hover:underline cursor-pointer"
                      >
                        {lang === 'en' ? 'Sorting Guide →' : 'বাছাই নির্দেশিকা →'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {Object.values(MATERIAL_TAXONOMY).map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-2xl bg-[#FFF9F0] border border-[#EDE4D8] space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-xs text-[#202B38]">
                              {lang === 'en' ? item.name : item.nameBn}
                            </span>
                            <span className="text-[10px] font-mono text-[#12613F] bg-[#C9F1DC] px-2 py-0.5 rounded-md font-bold shrink-0">
                              {item.rewardPointsPerKg} pts/kg
                            </span>
                          </div>
                          <p className="text-[11px] text-[#53616D] line-clamp-2 leading-relaxed">
                            {lang === 'en' ? item.prepInstructions : item.prepInstructionsBn}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDEBAR (5 cols on lg, 4 cols on xl) - STICKY ON LARGE VIEWPORTS FOR IMMEDIATE REACHABILITY */}
                <div className="col-span-12 lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-20 lg:self-start min-w-0">
                  {/* Points Balance Hero Card */}
                  <div className="p-6 bg-gradient-to-br from-[#FEF8EB] via-white to-[#FFF9F0] rounded-3xl border-2 border-[#F5BF55] shadow-xs space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#53616D]">
                          {lang === 'en' ? 'Rewards Balance' : 'রিওয়ার্ড ব্যালেন্স'}
                        </span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <h2 className="text-3xl sm:text-4xl font-black text-[#202B38] tabular-nums">
                            {customerAvailablePoints}
                          </h2>
                          <span className="text-xs font-bold text-[#12613F] bg-[#C9F1DC] px-2.5 py-0.5 rounded-full">
                            Available
                          </span>
                        </div>
                      </div>

                      <div className="w-12 h-12 rounded-2xl bg-[#F5BF55] text-[#202B38] flex items-center justify-center font-bold shadow-xs shrink-0">
                        <Gift className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="p-3.5 bg-white border border-[#EDE4D8] rounded-2xl text-xs space-y-1">
                      <div className="flex justify-between items-center font-semibold">
                        <span className="text-[#53616D]">
                          {lang === 'en' ? 'Pending hub verification:' : 'যাচাইাধীন পয়েন্ট:'}
                        </span>
                        <span className="font-mono font-bold text-[#25345C]">
                          +{customerPendingPoints} pts
                        </span>
                      </div>
                      <span className="text-[11px] text-[#53616D] block">
                        {confirmedKg.toFixed(1)} kg total verified material
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveTab('rewards')}
                      className="w-full min-h-[44px] py-2.5 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <span>{lang === 'en' ? 'Redeem Points for Vouchers' : 'পয়েন্ট রিডিম করুন'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Automated 24h Reminder & SMS Gateway Feed */}
                  <div className="p-5 bg-white rounded-3xl border border-[#EDE4D8] shadow-2xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#FAF5EC]">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#25345C]" />
                        <h3 className="font-bold text-xs text-[#202B38]">
                          {lang === 'en' ? 'Automated 24h Alerts' : 'স্বয়ংক্রিয় নোটিফিকেশন'}
                        </h3>
                      </div>
                      <button
                        onClick={() => setIsNotificationModalOpen(true)}
                        className="text-[11px] font-bold text-[#25345C] hover:underline cursor-pointer"
                      >
                        View All ({notifications.length})
                      </button>
                    </div>

                    <div className="space-y-2">
                      {notifications.slice(0, 2).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            setSelectedPrepNotif(notif);
                            setIsPrepModalOpen(true);
                          }}
                          className="p-3 rounded-2xl bg-[#FFF9F0] border border-[#EDE4D8] hover:border-[#25345C]/40 transition-colors cursor-pointer space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#202B38] line-clamp-1">
                              {lang === 'en' ? notif.title : notif.titleBn}
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">
                              {notif.channel}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#53616D] line-clamp-2 leading-relaxed">
                            {lang === 'en' ? notif.message : notif.messageBn}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Saved Locations & Assisted Route */}
                  <div className="p-5 bg-white rounded-3xl border border-[#EDE4D8] shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xs text-[#202B38]">
                        {lang === 'en' ? 'Service Address' : 'সেবা ঠিকানা'}
                      </h3>
                      <button
                        onClick={() => setIsAreaSelectorOpen(true)}
                        className="text-[11px] font-bold text-[#25345C] hover:underline cursor-pointer"
                      >
                        Change
                      </button>
                    </div>

                    <div className="p-3 bg-[#FAF5EC] rounded-2xl border border-[#EDE4D8] space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#202B38]">
                          {currentLocation.label}
                        </span>
                        <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                          Lane Active
                        </span>
                      </div>
                      <p className="text-xs text-[#53616D]">{currentLocation.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: REWARDS (Responsive Desktop Grid & Full Points Ledger) */}
          {/* ========================================================================= */}
          {activeTab === 'rewards' && (
            <div className="space-y-6 animate-fade-in pb-20 md:pb-6">
              {/* Rewards Summary Banner */}
              <div className="p-6 sm:p-8 bg-gradient-to-br from-[#FEF8EB] via-white to-[#FFF9F0] rounded-3xl border-2 border-[#F5BF55] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#53616D]">
                    {lang === 'en' ? 'Verified Circular Points' : 'যাচাইকৃত সার্কুলার পয়েন্ট'}
                  </span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <h2 className="text-4xl sm:text-5xl font-black text-[#202B38] tabular-nums">
                      {customerAvailablePoints}
                    </h2>
                    <span className="text-xs font-bold text-[#12613F] bg-[#C9F1DC] px-3 py-1 rounded-full">
                      {lang === 'en' ? 'Available to Redeem' : 'রিডিমযোগ্য পয়েন্ট'}
                    </span>
                  </div>
                  <p className="text-xs text-[#53616D] mt-2">
                    {lang === 'en'
                      ? `+${customerPendingPoints} points awaiting hub scale verification · ${confirmedKg.toFixed(1)} kg total material diverted`
                      : `+${customerPendingPoints} পয়েন্ট হাবে যাচাইাধীন · মোট ${confirmedKg.toFixed(1)} কেজি বর্জ্য পুনরুদ্ধার`}
                  </p>
                </div>

                <div className="w-16 h-16 rounded-3xl bg-[#F5BF55] text-[#202B38] flex items-center justify-center font-black shadow-md self-start sm:self-auto">
                  <Gift className="w-8 h-8" />
                </div>
              </div>

              {/* Reward Catalogue Responsive Grid (3 Columns on Desktop) */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#202B38]">
                  {lang === 'en' ? 'Available Circular Rewards' : 'উপলব্ধ রিওয়ার্ড ভাউচার'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rewards.map((item) => {
                    const canAfford = customerAvailablePoints >= item.pointsCost;
                    return (
                      <div
                        key={item.id}
                        className="p-5 rounded-3xl bg-white border border-[#EDE4D8] flex flex-col justify-between space-y-4 shadow-2xs hover:border-[#25345C]/40 transition-all"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold bg-[#FAF5EC] text-[#53616D] px-2 py-0.5 rounded-md uppercase">
                              {item.category}
                            </span>
                            <span className="font-mono font-black text-[#12613F] text-sm">
                              {item.pointsCost} pts
                            </span>
                          </div>

                          <h4 className="font-bold text-sm text-[#202B38]">
                            {lang === 'en' ? item.title : item.titleBn}
                          </h4>
                          <p className="text-xs text-[#53616D] leading-relaxed">
                            {item.description}
                          </p>
                          <span className="text-[11px] text-[#53616D] block font-semibold">
                            Funder: {item.funder}
                          </span>
                        </div>

                        <button
                          onClick={() => handleRedeem(item.id)}
                          disabled={!canAfford}
                          className={`w-full min-h-[44px] rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            canAfford
                              ? 'bg-[#25345C] hover:bg-[#1B2644] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          }`}
                        >
                          <Gift className="w-4 h-4 text-[#C9F1DC]" />
                          <span>
                            {canAfford
                              ? lang === 'en'
                                ? 'Redeem Voucher'
                                : 'ভাউচার রিডিম'
                              : `${item.pointsCost - customerAvailablePoints} more pts needed`}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Full Points Ledger Table */}
              <div className="bg-white rounded-3xl border border-[#EDE4D8] p-6 shadow-2xs space-y-4">
                <h3 className="text-base font-bold text-[#202B38]">
                  {lang === 'en' ? 'Points Ledger & Audit History' : 'পয়েন্ট লেজার ও অডিট ট্রেইল'}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FAF5EC] text-[#53616D] uppercase font-bold border-y border-[#EDE4D8]">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Event Description</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FAF5EC] font-mono">
                      {pointsLedger.map((entry) => (
                        <tr key={entry.id} className="hover:bg-[#FFF9F0]/60">
                          <td className="py-3 px-4 text-[#53616D]">
                            {entry.timestamp.split('T')[0]}
                          </td>
                          <td className="py-3 px-4 font-sans text-[#202B38]">
                            {entry.description}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                entry.status === 'AVAILABLE'
                                  ? 'bg-[#C9F1DC] text-[#12613F]'
                                  : entry.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {entry.status}
                            </span>
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-bold ${
                              entry.amount > 0 ? 'text-[#12613F]' : 'text-slate-800'
                            }`}
                          >
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
          {/* TAB 3: MY ACTIVITY (Chronological Collection Timeline) */}
          {/* ========================================================================= */}
          {activeTab === 'activity' && (
            <div className="space-y-6 animate-fade-in pb-20 md:pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#202B38]">
                    {lang === 'en' ? 'Collection History & Receipts' : 'বর্জ্য সংগ্রহের ইতিহাস ও রসিদ'}
                  </h2>
                  <p className="text-xs text-[#53616D]">
                    {lang === 'en'
                      ? 'Detailed scale weights, chain of custody & evidence levels'
                      : 'স্কেল ওজন, কাস্টডি চেইন ও ডিজিটাল প্রমাণাদি'}
                  </p>
                </div>

                {/* Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {(['all', 'upcoming', 'completed', 'attention'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setActivityFilter(f)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                        activityFilter === f
                          ? 'bg-[#25345C] text-white shadow-2xs'
                          : 'bg-white border border-[#EDE4D8] text-[#53616D] hover:bg-[#FAF5EC]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Collections Grid (2 Columns on Desktop) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.map((booking) => {
                  const isUpcoming =
                    booking.status === 'CONFIRMED' ||
                    booking.status === 'COLLECTOR_ASSIGNED' ||
                    booking.status === 'REQUESTED';

                  return (
                    <div
                      key={booking.id}
                      onClick={() => handleOpenTransactionDetail(booking)}
                      className="p-5 rounded-3xl bg-white border border-[#EDE4D8] hover:border-[#25345C] transition-all space-y-3 shadow-2xs cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-[#25345C]">
                                #{booking.id}
                              </span>
                              <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                                  isUpcoming
                                    ? 'bg-sky-100 text-sky-800'
                                    : booking.status === 'MISSED' || booking.status === 'DISPUTED'
                                    ? 'bg-amber-100 text-amber-900'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {booking.status}
                              </span>
                            </div>
                            <h4 className="text-base font-bold text-[#202B38] mt-1">
                              {booking.scheduledDate} ({booking.scheduledTimeWindow})
                            </h4>
                          </div>

                          <div className="text-right">
                            <span className="text-sm font-bold text-[#202B38] block tabular-nums">
                              {booking.confirmedWeightKg
                                ? `${booking.confirmedWeightKg} kg`
                                : 'Pending intake'}
                            </span>
                            <EvidenceBadge level={booking.evidenceLevel} />
                          </div>
                        </div>

                        <p className="text-xs text-[#53616D] line-clamp-1">
                          📍 {booking.address}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#53616D] pt-3 border-t border-[#FAF5EC]">
                        <span className="truncate max-w-[220px]">
                          {booking.materials.map((m) => m.category.replace('_', ' ')).join(', ')}
                        </span>
                        <span className="font-bold text-[#25345C] group-hover:underline flex items-center gap-1">
                          <span>See receipt</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: SERVICES & DROP-OFF (Full Desktop Drop-Off Points View) */}
          {/* ========================================================================= */}
          {activeTab === 'services' && (
            <div className="space-y-6 animate-fade-in pb-20 md:pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#202B38]">
                    {lang === 'en' ? 'Drop-Off Hubs & Special Services' : 'ড্রপ-অফ পয়েন্ট ও বিশেষ সেবা'}
                  </h2>
                  <p className="text-xs text-[#53616D]">
                    {lang === 'en'
                      ? 'Self drop-off locations, brand takeback and recurring commercial services'
                      : 'স্বয়ংক্রিয় ড্রপ-অফ কেন্দ্র ও প্রতিষ্ঠানিক বর্জ্য সংগ্রহ'}
                  </p>
                </div>
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="px-4 py-2 bg-[#25345C] text-white rounded-xl text-xs font-bold hover:bg-[#1B2644]"
                >
                  Book Pickup
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dropOffPoints.map((point) => (
                  <div
                    key={point.id}
                    className="p-5 rounded-3xl bg-white border border-[#EDE4D8] space-y-3 shadow-2xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-[#202B38]">{point.name}</h4>
                        <p className="text-xs text-[#53616D] mt-0.5">{point.address}</p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">
                        Open {point.operatingHours}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-[#53616D]">Accepted Materials:</span>
                      <div className="flex flex-wrap gap-1">
                        {point.acceptedMaterials.map((m) => (
                          <span
                            key={m}
                            className="text-[10px] bg-[#FAF5EC] text-[#202B38] px-2 py-0.5 rounded-md font-semibold"
                          >
                            {m.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedDropOffPoint(point)}
                      className="w-full py-2 bg-[#FAF5EC] hover:bg-[#EDE4D8] text-[#25345C] rounded-xl text-xs font-bold transition-colors"
                    >
                      View Point Rules & Instructions
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: ACCOUNT & SITES (Organisation & Saved Addresses) */}
          {/* ========================================================================= */}
          {activeTab === 'account' && (
            <div className="space-y-6 animate-fade-in pb-20 md:pb-6">
              <div className="bg-white rounded-3xl border border-[#EDE4D8] p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#25345C] text-[#C9F1DC] flex items-center justify-center font-bold">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#202B38]">Nasreen Akhter</h3>
                    <span className="text-xs text-[#53616D]">+880 1712-345678 · Dhaka Clean Lane Pilot</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#53616D]">Account Mode:</span>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="bg-[#FAF5EC] border border-[#EDE4D8] rounded-xl px-3 py-1.5 text-xs font-bold text-[#202B38]"
                  >
                    <option value="customer_household">Household Resident</option>
                    <option value="customer_apartment">Apartment Committee</option>
                    <option value="customer_business">Business / Café</option>
                  </select>
                </div>
              </div>

              {/* Multi-site Organization Dashboard for Apartment or Business */}
              {(role === 'customer_apartment' || role === 'customer_business') && (
                <OrganisationDashboardView />
              )}

              {/* Saved Locations List */}
              <div className="bg-white rounded-3xl border border-[#EDE4D8] p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#202B38]">Saved Collection Addresses</h3>
                  <button
                    onClick={() => setIsOnboardingModalOpen(true)}
                    className="px-3 py-1.5 bg-[#25345C] text-white rounded-xl text-xs font-bold"
                  >
                    Add Address
                  </button>
                </div>

                <div className="space-y-3">
                  {savedLocations.map((loc) => (
                    <div
                      key={loc.id}
                      className="p-4 rounded-2xl border border-[#EDE4D8] bg-[#FAF5EC]/40 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#202B38]">{loc.label}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                            {loc.status === 'available' ? 'Lane Active' : 'Waitlist'}
                          </span>
                        </div>
                        <p className="text-xs text-[#53616D] mt-0.5">{loc.address}</p>
                      </div>

                      <button
                        onClick={() => setSelectedLocationId(loc.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                          selectedLocationId === loc.id
                            ? 'bg-[#25345C] text-white'
                            : 'bg-white border border-[#EDE4D8] text-[#202B38]'
                        }`}
                      >
                        {selectedLocationId === loc.id ? 'Selected' : 'Use'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE-ONLY FIXED BOTTOM NAVIGATION BAR (< md) */}
      {/* ========================================================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EDE4D8] px-4 py-2 shadow-lg max-w-lg mx-auto">
        <div className="grid grid-cols-3 gap-2 items-center">
          {[
            { id: 'home', labelEn: 'Home', labelBn: 'হোম', icon: Home },
            { id: 'rewards', labelEn: 'Rewards', labelBn: 'রিওয়ার্ডস', icon: Gift },
            { id: 'activity', labelEn: 'My activity', labelBn: 'কার্যক্রম', icon: Clock }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all cursor-pointer min-h-[48px] ${
                  isActive
                    ? 'bg-[#25345C] text-white shadow-xs'
                    : 'text-[#53616D] hover:bg-[#FAF5EC] hover:text-[#202B38]'
                }`}
                aria-label={tab.labelEn}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#C9F1DC]' : 'text-[#53616D]'}`} />
                <span className="text-[11px] font-bold mt-0.5">
                  {lang === 'en' ? tab.labelEn : tab.labelBn}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* AREA SELECTOR & SERVICE ELIGIBILITY MODAL */}
      {/* ========================================================================= */}
      {isAreaSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#EDE4D8] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#202B38]">
                {lang === 'en' ? 'Select Service Location' : 'সেবা এলাকা নির্বাচন'}
              </h3>
              <button
                onClick={() => setIsAreaSelectorOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {savedLocations.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => {
                    setSelectedLocationId(loc.id);
                    setIsAreaSelectorOpen(false);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedLocationId === loc.id
                      ? 'bg-[#EDF1F9] border-[#25345C]'
                      : 'bg-white border-[#EDE4D8] hover:bg-[#FAF5EC]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#202B38]">{loc.label}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          loc.status === 'available'
                            ? 'bg-[#C9F1DC] text-[#12613F]'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {loc.status === 'available' ? 'Active Lane' : 'Waitlist'}
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
                setIsAreaSelectorOpen(false);
                setIsOnboardingModalOpen(true);
              }}
              className="w-full min-h-[44px] bg-[#FAF5EC] border border-[#EDE4D8] hover:bg-[#EDE4D8] text-[#25345C] rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Add New Address / Check Area' : 'নতুন ঠিকানা যোগ করুন'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAILS & ACCOUNT DRAWER (For Mobile Quick Settings) */}
      {/* ========================================================================= */}
      {isDetailsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-[#FFF9F0] rounded-t-3xl sm:rounded-3xl border border-[#EDE4D8] p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EDE4D8] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#25345C] text-[#C9F1DC] flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#202B38]">
                    Account, Sites & Detailed Settings
                  </h3>
                  <span className="text-xs text-[#53616D]">Nasreen Akhter · +880 1712-345678</span>
                </div>
              </div>
              <button
                onClick={() => setIsDetailsDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-[#EDE4D8] flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Account Role Selector */}
            <div className="p-4 bg-white rounded-2xl border border-[#EDE4D8] space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#53616D] block">
                Account Type Mode
              </span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-[#FAF5EC] border border-[#EDE4D8] rounded-xl p-2.5 text-xs font-bold text-[#202B38]"
              >
                <option value="customer_household">Household Account (Standard)</option>
                <option value="customer_apartment">Apartment Committee (Multi-Unit)</option>
                <option value="customer_business">Business / Institutional Account</option>
              </select>
            </div>

            {/* Quick Links */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setIsDetailsDrawerOpen(false);
                  setIsNotificationModalOpen(true);
                }}
                className="w-full p-3.5 bg-white border border-[#EDE4D8] rounded-2xl text-xs font-bold text-[#202B38] flex items-center justify-between hover:bg-[#FAF5EC]"
              >
                <span className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#25345C]" />
                  24h Automated Reminders & SMS Settings
                </span>
                <ChevronRight className="w-4 h-4 text-[#53616D]" />
              </button>

              <button
                onClick={() => {
                  setIsDetailsDrawerOpen(false);
                  setIsDisputeModalOpen(true);
                }}
                className="w-full p-3.5 bg-white border border-[#EDE4D8] rounded-2xl text-xs font-bold text-rose-700 flex items-center justify-between hover:bg-rose-50"
              >
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  File Collection Dispute / Challenge
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setIsDetailsDrawerOpen(false)}
              className="w-full py-3 bg-[#25345C] text-white rounded-2xl font-bold text-xs"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ALL MODAL TOUCHPOINTS */}
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
      <NotificationCenterModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        onOpenPreparation={(notif) => {
          setSelectedPrepNotif(notif);
          setSelectedPrepBooking(null);
          setIsPrepModalOpen(true);
        }}
      />
      <PreparationGuidanceModal
        isOpen={isPrepModalOpen}
        onClose={() => {
          setIsPrepModalOpen(false);
          setSelectedPrepNotif(null);
          setSelectedPrepBooking(null);
        }}
        notification={selectedPrepNotif}
        booking={selectedPrepBooking}
      />
    </div>
  );
};
