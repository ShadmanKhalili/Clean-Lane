import React from 'react';
import { FlaskConical, Undo2 } from 'lucide-react';
import { fmtKg, tamperedWeight, type Journey, type Tamper } from './journey';
import { useT } from './ui';

export const DemoControls: React.FC<{
  journey: Journey;
  selectedKey: string | undefined;
  onSelect: (key: string) => void;
  tamper: Tamper | null;
  onTamper: () => void;
  onRestore: () => void;
}> = ({ journey, selectedKey, onSelect, tamper, onTamper, onRestore }) => {
  const { t, bi } = useT();
  const target = journey.targets.find((x) => x.key === selectedKey) ?? journey.targets[0];
  const original = tamper ? journey.targets.find((x) => x.key === tamper.key) : undefined;

  return (
    <footer className="border-t border-[#172521]/12 pt-4">
      <details open={!!tamper}>
        <summary className="inline-flex items-center gap-2 min-h-11 cursor-pointer text-xs font-semibold tracking-wider uppercase text-[#5B6B66] list-none [&::-webkit-details-marker]:hidden">
          <FlaskConical className="w-4 h-4" aria-hidden="true" />
          {t('Demo controls', 'ডেমো কন্ট্রোল')}
        </summary>
        <div className="mt-2 rounded-2xl border border-dashed border-[#172521]/25 p-4 space-y-3 bg-white/60">
          {!target ? (
            <p className="text-sm text-[#5B6B66]">{t('Nothing to tamper with yet: no weighed records.', 'এখনো পরিবর্তনের মতো কিছু নেই: ওজন করা রেকর্ড নেই।')}</p>
          ) : tamper && original ? (
            <>
              <p className="text-sm text-[#172521]">
                {t(
                  `Someone edited the weight from ${fmtKg(original.kg)} to ${fmtKg(tamper.kg)} in memory. Nothing real was changed.`,
                  `কেউ মেমরিতে ওজন ${fmtKg(original.kg)} থেকে ${fmtKg(tamper.kg)} করেছে। আসল ডেটা বদলায়নি।`
                )}
              </p>
              <button
                type="button"
                onClick={onRestore}
                className="inline-flex items-center gap-2 min-h-11 px-4 rounded-full bg-[#172521] text-white text-sm font-semibold hover:bg-black cursor-pointer"
              >
                <Undo2 className="w-4 h-4" aria-hidden="true" />
                {t('Restore', 'আগের অবস্থায় ফেরান')}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-[#172521]">
                {t(
                  `Someone edits the weight from ${fmtKg(target.kg)} to ${fmtKg(tamperedWeight(target.kg))}…`,
                  `কেউ ওজন ${fmtKg(target.kg)} থেকে ${fmtKg(tamperedWeight(target.kg))} করে দেয়…`
                )}
              </p>
              {journey.targets.length > 1 && (
                <label className="block text-xs text-[#5B6B66]">
                  {t('Record to edit', 'যে রেকর্ড বদলাবেন')}
                  <select
                    value={target.key}
                    onChange={(e) => onSelect(e.target.value)}
                    className="mt-1 block w-full min-h-11 rounded-lg border border-[#172521]/25 bg-white px-2 text-sm text-[#172521]"
                  >
                    {journey.targets.map((x) => (
                      <option key={x.key} value={x.key}>
                        {t('Record', 'রেকর্ড')} {x.recordNo} · {bi(x.title)} · {fmtKg(x.kg)}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <button
                type="button"
                onClick={onTamper}
                className="inline-flex items-center gap-2 min-h-11 px-4 rounded-full border border-[#B42318] text-[#B42318] text-sm font-semibold hover:bg-[#B42318]/5 cursor-pointer"
              >
                <FlaskConical className="w-4 h-4" aria-hidden="true" />
                {t('Simulate tampering', 'কারসাজি সিমুলেট করুন')}
              </button>
            </>
          )}
        </div>
      </details>
    </footer>
  );
};
