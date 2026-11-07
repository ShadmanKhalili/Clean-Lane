import React from 'react';
import { Check, Fingerprint, ShieldQuestion, X } from 'lucide-react';
import { MATERIALS, MaterialGlyph, relatableCount } from '../design/materials';
import { fmtKg, type Journey, type Verification } from './journey';
import { useT } from './ui';

export type SealState = 'ok' | 'broken' | 'empty';

export const sealState = (j: Journey, v: Verification): SealState => (!v.ok ? 'broken' : j.recordCount === 0 ? 'empty' : 'ok');

const SealMark: React.FC<{ state: SealState }> = ({ state }) => {
  const tone =
    state === 'ok'
      ? { ring: '#124B3A', fill: '#CBEA70', ink: '#124B3A' }
      : state === 'broken'
        ? { ring: '#B42318', fill: '#FDE4E1', ink: '#B42318' }
        : { ring: '#8A948F', fill: '#EEEDE6', ink: '#5B6B66' };
  return (
    <div
      className={`vf-stamp relative shrink-0 grid place-items-center w-24 h-24 sm:w-28 sm:h-28 rounded-full ${state === 'broken' ? 'vf-shake' : ''}`}
      style={{ background: tone.fill, boxShadow: `inset 0 0 0 3px ${tone.ring}, 0 0 0 5px ${tone.fill}, 0 0 0 6px ${tone.ring}` }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="w-12 h-12 sm:w-14 sm:h-14" fill="none" stroke={tone.ink} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
        {state === 'ok' && <path d="M5 12.5l4.5 4.5L19 7.5" />}
        {state === 'broken' && <path d="M6 6l12 12M18 6L6 18" />}
        {state === 'empty' && <path d="M12 8v5M12 16.5v.5" />}
      </svg>
    </div>
  );
};

export const Hero: React.FC<{
  journey: Journey;
  verification: Verification;
  tamperedNote?: boolean;
  checkedLabel?: string;
}> = ({ journey, verification, checkedLabel }) => {
  const { t, bi, lang } = useT();
  const m = MATERIALS[journey.material];
  const state = sealState(journey, verification);
  const f = journey.facts;
  const records = verification.recordCount;

  const label =
    state === 'ok'
      ? { head: t('VERIFIED', 'যাচাইকৃত'), Icon: Check }
      : state === 'broken'
        ? { head: t('BROKEN', 'ভাঙা'), Icon: X }
        : { head: t('NOT YET SEALED', 'এখনো সিল হয়নি'), Icon: ShieldQuestion };
  const sub =
    state === 'ok'
      ? t(`Chain intact · ${records} records · sealed with SHA-256`, `চেইন অক্ষত · ${records}টি রেকর্ড · SHA-256 দিয়ে সিল করা`)
      : state === 'broken'
        ? t(`Chain broken at record ${(verification.brokenRecord ?? 0) + 1} of ${records}`, `${records}টির মধ্যে ${(verification.brokenRecord ?? 0) + 1} নম্বর রেকর্ডে চেইন ভেঙেছে`)
        : t('No individually sealed records for this lot yet', 'এই লটের জন্য এখনো আলাদা সিল করা রেকর্ড নেই');

  const toneText = state === 'ok' ? 'text-[#124B3A]' : state === 'broken' ? 'text-[#B42318]' : 'text-[#5B6B66]';

  return (
    <section aria-labelledby="vf-title" className="space-y-6">
      <div className="flex items-start gap-3">
        <span className="grid place-items-center w-12 h-12 rounded-2xl shrink-0" style={{ background: m.tint }}>
          <MaterialGlyph material={journey.material} size={26} />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#5B6B66]">{t('Scan the bottle', 'বোতল স্ক্যান করুন')}</p>
          <h1 id="vf-title" className="font-display text-[2rem] leading-[1.05] sm:text-[2.6rem] font-bold text-[#172521] tracking-tight">
            {t("This bag's journey", 'এই ব্যাগের যাত্রা')}
          </h1>
        </div>
      </div>

      <div
        role="status"
        aria-live="polite"
        className={`flex items-center gap-4 rounded-3xl border p-4 sm:p-5 ${
          state === 'ok' ? 'bg-white border-[#124B3A]/20' : state === 'broken' ? 'bg-[#FFF5F3] border-[#B42318]/40' : 'bg-white border-[#172521]/15'
        }`}
      >
        <SealMark state={state} />
        <div className="min-w-0">
          <p className={`font-display text-2xl sm:text-3xl font-extrabold tracking-wide inline-flex items-center gap-2 ${toneText}`}>
            <label.Icon className="w-6 h-6" aria-hidden="true" strokeWidth={3} />
            {label.head}
          </p>
          <p className="text-sm text-[#172521]/80 mt-0.5 leading-snug">{sub}</p>
          {checkedLabel && <p className="text-xs text-[#5B6B66] mt-1">{checkedLabel}</p>}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
        <Fact label={t('Material', 'উপাদান')}>
          <span className="inline-flex items-center gap-1.5">
            <MaterialGlyph material={journey.material} size={14} />
            {lang === 'bn' ? m.bn : m.en}
          </span>
        </Fact>
        <Fact label={f.weightKind === 'hub' ? t('Weight confirmed', 'নিশ্চিত ওজন') : t('Weight at the door', 'দরজায় ওজন')}>
          {f.weightKg !== undefined ? (
            <>
              <span className="font-display text-xl font-bold">{fmtKg(f.weightKg)}</span>
              <span className="block text-xs text-[#5B6B66] font-normal">
                ≈ {relatableCount(journey.material, f.weightKg)} {lang === 'bn' ? m.itemBn : m.itemEn}
              </span>
            </>
          ) : (
            t('Not weighed yet', 'এখনো ওজন হয়নি')
          )}
        </Fact>
        <Fact label={t('Collected from', 'যেখান থেকে সংগ্রহ')}>{f.place}</Fact>
        <Fact label={t('Right now', 'এখন')}>
          <span>{bi(f.stage)}</span>
          {f.evidence && <EvidenceTag level={f.evidence} className="ml-2 align-middle" />}
        </Fact>
      </dl>
    </section>
  );
};

const Fact: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="border-t border-[#172521]/12 pt-2 min-w-0">
    <dt className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#5B6B66]">{label}</dt>
    <dd className="mt-0.5 font-medium text-[#172521] break-words">{children}</dd>
  </div>
);

export const EvidenceTag: React.FC<{ level: string; className?: string }> = ({ level, className = '' }) => (
  <span
    title={`Evidence level ${level}`}
    className={`inline-flex items-center gap-1 px-1.5 py-px rounded border border-[#124B3A]/25 bg-[#124B3A]/5 text-[10px] font-bold tracking-wider text-[#124B3A] ${className}`}
  >
    <Fingerprint className="w-3 h-3" aria-hidden="true" />
    {level}
  </span>
);

