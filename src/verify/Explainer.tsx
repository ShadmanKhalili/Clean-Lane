import React from 'react';
import { ChevronDown, Loader2, RefreshCw } from 'lucide-react';
import { useT } from './ui';

export const Explainer: React.FC<{
  checking: boolean;
  onRecheck: () => void;
  lastCheck?: { ms: number; records: number; ok: boolean };
}> = ({ checking, onRecheck, lastCheck }) => {
  const { t } = useT();
  const lines = [
    [
      'Every record carries a fingerprint of the record before it.',
      'প্রতিটি রেকর্ডে তার আগের রেকর্ডের একটি ফিঙ্গারপ্রিন্ট থাকে।'
    ],
    [
      'Change one number and every later fingerprint stops matching.',
      'একটি সংখ্যা বদলালে পরের সব ফিঙ্গারপ্রিন্ট আর মেলে না।'
    ],
    ['Anyone can recheck it, right here, right now.', 'যে কেউ এখনই, এখানেই আবার যাচাই করতে পারেন।']
  ];
  return (
    <section aria-labelledby="vf-how" className="rounded-2xl border border-[#172521]/12 bg-white">
      <details className="group" open>
        <summary className="flex items-center justify-between gap-3 px-4 min-h-14 cursor-pointer list-none [&::-webkit-details-marker]:hidden rounded-2xl">
          <h2 id="vf-how" className="font-display text-xl font-bold text-[#172521]">
            {t('How we know', 'আমরা কীভাবে জানি')}
          </h2>
          <ChevronDown className="w-5 h-5 text-[#5B6B66] transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="px-4 pb-4 space-y-4">
          <ol className="space-y-2.5">
            {lines.map(([en, bn], i) => (
              <li key={i} className="flex gap-3 text-sm text-[#172521]/90 leading-snug">
                <span className="grid place-items-center w-6 h-6 rounded-full bg-[#CBEA70] text-[#124B3A] text-xs font-bold shrink-0" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="pt-0.5">{t(en, bn)}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onRecheck}
              disabled={checking}
              className="inline-flex items-center gap-2 min-h-11 px-4 rounded-full bg-[#124B3A] text-white text-sm font-semibold hover:bg-[#0d3a2d] disabled:opacity-80 cursor-pointer"
            >
              {checking ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="w-4 h-4" aria-hidden="true" />}
              {checking ? t('Re-checking…', 'আবার যাচাই হচ্ছে…') : t('Re-check now', 'এখনই আবার যাচাই করুন')}
            </button>
            {lastCheck && !checking && (
              <p role="status" className="text-xs text-[#5B6B66]">
                {lastCheck.ok
                  ? t(`Re-computed ${lastCheck.records} fingerprints in ${lastCheck.ms.toFixed(1)} ms. All match.`, `${lastCheck.records}টি ফিঙ্গারপ্রিন্ট ${lastCheck.ms.toFixed(1)} মি.সে.-এ পুনরায় গণনা। সব মিলেছে।`)
                  : t(`Re-computed ${lastCheck.records} fingerprints in ${lastCheck.ms.toFixed(1)} ms. A mismatch was found.`, `${lastCheck.records}টি ফিঙ্গারপ্রিন্ট ${lastCheck.ms.toFixed(1)} মি.সে.-এ পুনরায় গণনা। অমিল পাওয়া গেছে।`)}
              </p>
            )}
          </div>
        </div>
      </details>
    </section>
  );
};
