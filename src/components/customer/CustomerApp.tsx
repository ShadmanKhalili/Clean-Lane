import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking, DropOffPoint, MaterialCategory } from '../../types';
import { MATERIAL_TAXONOMY } from '../../data/mockData';
import { EvidenceBadge } from '../common/EvidenceBadge';
import { NewBookingModal } from './NewBookingModal';
import { CollectionStatusModal } from './CollectionStatusModal';
import { RecurringServiceModal } from './RecurringServiceModal';
import { MaterialGuideModal } from './MaterialGuideModal';
import { DisputeModal } from './DisputeModal';
import { DropOffDetailModal } from './DropOffDetailModal';
import { EnvironmentalImpactWidget } from '../common/EnvironmentalImpactWidget';
import { AppointmentTicket } from '../common/AppointmentTicket';
import { MaterialIllustration } from '../common/MaterialIllustrations';
import { useTranslation } from '../../utils/translations';
import {
  Home,
  Gift,
  Clock,
  MapPin,
  HelpCircle,
  AlertCircle,
  Plus,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Check,
  CheckCircle2,
  Calendar,
  Sparkles,
  Layers,
  FileText,
  Volume2,
  VolumeX,
  Leaf,
  Recycle,
  Flame,
  Droplets,
  Truck,
  Scale,
  ShieldCheck,
  Award,
  Zap,
  ExternalLink
} from 'lucide-react';
import { speakInstruction, stopSpeaking } from '../../utils/statusDictionary';

interface CustomerAppProps {
  initialTab?: 'home' | 'rewards' | 'activity';
  onNavigateTab?: (tab: string) => void;
}

