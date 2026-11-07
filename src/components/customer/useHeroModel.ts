import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { pointsForWeight, pointsToTaka } from '../../domain/rules';
import type { Booking } from '../../types';
import { daysFromToday, formatBookingDate } from './dates';
import { useCustomerData } from './useCustomerData';

export type HeroKind = 'none' | 'ready' | 'today' | 'later' | 'celebrate' | 'review' | 'missed' | 'disputed';

export interface HeroModel {
  kind: HeroKind;
  booking?: Booking;
  title: string;
  body: string;
  /** What the Listen button reads aloud, in the current language. */
  speech: string;
  points?: number;
  taka?: number | null;
  collector?: string;
  windowStart?: string;
  enRoute?: boolean;
  hasHistory: boolean;
}

const DAY = 86_400_000;

export const firstName = (full?: string): string | undefined => full?.replace(/\(.*?\)/g, '').trim().split(/\s+/)[0] || undefined;

/** "09:00 AM - 11:30 AM" -> "9:00 AM" */
export const windowStart = (w: string): string => w.split(/[-–]/)[0].trim().replace(/^0/, '');

/** The one thing the home card should say right now, in the customer's language. */
export const useHeroModel = (): HeroModel => {
  const { lang, rewards, jobs } = useApp();
  const { myBookings, nextBooking, attentionBooking } = useCustomerData();
  const en = lang === 'en';

  return useMemo<HeroModel>(() => {
    const hasHistory = myBookings.length > 0;
    const now = Date.now();
    const days = nextBooking ? daysFromToday(nextBooking.scheduledDate) : null;
    const soon = nextBooking && days !== null && days <= 1;
    const make = (m: Omit<HeroModel, 'speech' | 'hasHistory'>): HeroModel => ({ ...m, hasHistory, speech: `${m.title}. ${m.body}` });

    const recentMissed = attentionBooking && now - new Date(attentionBooking.updatedAt).getTime() < 14 * DAY ? attentionBooking : undefined;
    if (recentMissed?.status === 'DISPUTED') {
      return make({
        kind: 'disputed',
        booking: recentMissed,
        title: en ? 'We are looking into your report' : 'আমরা আপনার অভিযোগটি দেখছি',
        body: en ? 'A person at Clean Lane is reviewing it. You do not need to do anything yet.' : 'ক্লিন লেনের একজন সদস্য এটি দেখছেন। আপনাকে এখন কিছু করতে হবে না।'
      });
    }
    if (recentMissed) {
      return make({
        kind: 'missed',
        booking: recentMissed,
        title: en ? 'We missed your pickup' : 'আপনার পিকআপ ছুটে গেছে',
        body: en ? 'We are sorry. Tell us and we will find you a new time.' : 'দুঃখিত। আমাদের জানান, আমরা নতুন সময় ঠিক করে দেব।'
      });
    }
    const review = myBookings.find((b) => b.status === 'QUANTITY_UNDER_REVIEW');
    if (review) {
      return make({
        kind: 'review',
        booking: review,
        title: en ? 'We are double-checking your weight' : 'আমরা আপনার ওজন আবার যাচাই করছি',
        body: en
          ? 'The weight at your door and at our hub were a little different, so a person is checking. Your points are safe.'
          : 'আপনার দরজা ও আমাদের হাবের ওজনে সামান্য পার্থক্য ছিল, তাই একজন যাচাই করছেন। আপনার পয়েন্ট নিরাপদ।'
      });
    }
    if (!soon) {
      const recent = myBookings
        .filter(
          (b) =>
            (b.status === 'QUANTITY_CONFIRMED' || b.status === 'ENTERED_RECOVERY_CHAIN' || b.status === 'PROCESSED') &&
            b.confirmedWeightKg &&
            now - new Date(b.updatedAt).getTime() < 3 * DAY
        )
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
      if (recent) {
        const pts = recent.earnedPoints ?? pointsForWeight(recent.confirmedWeightKg ?? 0);
        const t = pointsToTaka(pts, rewards);
        return make({
          kind: 'celebrate',
          booking: recent,
          points: pts,
          taka: t,
          title: en ? `+${pts} points` : `+${pts.toLocaleString('bn-BD')} পয়েন্ট`,
          body: en
            ? `Your ${recent.confirmedWeightKg} kg was weighed at the hub${t ? `, worth about ৳${t} in vouchers` : ''}. Thank you!`
            : `আপনার ${(recent.confirmedWeightKg ?? 0).toLocaleString('bn-BD')} কেজি হাবে ওজন হয়েছে${t ? `, ভাউচারে প্রায় ৳${t.toLocaleString('bn-BD')}` : ''}। ধন্যবাদ!`
        });
      }
    }
    if (nextBooking) {
      const job = jobs.find((j) => j.bookingId === nextBooking.id);
      const collector = firstName(job?.collectorName ?? nextBooking.collectorName);
      const win = nextBooking.scheduledTimeWindow;
      const start = windowStart(win);
      if (days === 0) {
        const enRoute = nextBooking.status === 'EN_ROUTE';
        const title = enRoute
          ? en ? `${collector ?? 'Your collector'} is on the way` : `${collector ?? 'আপনার সংগ্রাহক'} আসছেন`
          : en ? 'Your pickup is today' : 'আজ আপনার পিকআপ';
        const body = enRoute
          ? en ? 'Please have your bag by the door.' : 'ব্যাগটি দরজার কাছে রাখুন।'
          : collector
          ? en ? `${collector}'s route starts at ${start}. Window: ${win}. Please have your bag by the door.` : `${collector}-এর রুট শুরু ${start}-এ। সময়: ${win}। ব্যাগটি দরজার কাছে রাখুন।`
          : en ? `A collector will be assigned before ${start}. Window: ${win}.` : `${start}-এর আগে একজন সংগ্রাহক ঠিক করা হবে। সময়: ${win}।`;
        return make({ kind: 'today', booking: nextBooking, title, body, collector, windowStart: start, enRoute });
      }
      if (days === 1) {
        return make({
          kind: 'ready',
          booking: nextBooking,
          collector,
          title: en ? 'Get ready for tomorrow' : 'আগামীকালের জন্য তৈরি হোন',
          body: en ? `Your collector comes between ${win}. Three quick steps: rinse, flatten, bag.` : `আপনার সংগ্রাহক আসবেন ${win}-এর মধ্যে। তিনটি সহজ ধাপ: ধুয়ে নিন, চ্যাপ্টা করুন, ব্যাগে ভরুন।`
        });
      }
      return make({
        kind: 'later',
        booking: nextBooking,
        collector,
        title: en ? `Your next pickup is ${formatBookingDate(nextBooking.scheduledDate, 'en')}` : `আপনার পরবর্তী পিকআপ ${formatBookingDate(nextBooking.scheduledDate, 'bn')}`,
        body: en ? `Window: ${win}. We will remind you the day before.` : `সময়: ${win}। আগের দিন আপনাকে মনে করিয়ে দেব।`
      });
    }
    const first = pointsForWeight(3);
    const t = pointsToTaka(first, rewards);
    return make({
      kind: 'none',
      title: en ? 'Ready when you are' : 'আপনি প্রস্তুত হলেই শুরু',
      body: hasHistory
        ? en ? 'Book your next pickup. It takes about a minute.' : 'পরবর্তী পিকআপ বুক করুন। এক মিনিটের মতো লাগবে।'
        : en
        ? `Your first pickup earns about ${first} points${t ? ` (≈ ৳${t})` : ''}. We collect from your door, free.`
        : `আপনার প্রথম পিকআপে প্রায় ${first.toLocaleString('bn-BD')} পয়েন্ট${t ? ` (≈ ৳${t.toLocaleString('bn-BD')})` : ''}। আমরা বিনামূল্যে আপনার দরজা থেকে নিই।`
    });
  }, [myBookings, nextBooking, attentionBooking, jobs, rewards, en]);
};
