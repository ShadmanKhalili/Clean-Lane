import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AppNotification, Booking, DropOffPoint, MaterialCategory, RewardItem } from '../../types';
import { RATES } from '../../domain/rules';
import { EvidenceBadge } from '../common/EvidenceBadge';
import { Modal } from '../common/Modal';
import { NewBookingModal } from './NewBookingModal';
import { CollectionStatusModal } from './CollectionStatusModal';
import { RecurringServiceModal } from './RecurringServiceModal';
import { MaterialGuideModal } from './MaterialGuideModal';
import { DisputeModal } from './DisputeModal';
import { DropOffDetailModal } from './DropOffDetailModal';
import { CancelPickupDialog } from './CancelPickupDialog';
import { OrganisationDashboardView } from './OrganisationDashboardView';
import { SupportCasesList } from './SupportCasesList';
import { EnvironmentalImpactWidget } from '../common/EnvironmentalImpactWidget';
import { AppointmentTicket } from '../common/AppointmentTicket';
import { MaterialIllustration } from '../common/MaterialIllustrations';
import { ReminderBanner } from '../notifications/ReminderBanner';
import { useTranslation } from '../../utils/translations';
import { formatBookingDate, daysFromToday, formatDateOnly, relativeDayLabel } from './dates';
import { impactForKg } from './impact';
import { bookingStatusClass, bookingStatusLabel, ledgerDelta, ledgerStatusLabel, materialLabel, redemptionStatusLabel } from './labels';
import { isCancellable, useCustomerData } from './useCustomerData';
import {
  Home,
  Gift,
  Clock,
  MapPin,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Check,
  CheckCircle2,
  Sparkles,
  Volume2,
  VolumeX,
  Leaf,
  Recycle,
  Flame,
  Truck,
  Scale,
  ShieldCheck,
  Award,
  Zap,
  Copy,
  Ticket,
  XCircle
} from 'lucide-react';
import { speakInstruction, stopSpeaking } from '../../utils/statusDictionary';

const NotificationCenterModal = lazy(() => import('../notifications/NotificationCenterModal').then((m) => ({ default: m.NotificationCenterModal })));
const PreparationGuidanceModal = lazy(() => import('../notifications/PreparationGuidanceModal').then((m) => ({ default: m.PreparationGuidanceModal })));

interface CustomerAppProps {
  initialTab?: 'home' | 'rewards' | 'activity';
  onNavigateTab?: (tab: string) => void;
}

type RedeemState =
  | { reward: RewardItem; phase: 'confirm' }
  | { reward: RewardItem; phase: 'done'; code: string }
  | { reward: RewardItem; phase: 'failed'; message: string };

/** The four streams offered on the home tiles. All earn the same flat doorstep rate. */
const HOME_STREAMS: MaterialCategory[] = ['PET_BOTTLES', 'CARDBOARD_OCC', 'ALUMINUM_CANS', 'HDPE_RIGID'];

