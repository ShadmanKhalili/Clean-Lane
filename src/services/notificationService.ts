import {
  AppNotification,
  Booking,
  MaterialCategory,
  MaterialPrepGuide,
  NotificationSettings,
  PrepStep
} from '../types';
import { MATERIAL_TAXONOMY } from '../data/mockData';

/**
 * Clean Lane Automated Notification Service
 * Handles 24-hour automated collection reminders, custom preparation guidance generation,
 * multi-channel simulation (SMS, Push, In-App), and notification scheduling.
 */

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  reminder24h: true,
  reminder2h: true,
  smsEnabled: true,
  pushEnabled: true,
  whatsappEnabled: false,
  audioReadout: true,
  languagePreference: 'en'
};

/**
 * Builds custom preparation instructions for the specific materials in a collection
 */
export function buildPrepGuidanceForMaterials(
  materials: { category: MaterialCategory; approximateBandKg?: string }[],
  scheduledWindow: string,
  accessInstructions?: string
): {
  steps: PrepStep[];
  materialSpecific: MaterialPrepGuide[];
  gatePlacementNote: string;
  gatePlacementNoteBn: string;
  contaminationWarning: string;
  contaminationWarningBn: string;
} {
  const materialSpecific: MaterialPrepGuide[] = materials.map((m) => {
    const tax = MATERIAL_TAXONOMY[m.category];
    return {
      category: m.category,
      name: tax?.name || m.category,
      nameBn: tax?.nameBn || m.category,
      instructions:
        tax?.prepInstructions ||
        'Keep material clean, dry, and separated from general waste.',
      instructionsBn:
        tax?.prepInstructionsBn ||
        'বর্জ্যটি পরিষ্কার, শুকনো এবং সাধারণ আবর্জনা থেকে আলাদা রাখুন।',
      doNotInclude: tax?.excludedContaminants || ['Wet household garbage', 'Medical waste']
    };
  });

  const steps: PrepStep[] = [
    {
      stepNumber: 1,
      title: 'Empty & Rinse Residue',
      titleBn: 'খালি করে ধুয়ে ফেলুন',
      detail:
        'Pour out any leftover liquids or oils from bottles and containers. A quick water rinse prevents odor and rejects.',
      detailBn:
        'বোতল ও পাত্রের ভেতরের তরল বা তেল ফেলে হালকা ধুয়ে নিন যাতে গন্ধ না ছড়ায়।',
      icon: 'droplets'
    },
    {
      stepNumber: 2,
      title: 'Flatten & Compress',
      titleBn: 'চাপ দিয়ে সংকুচিত করুন',
      detail:
        'Crush plastic bottles, break down cardboard boxes flat, and step on beverage cans to maximize bag capacity.',
      detailBn:
        'কার্টুন বক্স চ্যাপ্টা করুন এবং বোতল চেপে সংকুচিত করুন যাতে পরিবহন সহজ হয়।',
      icon: 'maximize-2'
    },
    {
      stepNumber: 3,
      title: 'Separate by Material Stream',
      titleBn: 'উপাদান অনুযায়ী আলাদা রাখুন',
      detail:
        'Keep dry recyclables in separate bags (e.g. plastics in one, cardboard in another) for instant digital scale verification.',
      detailBn:
        'ডিজিটাল স্কেলে দ্রুত ওজনের জন্য প্লাস্টিক, কাগজ ও ধাতব ক্যান আলাদা ব্যাগে রাখুন।',
      icon: 'layers'
    },
    {
      stepNumber: 4,
      title: 'Doorstep / Gate Placement',
      titleBn: 'দরজা বা গেইটে প্রস্তুত রাখুন',
      detail: `Place bags at your designated pickup spot 15 minutes before ${scheduledWindow.split('-')[0] || 'your window'}. ${
        accessInstructions ? `Collector note: ${accessInstructions}` : ''
      }`,
      detailBn: `সংগ্রহের সময়ের ১৫ মিনিট আগে নির্ধারিত স্থানে ব্যাগগুলো প্রস্তুত রাখুন।`,
      icon: 'door-open'
    }
  ];

  return {
    steps,
    materialSpecific,
    gatePlacementNote: `Collector arrives during ${scheduledWindow}. Ensure security/guard is notified if pickup is at ground gate.`,
    gatePlacementNoteBn: `কালেক্টর ${scheduledWindow} সময়ের মধ্যে পৌঁছাবেন। গ্রাউন্ড গেইটে থাকলে গার্ডকে অবহিত রাখুন।`,
    contaminationWarning:
      'Warning: Wet kitchen food scraps, grease-soaked boxes, or broken glass will be rejected and deducted from verified payout.',
    contaminationWarningBn:
      'সতর্কতা: ভেজা রান্নাঘরের বর্জ্য, তৈলাক্ত বক্স বা ভাঙা কাঁচ থাকলে তা বাতিল হবে এবং পয়েন্ট যোগ হবে না।'
  };
}

