import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Gift,
  HelpCircle,
  Home,
  MapPin,
  Plus,
  Recycle,
  Ticket,
  Volume2,
  VolumeX,
  XCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppNotification, Booking, DropOffPoint, RewardItem } from '../../types';
import { RATES, pointsToTaka } from '../../domain/rules';
import { Confetti, EmptyState, RickshawBand } from '../../design/Celebrate';
import { Term } from '../../design/Glossary';
import { MaterialGlyph } from '../../design/materials';
import { Modal } from '../common/Modal';
import { EnvironmentalImpactWidget } from '../common/EnvironmentalImpactWidget';
import { ReminderBanner } from '../notifications/ReminderBanner';
import { NewBookingModal, BookingPreset } from './NewBookingModal';
import { CollectionStatusModal } from './CollectionStatusModal';
import { RecurringServiceModal } from './RecurringServiceModal';
import { MaterialGuideModal } from './MaterialGuideModal';
import { DisputeModal } from './DisputeModal';
import { DropOffDetailModal } from './DropOffDetailModal';
import { CancelPickupDialog } from './CancelPickupDialog';
import { OrganisationDashboardView } from './OrganisationDashboardView';
import { SupportCasesList } from './SupportCasesList';
import { HomeHero } from './HomeHero';
import { PointsJar, shortPartner } from './PointsJar';
import { NeighbourhoodCard } from './NeighbourhoodCard';
import { LearnEntry } from './LearnEntry';
import { MaterialChips, MiniJourney } from './BookingBits';
import { useHeroModel } from './useHeroModel';
import { canSpeak, speak, stopSpeech } from './speech';
import { useTranslation } from '../../utils/translations';
import { formatBookingDate, daysFromToday, formatDateOnly } from './dates';
import { bookingStatusClass, bookingStatusLabel, ledgerDelta, ledgerStatusLabel, materialLabel, redemptionStatusLabel } from './labels';
import { isCancellable, useCustomerData } from './useCustomerData';
import { CARD, DANGER_GHOST, GHOST, PRIMARY, SECONDARY, FOCUS, nf, taka } from './ui';

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