export const CustomerApp: React.FC<CustomerAppProps> = ({ initialTab = 'home', onNavigateTab }) => {
  const {
    lang,
    rewards,
    campaigns,
    serviceZones,
    customerAvailablePoints,
    customerPendingPoints,
    savedLocations,
    selectedLocationId,
    dropOffPoints,
    redeemReward,
    showToast
  } = useApp();
  const { customer, myBookings, nextBooking, nextJob, attentionBooking, confirmedKg, awaitingKg, myLedger, myRedemptions, myNotifications } =
    useCustomerData();

  const t = useTranslation(lang);
  const isOrg = customer.customerType === 'apartment' || customer.customerType === 'business';

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
  const [statusBookingId, setStatusBookingId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [isDropOffListOpen, setIsDropOffListOpen] = useState(false);
  const [selectedDropOffPoint, setSelectedDropOffPoint] = useState<DropOffPoint | null>(null);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [selectedBookingForHelp, setSelectedBookingForHelp] = useState<string | undefined>(undefined);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [prepTarget, setPrepTarget] = useState<{ booking?: Booking; notification?: AppNotification } | null>(null);
  const [redeem, setRedeem] = useState<RedeemState | null>(null);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
  }, []);

  const statusBooking = statusBookingId ? myBookings.find((b) => b.id === statusBookingId) ?? null : null;

  // Rewards Secondary Views toggle (mobile only; desktop shows everything)
  const [activeRewardsSubView, setActiveRewardsSubView] = useState<'spending' | 'history' | 'rules' | 'campaigns'>('spending');

  // Activity filter & Secondary Views toggle
  const [activityFilter, setActivityFilter] = useState<'all' | 'upcoming' | 'completed' | 'attention'>('all');
  const [showEnvironmentalImpact, setShowEnvironmentalImpact] = useState<boolean>(false);

  // Current Address
  const currentLocation = savedLocations.find((l) => l.id === selectedLocationId) || savedLocations[0];
  const currentZone = serviceZones.find((z) => z.id === currentLocation?.zoneId);

  // Audio instruction state
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);
  useEffect(() => () => stopSpeaking(), []);

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
  const [homeSelectedCats, setHomeSelectedCats] = useState<MaterialCategory[]>(['PET_BOTTLES', 'CARDBOARD_OCC']);

  const toggleHomeMaterial = (cat: MaterialCategory) => {
    if (homeSelectedCats.includes(cat)) {
      if (homeSelectedCats.length > 1) setHomeSelectedCats(homeSelectedCats.filter((c) => c !== cat));
    } else {
      setHomeSelectedCats([...homeSelectedCats, cat]);
    }
  };

  const handleOpenStatus = (b: Booking) => setStatusBookingId(b.id);

  const handleGetHelp = (bId?: string) => {
    setSelectedBookingForHelp(bId || attentionBooking?.id || nextBooking?.id);
    setIsDisputeModalOpen(true);
  };

  const openPrep = (booking: Booking) => {
    const notification = myNotifications.find((n) => n.bookingId === booking.id && n.type === 'COLLECTION_REMINDER_24H');
    setPrepTarget({ booking, notification });
  };

  // ---- Rewards ----
  const startRedeem = (reward: RewardItem) => {
    setCopied(false);
    setRedeem({ reward, phase: 'confirm' });
  };

  const confirmRedeem = () => {
    if (!redeem || redeem.phase !== 'confirm') return;
    const reward = redeem.reward;
    const res = redeemReward(reward.id);
    if (res.success && res.couponCode) {
      setRedeem({ reward, phase: 'done', code: res.couponCode });
    } else {
      const message = !res.success
        ? customerAvailablePoints < reward.pointsCost
          ? lang === 'en'
            ? res.message
            : `পর্যাপ্ত পয়েন্ট নেই (ব্যালেন্স ${customerAvailablePoints}, প্রয়োজন ${reward.pointsCost})। যাচাইাধীন পয়েন্ট রিডিম করা যায় না।`
          : reward.stockAvailable <= 0
          ? lang === 'en'
            ? res.message
            : 'এই ভাউচারটি এখন স্টকে নেই।'
          : res.message
        : lang === 'en'
        ? 'The voucher could not be issued. Please try again.'
        : 'ভাউচার ইস্যু করা যায়নি। আবার চেষ্টা করুন।';
      setRedeem({ reward, phase: 'failed', message });
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast(lang === 'en' ? 'Could not copy automatically. Please select the code and copy it.' : 'স্বয়ংক্রিয়ভাবে কপি করা যায়নি। কোডটি সিলেক্ট করে কপি করুন।');
    }
  };

  const validUntil = (rewardId: string, issuedAt: string) => {
    const days = rewards.find((r) => r.id === rewardId)?.validityDays;
    if (!days) return null;
    const d = new Date(issuedAt);
    if (Number.isNaN(d.getTime())) return null;
    d.setDate(d.getDate() + days);
    return formatDateOnly(d.toISOString(), lang);
  };

  const activeCampaigns = campaigns.filter(
    (c) => c.status === 'ACTIVE' && (!currentLocation || c.eligibleZones.includes(currentLocation.zoneId))
  );

  // ---- Derived home figures ----
  const totalKg = confirmedKg + awaitingKg;
  const impact = impactForKg(confirmedKg);
  const hasImpactData = totalKg > 0;
  const nextCollector = nextJob?.collectorName ?? nextBooking?.collectorName;
  const vehicle = nextBooking?.collectorName?.match(/\(([^)]+)\)/)?.[1];
  const reminderDue =
    nextBooking !== undefined &&
    [0, 1].includes(daysFromToday(nextBooking.scheduledDate) ?? -1) &&
    (nextBooking.status === 'REQUESTED' || nextBooking.status === 'CONFIRMED' || nextBooking.status === 'COLLECTOR_ASSIGNED');

  // Filtered bookings for Activity
  const filteredBookings = myBookings.filter((b) => {
    if (activityFilter === 'all') return true;
    if (activityFilter === 'upcoming') return b.status === 'REQUESTED' || b.status === 'CONFIRMED' || b.status === 'COLLECTOR_ASSIGNED' || b.status === 'EN_ROUTE';
    if (activityFilter === 'completed') {
      return b.status === 'COLLECTED' || b.status === 'QUANTITY_CONFIRMED' || b.status === 'ENTERED_RECOVERY_CHAIN' || b.status === 'PROCESSED';
    }
    return b.status === 'MISSED' || b.status === 'DISPUTED' || b.status === 'CANCELLED';
  });

  const sortedLedger = [...myLedger].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const pointsBalanceMobile = (
    <div className="p-4 bg-gradient-to-br from-[#FEF8EB] via-white to-[#FFF9F0] rounded-2xl border border-[#F5BF55] shadow-2xs space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#53616D] block">
            {lang === 'en' ? 'Rewards Balance' : 'রিওয়ার্ড ব্যালেন্স'}
          </span>
          <div className="flex items-baseline gap-2 flex-wrap">
            <strong className="text-xl font-black text-[#202B38] font-mono">{customerAvailablePoints} pts</strong>
            <span className="text-[10px] font-bold text-[#12613F] bg-[#C9F1DC] px-1.5 py-0.5 rounded-full">{t.availableToRedeem}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleTabSwitch('rewards')}
          className="px-3 py-1.5 bg-[#25345C] text-white rounded-xl font-bold text-xs cursor-pointer shrink-0"
        >
          {t.seeRewards} →
        </button>
      </div>
    </div>
  );

  const ratesList = (
    <div className="space-y-2">
      <div className="p-2.5 bg-[#FAF9F5] rounded-xl flex justify-between items-center gap-3">
        <span className="font-bold text-[#202B38]">{lang === 'en' ? 'Doorstep pickup (all accepted materials)' : 'ডোরস্টেপ পিকআপ (সব গৃহীত উপাদান)'}</span>
        <span className="font-mono font-bold text-[#12613F] shrink-0">{RATES.doorstepPointsPerKg} pts / kg</span>
      </div>
      <div className="p-2.5 bg-[#FAF9F5] rounded-xl flex justify-between items-center gap-3">
        <span className="font-bold text-[#202B38]">{lang === 'en' ? 'Walk-in drop-off point' : 'ড্রপ-অফ পয়েন্টে জমা'}</span>
        <span className="font-mono font-bold text-[#12613F] shrink-0">{RATES.dropOffPointsPerKg} pts / kg</span>
      </div>
    </div>
  );

  const ledgerList = (
    <div className="space-y-2">
      {sortedLedger.length === 0 ? (
        <p className="p-4 text-center text-[#53616D]">{lang === 'en' ? 'No points activity yet. Your first pickup will appear here.' : 'এখনো কোনো পয়েন্ট লেনদেন নেই। প্রথম পিকআপের পর এখানে দেখা যাবে।'}</p>
      ) : (
        sortedLedger.map((entry) => {
          const delta = ledgerDelta(entry);
          const linked = entry.linkedBookingId ? myBookings.find((b) => b.id === entry.linkedBookingId) : undefined;
          const inner = (
            <>
              <span className="min-w-0">
                <span className="font-bold text-[#202B38] block">{entry.description}</span>
                <span className="text-[11px] text-[#53616D]">
                  {formatDateOnly(entry.timestamp, lang)} · {ledgerStatusLabel(entry, lang)}
                </span>
              </span>
              <span className={`font-mono font-bold text-sm shrink-0 ${entry.type === 'PENDING_HOLD' ? 'text-[#7A4D00]' : delta > 0 ? 'text-[#12613F]' : 'text-[#202B38]'}`}>
                {delta > 0 ? `+${delta}` : delta} pts
              </span>
            </>
          );
          return linked ? (
            <button
              type="button"
              key={entry.id}
              onClick={() => handleOpenStatus(linked)}
              className="w-full text-left p-3 bg-[#FAF9F5] rounded-xl border border-[#EDE4D8] hover:border-[#25345C] flex items-center justify-between gap-3 cursor-pointer"
            >
              {inner}
            </button>
          ) : (
            <div key={entry.id} className="p-3 bg-[#FAF9F5] rounded-xl border border-[#EDE4D8] flex items-center justify-between gap-3">
              {inner}
            </div>
          );
        })
      )}
    </div>
  );

  const rewardsCatalog = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      {rewards.map((item) => {
        const outOfStock = item.stockAvailable <= 0;
        const canAfford = customerAvailablePoints >= item.pointsCost;
        const disabled = !canAfford || outOfStock;
        return (
          <div key={item.id} className="p-4 rounded-2xl bg-white border border-[#EDE4D8] shadow-2xs flex flex-col justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-xs text-[#202B38]">{lang === 'en' ? item.title : item.titleBn}</h4>
                <span className="text-[10px] font-mono text-[#12613F] font-bold bg-[#C9F1DC] px-2 py-0.5 rounded shrink-0">{item.pointsCost} pts</span>
              </div>
              <p className="text-[11px] text-[#53616D] leading-relaxed">{lang === 'en' ? item.description : item.descriptionBn || item.description}</p>
              <span className="text-[10px] text-[#53616D] block font-medium">
                {lang === 'en' ? `Valid ${item.validityDays} days after redeeming · Funded by ${item.funder}` : `রিডিমের পর ${item.validityDays} দিন বৈধ · অর্থায়নে: ${item.funder}`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => startRedeem(item)}
              disabled={disabled}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors ${
                disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed border border-slate-200' : 'bg-[#25345C] hover:bg-[#1B2644] text-white shadow-xs cursor-pointer'
              }`}
            >
              {outOfStock
                ? lang === 'en'
                  ? 'Out of stock'
                  : 'স্টক শেষ'
                : canAfford
                ? t.redeemButton
                : `${item.pointsCost - customerAvailablePoints} ${t.morePointsNeeded}`}
            </button>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="w-full pb-20 md:pb-6">
      {/* ========================================================================= */}
      {/* TAB 1: HOME                                                               */}
      {/* ========================================================================= */}
      {activeTab === 'home' && isOrg && (
        <div className="w-full max-w-xl lg:max-w-7xl mx-auto space-y-5 animate-fade-in pt-2">
          {nextBooking && reminderDue && (
            <ReminderBanner booking={nextBooking} onOpenPreparation={openPrep} onOpenNotifications={() => setIsNotificationsOpen(true)} />
          )}
          <OrganisationDashboardView
            onBookPickup={() => setIsBookingModalOpen(true)}
            onOpenStatus={handleOpenStatus}
            onCancel={(b) => setCancelTarget(b)}
            onRequestRecurring={() => setIsRecurringModalOpen(true)}
            onGetHelp={handleGetHelp}
          />
        </div>
      )}

      {activeTab === 'home' && !isOrg && (
        <div className="w-full max-w-xl lg:max-w-7xl mx-auto space-y-5 animate-fade-in pt-2">
          {/* Top Bar: Your Location, Audio Guide, & Help */}
          <div className="flex items-center justify-between text-xs pb-1 gap-2">
            <div className="flex items-center gap-1.5 font-bold text-[#202B38] min-w-0">
              <MapPin className="w-4 h-4 text-[#12613F] shrink-0" aria-hidden="true" />
              <span className="truncate max-w-[170px] sm:max-w-xs">{currentLocation?.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                  currentLocation?.status === 'available' ? 'bg-[#C9F1DC] text-[#12613F]' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {currentLocation?.status === 'available' ? t.activeLane : t.waitlist}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleToggleAudio}
                aria-pressed={isSpeakingAudio}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
                  isSpeakingAudio ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse' : 'bg-white border-[#EDE4D8] text-[#53616D] hover:bg-[#FAF5EC]'
                }`}
                title={lang === 'en' ? 'Listen to audio tips' : 'অডিও শুনুন'}
                aria-label={lang === 'en' ? 'Listen to audio tips' : 'অডিও শুনুন'}
              >
                {isSpeakingAudio ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />
                    <span>{t.audioSpeaking}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[#12613F]" aria-hidden="true" />
                    <span className="hidden sm:inline">{t.listenAudio}</span>
                  </>
                )}
              </button>

              <button type="button" onClick={() => handleGetHelp()} className="text-xs font-bold text-[#25345C] hover:underline flex items-center gap-1 cursor-pointer">
                <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t.help}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-7 space-y-5">
              {nextBooking && reminderDue && !attentionBooking && (
                <ReminderBanner booking={nextBooking} onOpenPreparation={openPrep} onOpenNotifications={() => setIsNotificationsOpen(true)} />
              )}

              {attentionBooking ? (
                <div className="p-6 bg-amber-50 border-2 border-amber-300 rounded-3xl space-y-4 shadow-sm text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-200 text-amber-950 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6 text-amber-900" aria-hidden="true" />
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-amber-950 tracking-tight">{t.pickupMissedIssue}</h2>
                    <p className="text-xs text-amber-800 max-w-sm mx-auto leading-relaxed">{t.pickupMissedDesc}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGetHelp(attentionBooking.id)}
                    className="w-full min-h-[48px] py-3 bg-amber-900 hover:bg-amber-950 text-white rounded-2xl font-bold text-sm shadow-xs transition-colors cursor-pointer"
                  >
                    {t.getHelp}
                  </button>
                </div>
              ) : nextBooking ? (
                <div className="space-y-3">
                  <AppointmentTicket
                    booking={nextBooking}
                    collectorName={nextCollector}
                    onTrackStatus={() => handleOpenStatus(nextBooking)}
                    onOpenChecklist={() => openPrep(nextBooking)}
                    onCancel={() => setCancelTarget(nextBooking)}
                  />

                  <div className="text-center pt-1">
                    <button type="button" onClick={() => setIsBookingModalOpen(true)} className="text-xs font-bold text-[#25345C] hover:underline cursor-pointer">
                      + {t.bookAnotherPickup}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 sm:p-7 bg-white rounded-3xl border border-[#EDE4D8] space-y-5 shadow-xs">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#12613F] bg-[#C9F1DC] px-2.5 py-0.5 rounded-full inline-block">
                      {lang === 'en' ? 'Doorstep Recycling Recovery' : 'ডোরস্টেপ রিসাইক্লিং রিকভারি'}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#25345C] tracking-tight">{t.whatWouldYouLikeCollected}</h1>
                    <p className="text-xs text-[#53616D] max-w-sm mx-auto leading-relaxed">
                      {lang === 'en'
                        ? `Select clean materials below to schedule a verified pickup. Earn ${RATES.doorstepPointsPerKg} points per verified kg.`
                        : `পরিচ্ছন্ন উপাদান বাছাই করে যাচাইকৃত পিকআপ বুক করুন। প্রতি যাচাইকৃত কেজিতে ${RATES.doorstepPointsPerKg} পয়েন্ট।`}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {HOME_STREAMS.map((id) => {
                      const isSelected = homeSelectedCats.includes(id);
                      return (
                        <button
                          type="button"
                          key={id}
                          aria-pressed={isSelected}
                          onClick={() => toggleHomeMaterial(id)}
                          className={`p-3 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col items-center text-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#FAF5EC] border-[#25345C] shadow-xs ring-1 ring-[#25345C]/20'
                              : 'bg-[#FAF9F5] border-[#EDE4D8] hover:border-[#25345C]/40 hover:bg-white'
                          }`}
                        >
                          <span
                            className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                              isSelected ? 'bg-[#12613F] text-white shadow-2xs' : 'bg-white border border-[#EDE4D8] text-transparent'
                            }`}
                          >
                            <Check className="w-3 h-3 stroke-[3]" aria-hidden="true" />
                          </span>

                          <MaterialIllustration category={id} size="md" className="shrink-0 my-0.5" />

                          <span className="font-bold text-xs text-[#202B38] block w-full">{materialLabel(id, lang)}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-xs px-1">
                    <button type="button" onClick={() => setIsGuideModalOpen(true)} className="font-bold text-[#25345C] hover:underline flex items-center gap-1 cursor-pointer">
                      <Sparkles className="w-3.5 h-3.5 text-[#12613F]" aria-hidden="true" />
                      <span>
                        {t.seeExamples} ({lang === 'en' ? 'Sorting rules' : 'বাছাই নিয়ম'})
                      </span>
                    </button>

                    <span className="text-[11px] text-[#53616D]">
                      {homeSelectedCats.length} {lang === 'en' ? 'selected' : 'বাছাইকৃত'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(true)}
                    className="w-full min-h-[52px] py-4 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-2xl font-black text-sm tracking-wide shadow-sm transition-all cursor-pointer transform active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <span>{lang === 'en' ? `Book Pickup (${homeSelectedCats.length} Streams)` : `পিকআপ বুক করুন (${homeSelectedCats.length}টি উপাদান)`}</span>
                    <ArrowRight className="w-4 h-4 text-[#C9F1DC]" aria-hidden="true" />
                  </button>

                  <div className="text-center pt-0.5">
                    <button type="button" onClick={() => setIsDropOffListOpen(true)} className="text-xs font-bold text-[#25345C] hover:underline cursor-pointer">
                      {t.findADropOffPoint} →
                    </button>
                  </div>
                </div>
              )}

              {/* Mobile-only glance cards */}
              <div className="lg:hidden space-y-4">
                {pointsBalanceMobile}

                <div className="p-3.5 bg-white rounded-2xl border border-[#EDE4D8] flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-[#12613F] shrink-0" aria-hidden="true" />
                    {hasImpactData ? (
                      <span>
                        <strong>{totalKg.toFixed(1)} kg</strong> {lang === 'en' ? 'diverted so far' : 'এ পর্যন্ত সংগৃহীত'}
                      </span>
                    ) : (
                      <span className="text-[#53616D]">{lang === 'en' ? 'Your recycling impact appears after your first pickup.' : 'প্রথম পিকআপের পর আপনার প্রভাব এখানে দেখা যাবে।'}</span>
                    )}
                  </div>
                  {confirmedKg > 0 && (
                    <span className="font-mono text-[10px] text-[#12613F] font-bold bg-[#C9F1DC] px-2 py-0.5 rounded shrink-0">
                      {lang === 'en' ? 'Scale-verified' : 'স্কেলে যাচাইকৃত'}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-[#EDE4D8] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#53616D]">
                <button type="button" onClick={() => setIsRecurringModalOpen(true)} className="hover:text-[#25345C] hover:underline cursor-pointer flex items-center gap-1.5 font-semibold">
                  <Recycle className="w-4 h-4 text-[#12613F]" aria-hidden="true" />
                  <span>{t.arrangeRegularCollection}</span>
                </button>

                <button type="button" onClick={() => setIsDropOffListOpen(true)} className="hover:text-[#25345C] hover:underline cursor-pointer flex items-center gap-1.5 font-semibold">
                  <MapPin className="w-4 h-4 text-[#25345C]" aria-hidden="true" />
                  <span>{t.findADropOffPoint}</span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN (desktop) */}
            <div className="hidden lg:block lg:col-span-5 space-y-5">
              <div className="p-5 bg-gradient-to-br from-[#FEF8EB] via-white to-[#FFF9F0] rounded-3xl border border-[#F5BF55] shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#53616D] block">
                      {lang === 'en' ? 'Circular Rewards Wallet' : 'সার্কুলার রিওয়ার্ড ওয়ালেট'}
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <h3 className="text-3xl font-black text-[#202B38] font-mono">{customerAvailablePoints}</h3>
                      <span className="text-xs font-mono font-bold text-[#53616D]">pts</span>
                      <span className="text-[10px] font-bold text-[#12613F] bg-[#C9F1DC] px-2 py-0.5 rounded-full">{t.availableToRedeem}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTabSwitch('rewards')}
                    className="p-2.5 rounded-2xl bg-[#25345C] text-white hover:bg-[#1B2644] transition-colors cursor-pointer shadow-2xs"
                    title={t.seeRewards}
                    aria-label={t.seeRewards}
                  >
                    <Gift className="w-5 h-5 text-[#C9F1DC]" aria-hidden="true" />
                  </button>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-[#EDE4D8] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
                    <div>
                      <span className="font-bold text-[#202B38] block">{lang === 'en' ? 'Pending hub verification' : 'হাবে ওজন যাচাইাধীন'}</span>
                      <span className="text-[11px] text-[#7A4D00]">{t.stillBeingChecked}</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-sm text-[#25345C]">+{customerPendingPoints} pts</span>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#202B38]">{lang === 'en' ? 'Top Redeemable Vouchers' : 'উপযুক্ত শীর্ষ ভাউচার'}</span>
                    <button type="button" onClick={() => handleTabSwitch('rewards')} className="text-[11px] font-bold text-[#25345C] hover:underline cursor-pointer">
                      {lang === 'en' ? 'View all' : 'সবগুলো দেখুন'} →
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {rewards.slice(0, 2).map((r) => (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => handleTabSwitch('rewards')}
                        className="p-3 text-left bg-white rounded-xl border border-[#EDE4D8] hover:border-[#25345C] transition-all cursor-pointer shadow-2xs space-y-1"
                      >
                        <span className="font-bold text-xs text-[#202B38] block truncate">{lang === 'en' ? r.title : r.titleBn}</span>
                        <span className="flex items-center justify-between text-[11px]">
                          <span className="font-mono font-bold text-[#12613F]">{r.pointsCost} pts</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleTabSwitch('rewards')}
                  className="w-full py-2.5 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <span>{lang === 'en' ? 'Browse Full Rewards Store' : 'পুরো রিওয়ার্ড ক্যাটালগ দেখুন'}</span>
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              {/* Next pickup / dispatch */}
              <div className="p-5 bg-white rounded-3xl border border-[#EDE4D8] shadow-xs space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#C9F1DC] text-[#12613F] flex items-center justify-center font-bold shrink-0">
                      <Truck className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-[#202B38] block">{lang === 'en' ? 'Neighborhood Doorstep Run' : 'এলাকার ডোরস্টেপ সংগ্রহ রুট'}</span>
                      <span className="text-[11px] text-[#53616D] block truncate">{currentZone?.name ?? currentLocation?.label}</span>
                    </div>
                  </div>

                  {currentZone && (
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                        currentZone.status === 'active_clean_lane' ? 'text-[#12613F] bg-[#C9F1DC]' : 'text-amber-800 bg-amber-100'
                      }`}
                    >
                      {currentZone.status === 'active_clean_lane' ? (lang === 'en' ? 'Active' : 'সক্রিয়') : lang === 'en' ? 'Pilot expansion' : 'সম্প্রসারণ'}
                    </span>
                  )}
                </div>

                <div className="p-3 bg-[#FAF9F5] rounded-2xl border border-[#EDE4D8] space-y-2 text-xs">
                  {nextBooking ? (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[#53616D]">{lang === 'en' ? 'Next collection slot:' : 'পরবর্তী সময়সূচী:'}</span>
                        <strong className="text-[#202B38] text-right">
                          {relativeDayLabel(nextBooking.scheduledDate, lang)}, {nextBooking.scheduledTimeWindow}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[#53616D]">{lang === 'en' ? 'Collector:' : 'সংগ্রাহক:'}</span>
                        <span className="text-[#202B38] font-medium text-right">
                          {nextCollector ?? (lang === 'en' ? 'Assigned before pickup' : 'পিকআপের আগে নির্ধারিত হবে')}
                        </span>
                      </div>
                      {vehicle && (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[#53616D]">{lang === 'en' ? 'Vehicle:' : 'যানবাহন:'}</span>
                          <span className="font-mono font-bold text-[#25345C]">{vehicle}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-[#53616D]">
                      {lang === 'en' ? 'No pickup booked. Your next slot and collector appear here once you book.' : 'কোনো পিকআপ বুক করা নেই। বুক করলে পরবর্তী সময় ও সংগ্রাহকের তথ্য এখানে দেখা যাবে।'}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsRecurringModalOpen(true)}
                  className="w-full py-2.5 bg-[#FAF5EC] hover:bg-[#EDE4D8] text-[#25345C] border border-[#EDE4D8] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Recycle className="w-3.5 h-3.5 text-[#12613F]" aria-hidden="true" />
                  <span>{lang === 'en' ? 'Request a regular pickup schedule' : 'নিয়মিত পিকআপ সূচির অনুরোধ'}</span>
                </button>
              </div>

              {/* Impact */}
              <div className="p-5 bg-white rounded-3xl border border-[#EDE4D8] shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#12613F] flex items-center justify-center font-bold">
                      <Leaf className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#202B38] block">{lang === 'en' ? 'Your Recovery Impact' : 'আপনার পুনরুদ্ধারের প্রভাব'}</span>
                      <span className="text-[11px] text-[#53616D]">{lang === 'en' ? 'From scale-verified pickups' : 'স্কেলে যাচাইকৃত পিকআপ থেকে'}</span>
                    </div>
                  </div>
                </div>

                {hasImpactData ? (
                  <>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 bg-[#FAF9F5] rounded-2xl border border-[#EDE4D8] space-y-1">
                        <div className="flex items-center gap-1 text-[#53616D] text-[11px]">
                          <Scale className="w-3.5 h-3.5 text-[#12613F]" aria-hidden="true" />
                          <span>{lang === 'en' ? 'Total Diverted' : 'মোট সংগৃহীত'}</span>
                        </div>
                        <span className="font-mono font-black text-lg text-[#25345C] block">{totalKg.toFixed(1)} kg</span>
                        {awaitingKg > 0 && (
                          <span className="text-[10px] text-[#7A4D00] font-bold">
                            {lang === 'en' ? `${awaitingKg.toFixed(1)} kg awaiting hub scale` : `${awaitingKg.toFixed(1)} কেজি হাব স্কেলের অপেক্ষায়`}
                          </span>
                        )}
                      </div>

                      <div className="p-3 bg-[#FAF9F5] rounded-2xl border border-[#EDE4D8] space-y-1">
                        <div className="flex items-center gap-1 text-[#53616D] text-[11px]">
                          <Flame className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                          <span>{lang === 'en' ? 'CO₂e Avoided' : 'কার্বন নির্গমন রোধ'}</span>
                        </div>
                        <span className="font-mono font-black text-lg text-[#12613F] block">≈ {impact.co2eKg.toFixed(0)} kg</span>
                      </div>

                      <div className="p-3 bg-[#FAF9F5] rounded-2xl border border-[#EDE4D8] space-y-1">
                        <div className="flex items-center gap-1 text-[#53616D] text-[11px]">
                          <Zap className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                          <span>{lang === 'en' ? 'Energy Saved' : 'বিদ্যুৎ সাশ্রয়'}</span>
                        </div>
                        <span className="font-mono font-black text-lg text-[#7A4D00] block">≈ {impact.kwh.toFixed(0)} kWh</span>
                      </div>

                      <div className="p-3 bg-[#FAF9F5] rounded-2xl border border-[#EDE4D8] space-y-1">
                        <div className="flex items-center gap-1 text-[#53616D] text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#25345C]" aria-hidden="true" />
                          <span>{lang === 'en' ? 'Landfill Saved' : 'ল্যান্ডফিল রোধ'}</span>
                        </div>
                        <span className="font-mono font-black text-lg text-[#25345C] block">≈ {impact.landfillM3.toFixed(2)} m³</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#53616D]">
                      {lang === 'en' ? 'Equivalents use rounded, indicative factors, not certified values.' : 'সমতুল্য মান আনুমানিক গড় হার অনুযায়ী, প্রত্যয়িত মান নয়।'}
                    </p>
                  </>
                ) : (
                  <p className="p-4 bg-[#FAF9F5] rounded-2xl border border-dashed border-[#EDE4D8] text-xs text-[#53616D] text-center">
                    {lang === 'en'
                      ? 'No weighed pickups yet. After your first collection is weighed, your totals show up here.'
                      : 'এখনো কোনো ওজন করা পিকআপ নেই। প্রথম সংগ্রহ ওজন হলে আপনার হিসাব এখানে দেখা যাবে।'}
                  </p>
                )}

                <button
                  type="button"
                  aria-expanded={showEnvironmentalImpact}
                  onClick={() => setShowEnvironmentalImpact(!showEnvironmentalImpact)}
                  className="w-full py-2 bg-white hover:bg-[#FAF9F5] border border-[#EDE4D8] text-[#25345C] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>
                    {showEnvironmentalImpact
                      ? lang === 'en'
                        ? 'Hide ESG Analytics'
                        : 'বিশ্লেষণ লুকান'
                      : lang === 'en'
                      ? 'View Detailed ESG Analytics'
                      : 'বিস্তারিত বিশ্লেষণ দেখুন'}
                  </span>
                  {showEnvironmentalImpact ? <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" /> : <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />}
                </button>

                {showEnvironmentalImpact && (
                  <div className="pt-2 animate-fade-in">
                    <EnvironmentalImpactWidget defaultExpanded={true} />
                  </div>
                )}
              </div>

              {/* Drop-off stations */}
              <div className="p-5 bg-white rounded-3xl border border-[#EDE4D8] shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                      <MapPin className="w-4 h-4 text-[#25345C]" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#202B38] block">{lang === 'en' ? 'Nearby Circular Drop-off Stations' : 'নিকটস্থ ড্রপ-অফ কালেকশন স্টেশন'}</span>
                      <span className="text-[11px] text-[#53616D]">{lang === 'en' ? 'Walk-in self-service depots' : 'স্বয়ংসেবা ড্রপ-অফ কেন্দ্র'}</span>
                    </div>
                  </div>

                  <button type="button" onClick={() => setIsDropOffListOpen(true)} className="text-xs font-bold text-[#25345C] hover:underline cursor-pointer">
                    {lang === 'en' ? 'All' : 'সব'} →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {dropOffPoints.slice(0, 2).map((point) => (
                    <div key={point.id} className="p-3 bg-[#FAF9F5] rounded-2xl border border-[#EDE4D8] space-y-2 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <strong className="text-[#202B38] block">{lang === 'en' ? point.name : point.nameBn}</strong>
                          <span className="text-[11px] text-[#53616D] block">{point.address}</span>
                        </div>
                        <span className="text-[10px] font-mono bg-[#C9F1DC] text-[#12613F] px-1.5 py-0.5 rounded font-bold shrink-0">{point.operatingHours}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-[#EDE4D8]/80 text-[11px]">
                        <span className="text-[#53616D]">
                          {point.acceptedMaterials.length} {lang === 'en' ? 'streams accepted' : 'উপাদান গৃহীত'}
                        </span>
                        <button type="button" onClick={() => setSelectedDropOffPoint(point)} className="font-bold text-[#25345C] hover:underline cursor-pointer">
                          {lang === 'en' ? 'Guidelines' : 'নির্দেশনা'} →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active sponsor campaign for this zone (no bonus is promised here). */}
              {activeCampaigns[0] && (
                <div className="p-4 bg-gradient-to-r from-[#FEF8EB] to-[#FFF9F0] rounded-3xl border border-[#F5BF55] flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#F5BF55] text-[#202B38] flex items-center justify-center font-bold shrink-0">
                      <Sparkles className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <strong className="text-[#202B38] block">{activeCampaigns[0].title}</strong>
                      <span className="text-[11px] text-[#7A4D00]">
                        {lang === 'en' ? `Sponsored by ${activeCampaigns[0].sponsorName}` : `স্পনসর: ${activeCampaigns[0].sponsorName}`}
                      </span>
                    </div>
                  </div>
                  <button type="button" onClick={() => handleTabSwitch('rewards')} className="px-3 py-1.5 bg-[#25345C] text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer">
                    {lang === 'en' ? 'Details' : 'বিস্তারিত'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REWARDS                                                            */}
      {/* ========================================================================= */}
      {activeTab === 'rewards' && (
        <div className="w-full max-w-xl lg:max-w-7xl mx-auto space-y-5 animate-fade-in pt-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
            <div className="lg:col-span-5 space-y-5">
              <div className="p-6 bg-gradient-to-br from-[#FEF8EB] via-white to-[#FFF9F0] rounded-3xl border-2 border-[#F5BF55] shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#53616D] block">{lang === 'en' ? 'Available Points' : 'উপলব্ধ পয়েন্ট'}</span>
                    <div className="flex items-baseline gap-2 mt-0.5 flex-wrap">
                      <h2 className="text-4xl font-black text-[#202B38] font-mono tabular-nums">{customerAvailablePoints}</h2>
                      <span className="text-xs font-bold text-[#12613F] bg-[#C9F1DC] px-2.5 py-0.5 rounded-full">{t.availableToRedeem}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#F5BF55] text-[#202B38] flex items-center justify-center font-bold shrink-0 shadow-2xs">
                    <Gift className="w-6 h-6" aria-hidden="true" />
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-[#EDE4D8] text-xs flex justify-between items-center">
                  <div>
                    <span className="text-[#53616D] block font-bold">{lang === 'en' ? 'Pending scale verification:' : 'যাচাইাধীন পয়েন্ট:'}</span>
                    <span className="text-[11px] text-[#7A4D00]">{t.stillBeingChecked}</span>
                  </div>
                  <span className="font-mono font-bold text-[#25345C] text-sm">+{customerPendingPoints} pts</span>
                </div>
              </div>

              {/* Mobile sub-view switcher */}
              <div role="tablist" aria-label={lang === 'en' ? 'Rewards sections' : 'রিওয়ার্ডের বিভাগ'} className="lg:hidden flex items-center gap-1.5 overflow-x-auto text-xs font-bold pb-1">
                {(
                  [
                    { id: 'spending', labelEn: 'Eligible Rewards', labelBn: 'উপযুক্ত ভাউচার' },
                    { id: 'history', labelEn: 'Points History', labelBn: 'পয়েন্ট খতিয়ান' },
                    { id: 'rules', labelEn: 'How Points Work', labelBn: 'পয়েন্ট নিয়ম' },
                    { id: 'campaigns', labelEn: 'Campaigns', labelBn: 'ক্যাম্পেইন' }
                  ] as const
                ).map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    role="tab"
                    aria-selected={activeRewardsSubView === v.id}
                    onClick={() => setActiveRewardsSubView(v.id)}
                    className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                      activeRewardsSubView === v.id ? 'bg-[#25345C] text-white shadow-2xs' : 'bg-white border border-[#EDE4D8] text-[#53616D] hover:bg-[#FAF5EC]'
                    }`}
                  >
                    {lang === 'en' ? v.labelEn : v.labelBn}
                  </button>
                ))}
              </div>

              <div className={`p-5 bg-white rounded-3xl border border-[#EDE4D8] space-y-3.5 shadow-2xs text-xs ${activeRewardsSubView === 'rules' ? '' : 'hidden lg:block'}`}>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#12613F]" aria-hidden="true" />
                  <h3 className="font-bold text-[#202B38] text-sm">{t.howPointsWork}</h3>
                </div>
                <p className="text-[#53616D] leading-relaxed">
                  {lang === 'en'
                    ? 'Points are earned from the certified scale weight of clean, segregated recyclables. Unwashed or contaminated materials are rejected.'
                    : 'পরিষ্কার ও আলাদা করা বর্জ্যের সার্টিফাইড স্কেলের ওজন অনুযায়ী পয়েন্ট দেওয়া হয়। অপরিচ্ছন্ন বা মিশ্রিত বর্জ্য গ্রহণ করা হয় না।'}
                </p>
                {ratesList}
              </div>

              <div className={`bg-white rounded-3xl border border-[#EDE4D8] p-5 shadow-2xs space-y-3 text-xs ${activeRewardsSubView === 'history' ? '' : 'hidden lg:block'}`}>
                <h3 className="font-bold text-[#202B38] text-sm">{t.pointsLedgerTitle}</h3>
                {ledgerList}
              </div>
            </div>

            <div className="lg:col-span-7 space-y-5">
              <div className={`${activeRewardsSubView === 'campaigns' ? '' : 'hidden lg:block'} space-y-3`}>
                {activeCampaigns.length === 0 ? (
                  <div className="p-5 bg-white border border-[#EDE4D8] rounded-3xl text-xs text-[#53616D]">
                    {lang === 'en' ? 'No sponsor campaigns are running in your area right now.' : 'এই মুহূর্তে আপনার এলাকায় কোনো স্পনসর ক্যাম্পেইন চলছে না।'}
                  </div>
                ) : (
                  activeCampaigns.map((c) => (
                    <div key={c.id} className="p-5 bg-gradient-to-r from-[#FEF8EB] via-white to-[#FFF9F0] border-2 border-[#F5BF55] rounded-3xl space-y-1.5 shadow-2xs">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm text-[#202B38] flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#7A4D00] shrink-0" aria-hidden="true" />
                          <span>{c.title}</span>
                        </h3>
                        <span className="text-[10px] font-mono font-bold text-[#12613F] bg-[#C9F1DC] px-2 py-0.5 rounded shrink-0">{lang === 'en' ? 'Active' : 'চলমান'}</span>
                      </div>
                      <p className="text-xs text-[#53616D] leading-relaxed">
                        {lang === 'en'
                          ? `Sponsored by ${c.sponsorName}. Supports recovery of ${materialLabel(c.targetMaterial, 'en').toLowerCase()} until ${formatDateOnly(c.endDate, 'en')}.`
                          : `স্পনসর: ${c.sponsorName}। ${formatDateOnly(c.endDate, 'bn')} পর্যন্ত ${materialLabel(c.targetMaterial, 'bn')} পুনরুদ্ধারে সহায়তা।`}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className={`${activeRewardsSubView === 'spending' ? '' : 'hidden lg:block'} space-y-3`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#202B38]">{t.eligibleRewards}</h3>
                  <span className="text-xs text-[#53616D]">
                    {rewards.length} {lang === 'en' ? 'available vouchers' : 'উপলব্ধ ভাউচার'}
                  </span>
                </div>
                {rewardsCatalog}
              </div>

              {myRedemptions.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleTabSwitch('activity')}
                  className="w-full p-3.5 bg-white border border-[#EDE4D8] rounded-2xl flex items-center justify-between text-xs font-bold text-[#25345C] hover:bg-[#FAF5EC] cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-[#12613F]" aria-hidden="true" />
                    {lang === 'en' ? `My vouchers (${myRedemptions.length})` : `আমার ভাউচার (${myRedemptions.length})`}
                  </span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MY ACTIVITY                                                        */}
      {/* ========================================================================= */}
      {activeTab === 'activity' && (
        <div className="w-full max-w-xl lg:max-w-7xl mx-auto space-y-6 animate-fade-in pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div>
              <h2 className="text-xl font-bold text-[#202B38]">{t.collectionHistoryTitle}</h2>
              <p className="text-xs text-[#53616D]">{t.collectionHistorySub}</p>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold pb-1">
              {(
                [
                  { id: 'all', label: t.filterAll },
                  { id: 'upcoming', label: t.filterUpcoming },
                  { id: 'completed', label: t.filterCompleted },
                  { id: 'attention', label: t.filterAttention }
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={activityFilter === f.id}
                  onClick={() => setActivityFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    activityFilter === f.id ? 'bg-[#25345C] text-white shadow-2xs' : 'bg-white border border-[#EDE4D8] text-[#53616D] hover:bg-[#FAF5EC]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-3">
              {filteredBookings.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-[#EDE4D8] text-xs text-[#53616D] space-y-3">
                  <p>
                    {myBookings.length === 0
                      ? lang === 'en'
                        ? 'No collections yet. Book your first pickup to start earning.'
                        : 'এখনো কোনো সংগ্রহ নেই। পয়েন্ট জমাতে প্রথম পিকআপ বুক করুন।'
                      : lang === 'en'
                      ? 'No collections found in this filter.'
                      : 'এই ফিল্টারে কোনো সংগ্রহ পাওয়া যায়নি।'}
                  </p>
                  {myBookings.length === 0 && (
                    <button type="button" onClick={() => setIsBookingModalOpen(true)} className="px-4 py-2 bg-[#25345C] text-white rounded-xl font-bold cursor-pointer">
                      {lang === 'en' ? 'Book a pickup' : 'পিকআপ বুক করুন'}
                    </button>
                  )}
                </div>
              ) : (
                filteredBookings.map((b) => (
                  <div key={b.id} className="bg-white rounded-2xl border border-[#EDE4D8] hover:border-[#25345C] transition-all shadow-2xs">
                    <button type="button" onClick={() => handleOpenStatus(b)} className="w-full text-left p-4 space-y-2.5 cursor-pointer">
                      <span className="flex items-start justify-between gap-2">
                        <span className="block">
                          <span className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-xs text-[#25345C]">#{b.id}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${bookingStatusClass(b.status)}`}>{bookingStatusLabel(b.status, lang)}</span>
                          </span>
                          <span className="text-sm font-bold text-[#202B38] mt-1 block">
                            {formatBookingDate(b.scheduledDate, lang)} ({b.scheduledTimeWindow})
                          </span>
                        </span>

                        <span className="text-right block shrink-0">
                          <span className="text-sm font-bold text-[#202B38] font-mono block">
                            {b.confirmedWeightKg ? `${b.confirmedWeightKg} kg` : b.status === 'CANCELLED' ? '—' : lang === 'en' ? 'Pending scale' : 'যাচাইাধীন'}
                          </span>
                          <EvidenceBadge level={b.evidenceLevel || 'E0'} interactive={false} />
                        </span>
                      </span>

                      <span className="flex items-center justify-between text-xs text-[#53616D] pt-2 border-t border-[#FAF5EC]">
                        <span className="truncate max-w-[220px]">{b.materials.map((m) => materialLabel(m.category, lang)).join(', ')}</span>
                        <span className="font-bold text-[#25345C] flex items-center gap-1">
                          <span>{t.seeDetails}</span>
                          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </span>
                      </span>
                    </button>
                    {isCancellable(b) && (
                      <div className="px-4 pb-3">
                        <button type="button" onClick={() => setCancelTarget(b)} className="text-xs font-bold text-rose-700 hover:underline flex items-center gap-1 cursor-pointer">
                          <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                          {lang === 'en' ? 'Cancel pickup' : 'পিকআপ বাতিল করুন'}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="space-y-5 lg:col-span-5">
              {/* My vouchers */}
              <section aria-labelledby="my-vouchers" className="p-5 bg-white rounded-3xl border border-[#EDE4D8] space-y-3 shadow-2xs text-xs">
                <h3 id="my-vouchers" className="font-bold text-sm text-[#202B38] flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-[#12613F]" aria-hidden="true" />
                  {lang === 'en' ? 'My vouchers' : 'আমার ভাউচার'}
                </h3>
                {myRedemptions.length === 0 ? (
                  <p className="text-[#53616D]">
                    {lang === 'en' ? 'Vouchers you redeem will be kept here with their codes.' : 'আপনার রিডিম করা ভাউচার ও কোড এখানে সংরক্ষিত থাকবে।'}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {[...myRedemptions]
                      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
                      .map((r) => {
                        const until = validUntil(r.rewardId, r.timestamp);
                        return (
                          <li key={r.id} className="p-3 bg-[#FAF9F5] rounded-xl border border-[#EDE4D8] space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-[#202B38]">{r.rewardTitle}</span>
                              <span className="font-mono text-[#53616D] shrink-0">-{r.pointsDeducted} pts</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <code className="font-mono font-bold text-[#25345C] bg-white border border-[#EDE4D8] rounded-lg px-2 py-1 break-all">{r.couponCode}</code>
                              <button
                                type="button"
                                onClick={() => copyCode(r.couponCode)}
                                aria-label={lang === 'en' ? `Copy code ${r.couponCode}` : `কোড ${r.couponCode} কপি করুন`}
                                className="p-2 rounded-lg border border-[#EDE4D8] bg-white hover:bg-[#FAF5EC] cursor-pointer shrink-0"
                              >
                                <Copy className="w-3.5 h-3.5 text-[#25345C]" aria-hidden="true" />
                              </button>
                            </div>
                            <div className="text-[11px] text-[#53616D]">
                              {redemptionStatusLabel(r, lang)} · {formatDateOnly(r.timestamp, lang)}
                              {until ? (lang === 'en' ? ` · valid until ${until}` : ` · ${until} পর্যন্ত বৈধ`) : ''}
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                )}
              </section>

              <SupportCasesList />

              <div className="p-5 bg-white rounded-3xl border border-[#EDE4D8] space-y-3.5 shadow-2xs text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#12613F]" aria-hidden="true" />
                  <h3 className="font-bold text-sm text-[#202B38]">{lang === 'en' ? 'Chain-of-Custody Verification' : 'কাস্টডি চেইন ও অডিট ট্রেইল'}</h3>
                </div>

                <p className="text-[#53616D] leading-relaxed">
                  {lang === 'en'
                    ? 'Every collection is weighed twice: first on the collector’s doorstep scale, then on the hub platform scale before it is batched. Open a pickup to see its recorded handovers.'
                    : 'প্রতিটি সংগ্রহ দুইবার ওজন করা হয়: প্রথমে সংগ্রাহকের দরজার স্কেলে, তারপর ব্যাচ করার আগে হাবের প্ল্যাটফর্ম স্কেলে। কোনো পিকআপ খুলে তার হস্তান্তরের রেকর্ড দেখুন।'}
                </p>

                <ol className="p-3 bg-[#FAF9F5] rounded-2xl border border-[#EDE4D8] space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#12613F]" aria-hidden="true" />
                    <span className="text-[#202B38] font-semibold">{lang === 'en' ? '1. Doorstep custody: field collector' : '১. ডোরস্টেপ কাস্টডি: মাঠ সংগ্রাহক'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#25345C]" aria-hidden="true" />
                    <span className="text-[#202B38] font-semibold">{lang === 'en' ? '2. Hub aggregation and scale check' : '২. হাবে একত্রীকরণ ও স্কেল যাচাই'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#B46A14]" aria-hidden="true" />
                    <span className="text-[#202B38] font-semibold">{lang === 'en' ? '3. Recycler mill processing' : '৩. রিসাইক্লার মিলে প্রক্রিয়াকরণ'}</span>
                  </li>
                </ol>
              </div>

              <div className="p-5 bg-white rounded-3xl border border-[#EDE4D8] space-y-3 shadow-2xs">
                <h3 className="font-bold text-sm text-[#202B38]">{lang === 'en' ? 'Environmental Recovery Totals' : 'পুনরুদ্ধার ও পরিবেশগত প্রভাব'}</h3>
                <EnvironmentalImpactWidget defaultExpanded={true} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MOBILE 3-TAB NAVIGATION DOCK                                              */}
      {/* ========================================================================= */}
      <nav
        aria-label={lang === 'en' ? 'Main navigation' : 'প্রধান নেভিগেশন'}
        className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#EDE4D8] px-6 py-2.5 z-30 shadow-lg flex items-center justify-around"
      >
        {(
          [
            { id: 'home', label: t.home, Icon: Home },
            { id: 'rewards', label: t.rewards, Icon: Gift },
            { id: 'activity', label: t.myActivity, Icon: Clock }
          ] as const
        ).map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleTabSwitch(id)}
            aria-current={activeTab === id ? 'page' : undefined}
            className={`flex flex-col items-center gap-1 text-xs transition-colors cursor-pointer min-w-[64px] min-h-[44px] ${activeTab === id ? 'text-[#12613F] font-bold' : 'text-[#53616D]'}`}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
            <span className="text-[11px]">{label}</span>
          </button>
        ))}
      </nav>

      {/* ========================================================================= */}
      {/* ALL MODAL TOUCHPOINTS                                                     */}
      {/* ========================================================================= */}
      <NewBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onOpenRecurring={() => setIsRecurringModalOpen(true)}
        initialSelectedCats={homeSelectedCats}
      />

      <CollectionStatusModal
        booking={statusBooking}
        isOpen={Boolean(statusBooking)}
        onClose={() => setStatusBookingId(null)}
        onGetHelp={(bId) => handleGetHelp(bId)}
      />

      <CancelPickupDialog booking={cancelTarget} onClose={() => setCancelTarget(null)} />

      <RecurringServiceModal isOpen={isRecurringModalOpen} onClose={() => setIsRecurringModalOpen(false)} />

      <DisputeModal isOpen={isDisputeModalOpen} bookingId={selectedBookingForHelp} onClose={() => setIsDisputeModalOpen(false)} />

      <MaterialGuideModal isOpen={isGuideModalOpen} onClose={() => setIsGuideModalOpen(false)} />

      <Suspense fallback={null}>
        {isNotificationsOpen && (
          <NotificationCenterModal
            isOpen
            onClose={() => setIsNotificationsOpen(false)}
            onOpenPreparation={(n) => setPrepTarget({ notification: n })}
          />
        )}
        {prepTarget && (
          <PreparationGuidanceModal
            isOpen
            booking={prepTarget.booking}
            notification={prepTarget.notification}
            onClose={() => setPrepTarget(null)}
          />
        )}
      </Suspense>

      {/* Redeem confirmation / result */}
      <Modal
        open={redeem !== null}
        onClose={() => setRedeem(null)}
        size="sm"
        title={
          redeem?.phase === 'done'
            ? lang === 'en'
              ? 'Voucher redeemed'
              : 'ভাউচার রিডিম হয়েছে'
            : redeem?.phase === 'failed'
            ? lang === 'en'
              ? 'Could not redeem'
              : 'রিডিম করা যায়নি'
            : lang === 'en'
            ? 'Redeem this voucher?'
            : 'ভাউচারটি রিডিম করবেন?'
        }
        closeLabel={lang === 'en' ? 'Close' : 'বন্ধ করুন'}
        footer={
          redeem?.phase === 'confirm' ? (
            <div className="flex flex-col-reverse sm:flex-row gap-2">
              <button type="button" onClick={() => setRedeem(null)} className="flex-1 py-2.5 rounded-xl border border-[#EDE4D8] bg-white text-[#25345C] font-bold text-xs hover:bg-[#FAF5EC] cursor-pointer">
                {lang === 'en' ? 'Not now' : 'এখন নয়'}
              </button>
              <button type="button" onClick={confirmRedeem} className="flex-1 py-2.5 rounded-xl bg-[#25345C] hover:bg-[#1B2644] text-white font-bold text-xs cursor-pointer">
                {lang === 'en' ? `Redeem for ${redeem.reward.pointsCost} pts` : `${redeem.reward.pointsCost} পয়েন্টে রিডিম করুন`}
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              {redeem?.phase === 'done' && (
                <button
                  type="button"
                  onClick={() => {
                    setRedeem(null);
                    handleTabSwitch('activity');
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-[#EDE4D8] bg-white text-[#25345C] font-bold text-xs hover:bg-[#FAF5EC] cursor-pointer"
                >
                  {lang === 'en' ? 'See my vouchers' : 'আমার ভাউচার দেখুন'}
                </button>
              )}
              <button type="button" onClick={() => setRedeem(null)} className="flex-1 py-2.5 rounded-xl bg-[#25345C] hover:bg-[#1B2644] text-white font-bold text-xs cursor-pointer">
                {lang === 'en' ? 'Done' : 'সম্পন্ন'}
              </button>
            </div>
          )
        }
      >
        {redeem && (
          <div className="space-y-4 text-xs text-[#202B38]">
            <div className="p-3.5 bg-[#FAF9F5] rounded-2xl border border-[#EDE4D8] space-y-1">
              <strong className="block text-sm">{lang === 'en' ? redeem.reward.title : redeem.reward.titleBn}</strong>
              <span className="text-[#53616D] block">{lang === 'en' ? redeem.reward.description : redeem.reward.descriptionBn || redeem.reward.description}</span>
            </div>

            {redeem.phase === 'confirm' && (
              <dl className="space-y-1.5">
                <div className="flex justify-between">
                  <dt className="text-[#53616D]">{lang === 'en' ? 'Cost' : 'মূল্য'}</dt>
                  <dd className="font-mono font-bold">{redeem.reward.pointsCost} pts</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#53616D]">{lang === 'en' ? 'Your balance now' : 'বর্তমান ব্যালেন্স'}</dt>
                  <dd className="font-mono font-bold">{customerAvailablePoints} pts</dd>
                </div>
                <div className="flex justify-between border-t border-[#EDE4D8] pt-1.5">
                  <dt className="text-[#53616D]">{lang === 'en' ? 'Balance after' : 'রিডিমের পর ব্যালেন্স'}</dt>
                  <dd className="font-mono font-bold text-[#12613F]">{customerAvailablePoints - redeem.reward.pointsCost} pts</dd>
                </div>
              </dl>
            )}

            {redeem.phase === 'done' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#12613F] font-bold">
                  <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                  <span>{lang === 'en' ? 'Your voucher is ready.' : 'আপনার ভাউচার প্রস্তুত।'}</span>
                </div>
                <div className="p-4 bg-[#E8FAF1] border border-[#C9F1DC] rounded-2xl text-center space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#53616D] block">{lang === 'en' ? 'Coupon code' : 'কুপন কোড'}</span>
                  <code className="block text-lg font-mono font-black text-[#12613F] tracking-wider break-all select-all">{redeem.code}</code>
                  <button
                    type="button"
                    onClick={() => copyCode(redeem.code)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#C9F1DC] rounded-xl font-bold text-[#25345C] hover:bg-[#FAF5EC] cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{copied ? (lang === 'en' ? 'Copied' : 'কপি হয়েছে') : lang === 'en' ? 'Copy code' : 'কোড কপি করুন'}</span>
                  </button>
                </div>
                <p className="text-[#53616D]" role="status">
                  {lang === 'en'
                    ? `${redeem.reward.pointsCost} points were deducted. The code is valid for ${redeem.reward.validityDays} days and stays in My vouchers.`
                    : `${redeem.reward.pointsCost} পয়েন্ট কাটা হয়েছে। কোডটি ${redeem.reward.validityDays} দিন বৈধ এবং “আমার ভাউচার”-এ থাকবে।`}
                </p>
              </div>
            )}

            {redeem.phase === 'failed' && (
              <div role="alert" className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-900">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="leading-relaxed">{redeem.message}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Drop-off points discovery list */}
      <Modal
        open={isDropOffListOpen}
        onClose={() => setIsDropOffListOpen(false)}
        title={t.findADropOffPoint}
        closeLabel={lang === 'en' ? 'Close' : 'বন্ধ করুন'}
      >
        <div className="space-y-3 text-xs">
          {dropOffPoints.map((point) => (
            <div key={point.id} className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EDE4D8] space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h4 className="font-bold text-xs text-[#202B38]">{lang === 'en' ? point.name : point.nameBn}</h4>
                  <p className="text-[11px] text-[#53616D]">{point.address}</p>
                </div>
                <span className="text-[10px] font-mono bg-[#C9F1DC] text-[#12613F] px-2 py-0.5 rounded font-bold shrink-0">{point.operatingHours}</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {point.acceptedMaterials.map((m) => (
                  <span key={m} className="text-[10px] bg-white border border-[#EDE4D8] px-2 py-0.5 rounded font-medium">
                    {materialLabel(m, lang)}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setSelectedDropOffPoint(point)}
                className="w-full py-2 bg-white hover:bg-[#EDE4D8] border border-[#EDE4D8] text-[#25345C] rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                {lang === 'en' ? 'View Guidelines' : 'নির্দেশনা দেখুন'}
              </button>
            </div>
          ))}
        </div>
      </Modal>

      <DropOffDetailModal point={selectedDropOffPoint} isOpen={Boolean(selectedDropOffPoint)} onClose={() => setSelectedDropOffPoint(null)} />
    </div>
  );
};