/**
 * Generates an automated 24-Hour Collection Reminder notification
 */
export function generate24HourReminder(
  booking: Booking,
  options?: {
    customDate?: string;
    channel?: 'IN_APP' | 'SMS' | 'PUSH' | 'WHATSAPP';
  }
): AppNotification {
  const prep = buildPrepGuidanceForMaterials(
    booking.materials,
    booking.scheduledTimeWindow,
    booking.accessInstructions
  );

  const materialsSummary = booking.materials
    .map((m) => MATERIAL_TAXONOMY[m.category]?.name || m.category)
    .join(', ');

  const materialsSummaryBn = booking.materials
    .map((m) => MATERIAL_TAXONOMY[m.category]?.nameBn || m.category)
    .join(', ');

  const title = `Reminder: Collection tomorrow (${booking.scheduledDate})`;
  const titleBn = `স্মারক: আগামীকাল বর্জ্য সংগ্রহ (${booking.scheduledDate})`;

  const message = `Your Clean Lane pickup is scheduled for tomorrow between ${booking.scheduledTimeWindow} at ${booking.address}. Please follow preparation steps to ensure full points & verification.`;
  const messageBn = `আপনার ক্লিন লেন সংগ্রহ আগামীকাল ${booking.scheduledTimeWindow} সময়ে (${booking.address}) নির্ধারিত রয়েছে। পূর্ণ পয়েন্ট নিশ্চিত করতে প্রস্তুতি নির্দেশিকা অনুসরণ করুন।`;

  const smsPreview = `[Clean Lane] Reminder: Recyclables pickup tomorrow (${booking.scheduledDate}) between ${booking.scheduledTimeWindow} for ${booking.customerName}. Prepare items: ${materialsSummary}. Keep clean & dry. Track live: https://cleanlane.app/b/${booking.id}`;

  const pushPreview = `⏰ Collection Tomorrow at ${booking.scheduledTimeWindow.split('-')[0]}! Tap to view bag preparation instructions for ${booking.materials.length} item types.`;

  return {
    id: `NOTIF-24H-${booking.id}-${Date.now().toString(36)}`,
    customerId: booking.customerId,
    customerName: booking.customerName,
    customerPhone: booking.phone,
    bookingId: booking.id,
    type: 'COLLECTION_REMINDER_24H',
    title,
    titleBn,
    message,
    messageBn,
    scheduledCollectionDate: booking.scheduledDate,
    scheduledTimeWindow: booking.scheduledTimeWindow,
    address: booking.address,
    channel: options?.channel || 'SMS',
    status: 'DELIVERED',
    scheduledSendTime: new Date(Date.now() - 3600000).toISOString(),
    sentAt: new Date().toISOString(),
    read: false,
    preparationInstructions: prep,
    smsPreview,
    pushPreview,
    createdAt: new Date().toISOString()
  };
}

/**
 * Initial mock notifications to seed the notification center
 */
