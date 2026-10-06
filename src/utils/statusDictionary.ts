/**
 * Status and Content Dictionary
 * Aligned with Clean Lane Developer UI Handoff v1.0 Section 8
 */

export interface CustomerStatusInfo {
  customerLabelEn: string;
  customerLabelBn: string;
  whatHappenedEn: string;
  whatHappenedBn: string;
  whatHappensNextEn: string;
  whatHappensNextBn: string;
  forbiddenWording: string;
}

export const BOOKING_CUSTOMER_STATUS_MAP: Record<string, CustomerStatusInfo> = {
  REQUESTED: {
    customerLabelEn: 'Pickup requested',
    customerLabelBn: 'পিকআপের অনুরোধ করা হয়েছে',
    whatHappenedEn: 'Your collection request has been received by the Clean Lane system.',
    whatHappenedBn: 'আপনার বর্জ্য সংগ্রহের অনুরোধটি গ্রহণ করা হয়েছে।',
    whatHappensNextEn: 'A licensed provider in your corridor will confirm vehicle capacity.',
    whatHappensNextBn: 'আপনার এলাকার অনুমোদিত কালেক্টর সময়সূচী নিশ্চিত করবে।',
    forbiddenWording: 'Do NOT say "Collection confirmed"'
  },
  CONFIRMED: {
    customerLabelEn: 'Pickup confirmed',
    customerLabelBn: 'পিকআপ নিশ্চিত করা হয়েছে',
    whatHappenedEn: 'Collector schedule and capacity confirmed for your slot.',
    whatHappenedBn: 'আপনার নির্ধারিত সময়ের জন্য কালেক্টর ও স্থান বরাদ্দ করা হয়েছে।',
    whatHappensNextEn: 'A collector will arrive during your selected window.',
    whatHappensNextBn: 'নির্ধারিত সময়ের মধ্যে কালেক্টর আপনার ঠিকানায় পৌঁছাবেন।',
    forbiddenWording: 'Do NOT say "Collector is coming now"'
  },
  COLLECTOR_ASSIGNED: {
    customerLabelEn: 'Collector assigned',
    customerLabelBn: 'কালেক্টর নিযুক্ত করা হয়েছে',
    whatHappenedEn: 'Collector has received route dispatch for your address.',
    whatHappenedBn: 'আপনার ঠিকানার জন্য রুট কালেক্টর নিযুক্ত করা হয়েছে।',
    whatHappensNextEn: 'Collector is preparing their collection run.',
    whatHappensNextBn: 'কালেক্টর সংগ্রহের জন্য প্রস্তুতি নিচ্ছেন।',
    forbiddenWording: 'Do NOT say "Arriving now"'
  },
  EN_ROUTE: {
    customerLabelEn: 'Collector en route',
    customerLabelBn: 'কালেক্টর পথে আছেন',
    whatHappenedEn: 'Collector has started their route in your neighborhood.',
    whatHappenedBn: 'কালেক্টর আপনার পাড়ার নির্ধারিত রুটে রওনা দিয়েছেন।',
    whatHappensNextEn: 'Please have your segregated, dry materials ready outside your door or building bay.',
    whatHappensNextBn: 'অনুগ্রহ করে পৃথক করা শুকনো পুনর্ব্যবহারযোগ্য বর্জ্য প্রস্তুত রাখুন।',
    forbiddenWording: 'Do NOT say "Pickup completed"'
  },
  COLLECTED: {
    customerLabelEn: 'Collected',
    customerLabelBn: 'সংগ্রহ করা হয়েছে',
    whatHappenedEn: 'Collector picked up your materials and recorded field weight.',
    whatHappenedBn: 'কালেক্টর আপনার বর্জ্য গ্রহণ করেছেন এবং আনুমানিক ওজন রেকর্ড করেছেন।',
    whatHappensNextEn: 'Materials are transported to the neighborhood receiving hub for platform scale verification.',
    whatHappensNextBn: 'বর্জ্য একত্রীকরণ কেন্দ্রে নিয়ে ডিজিটাল প্ল্যাটফর্ম স্কেলে চূড়ান্ত ওজন করা হবে।',
    forbiddenWording: 'Do NOT say "Recycled"'
  },
  QUANTITY_UNDER_REVIEW: {
    customerLabelEn: 'Quantity under scale check',
    customerLabelBn: 'ওজন যাচাই চলছে',
    whatHappenedEn: 'Material arrived at the certified aggregation hub.',
    whatHappenedBn: 'বর্জ্য অনুমোদিত একত্রীকরণ কেন্দ্রে পৌঁছেছে।',
    whatHappensNextEn: 'Certified scale operator is verifying gross and tare weight.',
    whatHappensNextBn: 'সার্টিফাইড ডিজিটাল স্কেলে চূড়ান্ত ওজন যাচাই করা হচ্ছে।',
    forbiddenWording: 'Do NOT say "Finished"'
  },
  QUANTITY_CONFIRMED: {
    customerLabelEn: 'Quantity confirmed',
    customerLabelBn: 'পরিমাণ নিশ্চিত করা হয়েছে',
    whatHappenedEn: 'Receiving hub certified platform scale verified weight and material grade.',
    whatHappenedBn: 'ডিজিটাল প্ল্যাটফর্ম স্কেলে বর্জ্যের নির্ভুল ওজন ও গ্রেড নিশ্চিত করা হয়েছে।',
    whatHappensNextEn: 'Points move from Pending to Available. Materials are consolidated for certified recovery.',
    whatHappensNextBn: 'পয়েন্ট অবিলম্বে উপলব্ধ (Available) ব্যালেন্সে যুক্ত হয়েছে।',
    forbiddenWording: 'Do NOT say "Processing completed"'
  },
  ENTERED_RECOVERY_CHAIN: {
    customerLabelEn: 'Received by recovery partner',
    customerLabelBn: 'রিকভারি পার্টনারে গৃহীত',
    whatHappenedEn: 'Consolidated material batch received by licensed pre-processor or recycler.',
    whatHappenedBn: 'বাছাইকৃত বর্জ্য অনুমোদিত রিসাইক্লিং মিলে গৃহীত হয়েছে।',
    whatHappensNextEn: 'Processor verifies batch manifests and schedules conversion.',
    whatHappensNextBn: 'প্রক্রিয়াকরণ কারখানা পরবর্তী রূপান্তর শুরু করবে।',
    forbiddenWording: 'Do NOT say "Recycled"'
  },
  PROCESSED: {
    customerLabelEn: 'Processing outcome confirmed',
    customerLabelBn: 'প্রক্রিয়াকরণের ফলাফল নিশ্চিত',
    whatHappenedEn: 'Licensed mill documented physical conversion (flakes, pellets, pulp, or RDF) with loss accounting.',
    whatHappenedBn: 'কারখানা সফলভাবে রূপান্তরের হিসাব (ফ্লেক্স, প্যালেট বা পাল্প) নথিভুক্ত করেছে।',
    whatHappensNextEn: 'Audited evidence package sealed for circular EPR reporting.',
    whatHappensNextBn: 'সম্পূর্ণ ট্রেসেবিলিটি রেকর্ড অডিট প্যাকেজ হিসেবে সংরক্ষিত।',
    forbiddenWording: 'Do NOT claim 100% recycling without loss accounting'
  },
  CANCELLED: {
    customerLabelEn: 'Pickup cancelled',
    customerLabelBn: 'পিকআপ বাতিল করা হয়েছে',
    whatHappenedEn: 'This booking was cancelled by the customer or operator before arrival.',
    whatHappenedBn: 'সংগ্রহের অনুরোধটি বাতিল করা হয়েছে।',
    whatHappensNextEn: 'You can book a new collection whenever convenient.',
    whatHappensNextBn: 'আপনি যখন সুবিধাজনক মনে করবেন পুনরায় বুকিং করতে পারবেন।',
    forbiddenWording: 'Do NOT alter historical audit log'
  },
  MISSED: {
    customerLabelEn: 'Collection missed',
    customerLabelBn: 'সংগ্রহ সম্ভব হয়নি',
    whatHappenedEn: 'Collector could not access premises or slot was interrupted.',
    whatHappenedBn: 'কালেক্টর প্রবেশ করতে পারেননি অথবা যোগাযোগ করা সম্ভব হয়নি।',
    whatHappensNextEn: 'Operator dispatch has flagged this for priority re-scheduling or customer support.',
    whatHappensNextBn: 'অপারেটর আপনার সাথে যোগাযোগ করে দ্রুততম সময়ে পুনঃনির্ধারণ করবে।',
    forbiddenWording: 'Do NOT blame customer without record'
  },
  DISPUTED: {
    customerLabelEn: 'Issue under review',
    customerLabelBn: 'সমস্যাটি পর্যালোচনায় আছে',
    whatHappenedEn: 'A service complaint or weight discrepancy ticket was submitted.',
    whatHappenedBn: 'এই সংগ্রহের ব্যাপারে একটি সহায়তা টিকেট দায়ের করা হয়েছে।',
    whatHappensNextEn: 'Clean Lane support agent will review logs and contact you.',
    whatHappensNextBn: 'আমাদের সাপোর্ট টিম রেকর্ড দেখে দ্রুত সমাধান জানাবে।',
    forbiddenWording: 'Do NOT mark resolved prematurely'
  }
};

/**
 * Returns customer-facing label adhering strictly to Section 8
 */
export function getCustomerStatusLabel(status: string, lang: 'en' | 'bn'): string {
  const item = BOOKING_CUSTOMER_STATUS_MAP[status];
  if (!item) return status;
  return lang === 'bn' ? item.customerLabelBn : item.customerLabelEn;
}

/**
 * Audio / Spoken Guidance Helper
 * Uses Web Speech API where available, fallback graceful
 */
export function speakInstruction(text: string, lang: 'en' | 'bn'): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }
  try {
    window.speechSynthesis.cancel(); // Stop prior speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
    utterance.rate = 0.95; // Slightly slower for clarity
    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore speech errors gracefully
  }
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
}
