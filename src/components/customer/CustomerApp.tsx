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
import { speakInstruction, stopSpeaking } from '../../utils/statusDictionary';
import { NotificationCenterModal } from '../notifications/NotificationCenterModal';
import { PreparationGuidanceModal } from '../notifications/PreparationGuidanceModal';
import { MaterialIllustration } from '../common/MaterialIllustrations';
import { BrandJourneyDevice } from '../common/BrandJourneyDevice';
import { EnvironmentalImpactWidget } from '../common/EnvironmentalImpactWidget';
import { AppointmentTicket } from '../common/AppointmentTicket';
import { AppNotification } from '../../types';
import { useTranslation } from '../../utils/translations';
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
  Layers,
  User,
  Volume2,
  Check,
  CheckCheck
} from 'lucide-react';

interface CustomerAppProps {
  initialTab?: 'home' | 'rewards' | 'activity' | 'services' | 'account';
  onNavigateTab?: (tab: string) => void;
}

export const CustomerApp: React.FC<CustomerAppProps> = ({
  initialTab = 'home',
  onNavigateTab
}) => {
  const {
    lang,
    role,
    setRole,
    bookings,
    pointsLedger,
    rewards,
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

  const t = useTranslation(lang);

  // Active view tab: home | rewards | activity | services | account
  const [activeTab, setActiveTab] = useState<'home' | 'rewards' | 'activity' | 'services' | 'account'>(
    initialTab
  );

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabSwitch = (tab: 'home' | 'rewards' | 'activity' | 'services' | 'account') => {
    setActiveTab(tab);
    if (onNavigateTab) {
      if (tab === 'home') onNavigateTab('overview');
      else onNavigateTab(tab);
    }
  };

  // Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isPrepModalOpen, setIsPrepModalOpen] = useState(false);
  const [isAreaSelectorOpen, setIsAreaSelectorOpen] = useState(false);
  const [selectedPrepNotif, setSelectedPrepNotif] = useState<AppNotification | null>(null);
  const [selectedPrepBooking, setSelectedPrepBooking] = useState<Booking | null>(null);
  const [selectedBookingForDispute, setSelectedBookingForDispute] = useState<string | undefined>(undefined);
  const [inspectedBooking, setInspectedBooking] = useState<Booking | null>(null);
  const [selectedDropOffPoint, setSelectedDropOffPoint] = useState<DropOffPoint | null>(null);
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);
  const [showAllStreamsInline, setShowAllStreamsInline] = useState(false);

  // Activity filter
  const [activityFilter, setActivityFilter] = useState<'all' | 'upcoming' | 'completed' | 'attention'>('all');

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

  const handleReportIssue = (bookingId?: string) => {
    setSelectedBookingForDispute(bookingId || nextBooking?.id);
    setIsDisputeModalOpen(true);
  };

  const handleRedeem = (rewardId: string) => {
    const success = redeemReward(rewardId);
    if (success) {
      showToast(
        lang === 'en'
          ? 'Reward voucher redeemed successfully! Check voucher code in activity.'
          : 'ভাউচার সফলভাবে রিডিম হয়েছে! কোড দেখতে এক্টিভিটি দেখুন।'
      );
    } else {
      showToast(
        lang === 'en'
          ? 'Insufficient verified points for this voucher.'
          : 'এই ভাউচারের জন্য আপনার পর্যাপ্ত পয়েন্ট নেই।'
      );
    }
  };

  const handleSpeakHomeSummary = () => {
    if (isSpeakingAudio) {
      stopSpeaking();
      setIsSpeakingAudio(false);
      return;
    }

    const text =
      lang === 'bn'
        ? `সুপ্রভাত। ${
            nextBooking
              ? `আপনার পরবর্তী বর্জ্য সংগ্রহ ${nextBooking.scheduledDate} তারিখে ${nextBooking.scheduledTimeWindow} সময়ে।`
              : 'বর্তমানে কোনো বর্জ্য সংগ্রহ নির্ধারিত নেই। পিকআপ বুক করতে পিকআপ বুক করুন বাটন চাপুন।'
          } আপনার মোট উপলব্ধ পয়েন্ট ${customerAvailablePoints} এবং উদ্ধারকৃত বর্জ্য ${confirmedKg.toFixed(1)} কেজি।`
        : `Good day. ${
            nextBooking
              ? `Your next collection is on ${nextBooking.scheduledDate} during ${nextBooking.scheduledTimeWindow}.`
              : 'No collection currently scheduled. Tap Book a pickup to schedule.'
          } You have ${customerAvailablePoints} available points and ${confirmedKg.toFixed(1)} kg verified materials.`;

    setIsSpeakingAudio(true);
    speakInstruction(text, lang);
    setTimeout(() => setIsSpeakingAudio(false), 7000);
  };

  // Filtered bookings for Activity Tab
  const filteredBookings = bookings.filter((b) => {
    if (activityFilter === 'all') return true;
    if (activityFilter === 'upcoming') {
      return (
        b.status === 'REQUESTED' ||
        b.status === 'CONFIRMED' ||
        b.status === 'COLLECTOR_ASSIGNED' ||
        b.status === 'EN_ROUTE'
      );
    }
    if (activityFilter === 'completed') {
      return (
        b.status === 'COLLECTED' ||
        b.status === 'QUANTITY_CONFIRMED' ||
        b.status === 'ENTERED_RECOVERY_CHAIN' ||
        b.status === 'PROCESSED'
      );
    }
    if (activityFilter === 'attention') {
      return b.status === 'MISSED' || b.status === 'DISPUTED' || b.status === 'CANCELLED';
    }
    return true;
  });

  return (
    <div className="w-full space-y-6 pb-20 md:pb-6">
      {/* ========================================================================= */}
      {/* CLEAN SUB-BAR: LOCATION INDICATOR & ACCESSIBILITY QUICK AUDIO */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EDE4D8]">
        {/* Neighborhood Location Chip */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAreaSelectorOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#EDE4D8] text-xs font-semibold text-[#202B38] hover:bg-[#FAF5EC] transition-colors shadow-2xs cursor-pointer"
            title={t.selectAddress}
          >
            <MapPin className="w-3.5 h-3.5 text-[#12613F] shrink-0" />
            <span className="truncate max-w-[200px] sm:max-w-[280px]">
              {currentLocation.label}
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                currentLocation.status === 'available'
                  ? 'bg-[#C9F1DC] text-[#12613F]'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {currentLocation.status === 'available' ? t.activeLane : t.waitlist}
            </span>
            <ChevronDown className="w-3 h-3 text-[#53616D]" />
          </button>
        </div>

        {/* Audio Summary / Spoken Guide */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSpeakHomeSummary}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs ${
              isSpeakingAudio
                ? 'bg-[#25345C] text-[#C9F1DC] border-[#25345C] animate-pulse'
                : 'bg-white border-[#EDE4D8] text-[#25345C] hover:bg-[#FAF5EC]'
            }`}
            title={isSpeakingAudio ? t.audioSpeaking : t.listenAudio}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isSpeakingAudio ? t.audioSpeaking : t.listenAudio}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HOME (Focused, Uncluttered, Core Job First) */}
      {/* ========================================================================= */}
      {activeTab === 'home' && (
        <div className="space-y-6 animate-fade-in">
          {/* Priority Attention Banner if Discrepancy */}
          {bookings.some((b) => b.status === 'MISSED' || b.status === 'DISPUTED') && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-3xl flex items-start justify-between gap-3 text-xs shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-950 flex items-center justify-center shrink-0 font-bold mt-0.5">
                  <AlertCircle className="w-4 h-4 text-amber-900" />
                </div>
                <div>
                  <span className="font-bold text-amber-950 block text-sm">
                    {lang === 'en' ? 'Attention on Collection' : 'সংগ্রহ সংক্রান্ত সতর্কতা'}
                  </span>
                  <p className="text-amber-800 text-xs mt-0.5 leading-relaxed">
                    {lang === 'en'
                      ? 'A recent pickup was flagged for review. Dispatch operator is investigating.'
                      : 'একটি সংগ্রহ পর্যালোচনাধীন রয়েছে। অপারেটর অডিট যাচাই করছেন।'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const disputed = bookings.find((b) => b.status === 'MISSED' || b.status === 'DISPUTED');
                  handleReportIssue(disputed?.id || 'CL-BK-001');
                }}
                className="px-3 py-1.5 bg-amber-900 text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer min-h-[36px]"
              >
                {t.getHelp}
              </button>
            </div>
          )}

          {/* 12-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Main Column (8 cols): Primary User Task */}
            <div className="col-span-12 lg:col-span-7 xl:col-span-8 space-y-6">
              {/* CORE HERO SECTION */}
              {nextBooking ? (
                /* CASE A: User has an upcoming pickup appointment */
                <div className="space-y-3">
                  <AppointmentTicket
                    booking={nextBooking}
                    onOpenChecklist={() => {
                      setSelectedPrepBooking(nextBooking);
                      setIsPrepModalOpen(true);
                    }}
                    onTrackStatus={() => handleOpenTransactionDetail(nextBooking)}
                  />
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => setIsBookingModalOpen(true)}
                      className="min-h-[40px] px-4 py-2 bg-white hover:bg-[#FAF5EC] border border-[#EDE4D8] text-[#25345C] rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.bookAnotherPickup}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* CASE B: User has no active pickup -> Warm, clear booking invitation */
                <section className="bg-white rounded-3xl border border-[#EDE4D8] p-6 sm:p-8 shadow-sm space-y-5">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#12613F] block">
                      {lang === 'en' ? 'Clean Lane Doorstep Service' : 'ক্লিন লেন ডোরস্টেপ সেবা'}
                    </span>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#25345C] tracking-tight">
                      {t.whatWouldYouLikeCollected}
                    </h1>
                    <p className="text-xs sm:text-sm text-[#53616D] max-w-xl leading-relaxed">
                      {t.whatWouldYouLikeCollectedSub}
                    </p>
                  </div>

                  {/* 3 Clear Tactile Material Choices */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                    <div
                      onClick={() => setIsBookingModalOpen(true)}
                      className="p-4 rounded-3xl bg-[#FFF9F0] border border-[#EDE4D8] hover:border-[#25345C] hover:shadow-md transition-all text-center space-y-2 cursor-pointer group shadow-2xs"
                    >
                      <MaterialIllustration
                        category="PET_BOTTLES"
                        size="lg"
                        className="mx-auto group-hover:scale-105 transition-transform"
                      />
                      <div>
                        <span className="text-sm font-bold text-[#202B38] block group-hover:text-[#25345C]">
                          {lang === 'en' ? 'Plastic Bottles' : 'প্লাস্টিক বোতল'}
                        </span>
                        <span className="text-xs text-[#12613F] font-bold">50 pts / kg</span>
                      </div>
                    </div>

                    <div
                      onClick={() => setIsBookingModalOpen(true)}
                      className="p-4 rounded-3xl bg-[#FFF9F0] border border-[#EDE4D8] hover:border-[#25345C] hover:shadow-md transition-all text-center space-y-2 cursor-pointer group shadow-2xs"
                    >
                      <MaterialIllustration
                        category="CARDBOARD_OCC"
                        size="lg"
                        className="mx-auto group-hover:scale-105 transition-transform"
                      />
                      <div>
                        <span className="text-sm font-bold text-[#202B38] block group-hover:text-[#25345C]">
                          {lang === 'en' ? 'Cardboard & Paper' : 'কাগজ ও কার্টন'}
                        </span>
                        <span className="text-xs text-[#12613F] font-bold">25 pts / kg</span>
                      </div>
                    </div>

                    <div
                      onClick={() => setIsBookingModalOpen(true)}
                      className="p-4 rounded-3xl bg-[#FFF9F0] border border-[#EDE4D8] hover:border-[#25345C] hover:shadow-md transition-all text-center space-y-2 cursor-pointer group shadow-2xs"
                    >
                      <MaterialIllustration
                        category="ALUMINUM_CANS"
                        size="lg"
                        className="mx-auto group-hover:scale-105 transition-transform"
                      />
                      <div>
                        <span className="text-sm font-bold text-[#202B38] block group-hover:text-[#25345C]">
                          {lang === 'en' ? 'Cans & Containers' : 'ক্যান ও পাত্র'}
                        </span>
                        <span className="text-xs text-[#12613F] font-bold">100 pts / kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Call-to-Action Button */}
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="w-full min-h-[50px] px-6 py-3.5 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer transform active:scale-[0.99]"
                  >
                    <span>{t.bookPickup}</span>
                    <ArrowRight className="w-5 h-5 text-[#C9F1DC]" />
                  </button>
                </section>
              )}

              {/* Verified Environmental Impact (Clean, calm glance with progressive disclosure) */}
              <EnvironmentalImpactWidget />

              {/* Accepted Clean Streams (Compact Strip + Modal Guide Link) */}
              <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#EDE4D8] shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#12613F]" />
                      <h2 className="text-base font-bold text-[#202B38]">
                        {t.acceptedCleanStreams}
                      </h2>
                    </div>
                    <p className="text-xs text-[#53616D] mt-0.5">
                      {t.segregatedRecyclables}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsGuideModalOpen(true)}
                    className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl border border-[#EDE4D8] bg-[#FAF5EC] hover:bg-[#EDE4D8] text-xs font-bold text-[#25345C] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <span>{t.fullSortingGuide}</span>
                  </button>
                </div>

                {/* 4 Streams Quick Glance */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'PET_BOTTLES', nameEn: 'Plastic Bottles', nameBn: 'প্লাস্টিক বোতল', pts: 50 },
                    { id: 'CARDBOARD_OCC', nameEn: 'Cardboard & Paper', nameBn: 'কাগজ ও কার্টন', pts: 25 },
                    { id: 'ALUMINUM_CANS', nameEn: 'Cans & Metal', nameBn: 'ক্যান ও টিন', pts: 100 },
                    { id: 'TETRAPAK_BEVERAGE', nameEn: 'Beverage Cartons', nameBn: 'টেট্রাপ্যাক প্যাকেট', pts: 40 }
                  ].map((stream) => (
                    <div
                      key={stream.id}
                      onClick={() => setIsGuideModalOpen(true)}
                      className="p-3 rounded-2xl bg-[#FFF9F0] border border-[#EDE4D8] hover:border-[#25345C]/30 flex items-center gap-2.5 cursor-pointer transition-all hover:scale-[1.01]"
                    >
                      <MaterialIllustration category={stream.id} size="sm" className="shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-[#202B38] block truncate">
                          {lang === 'en' ? stream.nameEn : stream.nameBn}
                        </span>
                        <span className="text-[10px] font-mono text-[#12613F] font-bold">
                          {stream.pts} pts/kg
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Inline Toggle for Full 6 Streams */}
                <div className="pt-1 flex items-center justify-between text-xs border-t border-[#FAF5EC]">
                  <button
                    type="button"
                    onClick={() => setShowAllStreamsInline(!showAllStreamsInline)}
                    className="text-xs font-bold text-[#25345C] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showAllStreamsInline ? t.hideFull6Streams : t.showFull6Streams}</span>
                  </button>
                  <span className="text-[11px] text-[#53616D] font-mono">
                    Rules 2021 Segregated
                  </span>
                </div>

                {showAllStreamsInline && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 animate-fade-in">
                    {Object.values(MATERIAL_TAXONOMY).map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-[#FFF9F0] border border-[#EDE4D8] flex items-start gap-3"
                      >
                        <MaterialIllustration category={item.id} size="sm" className="shrink-0 mt-0.5" />
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-xs text-[#202B38] truncate">
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Column (4 cols): Rewards & Summary */}
            <div className="col-span-12 lg:col-span-5 xl:col-span-4 space-y-5 lg:sticky lg:top-20">
              {/* Card 1: Verified Rewards Balance Card */}
              <div className="p-6 bg-gradient-to-br from-[#FEF8EB] via-white to-[#FFF9F0] rounded-3xl border-2 border-[#F5BF55] shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#53616D]">
                      {t.rewardsBalance}
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <h2 className="text-3xl sm:text-4xl font-black text-[#202B38] tabular-nums">
                        {customerAvailablePoints}
                      </h2>
                      <span className="text-xs font-bold text-[#12613F] bg-[#C9F1DC] px-2.5 py-0.5 rounded-full">
                        {t.available}
                      </span>
                    </div>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-[#F5BF55] text-[#202B38] flex items-center justify-center font-bold shadow-xs shrink-0">
                    <Gift className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-3.5 bg-white border border-[#EDE4D8] rounded-2xl text-xs space-y-1">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-[#53616D]">{t.pendingHubCheck}:</span>
                    <span className="font-mono font-bold text-[#25345C]">
                      +{customerPendingPoints} pts
                    </span>
                  </div>
                  <span className="text-[11px] text-[#53616D] block">
                    {confirmedKg.toFixed(1)} {lang === 'en' ? 'kg total verified material' : 'কেজি মোট যাচাইকৃত বর্জ্য'}
                  </span>
                </div>

                <button
                  onClick={() => handleTabSwitch('rewards')}
                  className="w-full min-h-[44px] py-2.5 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
                >
                  <span>{t.redeemVouchers}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Card 2: Recent Completed Collection Glance */}
              {lastCompletedBooking && (
                <div className="p-5 bg-white rounded-3xl border border-[#EDE4D8] shadow-2xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#FAF5EC]">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#12613F]" />
                      <h3 className="font-bold text-xs text-[#202B38]">
                        {t.recentCollection}
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      Verified ✓
                    </span>
                  </div>

                  <div className="p-3 bg-[#FFF9F0] rounded-2xl border border-[#EDE4D8] text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[#53616D]">#{lastCompletedBooking.id}</span>
                      <span className="font-bold text-[#25345C]">{lastCompletedBooking.scheduledDate}</span>
                    </div>
                    <div className="flex justify-between items-center font-semibold pt-1 border-t border-[#EDE4D8]">
                      <span className="text-slate-700">
                        {lastCompletedBooking.confirmedWeightKg || 6.5} kg verified
                      </span>
                      <span className="font-mono font-bold text-[#12613F]">
                        +{lastCompletedBooking.earnedPoints || 325} pts
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenTransactionDetail(lastCompletedBooking)}
                    className="w-full py-2 bg-white hover:bg-[#FAF5EC] border border-[#EDE4D8] text-[#25345C] rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{t.viewScaleCertificate}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Card 3: Quick Support Assistance */}
              <div className="p-4 bg-[#FFF9F0] rounded-3xl border border-[#EDE4D8] flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-white border border-[#EDE4D8] flex items-center justify-center text-[#25345C] shrink-0">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-[#202B38] block truncate">
                      {t.doorstepSupport}
                    </span>
                    <span className="text-[11px] text-[#53616D] block truncate">
                      {t.pickupQuestions}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleReportIssue(nextBooking?.id)}
                  className="px-3 py-1.5 bg-white hover:bg-[#FAF5EC] border border-[#EDE4D8] text-[#25345C] rounded-xl font-bold text-xs shrink-0 cursor-pointer transition-colors shadow-2xs"
                >
                  {t.getHelp}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REWARDS (Full Catalogue & Points Ledger) */}
      {/* ========================================================================= */}
      {activeTab === 'rewards' && (
        <div className="space-y-6 animate-fade-in">
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
                  {t.availableToRedeem}
                </span>
              </div>
              <p className="text-xs text-[#53616D] mt-2">
                {lang === 'en'
                  ? `+${customerPendingPoints} points awaiting hub scale check · ${confirmedKg.toFixed(1)} kg total material diverted`
                  : `+${customerPendingPoints} পয়েন্ট হাবে যাচাইাধীন · মোট ${confirmedKg.toFixed(1)} কেজি বর্জ্য পুনরুদ্ধার`}
              </p>
            </div>

            <div className="w-16 h-16 rounded-3xl bg-[#F5BF55] text-[#202B38] flex items-center justify-center font-black shadow-md self-start sm:self-auto">
              <Gift className="w-8 h-8" />
            </div>
          </div>

          {/* Reward Catalogue Grid */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#202B38]">
              {t.rewardCatalogTitle}
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
                        {lang === 'en' ? item.description : item.descriptionBn || item.description}
                      </p>
                      <span className="text-[11px] text-[#53616D] block font-semibold">
                        {lang === 'en' ? `Funder: ${item.funder}` : `ইপিআর স্পনসর: ${item.funder}`}
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
                          ? t.redeemButton
                          : `${item.pointsCost - customerAvailablePoints} ${t.morePointsNeeded}`}
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
              {t.pointsLedgerTitle}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF5EC] text-[#53616D] uppercase font-bold border-y border-[#EDE4D8]">
                  <tr>
                    <th className="py-3 px-4">{lang === 'en' ? 'Date' : 'তারিখ'}</th>
                    <th className="py-3 px-4">{lang === 'en' ? 'Event Description' : 'বিবরণ'}</th>
                    <th className="py-3 px-4">{lang === 'en' ? 'Status' : 'স্ট্যাটাস'}</th>
                    <th className="py-3 px-4 text-right">{lang === 'en' ? 'Points' : 'পয়েন্ট'}</th>
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
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#202B38]">
                {t.collectionHistoryTitle}
              </h2>
              <p className="text-xs text-[#53616D]">
                {t.collectionHistorySub}
              </p>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'all', label: t.filterAll },
                { id: 'upcoming', label: t.filterUpcoming },
                { id: 'completed', label: t.filterCompleted },
                { id: 'attention', label: t.filterAttention }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActivityFilter(f.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activityFilter === f.id
                      ? 'bg-[#25345C] text-white shadow-2xs'
                      : 'bg-white border border-[#EDE4D8] text-[#53616D] hover:bg-[#FAF5EC]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Collections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBookings.map((booking) => {
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
                            : lang === 'en' ? 'Pending intake' : 'যাচাইাধীন'}
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
                      <span>{t.seeReceipt}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SERVICES & DROP-OFF DEPOTS */}
      {/* ========================================================================= */}
      {activeTab === 'services' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#202B38]">
                {lang === 'en' ? 'Drop-Off Hubs & Specialized Services' : 'ড্রপ-অফ কেন্দ্র ও বিশেষ সেবা'}
              </h2>
              <p className="text-xs text-[#53616D]">
                {lang === 'en'
                  ? 'Self drop-off locations, brand takeback and commercial recovery options'
                  : 'স্বয়ংক্রিয় ড্রপ-অফ পয়েন্ট, ব্র্যান্ড রিকভারি ও বাণিজ্যিক সেবা'}
              </p>
            </div>
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="px-4 py-2 bg-[#25345C] text-white rounded-xl text-xs font-bold hover:bg-[#1B2644] cursor-pointer"
            >
              {t.bookPickup}
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
                  <span className="text-[11px] font-bold text-[#53616D]">
                    {lang === 'en' ? 'Accepted Materials:' : 'অনুমোদিত উপাদান:'}
                  </span>
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
                  className="w-full py-2 bg-[#FAF5EC] hover:bg-[#EDE4D8] text-[#25345C] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  {lang === 'en' ? 'View Depot Guidelines' : 'কেন্দ্রের নিয়মাবলী দেখুন'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ACCOUNT & SITES */}
      {/* ========================================================================= */}
      {activeTab === 'account' && (
        <div className="space-y-6 animate-fade-in">
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
              <span className="text-xs font-bold text-[#53616D]">
                {lang === 'en' ? 'Account Perspective:' : 'অ্যাকাউন্টের ধরন:'}
              </span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="bg-[#FAF5EC] border border-[#EDE4D8] rounded-xl px-3 py-1.5 text-xs font-bold text-[#202B38] cursor-pointer"
              >
                <option value="customer_household">
                  {lang === 'en' ? 'Household Resident' : 'বাসাবাড়ির বাসিন্দা'}
                </option>
                <option value="customer_apartment">
                  {lang === 'en' ? 'Apartment Committee' : 'ভবন ব্যবস্থাপনা কমিটি'}
                </option>
                <option value="customer_business">
                  {lang === 'en' ? 'Business / Café' : 'ব্যবসা প্রতিষ্ঠান'}
                </option>
              </select>
            </div>
          </div>

          {/* Organisation Dashboard for Apartment / Commercial */}
          {(role === 'customer_apartment' || role === 'customer_business') && (
            <OrganisationDashboardView />
          )}

          {/* Saved Service Addresses List */}
          <div className="bg-white rounded-3xl border border-[#EDE4D8] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#202B38]">
                {lang === 'en' ? 'Saved Collection Addresses' : 'সংরক্ষিত সেবার ঠিকানা'}
              </h3>
              <button
                onClick={() => setIsOnboardingModalOpen(true)}
                className="px-3.5 py-1.5 bg-[#25345C] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-[#1B2644]"
              >
                {t.addNewAddress}
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
                    <p className="text-xs text-[#53616D] mt-0.5">{loc.address}</p>
                  </div>
                  {selectedLocationId === loc.id ? (
                    <span className="text-xs font-bold text-[#12613F] flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      <span>{lang === 'en' ? 'Active' : 'নির্বাচিত'}</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setSelectedLocationId(loc.id)}
                      className="px-3 py-1 bg-white border border-[#EDE4D8] text-[#25345C] rounded-xl text-xs font-bold hover:bg-[#FAF5EC] cursor-pointer"
                    >
                      {lang === 'en' ? 'Select' : 'নির্বাচন'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MOBILE FLOATING ACTION DOCK (Thumb Reachable) */}
      {/* ========================================================================= */}
      <aside
        aria-label="Mobile quick actions"
        className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#EDE4D8] px-4 py-2.5 z-30 shadow-lg flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTabSwitch('home')}
            className={`p-2 rounded-xl flex flex-col items-center gap-0.5 ${
              activeTab === 'home' ? 'text-[#12613F] font-bold' : 'text-[#53616D]'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-[10px]">{t.home}</span>
          </button>

          <button
            onClick={() => handleTabSwitch('rewards')}
            className={`p-2 rounded-xl flex flex-col items-center gap-0.5 ${
              activeTab === 'rewards' ? 'text-[#12613F] font-bold' : 'text-[#53616D]'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span className="text-[10px]">{t.rewards}</span>
          </button>

          <button
            onClick={() => handleTabSwitch('activity')}
            className={`p-2 rounded-xl flex flex-col items-center gap-0.5 ${
              activeTab === 'activity' ? 'text-[#12613F] font-bold' : 'text-[#53616D]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="text-[10px]">{t.myActivity}</span>
          </button>
        </div>

        <button
          onClick={() => setIsBookingModalOpen(true)}
          className="flex-1 max-w-[180px] min-h-[44px] px-3.5 py-2 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#C9F1DC]" />
          <span>{t.bookPickup}</span>
        </button>
      </aside>

      {/* ========================================================================= */}
      {/* ALL MODAL TOUCHPOINTS */}
      {/* ========================================================================= */}
      <NewBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onOpenRewards={() => handleTabSwitch('rewards')}
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

      {/* Address Switcher Modal */}
      {isAreaSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#EDE4D8] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EDE4D8] pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#25345C]" />
                <h3 className="text-base font-bold text-[#202B38]">{t.selectAddress}</h3>
              </div>
              <button
                onClick={() => setIsAreaSelectorOpen(false)}
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
                    setIsAreaSelectorOpen(false);
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
                setIsAreaSelectorOpen(false);
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
    </div>
  );
};