export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'NOTIF-24H-INIT-01',
    customerId: 'CUST-H-801',
    customerName: 'Nasreen Akhter',
    customerPhone: '+880 1711-234567',
    bookingId: 'CL-BK-2026-101',
    type: 'COLLECTION_REMINDER_24H',
    title: 'Reminder: Collection tomorrow (2026-10-06)',
    titleBn: 'স্মারক: আগামীকাল বর্জ্য সংগ্রহ (2026-10-06)',
    message:
      'Your Clean Lane pickup is scheduled for tomorrow between 08:00 - 10:00 at Apt 4B, Road 54, Gulshan-2. Please rinse, flatten, and separate recyclables.',
    messageBn:
      'আপনার বর্জ্য সংগ্রহ আগামীকাল সকাল ০৮:০০ - ১০:০০ সময়ে (অ্যাপার্টমেন্ট ৪বি, রোড ৫৪, গুলশান-২) নির্ধারিত রয়েছে। অনুগ্রহ করে বোতল ধুয়ে চ্যাপ্টা করে রাখুন।',
    scheduledCollectionDate: '2026-10-06',
    scheduledTimeWindow: '08:00 - 10:00',
    address: 'House 14, Apt 4B, Road 54, Gulshan-2, Dhaka',
    channel: 'SMS',
    status: 'DELIVERED',
    scheduledSendTime: '2026-10-05T08:00:00Z',
    sentAt: '2026-10-05T08:00:15Z',
    read: false,
    preparationInstructions: buildPrepGuidanceForMaterials(
      [
        { category: 'PET_BOTTLES', approximateBandKg: '2-5 kg' },
        { category: 'CARDBOARD_OCC', approximateBandKg: '5-10 kg' }
      ],
      '08:00 - 10:00',
      'Ring Apt 4B bell or leave with lobby guard with tag'
    ),
    smsPreview:
      '[Clean Lane] Reminder: Recyclables pickup tomorrow (2026-10-06) 08:00-10:00 for Nasreen Akhter. Materials: PET Bottles, Cardboard. Rinse & flatten boxes. Track: https://cleanlane.app/b/CL-BK-2026-101',
    pushPreview:
      '⏰ Collection Tomorrow (08:00 - 10:00)! Tap to see preparation rules for PET Bottles & Cardboard.',
    createdAt: '2026-10-05T08:00:00Z'
  },
  {
    id: 'NOTIF-CONFIRM-INIT-02',
    customerId: 'CUST-H-801',
    customerName: 'Nasreen Akhter',
    customerPhone: '+880 1711-234567',
    bookingId: 'CL-BK-2026-101',
    type: 'BOOKING_CONFIRMED',
    title: 'Pickup Requested & Lane Approved',
    titleBn: 'পিকআপ অনুরোধ অনুমোদিত',
    message:
      'Your collection booking CL-BK-2026-101 has been confirmed for Gulshan-2 Clean Lane. Collector Tariqul Islam has been assigned.',
    messageBn:
      'আপনার বুকিং CL-BK-2026-101 গুলশান-২ ক্লিন লেনের জন্য নিশ্চিত করা হয়েছে। কালেক্টর তরিকুল ইসলাম নিযুক্ত হয়েছেন।',
    scheduledCollectionDate: '2026-10-06',
    scheduledTimeWindow: '08:00 - 10:00',
    address: 'House 14, Apt 4B, Road 54, Gulshan-2, Dhaka',
    channel: 'IN_APP',
    status: 'DELIVERED',
    scheduledSendTime: '2026-10-04T10:30:00Z',
    sentAt: '2026-10-04T10:30:02Z',
    read: true,
    preparationInstructions: buildPrepGuidanceForMaterials(
      [
        { category: 'PET_BOTTLES', approximateBandKg: '2-5 kg' },
        { category: 'CARDBOARD_OCC', approximateBandKg: '5-10 kg' }
      ],
      '08:00 - 10:00'
    ),
    smsPreview:
      '[Clean Lane] Booking CL-BK-2026-101 confirmed for 2026-10-06 (08:00-10:00). Collector: Tariqul Islam.',
    pushPreview:
      '✅ Clean Lane booking confirmed for tomorrow morning!',
    createdAt: '2026-10-04T10:30:00Z'
  }
];

/**
 * Automated reminder dispatcher engine
 * Evaluates all upcoming bookings and triggers 24h reminder when due
 */
export function evaluateAutomatedReminders(
  bookings: Booking[],
  existingNotifications: AppNotification[]
): {
  newReminders: AppNotification[];
  logs: string[];
} {
  const newReminders: AppNotification[] = [];
  const logs: string[] = [];

  const eligibleBookings = bookings.filter(
    (b) =>
      b.status === 'REQUESTED' ||
      b.status === 'CONFIRMED' ||
      b.status === 'COLLECTOR_ASSIGNED'
  );

  for (const booking of eligibleBookings) {
    // Check if 24h reminder already dispatched
    const alreadySent = existingNotifications.some(
      (n) =>
        n.bookingId === booking.id && n.type === 'COLLECTION_REMINDER_24H'
    );

    if (!alreadySent) {
      const reminder = generate24HourReminder(booking);
      newReminders.push(reminder);
      logs.push(
        `[AutoScheduler] Dispatched 24H Reminder for Booking #${booking.id} (${booking.customerName}, ${booking.phone}) scheduled for ${booking.scheduledDate} ${booking.scheduledTimeWindow}.`
      );
    }
  }

  return {
    newReminders,
    logs
  };
}