export const CustomerApp: React.FC<CustomerAppProps> = ({ initialTab = 'home', onNavigateTab }) => {
  const { lang, rewards, campaigns, serviceZones, customerAvailablePoints, customerPendingPoints, savedLocations, selectedLocationId, dropOffPoints, redeemReward, showToast } = useApp();
  const { customer, myBookings, nextBooking, attentionBooking, myLedger, myRedemptions, myNotifications } = useCustomerData();
  const t = useTranslation(lang);
  const en = lang === 'en';
  const isOrg = customer.customerType === 'apartment' || customer.customerType === 'business';
  const hero = useHeroModel();

  const normTab = (x?: string) => (x === 'activity' ? 'activity' : x === 'rewards' ? 'rewards' : 'home');
  const [activeTab, setActiveTab] = useState<'home' | 'rewards' | 'activity'>(normTab(initialTab));
  useEffect(() => {
    if (initialTab) setActiveTab(normTab(initialTab));
  }, [initialTab]);

  const handleTabSwitch = (tab: 'home' | 'rewards' | 'activity') => {
    setActiveTab(tab);
    onNavigateTab?.(tab === 'home' ? 'overview' : tab);
  };

  // Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingPreset, setBookingPreset] = useState<BookingPreset | undefined>(undefined);
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
  const [activityFilter, setActivityFilter] = useState<'all' | 'upcoming' | 'completed' | 'attention'>('all');

  const currentLocation = savedLocations.find((l) => l.id === selectedLocationId) || savedLocations[0];

  // Listen: reads the home card in the current language.
  const [isSpeaking, setIsSpeaking] = useState(false);
  useEffect(() => () => stopSpeech(), []);
  const toggleListen = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speak(hero.speech, lang, () => setIsSpeaking(false));
    }
  };

  const openBooking = (preset?: BookingPreset) => {
    setBookingPreset(preset);
    setIsBookingModalOpen(true);
  };
  const lastBooking = [...myBookings].filter((b) => b.materials.length > 0).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const sameAsLast = lastBooking
    ? () => openBooking({ materials: lastBooking.materials.map((m) => m.category), address: lastBooking.address, accessInstructions: lastBooking.accessInstructions })
    : undefined;

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
          ? en
            ? res.message
            : `পর্যাপ্ত পয়েন্ট নেই (ব্যালেন্স ${customerAvailablePoints}, প্রয়োজন ${reward.pointsCost})। অপেক্ষমাণ পয়েন্ট রিডিম করা যায় না।`
          : reward.stockAvailable <= 0
          ? en
            ? res.message
            : 'এই ভাউচারটি এখন স্টকে নেই।'
          : res.message
        : en
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
      showToast(en ? 'Could not copy automatically. Please select the code and copy it.' : 'স্বয়ংক্রিয়ভাবে কপি করা যায়নি। কোডটি সিলেক্ট করে কপি করুন।');
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

  const activeCampaigns = campaigns.filter((c) => c.status === 'ACTIVE' && (!currentLocation || c.eligibleZones.includes(currentLocation.zoneId)));
  const worth = pointsToTaka(customerAvailablePoints, rewards);
  const pendingWorth = pointsToTaka(customerPendingPoints, rewards);
  const bestAffordable = [...rewards].filter((r) => r.stockAvailable > 0 && r.pointsCost <= customerAvailablePoints).sort((a, b) => b.cashEquivalentBdt - a.cashEquivalentBdt)[0];

  const filteredBookings = myBookings.filter((b) => {
    if (activityFilter === 'all') return true;
    if (activityFilter === 'upcoming') return b.status === 'REQUESTED' || b.status === 'CONFIRMED' || b.status === 'COLLECTOR_ASSIGNED' || b.status === 'EN_ROUTE';
    if (activityFilter === 'completed') return ['COLLECTED', 'QUANTITY_CONFIRMED', 'ENTERED_RECOVERY_CHAIN', 'PROCESSED'].includes(b.status);
    return b.status === 'MISSED' || b.status === 'DISPUTED' || b.status === 'CANCELLED';
  });
  const sortedLedger = [...myLedger].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const reminderDue =
    nextBooking !== undefined &&
    [0, 1].includes(daysFromToday(nextBooking.scheduledDate) ?? -1) &&
    (nextBooking.status === 'REQUESTED' || nextBooking.status === 'CONFIRMED' || nextBooking.status === 'COLLECTOR_ASSIGNED');

  const page = 'w-full max-w-xl lg:max-w-5xl mx-auto animate-fade-in pt-2 text-[#124B3A]';
  const h2 = 'font-display text-xl font-extrabold';

  const walletCard = (
    <section className={`${CARD} p-5`} aria-labelledby="wallet-title">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 id="wallet-title" className="text-xs font-bold tracking-wide text-[#124B3A]/60">
            {en ? 'Your points' : 'আপনার পয়েন্ট'}
          </h2>
          <p className="font-display text-3xl font-extrabold leading-tight">
            {nf(customerAvailablePoints, lang)} <span className="text-base font-bold">{en ? 'points' : 'পয়েন্ট'}</span>
          </p>
          {worth !== null && <p className="text-sm font-bold text-[#124B3A]/70">≈ {taka(worth, lang)} {en ? 'in vouchers' : 'ভাউচারে'}</p>}
        </div>
        <button type="button" onClick={() => handleTabSwitch('rewards')} className={GHOST}>
          {en ? 'See rewards' : 'রিওয়ার্ড দেখুন'}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {customerPendingPoints > 0 && (
        <p className="mt-2 rounded-xl bg-[#FFF4DC] px-3 py-2 text-xs font-semibold text-[#7A4D00]">
          +{nf(customerPendingPoints, lang)} <Term id="pendingPoints" lang={lang}>{en ? 'pending points' : 'অপেক্ষমাণ পয়েন্ট'}</Term>
          {en ? ' on the way once the ' : ' আসছে, '}
          <Term id="hubScale" lang={lang}>{en ? 'hub scale' : 'হাবের স্কেল'}</Term>
          {en ? ' confirms' : ' নিশ্চিত করলেই'}
        </p>
      )}
    </section>
  );

  const quietLinks = (
    <div className="flex flex-wrap items-center justify-center gap-x-4 border-t border-[#124B3A]/10 pt-3">
      {nextBooking && (
        <button type="button" onClick={() => openBooking()} className={GHOST}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          {en ? 'Book another pickup' : 'আরেকটি পিকআপ বুক করুন'}
        </button>
      )}
      <button type="button" onClick={() => setIsRecurringModalOpen(true)} className={GHOST}>
        <Recycle className="h-4 w-4" aria-hidden="true" />
        {t.arrangeRegularCollection}
      </button>
      <button type="button" onClick={() => setIsDropOffListOpen(true)} className={GHOST}>
        <MapPin className="h-4 w-4" aria-hidden="true" />
        {t.findADropOffPoint}
      </button>
      <button type="button" onClick={() => setIsGuideModalOpen(true)} className={GHOST}>
        {en ? 'Sorting rules' : 'বাছাইয়ের নিয়ম'}
      </button>
    </div>
  );

  return (
    <div className="w-full pb-24 md:pb-6">
      {/* ================= HOME (organisations) ================= */}
      {activeTab === 'home' && isOrg && (
        <div className="w-full max-w-xl lg:max-w-7xl mx-auto space-y-5 animate-fade-in pt-2">
          {nextBooking && reminderDue && <ReminderBanner booking={nextBooking} onOpenPreparation={openPrep} onOpenNotifications={() => setIsNotificationsOpen(true)} />}
          <OrganisationDashboardView
            onBookPickup={() => openBooking()}
            onOpenStatus={handleOpenStatus}
            onCancel={(b) => setCancelTarget(b)}
            onRequestRecurring={() => setIsRecurringModalOpen(true)}
            onGetHelp={handleGetHelp}
          />
        </div>
      )}

      {/* ================= HOME (households) ================= */}
      {activeTab === 'home' && !isOrg && (
        <div className={`${page} space-y-4`}>
          <div className="flex items-center justify-between gap-2 text-sm">
            <div className="flex min-w-0 items-center gap-1.5 font-bold">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{currentLocation?.label}</span>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${currentLocation?.status === 'available' ? 'bg-[#EAF5C9] text-[#124B3A]' : 'bg-amber-100 text-amber-800'}`}>
                {currentLocation?.status === 'available' ? t.activeLane : t.waitlist}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {canSpeak() && (
                <button
                  type="button"
                  onClick={toggleListen}
                  aria-pressed={isSpeaking}
                  className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-bold ${FOCUS} cursor-pointer ${isSpeaking ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-[#124B3A]/15 bg-white'}`}
                  aria-label={en ? 'Listen to this card' : 'কার্ডটি শুনুন'}
                >
                  {isSpeaking ? <VolumeX className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
                  {isSpeaking ? t.audioSpeaking : en ? 'Listen' : 'শুনুন'}
                </button>
              )}
              <button type="button" onClick={() => handleGetHelp()} className={GHOST}>
                <HelpCircle className="h-4 w-4" aria-hidden="true" />
                {t.help}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12 lg:gap-6">
            <div className="space-y-4 lg:col-span-7">
              <HomeHero
                model={hero}
                onBook={() => openBooking()}
                onSameAsLast={hero.hasHistory ? sameAsLast : undefined}
                onTrack={handleOpenStatus}
                onChecklist={openPrep}
                onCancel={(b) => setCancelTarget(b)}
                onHelp={handleGetHelp}
                onSeeRewards={() => handleTabSwitch('rewards')}
              />
              <LearnEntry />
              {quietLinks}
            </div>
            <div className="space-y-4 lg:col-span-5">
              {walletCard}
              <NeighbourhoodCard zoneId={currentLocation?.zoneId} />
              <EnvironmentalImpactWidget />
              {activeCampaigns[0] && (
                <p className="rounded-2xl bg-[#FFF4DC] px-4 py-3 text-xs font-semibold text-[#7A4D00]">
                  {en ? `${activeCampaigns[0].title}, sponsored by ${activeCampaigns[0].sponsorName}.` : `${activeCampaigns[0].title}, স্পনসর: ${activeCampaigns[0].sponsorName}।`}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= REWARDS ================= */}
      {activeTab === 'rewards' && (
        <div className={`${page} space-y-4`}>
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12 lg:gap-6">
            <div className="space-y-4 lg:col-span-5">
              <section className={`${CARD} overflow-hidden`} aria-labelledby="jar-title">
                <RickshawBand height={12} />
                <div className="space-y-4 p-5">
                  <h1 id="jar-title" className="font-display text-2xl font-extrabold">
                    {en ? 'Your reward jar' : 'আপনার রিওয়ার্ড জার'}
                  </h1>
                  <PointsJar available={customerAvailablePoints} pending={customerPendingPoints} rewards={rewards} />
                  {customerPendingPoints > 0 && (
                    <p className="rounded-xl bg-[#FFF4DC] px-3 py-2 text-xs font-semibold text-[#7A4D00]">
                      +{nf(customerPendingPoints, lang)}
                      {pendingWorth ? ` (≈ ${taka(pendingWorth, lang)})` : ''} <Term id="pendingPoints" lang={lang}>{en ? 'pending points' : 'অপেক্ষমাণ পয়েন্ট'}</Term>
                      {en ? ' join the jar once the ' : ' জারে যোগ হবে '}
                      <Term id="hubScale" lang={lang}>{en ? 'hub scale' : 'হাবের স্কেল'}</Term>
                      {en ? ' confirms the weight.' : ' ওজন নিশ্চিত করলে।'}
                    </p>
                  )}
                  {bestAffordable ? (
                    <button type="button" onClick={() => startRedeem(bestAffordable)} className={PRIMARY}>
                      {en ? `Redeem ${taka(bestAffordable.cashEquivalentBdt, lang)} ${shortPartner(bestAffordable)}` : `${taka(bestAffordable.cashEquivalentBdt, lang)} ${shortPartner(bestAffordable)} রিডিম করুন`}
                    </button>
                  ) : (
                    <button type="button" onClick={() => openBooking()} className={PRIMARY}>
                      {en ? 'Book a pickup to fill your jar' : 'জার ভরতে পিকআপ বুক করুন'}
                    </button>
                  )}
                </div>
              </section>

              <details className={`${CARD} group p-5`}>
                <summary className={`flex cursor-pointer list-none items-center justify-between text-sm font-extrabold ${FOCUS}`}>
                  {t.howPointsWork}
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" aria-hidden="true" />
                </summary>
                <div className="mt-3 space-y-2 text-sm">
                  <p className="font-medium text-[#124B3A]/75">
                    {en ? 'You earn points on the weight confirmed at the ' : 'পরিষ্কার ও আলাদা করা জিনিসের, '}
                    <Term id="hubScale" lang={lang}>{en ? 'hub scale' : 'হাবের স্কেলে'}</Term>
                    {en ? ', for clean, separated recyclables.' : ' নিশ্চিত ওজনে পয়েন্ট পান।'}
                  </p>
                  <p className="flex justify-between rounded-xl bg-[#FAF9F5] p-2.5 font-bold">
                    <span>{en ? 'Pickup at your door' : 'দরজা থেকে পিকআপ'}</span>
                    <span>{RATES.doorstepPointsPerKg} {en ? 'pts / kg' : 'পয়েন্ট / কেজি'}</span>
                  </p>
                  <p className="flex justify-between rounded-xl bg-[#FAF9F5] p-2.5 font-bold">
                    <span>{en ? 'Walk-in drop-off' : 'ড্রপ-অফ পয়েন্টে জমা'}</span>
                    <span>{RATES.dropOffPointsPerKg} {en ? 'pts / kg' : 'পয়েন্ট / কেজি'}</span>
                  </p>
                </div>
              </details>

              <details className={`${CARD} group p-5`}>
                <summary className={`flex cursor-pointer list-none items-center justify-between text-sm font-extrabold ${FOCUS}`}>
                  {t.pointsLedgerTitle}
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" aria-hidden="true" />
                </summary>
                <div className="mt-3 space-y-2">
                  {sortedLedger.length === 0 ? (
                    <p className="text-sm text-[#124B3A]/65">{en ? 'No points yet. Your first pickup will appear here.' : 'এখনো কোনো পয়েন্ট নেই। প্রথম পিকআপের পর এখানে দেখা যাবে।'}</p>
                  ) : (
                    sortedLedger.map((entry) => {
                      const delta = ledgerDelta(entry);
                      const linked = entry.linkedBookingId ? myBookings.find((b) => b.id === entry.linkedBookingId) : undefined;
                      const inner = (
                        <>
                          <span className="min-w-0">
                            <span className="block text-sm font-bold">{entry.description}</span>
                            <span className="text-xs text-[#124B3A]/60">{formatDateOnly(entry.timestamp, lang)} · {ledgerStatusLabel(entry, lang)}</span>
                          </span>
                          <span className={`shrink-0 text-sm font-extrabold tabular-nums ${entry.type === 'PENDING_HOLD' ? 'text-[#7A4D00]' : ''}`}>{delta > 0 ? `+${delta}` : delta}</span>
                        </>
                      );
                      return linked ? (
                        <button type="button" key={entry.id} onClick={() => handleOpenStatus(linked)} className={`flex w-full items-center justify-between gap-3 rounded-xl bg-[#FAF9F5] p-3 text-left cursor-pointer ${FOCUS}`}>
                          {inner}
                        </button>
                      ) : (
                        <div key={entry.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#FAF9F5] p-3">{inner}</div>
                      );
                    })
                  )}
                </div>
              </details>
            </div>

            <div className="space-y-4 lg:col-span-7">
              <div className="flex items-baseline justify-between">
                <h2 className={h2}>{t.eligibleRewards}</h2>
                <span className="text-xs font-semibold text-[#124B3A]/60">{rewards.length} {en ? 'vouchers' : 'ভাউচার'}</span>
              </div>
              <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {rewards.map((item) => {
                  const outOfStock = item.stockAvailable <= 0;
                  const canAfford = customerAvailablePoints >= item.pointsCost;
                  const pct = Math.min(100, Math.round((customerAvailablePoints / item.pointsCost) * 100));
                  return (
                    <li key={item.id} className={`${CARD} flex flex-col justify-between gap-3 p-4`}>
                      <div className="space-y-1.5">
                        <p className="font-display text-2xl font-extrabold leading-none">{taka(item.cashEquivalentBdt, lang)}</p>
                        <h3 className="text-sm font-bold leading-snug">{en ? item.title : item.titleBn}</h3>
                        <p className="text-xs font-medium leading-relaxed text-[#124B3A]/65">{en ? item.description : item.descriptionBn || item.description}</p>
                        <p className="text-[11px] font-medium text-[#124B3A]/50">
                          {en ? `Valid ${item.validityDays} days · ${item.funder}` : `${item.validityDays} দিন বৈধ · ${item.funder}`}
                        </p>
                      </div>
                      <div>
                        <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
                          <span>{nf(item.pointsCost, lang)} {en ? 'points' : 'পয়েন্ট'}</span>
                          <span className="text-[#124B3A]/60">{canAfford ? (en ? 'Ready' : 'প্রস্তুত') : `${pct}%`}</span>
                        </div>
                        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[#124B3A]/10" aria-hidden="true">
                          <div className="h-full rounded-full bg-[#124B3A]" style={{ width: `${pct}%` }} />
                        </div>
                        <button type="button" onClick={() => startRedeem(item)} disabled={!canAfford || outOfStock} className={`${SECONDARY} w-full`}>
                          {outOfStock ? (en ? 'Out of stock' : 'স্টক শেষ') : canAfford ? t.redeemButton : `${nf(item.pointsCost - customerAvailablePoints, lang)} ${t.morePointsNeeded}`}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {activeCampaigns.map((c) => (
                <div key={c.id} className="rounded-2xl bg-[#FFF4DC] p-4 text-sm">
                  <p className="font-bold">{c.title}</p>
                  <p className="mt-0.5 text-xs font-medium text-[#7A4D00]">
                    {en
                      ? `Sponsored by ${c.sponsorName}. Supports ${materialLabel(c.targetMaterial, 'en').toLowerCase()} until ${formatDateOnly(c.endDate, 'en')}.`
                      : `স্পনসর: ${c.sponsorName}। ${formatDateOnly(c.endDate, 'bn')} পর্যন্ত ${materialLabel(c.targetMaterial, 'bn')} সংগ্রহে সহায়তা।`}
                  </p>
                </div>
              ))}

              {myRedemptions.length > 0 && (
                <button type="button" onClick={() => handleTabSwitch('activity')} className={`${GHOST} w-full justify-between rounded-2xl bg-white px-4 ring-1 ring-[#124B3A]/10`}>
                  <span className="flex items-center gap-2"><Ticket className="h-4 w-4" aria-hidden="true" />{en ? `My vouchers (${myRedemptions.length})` : `আমার ভাউচার (${myRedemptions.length})`}</span>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= ACTIVITY ================= */}
      {activeTab === 'activity' && (
        <div className={`${page} space-y-4`}>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-display text-2xl font-extrabold">{t.collectionHistoryTitle}</h1>
              <p className="text-sm font-medium text-[#124B3A]/65">{en ? 'Follow each bag from your door to the recycler.' : 'প্রতিটি ব্যাগ আপনার দরজা থেকে রিসাইক্লার পর্যন্ত অনুসরণ করুন।'}</p>
            </div>
            <button type="button" onClick={() => openBooking()} className={`${PRIMARY} sm:!w-auto`}>
              <Plus className="h-5 w-5" aria-hidden="true" />
              {en ? 'Book a pickup' : 'পিকআপ বুক করুন'}
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-sm font-bold" role="group" aria-label={en ? 'Filter pickups' : 'পিকআপ ফিল্টার'}>
            {([
              { id: 'all', label: t.filterAll },
              { id: 'upcoming', label: t.filterUpcoming },
              { id: 'completed', label: t.filterCompleted },
              { id: 'attention', label: t.filterAttention }
            ] as const).map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={activityFilter === f.id}
                onClick={() => setActivityFilter(f.id)}
                className={`min-h-10 whitespace-nowrap rounded-full px-4 cursor-pointer ${FOCUS} ${activityFilter === f.id ? 'bg-[#124B3A] text-[#CBEA70]' : 'bg-white text-[#124B3A] ring-1 ring-[#124B3A]/15'}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12 lg:gap-6">
            <div className="space-y-3 lg:col-span-7">
              {filteredBookings.length === 0 ? (
                myBookings.length === 0 ? (
                  <EmptyState
                    icon={<Clock className="h-6 w-6 text-[#124B3A]" aria-hidden="true" />}
                    title={en ? 'Your first bag starts here' : 'আপনার প্রথম ব্যাগ এখান থেকে শুরু'}
                    body={en ? 'Book a pickup and you can follow your bag from your door to the recycler, step by step.' : 'পিকআপ বুক করলে আপনার ব্যাগ দরজা থেকে রিসাইক্লার পর্যন্ত ধাপে ধাপে অনুসরণ করতে পারবেন।'}
                    action={<button type="button" onClick={() => openBooking()} className={SECONDARY}>{en ? 'Book a pickup' : 'পিকআপ বুক করুন'}</button>}
                  />
                ) : (
                  <p className="rounded-2xl bg-white p-6 text-center text-sm font-semibold text-[#124B3A]/65 ring-1 ring-[#124B3A]/10">{en ? 'Nothing in this filter.' : 'এই ফিল্টারে কিছু নেই।'}</p>
                )
              ) : (
                filteredBookings.map((b) => (
                  <article key={b.id} className={`${CARD} overflow-hidden`}>
                    <button type="button" onClick={() => handleOpenStatus(b)} className={`w-full space-y-3 p-4 text-left cursor-pointer ${FOCUS}`} aria-label={`${formatBookingDate(b.scheduledDate, lang)} ${bookingStatusLabel(b.status, lang)}`}>
                      <span className="flex items-start justify-between gap-2">
                        <span>
                          <span className="block text-base font-extrabold">{formatBookingDate(b.scheduledDate, lang)}</span>
                          <span className="block text-xs font-medium text-[#124B3A]/60">{b.scheduledTimeWindow} · #{b.id}</span>
                        </span>
                        <span className="text-right">
                          <span className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold ${bookingStatusClass(b.status)}`}>{bookingStatusLabel(b.status, lang)}</span>
                          <span className="mt-1 block text-sm font-extrabold tabular-nums">
                            {b.confirmedWeightKg ? `${nf(b.confirmedWeightKg, lang, 1)} kg` : b.status === 'CANCELLED' ? '' : en ? 'Not weighed yet' : 'ওজন বাকি'}
                          </span>
                        </span>
                      </span>
                      <MaterialChips booking={b} />
                      <MiniJourney booking={b} />
                    </button>
                    {isCancellable(b) && (
                      <div className="border-t border-[#124B3A]/10 px-4 py-1">
                        <button type="button" onClick={() => setCancelTarget(b)} className={DANGER_GHOST}>
                          <XCircle className="h-4 w-4" aria-hidden="true" />
                          {en ? 'Cancel pickup' : 'পিকআপ বাতিল করুন'}
                        </button>
                      </div>
                    )}
                  </article>
                ))
              )}
            </div>

            <div className="space-y-4 lg:col-span-5">
              <section aria-labelledby="my-vouchers" className="space-y-3">
                <h2 id="my-vouchers" className={`${h2} flex items-center gap-2`}>
                  <Ticket className="h-5 w-5" aria-hidden="true" />
                  {en ? 'My vouchers' : 'আমার ভাউচার'}
                </h2>
                {myRedemptions.length === 0 ? (
                  <EmptyState
                    icon={<Gift className="h-6 w-6 text-[#124B3A]" aria-hidden="true" />}
                    title={en ? 'No vouchers yet' : 'এখনো কোনো ভাউচার নেই'}
                    body={en ? 'When you redeem points, your voucher and its code are kept here.' : 'পয়েন্ট রিডিম করলে ভাউচার ও কোড এখানে থাকবে।'}
                    action={<button type="button" onClick={() => handleTabSwitch('rewards')} className={SECONDARY}>{en ? 'See rewards' : 'রিওয়ার্ড দেখুন'}</button>}
                  />
                ) : (
                  <ul className="space-y-2">
                    {[...myRedemptions].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).map((r) => {
                      const until = validUntil(r.rewardId, r.timestamp);
                      return (
                        <li key={r.id} className={`${CARD} space-y-2 p-4 text-sm`}>
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold">{r.rewardTitle}</span>
                            <span className="shrink-0 text-xs font-semibold text-[#124B3A]/60">-{r.pointsDeducted}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <code className="break-all rounded-lg bg-[#FAF9F5] px-2 py-1 font-mono font-bold">{r.couponCode}</code>
                            <button type="button" onClick={() => copyCode(r.couponCode)} aria-label={en ? `Copy code ${r.couponCode}` : `কোড ${r.couponCode} কপি করুন`} className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#124B3A]/15 bg-white cursor-pointer ${FOCUS}`}>
                              <Copy className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                          <p className="text-xs text-[#124B3A]/60">
                            {redemptionStatusLabel(r, lang)} · {formatDateOnly(r.timestamp, lang)}
                            {until ? (en ? ` · valid until ${until}` : ` · ${until} পর্যন্ত বৈধ`) : ''}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              <SupportCasesList showEmpty onAsk={() => handleGetHelp()} />
              <EnvironmentalImpactWidget />
            </div>
          </div>
        </div>
      )}

      {/* ================= MOBILE NAV ================= */}
      <nav aria-label={en ? 'Main navigation' : 'প্রধান নেভিগেশন'} className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-[#124B3A]/10 bg-white/95 px-6 py-2 shadow-lg backdrop-blur-md md:hidden">
        {([
          { id: 'home', label: t.home, Icon: Home },
          { id: 'rewards', label: t.rewards, Icon: Gift },
          { id: 'activity', label: t.myActivity, Icon: Clock }
        ] as const).map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleTabSwitch(id)}
            aria-current={activeTab === id ? 'page' : undefined}
            className={`flex min-h-[44px] min-w-[64px] flex-col items-center gap-0.5 rounded-xl text-xs cursor-pointer ${FOCUS} ${activeTab === id ? 'font-extrabold text-[#124B3A]' : 'text-[#124B3A]/55'}`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            <span className="text-[11px]">{label}</span>
          </button>
        ))}
      </nav>

      {/* ================= MODALS ================= */}
      <NewBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setBookingPreset(undefined);
        }}
        onOpenRecurring={() => setIsRecurringModalOpen(true)}
        preset={bookingPreset}
      />
      <CollectionStatusModal booking={statusBooking} isOpen={Boolean(statusBooking)} onClose={() => setStatusBookingId(null)} onGetHelp={(bId) => handleGetHelp(bId)} />
      <CancelPickupDialog booking={cancelTarget} onClose={() => setCancelTarget(null)} />
      <RecurringServiceModal isOpen={isRecurringModalOpen} onClose={() => setIsRecurringModalOpen(false)} />
      <DisputeModal isOpen={isDisputeModalOpen} bookingId={selectedBookingForHelp} onClose={() => setIsDisputeModalOpen(false)} />
      <MaterialGuideModal isOpen={isGuideModalOpen} onClose={() => setIsGuideModalOpen(false)} />

      <Suspense fallback={null}>
        {isNotificationsOpen && <NotificationCenterModal isOpen onClose={() => setIsNotificationsOpen(false)} onOpenPreparation={(n) => setPrepTarget({ notification: n })} />}
        {prepTarget && <PreparationGuidanceModal isOpen booking={prepTarget.booking} notification={prepTarget.notification} onClose={() => setPrepTarget(null)} />}
      </Suspense>

      {/* Redeem confirmation / result */}
      <Modal
        open={redeem !== null}
        onClose={() => setRedeem(null)}
        size="sm"
        title={redeem?.phase === 'done' ? (en ? 'Voucher redeemed' : 'ভাউচার রিডিম হয়েছে') : redeem?.phase === 'failed' ? (en ? 'Could not redeem' : 'রিডিম করা যায়নি') : en ? 'Redeem this voucher?' : 'ভাউচারটি রিডিম করবেন?'}
        closeLabel={en ? 'Close' : 'বন্ধ করুন'}
        footer={
          redeem?.phase === 'confirm' ? (
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <button type="button" onClick={() => setRedeem(null)} className={`${SECONDARY} flex-1`}>{en ? 'Not now' : 'এখন নয়'}</button>
              <button type="button" onClick={confirmRedeem} className={`${PRIMARY} !h-12 flex-1 !text-sm`}>{en ? `Redeem for ${redeem.reward.pointsCost} pts` : `${redeem.reward.pointsCost} পয়েন্টে রিডিম করুন`}</button>
            </div>
          ) : (
            <div className="flex gap-2">
              {redeem?.phase === 'done' && (
                <button type="button" onClick={() => { setRedeem(null); handleTabSwitch('activity'); }} className={`${SECONDARY} flex-1`}>{en ? 'See my vouchers' : 'আমার ভাউচার দেখুন'}</button>
              )}
              <button type="button" onClick={() => setRedeem(null)} className={`${PRIMARY} !h-12 flex-1 !text-sm`}>{en ? 'Done' : 'সম্পন্ন'}</button>
            </div>
          )
        }
      >
        {redeem && (
          <div className="relative space-y-4 text-sm text-[#124B3A]">
            {redeem.phase === 'done' && <Confetti top="30%" count={26} />}
            <div className="space-y-1 rounded-2xl bg-[#FAF9F5] p-3.5">
              <strong className="block font-display text-2xl">{taka(redeem.reward.cashEquivalentBdt, lang)}</strong>
              <span className="block font-bold">{en ? redeem.reward.title : redeem.reward.titleBn}</span>
              <span className="block text-xs text-[#124B3A]/65">{en ? redeem.reward.description : redeem.reward.descriptionBn || redeem.reward.description}</span>
            </div>
            {redeem.phase === 'confirm' && (
              <dl className="space-y-1.5">
                <div className="flex justify-between"><dt className="text-[#124B3A]/65">{en ? 'Cost' : 'মূল্য'}</dt><dd className="font-bold">{redeem.reward.pointsCost} pts</dd></div>
                <div className="flex justify-between"><dt className="text-[#124B3A]/65">{en ? 'Your balance now' : 'বর্তমান ব্যালেন্স'}</dt><dd className="font-bold">{customerAvailablePoints} pts</dd></div>
                <div className="flex justify-between border-t border-[#124B3A]/10 pt-1.5"><dt className="text-[#124B3A]/65">{en ? 'Balance after' : 'রিডিমের পর ব্যালেন্স'}</dt><dd className="font-bold">{customerAvailablePoints - redeem.reward.pointsCost} pts</dd></div>
              </dl>
            )}
            {redeem.phase === 'done' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-bold"><CheckCircle2 className="h-5 w-5" aria-hidden="true" /><span>{en ? 'Your voucher is ready.' : 'আপনার ভাউচার প্রস্তুত।'}</span></div>
                <div className="space-y-2 rounded-2xl bg-[#EAF5C9] p-4 text-center">
                  <span className="block text-xs font-bold text-[#124B3A]/60">{en ? 'Coupon code' : 'কুপন কোড'}</span>
                  <code className="block select-all break-all font-mono text-lg font-black tracking-wider">{redeem.code}</code>
                  <button type="button" onClick={() => copyCode(redeem.code)} className={`${SECONDARY} !h-10`}>
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    {copied ? (en ? 'Copied' : 'কপি হয়েছে') : en ? 'Copy code' : 'কোড কপি করুন'}
                  </button>
                </div>
                <p className="text-xs text-[#124B3A]/65" role="status">
                  {en ? `${redeem.reward.pointsCost} points were used. The code is valid for ${redeem.reward.validityDays} days and stays in My vouchers.` : `${redeem.reward.pointsCost} পয়েন্ট ব্যবহার হয়েছে। কোডটি ${redeem.reward.validityDays} দিন বৈধ এবং “আমার ভাউচার”-এ থাকবে।`}
                </p>
              </div>
            )}
            {redeem.phase === 'failed' && (
              <div role="alert" className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-rose-900">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <p className="leading-relaxed">{redeem.message}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Drop-off points */}
      <Modal open={isDropOffListOpen} onClose={() => setIsDropOffListOpen(false)} title={t.findADropOffPoint} closeLabel={en ? 'Close' : 'বন্ধ করুন'}>
        <div className="space-y-3 text-sm text-[#124B3A]">
          {dropOffPoints.map((point) => (
            <div key={point.id} className="space-y-2 rounded-2xl bg-[#FAF9F5] p-4 ring-1 ring-[#124B3A]/10">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold">{en ? point.name : point.nameBn}</h4>
                  <p className="text-xs text-[#124B3A]/65">{point.address}</p>
                </div>
                <span className="shrink-0 rounded bg-[#EAF5C9] px-2 py-0.5 text-[10px] font-bold">{point.operatingHours}</span>
              </div>
              <ul className="flex flex-wrap gap-1.5">
                {point.acceptedMaterials.map((m) => (
                  <li key={m} className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold ring-1 ring-[#124B3A]/10">
                    <MaterialGlyph material={m} size={12} />
                    {materialLabel(m, lang)}
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => setSelectedDropOffPoint(point)} className={`${SECONDARY} !h-10 w-full`}>
                {en ? 'View guidelines' : 'নির্দেশনা দেখুন'}
              </button>
            </div>
          ))}
        </div>
      </Modal>

      <DropOffDetailModal point={selectedDropOffPoint} isOpen={Boolean(selectedDropOffPoint)} onClose={() => setSelectedDropOffPoint(null)} />
    </div>
  );
};
