import React, { useEffect, useId, useRef, useState } from 'react';

/**
 * Plain words first, codes second: wrap a term in <Term id="hubScale"> and
 * people can tap it for a one-line explanation (keyboard and screen-reader
 * accessible; Escape or tapping elsewhere closes it).
 */
export const GLOSSARY = {
  hubScale: {
    en: ['Hub scale', 'A certified scale at our collection hub. Points are confirmed on this weight, not the doorstep estimate.'],
    bn: ['হাবের স্কেল', 'আমাদের সংগ্রহ হাবের সনদপ্রাপ্ত ওজন যন্ত্র। পয়েন্ট এই ওজনেই নিশ্চিত হয়, দরজার আনুমানিক ওজনে নয়।']
  },
  pendingPoints: {
    en: ['Pending points', 'Points we expect you to earn. They become spendable once the hub scale confirms the weight.'],
    bn: ['অপেক্ষমাণ পয়েন্ট', 'যে পয়েন্ট আপনি পাবেন বলে আশা করা হচ্ছে। হাবের স্কেলে ওজন নিশ্চিত হলে খরচ করা যাবে।']
  },
  evidenceLevel: {
    en: ['Evidence level (E0–E5)', 'How far a kilogram is proven: E0 booked, E1 collected, E2 hub-weighed, E3 sent to recycler, E4 recycled, E5 in an audited brand report.'],
    bn: ['প্রমাণের স্তর (E0–E5)', 'এক কেজি কতদূর প্রমাণিত: E0 বুক, E1 সংগ্রহ, E2 হাবে ওজন, E3 রিসাইক্লারে পাঠানো, E4 রিসাইকেল, E5 অডিটেড ব্র্যান্ড রিপোর্টে।']
  },
  chainOfCustody: {
    en: ['Chain of custody', 'The record of every hand a bag passes through, each sealed with a fingerprint of the one before so it cannot be quietly edited.'],
    bn: ['হস্তান্তরের শৃঙ্খল', 'একটি ব্যাগ যাদের হাত ঘুরে যায় তার রেকর্ড; প্রতিটি আগেরটির ফিঙ্গারপ্রিন্টসহ সিল করা, তাই গোপনে বদলানো যায় না।']
  },
  epr: {
    en: ['EPR', 'Extended Producer Responsibility: brands must show that packaging they sell is collected and recycled.'],
    bn: ['ইপিআর', 'বর্ধিত উৎপাদক দায়িত্ব: ব্র্যান্ডকে দেখাতে হয় তাদের প্যাকেজিং সংগ্রহ ও রিসাইকেল হয়েছে।']
  },
  lot: {
    en: ['Lot', 'A batch of material tracked together, e.g. one household’s bottles or a sorted bale at the hub.'],
    bn: ['লট', 'একসাথে ট্র্যাক করা উপকরণের ব্যাচ, যেমন এক পরিবারের বোতল বা হাবে বাছাই করা এক গাঁট।']
  },
  contamination: {
    en: ['Contamination', 'Food, oil or mixed waste on recyclables. Contaminated items can’t be recycled and earn no points.'],
    bn: ['দূষণ', 'রিসাইকেলযোগ্য জিনিসে খাবার, তেল বা মিশ্র বর্জ্য। দূষিত জিনিস রিসাইকেল হয় না, পয়েন্টও মেলে না।']
  },
  fingerprint: {
    en: ['Fingerprint (hash)', 'A short code computed from a record’s contents. Change one number and the fingerprint changes completely.'],
    bn: ['ফিঙ্গারপ্রিন্ট (হ্যাশ)', 'রেকর্ডের বিষয়বস্তু থেকে তৈরি ছোট কোড। একটি সংখ্যা বদলালেই ফিঙ্গারপ্রিন্ট পুরো বদলে যায়।']
  },
  weightTolerance: {
    en: ['±5% tolerance', 'Doorstep and hub weights may differ a little (moisture, bag weight). Beyond 5%, a person reviews it before points are confirmed.'],
    bn: ['±৫% সহনসীমা', 'দরজা ও হাবের ওজনে সামান্য পার্থক্য হতে পারে। ৫%-এর বেশি হলে পয়েন্ট নিশ্চিতের আগে একজন যাচাই করেন।']
  }
} as const;

export type GlossaryId = keyof typeof GLOSSARY;

export const Term: React.FC<{ id: GlossaryId; lang: 'en' | 'bn'; children?: React.ReactNode }> = ({ id, lang, children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const popId = useId();
  const [title, body] = GLOSSARY[id][lang];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open]);

  return (
    <span ref={ref} className="relative inline">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={popId}
        className="underline decoration-dotted decoration-[1.5px] underline-offset-[3px] decoration-[#124B3A]/50 cursor-help text-inherit font-inherit"
      >
        {children ?? title}
      </button>
      {open && (
        <span
          id={popId}
          role="note"
          className="absolute z-[75] left-0 top-full mt-2 w-64 max-w-[80vw] rounded-2xl bg-[#172521] text-white text-xs leading-relaxed p-3 shadow-xl cl-rise text-left font-normal normal-case tracking-normal"
        >
          <strong className="block text-[#CBEA70] mb-0.5">{title}</strong>
          {body}
        </span>
      )}
    </span>
  );
};