export const CustomerApp: React.FC<CustomerAppProps> = ({
  initialTab = 'home',
  onNavigateTab
}) => {
  const {
    lang,
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
    showToast
  } = useApp();

  const t = useTranslation(lang);

  // 3 Navigation Tabs Only: Home | Rewards | My activity
  const [activeTab, setActiveTab] = useState<'home' | 'rewards' | 'activity'>(
    initialTab === 'activity' ? 'activity' : initialTab === 'rewards' ? 'rewards' : 'home'
  );

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab === 'activity' ? 'activity' : initialTab === 'rewards' ? 'rewards' : 'home');
    }
  }, [initialTab]);

  const handleTabSwitch = (tab: 'home' | 'rewards' | 'activity') => {
    setActiveTab(tab);
    if (onNavigateTab) {
      if (tab === 'home') onNavigateTab('overview');
      else onNavigateTab(tab);
    }
  };

  // Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [isDropOffListOpen, setIsDropOffListOpen] = useState(false);
  const [selectedDropOffPoint, setSelectedDropOffPoint] = useState<DropOffPoint | null>(null);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [selectedBookingForHelp, setSelectedBookingForHelp] = useState<string | undefined>(undefined);
  const [statusModalBooking, setStatusModalBooking] = useState<Booking | null>(null);

  // Rewards Secondary Views toggle
  const [activeRewardsSubView, setActiveRewardsSubView] = useState<'spending' | 'history' | 'rules' | 'campaigns'>('spending');

  // Activity filter & Secondary Views toggle
  const [activityFilter, setActivityFilter] = useState<'all' | 'upcoming' | 'completed' | 'attention'>('all');
  const [showEnvironmentalImpact, setShowEnvironmentalImpact] = useState<boolean>(false);

  // Current Address
  const currentLocation =
    savedLocations.find((l) => l.id === selectedLocationId) || savedLocations[0];

  // Audio instruction state
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);

  const handleToggleAudio = () => {
    if (isSpeakingAudio) {
      stopSpeaking();
      setIsSpeakingAudio(false);
    } else {
      setIsSpeakingAudio(true);
      const text =
        lang === 'en'
          ? 'Welcome to Clean Lane. Select clean, dry plastic bottles, cardboard, cans or rigid containers to schedule your verified doorstep recovery.'
          : 'ক্লিন লেনে স্বাগতম। বাসা থেকে সার্টিফাইড সংগ্রহের জন্য পরিচ্ছন্ন প্লাস্টিক বোতল, কার্টন বা ক্যান বাছাই করে বুকিং করুন।';
      speakInstruction(text, lang, () => setIsSpeakingAudio(false));
    }
  };

  // Selected materials from Home
  const [homeSelectedCats, setHomeSelectedCats] = useState<MaterialCategory[]>([
    'PET_BOTTLES',
    'CARDBOARD_OCC'
  ]);

  const toggleHomeMaterial = (cat: MaterialCategory) => {
    if (homeSelectedCats.includes(cat)) {
      if (homeSelectedCats.length > 1) {
        setHomeSelectedCats(homeSelectedCats.filter((c) => c !== cat));
      }
    } else {
      setHomeSelectedCats([...homeSelectedCats, cat]);
    }
  };

  // Issue / Discrepancy Booking (Attention Rule)
  const attentionBooking = bookings.find(
    (b) => b.status === 'MISSED' || b.status === 'DISPUTED'
  );

  // Active Upcoming Booking (Single Next Task Rule)
  const nextBooking = bookings.find(
    (b) =>
      b.status === 'CONFIRMED' ||
      b.status === 'COLLECTOR_ASSIGNED' ||
      b.status === 'REQUESTED' ||
      b.status === 'EN_ROUTE'
  );

  const handleOpenStatus = (b: Booking) => {
    setStatusModalBooking(b);
    setIsStatusModalOpen(true);
  };

  const handleGetHelp = (bId?: string) => {
    setSelectedBookingForHelp(bId || attentionBooking?.id || nextBooking?.id);
    setIsDisputeModalOpen(true);
  };

  const handleRedeem = (rewardId: string) => {
    const success = redeemReward(rewardId);
    if (success) {
      showToast(
        lang === 'en'
          ? 'Reward voucher redeemed successfully! Check voucher code in activity.'
          : 'ভাউচার সফলভাবে রিডিম হয়েছে!'
      );
    } else {
      showToast(
        lang === 'en'
          ? 'Insufficient verified points for this voucher.'
          : 'এই ভাউচারের জন্য আপনার পর্যাপ্ত পয়েন্ট নেই।'
      );
    }
  };

  // Filtered bookings for Activity
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
    <div className="w-full pb-20 md:pb-6">
      {/* ========================================================================= */}
      {/* TAB 1: HOME (Focused, Engaging Circular Front Door)                       */}
      {/* ========================================================================= */}
      {activeTab === 'home' && (
        <div className="w-full max-w-xl lg:max-w-7xl mx-auto space-y-5 animate-fade-in pt-2">
          {/* Top Bar: Your Location, Audio Guide, & Help */}
          <div className="flex items-center justify-between text-xs pb-1">
            <div className="flex items-center gap-1.5 font-bold text-[#202B38] min-w-0">
              <MapPin className="w-4 h-4 text-[#12613F] shrink-0" />
              <span className="truncate max-w-[170px] sm:max-w-xs">{currentLocation.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                  currentLocation.status === 'available'
                    ? 'bg-[#C9F1DC] text-[#12613F]'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {currentLocation.status === 'available' ? t.activeLane : t.waitlist}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Spoken voice helper pill */}
              <button
                type="button"
                onClick={handleToggleAudio}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
                  isSpeakingAudio
                    ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
                    : 'bg-white border-[#EDE4D8] text-[#53616D] hover:bg-[#FAF5EC]'
                }`}
                title={lang === 'en' ? 'Listen to audio tips' : 'অডিও শুনুন'}
              >
                {isSpeakingAudio ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-rose-600" />
                    <span>{t.audioSpeaking}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[#12613F]" />
                    <span className="hidden sm:inline">{t.listenAudio}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleGetHelp()}
                className="text-xs font-bold text-[#25345C] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{t.help}</span>
              </button>
            </div>
          </div>

          {/* Responsive 12-Column Grid on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* ============================================================== */}
            {/* LEFT COLUMN: Main Customer Task Flow (7 cols on lg)           */}
            {/* ============================================================== */}
            <div className="lg:col-span-7 space-y-5">
              {/* MAIN TASK PANEL */}
              {attentionBooking ? (
                /* CASE C: SOMETHING NEEDS ATTENTION (Replaces main pickup panel) */
                <div className="p-6 bg-amber-50 border-2 border-amber-300 rounded-3xl space-y-4 shadow-sm text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-200 text-amber-950 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6 text-amber-900" />
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-amber-950 tracking-tight">
                      {t.pickupMissedIssue}
                    </h2>
                    <p className="text-xs text-amber-800 max-w-sm mx-auto leading-relaxed">
                      {t.pickupMissedDesc}
                    </p>
                  </div>

                  {/* Single Primary Action */}
                  <button
                    onClick={() => handleGetHelp(attentionBooking.id)}
                    className="w-full min-h-[48px] py-3 bg-amber-900 hover:bg-amber-950 text-white rounded-2xl font-bold text-sm shadow-xs transition-colors cursor-pointer"
                  >
                    {t.getHelp}
                  </button>
                </div>
              ) : nextBooking ? (
                /* CASE B: UPCOMING COLLECTION (Rich Appointment Ticket) */
                <div className="space-y-3">
                  <AppointmentTicket
                    booking={nextBooking}
                    onTrackStatus={() => handleOpenStatus(nextBooking)}
                    onOpenChecklist={() => setIsGuideModalOpen(true)}
                  />

                  {/* Secondary Action: Book another pickup */}
                  <div className="text-center pt-1">
                    <button
                      onClick={() => setIsBookingModalOpen(true)}
                      className="text-xs font-bold text-[#25345C] hover:underline cursor-pointer"
                    >
                      + {t.bookAnotherPickup}
                    </button>
                  </div>
                </div>
              ) : (
                /* CASE A: NO UPCOMING COLLECTION (Tactile Stream Selection & Booking) */
                <div className="p-5 sm:p-7 bg-white rounded-3xl border border-[#EDE4D8] space-y-5 shadow-xs">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#12613F] bg-[#C9F1DC] px-2.5 py-0.5 rounded-full inline-block">
                      {lang === 'en' ? 'Doorstep Recycling Recovery' : 'ডোরস্টেপ রিসাইক্লিং রিকভারি'}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#25345C] tracking-tight">
                      {t.whatWouldYouLikeCollected}
                    </h1>
                    <p className="text-xs text-[#53616D] max-w-sm mx-auto leading-relaxed">
                      {lang === 'en'
                        ? 'Select clean materials below to schedule verified collection with reward points'
                        : 'রিওয়ার্ড পয়েন্ট সহ ডোরস্টেপ সংগ্রহের জন্য পরিচ্ছন্ন উপাদানসমূহ বাছাই করুন'}
                    </p>
                  </div>

                  {/* Tactile 4-Stream Material Selection Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      {
                        id: 'PET_BOTTLES' as MaterialCategory,
                        nameEn: 'Plastic bottles',
                        nameBn: 'প্লাস্টিক বোতল (PET)',
                        rate: '50 pts/kg'
                      },
                      {
                        id: 'CARDBOARD_OCC' as MaterialCategory,
                        nameEn: 'Cardboard & boxes',
                        nameBn: 'কাগজ ও কার্টন (OCC)',
                        rate: '25 pts/kg'
                      },
                      {
                        id: 'ALUMINUM_CANS' as MaterialCategory,
                        nameEn: 'Cans & metal',
                        nameBn: 'ক্যান ও ধাতু',
                        rate: '100 pts/kg'
                      },
                      {
                        id: 'HDPE_RIGID' as MaterialCategory,
                        nameEn: 'Rigid containers',
                        nameBn: 'রিজিড প্লাস্টিক (HDPE)',
                        rate: '45 pts/kg'
                      }
                    ].map((stream) => {
                      const isSelected = homeSelectedCats.includes(stream.id);
                      return (
                        <div
                          key={stream.id}
                          onClick={() => toggleHomeMaterial(stream.id)}
                          className={`p-3 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col items-center text-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#FAF5EC] border-[#25345C] shadow-xs ring-1 ring-[#25345C]/20'
                              : 'bg-[#FAF9F5] border-[#EDE4D8] hover:border-[#25345C]/40 hover:bg-white'
                          }`}
                        >
                          {/* Checkmark badge */}
                          <span
                            className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-[#12613F] text-white shadow-2xs'
                                : 'bg-white border border-[#EDE4D8] text-transparent'
                            }`}
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>

                          <MaterialIllustration category={stream.id} size="md" className="shrink-0 my-0.5" />

                          <div className="w-full">
                            <span className="font-bold text-xs text-[#202B38] block truncate">
                              {lang === 'en' ? stream.nameEn : stream.nameBn}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-[#12613F] block">
                              {stream.rate}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Sorting Guide Link */}
                  <div className="flex items-center justify-between text-xs px-1">
                    <button
                      type="button"
                      onClick={() => setIsGuideModalOpen(true)}
                      className="font-bold text-[#25345C] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#12613F]" />
                      <span>{t.seeExamples} ({lang === 'en' ? 'Sorting rules' : 'বাছাই নিয়ম'})</span>
                    </button>

                    <span className="text-[11px] text-[#53616D]">
                      {homeSelectedCats.length} {lang === 'en' ? 'selected' : 'বাছাইকৃত'}
                    </span>
                  </div>

                  {/* Single Primary Action: Book Pickup */}
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(true)}
                    className="w-full min-h-[52px] py-4 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-2xl font-black text-sm tracking-wide shadow-sm transition-all cursor-pointer transform active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <span>
                      {lang === 'en'
                        ? `Book Pickup (${homeSelectedCats.length} Streams)`
                        : `পিকআপ বুক করুন (${homeSelectedCats.length}টি উপাদান)`}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#C9F1DC]" />
                  </button>

                  {/* Secondary Action: Find a drop-off point */}
                  <div className="text-center pt-0.5">
                    <button
                      type="button"
                      onClick={() => setIsDropOffListOpen(true)}
                      className="text-xs font-bold text-[#25345C] hover:underline cursor-pointer"
                    >
                      {t.findADropOffPoint} →
                    </button>
                  </div>
                </div>
              )}

              {/* Mobile-Only Rewards & Impact cards (hidden on desktop because desktop has dedicated cards on right) */}
              <div className="lg:hidden space-y-4">
                {/* Rewards Balance Glance on Mobile */}
                <div className="p-4 bg-gradient-to-br from-[#FEF8EB] via-white to-[#FFF9F0] rounded-2xl border border-[#F5BF55] shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#53616D] block">
                        {lang === 'en' ? 'Rewards Balance' : 'রিওয়ার্ড ব্যালেন্স'}
                      </span>
                      <div className="flex items-baseline gap-2">
                        <strong className="text-xl font-black text-[#202B38] font-mono">{customerAvailablePoints} pts</strong>
                        <span className="text-[10px] font-bold text-[#12613F] bg-[#C9F1DC] px-1.5 py-0.2 rounded-full">
                          {t.availableToRedeem}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTabSwitch('rewards')}
                      className="px-3 py-1.5 bg-[#25345C] text-white rounded-xl font-bold text-xs"
                    >
                      {t.seeRewards} →
                    </button>
                  </div>
                </div>

                {/* Environmental Impact Glance on Mobile */}
                <div className="p-3.5 bg-white rounded-2xl border border-[#EDE4D8] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-[#12613F]" />
                    <span><strong>142.5 kg</strong> {lang === 'en' ? 'diverted this month' : 'সংগৃহীত বর্জ্য'}</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#12613F] font-bold bg-[#C9F1DC] px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>
              </div>

              {/* Secondary Recurring & Drop-Off Shortcuts */}
              <div className="pt-2 border-t border-[#EDE4D8] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#53616D]">
                <button
                  onClick={() => setIsRecurringModalOpen(true)}
                  className="hover:text-[#25345C] hover:underline cursor-pointer flex items-center gap-1.5 font-semibold"
                >
                  <Recycle className="w-4 h-4 text-[#12613F]" />
                  <span>{t.arrangeRegularCollection}</span>
                </button>

                <button
                  onClick={() => setIsDropOffListOpen(true)}
                  className="hover:text-[#25345C] hover:underline cursor-pointer flex items-center gap-1.5 font-semibold"
                >
                  <MapPin className="w-4 h-4 text-[#25345C]" />
                  <span>{t.findADropOffPoint}</span>
                </button>
              </div>
            </div>

            {/* ============================================================== */}
            {/* RIGHT COLUMN: Desktop Companion Command Suite (5 cols on lg)   */}
            {/* ============================================================== */}
            <div className="hidden lg:block lg:col-span-5 space-y-5">
              {/* Card 1: Circular Rewards Wallet & Quick Vouchers */}
              <div className="p-5 bg-gradient-to-br from-[#FEF8EB] via-white to-[#FFF9F0] rounded-3xl border border-[#F5BF55] shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#53616D] block">
                      {lang === 'en' ? 'Circular Rewards Wallet' : 'সার্কুলার রিওয়ার্ড ওয়ালেট'}
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <h3 className="text-3xl font-black text-[#202B38] font-mono">
                        {customerAvailablePoints}
                      </h3>
                      <span className="text-xs font-mono font-bold text-[#53616D]">pts</span>
                      <span className="text-[10px] font-bold text-[#12613F] bg-[#C9F1DC] px-2 py-0.5 rounded-full">
                        {t.availableToRedeem}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTabSwitch('rewards')}
                    className="p-2.5 rounded-2xl bg-[#25345C] text-white hover:bg-[#1B2644] transition-colors cursor-pointer shadow-2xs"
                    title={t.seeRewards}
                  >
                    <Gift className="w-5 h-5 text-[#C9F1DC]" />
                  </button>
                </div>

                {/* Pending Points Badge */}
                <div className="p-3 bg-white rounded-2xl border border-[#EDE4D8] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <div>
                      <span className="font-bold text-[#202B38] block">
                        {lang === 'en' ? 'Pending hub verification' : 'হাবে ওজন যাচাইাধীন'}
                      </span>
                      <span className="text-[11px] text-[#7A4D00]">{t.stillBeingChecked}</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-sm text-[#25345C]">+{customerPendingPoints} pts</span>
                </div>

                {/* Quick Vouchers Glance */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#202B38]">{lang === 'en' ? 'Top Redeemable Vouchers' : 'উপযুক্ত শীর্ষ ভাউচার'}</span>
                    <button
                      onClick={() => handleTabSwitch('rewards')}
                      className="text-[11px] font-bold text-[#25345C] hover:underline"
                    >
                      {lang === 'en' ? 'View all' : 'সবগুলো দেখুন'} →
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {rewards.slice(0, 2).map((r) => (
                      <div
                        key={r.id}
                        onClick={() => handleTabSwitch('rewards')}
                        className="p-3 bg-white rounded-xl border border-[#EDE4D8] hover:border-[#25345C] transition-all cursor-pointer shadow-2xs space-y-1"
                      >
                        <span className="font-bold text-xs text-[#202B38] block truncate">
                          {lang === 'en' ? r.title : r.titleBn}
                        </span>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono font-bold text-[#12613F]">{r.pointsCost} pts</span>
                          <span className="text-[10px] text-[#53616D]">{r.funder}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleTabSwitch('rewards')}
                  className="w-full py-2.5 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <span>{lang === 'en' ? 'Browse Full Rewards Store' : 'পুরো রিওয়ার্ড ক্যাটালগ দেখুন'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card 2: Pilot Lane Schedule & Assigned Van Dispatch */}
              <div className="p-5 bg-white rounded-3xl border border-[#EDE4D8] shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#C9F1DC] text-[#12613F] flex items-center justify-center font-bold">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#202B38] block">
                        {lang === 'en' ? 'Neighborhood Doorstep Run' : 'এলাকার ডোরস্টেপ সংগ্রহ রুট'}
                      </span>
                      <span className="text-[11px] text-[#53616D]">
                        {currentLocation.label.split(',')[0]} Pilot Lane
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold text-[#12613F] bg-[#C9F1DC] px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>

                <div className="p-3 bg-[#FAF9F5] rounded-2xl border border-[#EDE4D8] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#53616D]">{lang === 'en' ? 'Next Collection Slot:' : 'পরবর্তী সময়সূচী:'}</span>
                    <strong className="text-[#202B38]">Tomorrow 09:00 AM – 11:30 AM</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#53616D]">{lang === 'en' ? 'Assigned Field Van:' : 'বরাদ্দকৃত মাঠ ভ্যান:'}</span>
                    <span className="font-mono font-bold text-[#25345C]">Electric Trike #DH-14</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#53616D]">{lang === 'en' ? 'Collector Custodian:' : 'সার্টিফাইড সংগ্রাহক:'}</span>
                    <span className="text-[#202B38] font-medium">Tariq Hossain (Verified)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsRecurringModalOpen(true)}
                  className="w-full py-2.5 bg-[#FAF5EC] hover:bg-[#EDE4D8] text-[#25345C] border border-[#EDE4D8] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Recycle className="w-3.5 h-3.5 text-[#12613F]" />
                  <span>{lang === 'en' ? 'Setup Weekly Recurring Service' : 'সাপ্তাহিক রুটিন সংগ্রহ সেটআপ'}</span>
                </button>
              </div>

              {/* Card 3: Certified Neighborhood Circular Impact */}
              <div className="p-5 bg-white rounded-3xl border border-[#EDE4D8] shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#12613F] flex items-center justify-center font-bold">
                      <Leaf className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#202B38] block">
                        {lang === 'en' ? 'Lane Diversion & ESG Impact' : 'লেন সার্কুলার পুনরুদ্ধার প্রভাব'}
                      </span>
                      <span className="text-[11px] text-[#53616D]">
                        {lang === 'en' ? 'Certified scale verified' : 'ডিজিটাল স্কেলে প্রমাণিত'}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold text-[#12613F] bg-[#C9F1DC] px-2 py-0.5 rounded">
                    E2 Audit
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-[#FAF9F5] rounded-2xl border border-[#EDE4D8] space-y-1">
                    <div className="flex items-center gap-1 text-[#53616D] text-[11px]">
                      <Scale className="w-3.5 h-3.5 text-[#12613F]" />
                      <span>{lang === 'en' ? 'Total Diverted' : 'মোট সংগৃহীত'}</span>
                    </div>
                    <span className="font-mono font-black text-lg text-[#25345C] block">142.5 kg</span>
                    <span className="text-[10px] text-[#12613F] font-bold">100% clean stream</span>
                  </div>

                  <div className="p-3 bg-[#FAF9F5] rounded-2xl border border-[#EDE4D8] space-y-1">
                    <div className="flex items-center gap-1 text-[#53616D] text-[11px]">
                      <Flame className="w-3.5 h-3.5 text-amber-600" />
                      <span>{lang === 'en' ? 'CO₂ Avoided' : 'কার্বন নির্গমন রোধ'}</span>
                    </div>
                    <span className="font-mono font-black text-lg text-[#12613F] block">318 kg</span>
                    <span className="text-[10px] text-[#53616D]">Scope 3 reduction</span>
                  </div>

                  <div className="p-3 bg-[#FAF9F5] rounded-2xl border border-[#EDE4D8] space-y-1">
                    <div className="flex items-center gap-1 text-[#53616D] text-[11px]">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>{lang === 'en' ? 'Energy Saved' : 'বিদ্যুৎ সাশ্রয়'}</span>
                    </div>
                    <span className="font-mono font-black text-lg text-[#7A4D00] block">48 kWh</span>
                    <span className="text-[10px] text-[#53616D]">Virgin replacement</span>
                  </div>

                  <div className="p-3 bg-[#FAF9F5] rounded-2xl border border-[#EDE4D8] space-y-1">
                    <div className="flex items-center gap-1 text-[#53616D] text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#25345C]" />
                      <span>{lang === 'en' ? 'Landfill Saved' : 'ল্যান্ডফিল রোধ'}</span>
                    </div>
                    <span className="font-mono font-black text-lg text-[#25345C] block">1.4 m³</span>
                    <span className="text-[10px] text-[#53616D]">Zero dumping</span>
                  </div>
                </div>

                {/* Collapsible full ESG widget */}
                <button
                  type="button"
                  onClick={() => setShowEnvironmentalImpact(!showEnvironmentalImpact)}
                  className="w-full py-2 bg-white hover:bg-[#FAF9F5] border border-[#EDE4D8] text-[#25345C] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{showEnvironmentalImpact ? (lang === 'en' ? 'Hide ESG Analytics' : 'বিশ্লেষণ লুকান') : (lang === 'en' ? 'View Detailed ESG Analytics & Charts' : 'বিস্তারিত চার্ট ও বিশ্লেষণ দেখুন')}</span>
                  {showEnvironmentalImpact ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showEnvironmentalImpact && (
                  <div className="pt-2 animate-fade-in">
                    <EnvironmentalImpactWidget defaultExpanded={true} />
                  </div>
                )}
              </div>

              {/* Card 4: Nearby Drop-off Stations & Depots */}
              <div className="p-5 bg-white rounded-3xl border border-[#EDE4D8] shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                      <MapPin className="w-4 h-4 text-[#25345C]" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#202B38] block">
                        {lang === 'en' ? 'Nearby Circular Drop-off Stations' : 'নিকটস্থ ড্রপ-অফ কালেকশন স্টেশন'}
                      </span>
                      <span className="text-[11px] text-[#53616D]">
                        {lang === 'en' ? 'Walk-in self-service depots' : 'স্বয়ং সেবা ড্রপ-অফ কেন্দ্র'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsDropOffListOpen(true)}
                    className="text-xs font-bold text-[#25345C] hover:underline"
                  >
                    {lang === 'en' ? 'All' : 'সব'} →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {dropOffPoints.slice(0, 2).map((point) => (
                    <div
                      key={point.id}
                      className="p-3 bg-[#FAF9F5] rounded-2xl border border-[#EDE4D8] space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <strong className="text-[#202B38] block">{point.name}</strong>
                          <span className="text-[11px] text-[#53616D] block">{point.address}</span>
                        </div>
                        <span className="text-[10px] font-mono bg-[#C9F1DC] text-[#12613F] px-1.5 py-0.5 rounded font-bold shrink-0">
                          {point.operatingHours}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-[#EDE4D8]/80 text-[11px]">
                        <span className="text-[#53616D]">
                          {point.acceptedMaterials.length} {lang === 'en' ? 'streams accepted' : 'উপাদান গৃহীত'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDropOffPoint(point);
                          }}
                          className="font-bold text-[#25345C] hover:underline cursor-pointer"
                        >
                          {lang === 'en' ? 'Guidelines' : 'নির্দেশনা'} →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 5: EPR Brand Partner Campaign */}
              <div className="p-4 bg-gradient-to-r from-[#FEF8EB] to-[#FFF9F0] rounded-3xl border border-[#F5BF55] flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F5BF55] text-[#202B38] flex items-center justify-center font-bold shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[#202B38] block">Dhaka Circular Plastic Initiative 2026</strong>
                    <span className="text-[11px] text-[#7A4D00]">Sponsored by Unilever & Nestlé · 2x points on clean PET</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleTabSwitch('rewards')}
                  className="px-3 py-1.5 bg-[#25345C] text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer"
                >
                  Active
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REWARDS (Responsive 2-Column Desktop & Clean Mobile)              */}
      {/* ========================================================================= */}
      {activeTab === 'rewards' && (
        <div className="w-full max-w-xl lg:max-w-7xl mx-auto space-y-6 animate-fade-in pt-2">
          {/* ===================================================================== */}
          {/* DESKTOP REWARDS VIEW: 2-Column Balanced Dashboard (>= 1024px)         */}
          {/* ===================================================================== */}
          <div className="hidden lg:grid grid-cols-12 gap-8 items-start">
            {/* Left Column (5 cols): Points Balance, Earning Rules, Points History */}
            <div className="lg:col-span-5 space-y-5">
              {/* Rewards Wallet Header Card */}
              <div className="p-6 bg-gradient-to-br from-[#FEF8EB] via-white to-[#FFF9F0] rounded-3xl border-2 border-[#F5BF55] shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#53616D] block">
                      {lang === 'en' ? 'Available Points' : 'উপলব্ধ পয়েন্ট'}
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <h2 className="text-4xl font-black text-[#202B38] font-mono tabular-nums">
                        {customerAvailablePoints}
                      </h2>
                      <span className="text-xs font-bold text-[#12613F] bg-[#C9F1DC] px-2.5 py-0.5 rounded-full">
                        {t.availableToRedeem}
                      </span>
                    </div>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-[#F5BF55] text-[#202B38] flex items-center justify-center font-bold shrink-0 shadow-2xs">
                    <Gift className="w-6 h-6" />
                  </div>
                </div>

                {/* Pending Points Separately with "Still being checked" */}
                <div className="p-3.5 bg-white rounded-2xl border border-[#EDE4D8] text-xs flex justify-between items-center">
                  <div>
                    <span className="text-[#53616D] block font-bold">
                      {lang === 'en' ? 'Pending Scale Verification:' : 'যাচাইাধীন পয়েন্ট:'}
                    </span>
                    <span className="text-[11px] text-[#7A4D00]">
                      {t.stillBeingChecked}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-[#25345C] text-sm">
                    +{customerPendingPoints} pts
                  </span>
                </div>
              </div>

              {/* How Points Work (Earning Rules) */}
              <div className="p-5 bg-white rounded-3xl border border-[#EDE4D8] space-y-3.5 shadow-2xs text-xs">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#12613F]" />
                  <span className="font-bold text-[#202B38] text-sm block">{t.howPointsWork}</span>
                </div>
                <p className="text-[#53616D] leading-relaxed">
                  {lang === 'en'
                    ? 'Points are earned strictly based on the certified digital scale weight of clean, segregated recyclables. Unwashed or contaminated materials are rejected.'
                    : 'পয়েন্ট সরাসরি ডিজিটাল স্কেলে মেপে পরিষ্কার বর্জ্যের ওজনের ওপর দেওয়া হয়। অপরিচ্ছন্ন বা মিশ্রিত বর্জ্য পয়েন্টের জন্য বিবেচিত হবে না।'}
                </p>

                <div className="space-y-2">
                  {[
                    { name: 'Plastic Bottles (PET)', rate: '50 pts / kg' },
                    { name: 'Paper & Cardboard (OCC)', rate: '25 pts / kg' },
                    { name: 'Aluminum Cans & Metal', rate: '100 pts / kg' },
                    { name: 'Rigid Plastics (HDPE)', rate: '45 pts / kg' }
                  ].map((r, i) => (
                    <div key={i} className="p-2.5 bg-[#FAF9F5] rounded-xl flex justify-between items-center">
                      <span className="font-bold text-[#202B38]">{r.name}</span>
                      <span className="font-mono font-bold text-[#12613F]">{r.rate}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Points History (Audit Ledger) */}
              <div className="bg-white rounded-3xl border border-[#EDE4D8] p-5 shadow-2xs space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#202B38] text-sm block">{t.pointsLedgerTitle}</span>
                  <span className="font-mono text-[10px] text-[#12613F] font-bold bg-[#C9F1DC] px-2 py-0.5 rounded">
                    Immutable Log
                  </span>
                </div>
                <div className="space-y-2">
                  {pointsLedger.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 bg-[#FAF9F5] rounded-xl border border-[#EDE4D8] flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-[#202B38] block">{entry.description}</span>
                        <span className="text-[11px] text-[#53616D] font-mono">
                          {entry.timestamp.split('T')[0]} · {entry.status}
                        </span>
                      </div>
                      <span
                        className={`font-mono font-bold text-sm ${
                          entry.amount > 0 ? 'text-[#12613F]' : 'text-[#202B38]'
                        }`}
                      >
                        {entry.amount > 0 ? `+${entry.amount}` : entry.amount} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (7 cols): EPR Campaigns & Eligible Vouchers Catalog */}
            <div className="lg:col-span-7 space-y-5">
              {/* Active Brand Partner Campaigns Banner */}
              <div className="p-5 bg-gradient-to-r from-[#FEF8EB] via-white to-[#FFF9F0] border-2 border-[#F5BF55] rounded-3xl space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#202B38] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#7A4D00]" />
                    <span>Dhaka Circular Plastic Initiative 2026</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#12613F] bg-[#C9F1DC] px-2 py-0.5 rounded">
                    Active EPR Incentive
                  </span>
                </div>
                <p className="text-xs text-[#53616D] leading-relaxed">
                  {lang === 'en'
                    ? 'Sponsored by Unilever & Nestlé. Double points on all clean food-grade PET bottles in your collection lane.'
                    : 'ইউনিলিভার ও নেসলে স্পনসরড। আপনার লেনে পরিষ্কার পিইটি বোতলে দ্বিগুণ পয়েন্ট প্রযোজ্য।'}
                </p>
              </div>

              {/* Vouchers Catalog Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#202B38]">{t.eligibleRewards}</h3>
                  <span className="text-xs text-[#53616D]">{rewards.length} {lang === 'en' ? 'available vouchers' : 'উপলব্ধ ভাউচার'}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {rewards.map((item) => {
                    const canAfford = customerAvailablePoints >= item.pointsCost;
                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-white border border-[#EDE4D8] hover:border-[#25345C]/50 transition-all shadow-2xs flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-xs text-[#202B38] truncate">
                              {lang === 'en' ? item.title : item.titleBn}
                            </h4>
                            <span className="text-[10px] font-mono text-[#12613F] font-bold bg-[#C9F1DC] px-2 py-0.5 rounded shrink-0">
                              {item.pointsCost} pts
                            </span>
                          </div>
                          <p className="text-[11px] text-[#53616D] line-clamp-2 leading-relaxed">
                            {lang === 'en' ? item.description : item.descriptionBn || item.description}
                          </p>
                          <span className="text-[10px] text-[#53616D] block font-medium">
                            Sponsored by {item.funder}
                          </span>
                        </div>

                        <button
                          onClick={() => handleRedeem(item.id)}
                          disabled={!canAfford}
                          className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                            canAfford
                              ? 'bg-[#25345C] hover:bg-[#1B2644] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          }`}
                        >
                          {canAfford ? t.redeemButton : `${item.pointsCost - customerAvailablePoints} ${t.morePointsNeeded}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* MOBILE REWARDS VIEW: Single Column with Sub-View Switcher (< 1024px)  */}
          {/* ===================================================================== */}
          <div className="lg:hidden space-y-5">
            {/* Rewards Header Card */}
            <div className="p-6 bg-gradient-to-br from-[#FEF8EB] via-white to-[#FFF9F0] rounded-3xl border-2 border-[#F5BF55] shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#53616D] block">
                    {lang === 'en' ? 'Available Points' : 'উপলব্ধ পয়েন্ট'}
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <h2 className="text-4xl font-black text-[#202B38] font-mono tabular-nums">
                      {customerAvailablePoints}
                    </h2>
                    <span className="text-xs font-bold text-[#12613F] bg-[#C9F1DC] px-2 py-0.5 rounded-full">
                      {t.availableToRedeem}
                    </span>
                  </div>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-[#F5BF55] text-[#202B38] flex items-center justify-center font-bold shrink-0">
                  <Gift className="w-6 h-6" />
                </div>
              </div>

              {/* Pending Points Separately with "Still being checked" */}
              <div className="p-3 bg-white rounded-2xl border border-[#EDE4D8] text-xs flex justify-between items-center">
                <div>
                  <span className="text-[#53616D] block">
                    {lang === 'en' ? 'Pending Points:' : 'যাচাইাধীন পয়েন্ট:'}
                  </span>
                  <span className="text-[11px] text-[#7A4D00] font-medium">
                    {t.stillBeingChecked}
                  </span>
                </div>
                <span className="font-mono font-bold text-[#25345C] text-sm">
                  +{customerPendingPoints} pts
                </span>
              </div>
            </div>

            {/* Sub-Views Switcher Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold pb-1">
              {[
                { id: 'spending', labelEn: 'Eligible Rewards', labelBn: 'উপযুক্ত ভাউচার' },
                { id: 'history', labelEn: 'Points History', labelBn: 'পয়েন্ট খতিয়ান' },
                { id: 'rules', labelEn: 'How Points Work', labelBn: 'পয়েন্ট নিয়ম' },
                { id: 'campaigns', labelEn: 'Campaigns', labelBn: 'ক্যাম্পেইন' }
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setActiveRewardsSubView(v.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    activeRewardsSubView === v.id
                      ? 'bg-[#25345C] text-white shadow-2xs'
                      : 'bg-white border border-[#EDE4D8] text-[#53616D] hover:bg-[#FAF5EC]'
                  }`}
                >
                  {lang === 'en' ? v.labelEn : v.labelBn}
                </button>
              ))}
            </div>

            {/* Mobile Sub-View 1: Spending */}
            {activeRewardsSubView === 'spending' && (
              <div className="space-y-3 animate-fade-in">
                <span className="text-[11px] font-bold text-[#53616D] uppercase tracking-wider block">
                  {t.eligibleRewards}
                </span>

                <div className="space-y-3">
                  {rewards.map((item) => {
                    const canAfford = customerAvailablePoints >= item.pointsCost;
                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-white border border-[#EDE4D8] flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#202B38] truncate">
                              {lang === 'en' ? item.title : item.titleBn}
                            </span>
                            <span className="text-[10px] font-mono text-[#12613F] font-bold bg-[#C9F1DC] px-1.5 py-0.2 rounded">
                              {item.pointsCost} pts
                            </span>
                          </div>
                          <p className="text-[11px] text-[#53616D] line-clamp-1">
                            {lang === 'en' ? item.description : item.descriptionBn || item.description}
                          </p>
                          <span className="text-[10px] text-[#53616D] block">
                            Funder: {item.funder}
                          </span>
                        </div>

                        <button
                          onClick={() => handleRedeem(item.id)}
                          disabled={!canAfford}
                          className={`px-4 py-2 rounded-xl font-bold text-xs shrink-0 transition-colors cursor-pointer ${
                            canAfford
                              ? 'bg-[#25345C] hover:bg-[#1B2644] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          }`}
                        >
                          {canAfford ? t.redeemButton : `${item.pointsCost - customerAvailablePoints} ${t.morePointsNeeded}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mobile Sub-View 2: History */}
            {activeRewardsSubView === 'history' && (
              <div className="bg-white rounded-3xl border border-[#EDE4D8] p-5 shadow-2xs space-y-3 animate-fade-in text-xs">
                <span className="font-bold text-[#202B38] block">{t.pointsLedgerTitle}</span>
                <div className="space-y-2">
                  {pointsLedger.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 bg-[#FAF9F5] rounded-xl border border-[#EDE4D8] flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-[#202B38] block">{entry.description}</span>
                        <span className="text-[11px] text-[#53616D] font-mono">
                          {entry.timestamp.split('T')[0]} · {entry.status}
                        </span>
                      </div>
                      <span
                        className={`font-mono font-bold text-sm ${
                          entry.amount > 0 ? 'text-[#12613F]' : 'text-[#202B38]'
                        }`}
                      >
                        {entry.amount > 0 ? `+${entry.amount}` : entry.amount} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile Sub-View 3: Rules */}
            {activeRewardsSubView === 'rules' && (
              <div className="p-5 bg-white rounded-3xl border border-[#EDE4D8] space-y-4 animate-fade-in text-xs">
                <span className="font-bold text-[#202B38] block">{t.howPointsWork}</span>
                <p className="text-[#53616D] leading-relaxed">
                  {lang === 'en'
                    ? 'Points are earned strictly based on the certified digital scale weight of clean, segregated recyclables. Unwashed or contaminated materials are rejected.'
                    : 'পয়েন্ট সরাসরি ডিজিটাল স্কেলে মেপে পরিষ্কার বর্জ্যের ওজনের ওপর দেওয়া হয়। অপরিচ্ছন্ন বা মিশ্রিত বর্জ্য পয়েন্টের জন্য বিবেচিত হবে না।'}
                </p>

                <div className="space-y-2">
                  {[
                    { name: 'Plastic Bottles (PET)', rate: '50 pts / kg' },
                    { name: 'Paper & Cardboard (OCC)', rate: '25 pts / kg' },
                    { name: 'Aluminum Cans & Metal', rate: '100 pts / kg' },
                    { name: 'Rigid Plastics (HDPE)', rate: '45 pts / kg' }
                  ].map((r, i) => (
                    <div key={i} className="p-2.5 bg-[#FAF9F5] rounded-xl flex justify-between items-center">
                      <span className="font-bold text-[#202B38]">{r.name}</span>
                      <span className="font-mono font-bold text-[#12613F]">{r.rate}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile Sub-View 4: Campaigns */}
            {activeRewardsSubView === 'campaigns' && (
              <div className="p-5 bg-white rounded-3xl border border-[#EDE4D8] space-y-3 animate-fade-in text-xs">
                <span className="font-bold text-[#202B38] block">EPR Brand Partner Campaigns</span>
                <div className="p-3.5 bg-[#FFF9F0] border border-[#F5BF55] rounded-2xl space-y-1.5">
                  <span className="font-bold text-[#202B38] block">Dhaka Circular Plastic Initiative 2026</span>
                  <p className="text-[#53616D]">
                    {lang === 'en'
                      ? 'Sponsored by Unilever & Nestlé. Double points on all clean food-grade PET bottles.'
                      : 'ইউনিলিভার ও নেসলে স্পনসরড। পরিষ্কার পিইটি বোতলে দ্বিগুণ পয়েন্ট।'}
                  </p>
                  <span className="text-[10px] font-mono text-[#12613F] font-bold block pt-1">
                    Active in Gulshan & Dhanmondi zones
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MY ACTIVITY (Responsive 2-Column Desktop & Clean Mobile)           */}
      {/* ========================================================================= */}
      {activeTab === 'activity' && (
        <div className="w-full max-w-xl lg:max-w-7xl mx-auto space-y-6 animate-fade-in pt-2">
          {/* Header & Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div>
              <h2 className="text-xl font-bold text-[#202B38]">{t.collectionHistoryTitle}</h2>
              <p className="text-xs text-[#53616D]">{t.collectionHistorySub}</p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold pb-1">
              {[
                { id: 'all', label: t.filterAll },
                { id: 'upcoming', label: t.filterUpcoming },
                { id: 'completed', label: t.filterCompleted },
                { id: 'attention', label: t.filterAttention }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActivityFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
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

          {/* Desktop 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (7 cols): Collection History Cards */}
            <div className="lg:col-span-7 space-y-3">
              {filteredBookings.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-[#EDE4D8] text-xs text-[#53616D]">
                  {lang === 'en' ? 'No collections found in this filter.' : 'এই ফিল্টারে কোনো সংগ্রহ পাওয়া যায়নি।'}
                </div>
              ) : (
                filteredBookings.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => handleOpenStatus(b)}
                    className="p-4 bg-white rounded-2xl border border-[#EDE4D8] hover:border-[#25345C] transition-all cursor-pointer shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#25345C]">
                            #{b.id}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.2 rounded-md ${
                              b.status === 'CONFIRMED' || b.status === 'COLLECTOR_ASSIGNED' || b.status === 'REQUESTED'
                                ? 'bg-sky-100 text-sky-800'
                                : b.status === 'MISSED' || b.status === 'DISPUTED'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#202B38] mt-1">
                          {b.scheduledDate} ({b.scheduledTimeWindow})
                        </h4>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-[#202B38] font-mono block">
                          {b.confirmedWeightKg ? `${b.confirmedWeightKg} kg` : lang === 'en' ? 'Pending scale' : 'যাচাইাধীন'}
                        </span>
                        <EvidenceBadge level={b.evidenceLevel || 'E2'} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#53616D] pt-2 border-t border-[#FAF5EC]">
                      <span className="truncate max-w-[200px]">
                        {b.materials.map((m) => m.category.replace(/_/g, ' ')).join(', ')}
                      </span>
                      <span className="font-bold text-[#25345C] flex items-center gap-1">
                        <span>{t.seeDetails}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right Column (5 cols on lg): Verified Measurement & Custody Audit Trail */}
            <div className="space-y-5 lg:col-span-5">
              {/* Custody Standards Card */}
              <div className="p-5 bg-white rounded-3xl border border-[#EDE4D8] space-y-3.5 shadow-2xs text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#12613F]" />
                    <span className="font-bold text-sm text-[#202B38]">
                      {lang === 'en' ? 'Chain-of-Custody Verification' : 'কাস্টডি চেইন ও অডিট ট্রেইল'}
                    </span>
                  </div>
                  <EvidenceBadge level="E2" />
                </div>

                <p className="text-[#53616D] leading-relaxed">
                  {lang === 'en'
                    ? 'All collections undergo certified dual-stage measurement: doorstep hanging scale weight verified against hub digital platform scale before batch consolidation.'
                    : 'প্রতিটি সংগ্রহ দ্বি-স্তরীয় ওজনে সার্টিফাইড: দরজায় ঝুলন্ত স্কেলে ওজন এবং একত্রীকরণ হাবে ডিজিটাল প্ল্যাটফর্ম স্কেলে ওজন মিলিয়ে ব্যাচ প্রস্তুত করা হয়।'}
                </p>

                <div className="p-3 bg-[#FAF9F5] rounded-2xl border border-[#EDE4D8] space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#12613F]" />
                    <span className="text-[#202B38] font-semibold">1. Doorstep Custody: Field Collector Tariq Hossain</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#25345C]" />
                    <span className="text-[#202B38] font-semibold">2. Hub Aggregation: Dhanmondi Station (Bay 2)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#B46A14]" />
                    <span className="text-[#202B38] font-semibold">3. Circular Mill: Apex Eco-Flakes Recycler Mill</span>
                  </div>
                </div>
              </div>

              {/* Environmental Recovery Totals Widget */}
              <div className="p-5 bg-white rounded-3xl border border-[#EDE4D8] space-y-3 shadow-2xs">
                <span className="font-bold text-sm text-[#202B38] block">
                  {lang === 'en' ? 'Environmental Recovery Totals' : 'পুনরুদ্ধার ও পরিবেশগত প্রভাব'}
                </span>
                <EnvironmentalImpactWidget defaultExpanded={true} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MOBILE 3-TAB THUMB NAVIGATION DOCK                                        */}
      {/* ========================================================================= */}
      <aside
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#EDE4D8] px-6 py-2.5 z-30 shadow-lg flex items-center justify-around"
      >
        <button
          onClick={() => handleTabSwitch('home')}
          className={`flex flex-col items-center gap-1 text-xs transition-colors cursor-pointer ${
            activeTab === 'home' ? 'text-[#12613F] font-bold' : 'text-[#53616D]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px]">{t.home}</span>
        </button>

        <button
          onClick={() => handleTabSwitch('rewards')}
          className={`flex flex-col items-center gap-1 text-xs transition-colors cursor-pointer ${
            activeTab === 'rewards' ? 'text-[#12613F] font-bold' : 'text-[#53616D]'
          }`}
        >
          <Gift className="w-5 h-5" />
          <span className="text-[11px]">{t.rewards}</span>
        </button>

        <button
          onClick={() => handleTabSwitch('activity')}
          className={`flex flex-col items-center gap-1 text-xs transition-colors cursor-pointer ${
            activeTab === 'activity' ? 'text-[#12613F] font-bold' : 'text-[#53616D]'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[11px]">{t.myActivity}</span>
        </button>
      </aside>

      {/* ========================================================================= */}
      {/* ALL MODAL TOUCHPOINTS                                                     */}
      {/* ========================================================================= */}
      <NewBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onOpenRewards={() => handleTabSwitch('rewards')}
        onOpenHelp={(bId) => handleGetHelp(bId)}
        onOpenRecurring={() => setIsRecurringModalOpen(true)}
        initialSelectedCats={homeSelectedCats}
      />

      <CollectionStatusModal
        booking={statusModalBooking}
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onGetHelp={(bId) => handleGetHelp(bId)}
      />

      <RecurringServiceModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
      />

      <DisputeModal
        isOpen={isDisputeModalOpen}
        bookingId={selectedBookingForHelp}
        onClose={() => setIsDisputeModalOpen(false)}
      />

      <MaterialGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      {/* Drop-off points discovery list */}
      {isDropOffListOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-[#EDE4D8] p-6 shadow-2xl max-w-lg w-full space-y-4 max-h-[85vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-[#EDE4D8] pb-3">
              <h3 className="text-base font-bold text-[#202B38]">{t.findADropOffPoint}</h3>
              <button
                onClick={() => setIsDropOffListOpen(false)}
                className="w-8 h-8 rounded-xl bg-[#FAF5EC] flex items-center justify-center text-[#53616D] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {dropOffPoints.map((point) => (
                <div
                  key={point.id}
                  className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EDE4D8] space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-xs text-[#202B38]">{point.name}</h4>
                      <p className="text-[11px] text-[#53616D]">{point.address}</p>
                    </div>
                    <span className="text-[10px] font-mono bg-[#C9F1DC] text-[#12613F] px-2 py-0.5 rounded font-bold">
                      Open {point.operatingHours}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {point.acceptedMaterials.map((m) => (
                      <span key={m} className="text-[10px] bg-white border border-[#EDE4D8] px-2 py-0.5 rounded font-medium">
                        {m.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedDropOffPoint(point);
                    }}
                    className="w-full py-2 bg-white hover:bg-[#EDE4D8] border border-[#EDE4D8] text-[#25345C] rounded-xl font-bold text-xs transition-colors cursor-pointer"
                  >
                    View Guidelines
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <DropOffDetailModal
        point={selectedDropOffPoint}
        isOpen={Boolean(selectedDropOffPoint)}
        onClose={() => setSelectedDropOffPoint(null)}
      />
    </div>
  );
};
