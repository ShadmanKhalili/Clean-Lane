import React, { useEffect, useState } from 'react';

export type Lang = 'en' | 'bn';

export const BRAND = '#124B3A';
export const LIME = '#CBEA70';
export const PAPER = '#FAF9F5';

/** Pick the right string for the current language. */
export const pick = <T,>(lang: Lang, en: T, bn: T): T => (lang === 'bn' ? bn : en);

export const fmtNum = (n: number, lang: Lang, digits = 0) =>
  n.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits });

export const fmtTime = (iso: string | undefined, lang: Lang) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
};

export const readStore = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};
export const writeStore = (key: string, value: string | null) => {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable: the screen still works for this session */
  }
};

/** Keyframes shared by both phone screens. Reduced motion is handled globally in index.css. */
export const PhoneStyles: React.FC = () => (
  <style>{`
    @keyframes cl-ring { 0% { transform: scale(1); opacity: .55 } 100% { transform: scale(2.3); opacity: 0 } }
    @keyframes cl-pop { 0% { transform: scale(.6); opacity: 0 } 60% { transform: scale(1.08); opacity: 1 } 100% { transform: scale(1) } }
    @keyframes cl-rise { 0% { transform: translateY(10px); opacity: 0 } 100% { transform: none; opacity: 1 } }
    @keyframes cl-trike { 0% { transform: translateX(-8%) } 50% { transform: translateX(62%) } 100% { transform: translateX(-8%) } }
    @keyframes cl-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-2px) } }
    @keyframes cl-spin { to { transform: rotate(360deg) } }
    @keyframes cl-flash { 0% { box-shadow: 0 0 0 0 rgba(18,75,58,.35) } 100% { box-shadow: 0 0 0 14px rgba(18,75,58,0) } }
    @keyframes cl-confetti {
      0% { transform: translate(0,0) rotate(0) scale(.4); opacity: 0 }
      10% { opacity: 1 } 70% { opacity: 1 }
      100% { transform: translate(var(--dx), var(--dy)) rotate(var(--rot)) scale(1); opacity: 0 }
    }
    @keyframes cl-slide { from { transform: translateY(100%) } to { transform: none } }
    .cl-rise { animation: cl-rise .45s cubic-bezier(.2,.8,.2,1) both }
    .cl-pop { animation: cl-pop .5s cubic-bezier(.2,.9,.3,1.2) both }
  `}</style>
);

export { Confetti } from '../../../design/Celebrate';

export const LangToggle: React.FC<{ lang: Lang; setLang: (l: Lang) => void; dark?: boolean }> = ({ lang, setLang, dark }) => (
  <div
    role="group"
    aria-label={pick(lang, 'Language', 'ভাষা')}
    className={`flex rounded-full p-1 ${dark ? 'bg-white/15' : 'bg-[#124B3A]/10'}`}
  >
    {(['en', 'bn'] as const).map((l) => (
      <button
        key={l}
        type="button"
        onClick={() => setLang(l)}
        aria-pressed={lang === l}
        lang={l}
        className={`h-10 min-w-12 rounded-full px-3 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CBEA70] ${
          lang === l ? (dark ? 'bg-[#CBEA70] text-[#124B3A]' : 'bg-[#124B3A] text-white') : dark ? 'text-white/80' : 'text-[#124B3A]'
        }`}
      >
        {l === 'en' ? 'EN' : 'বাংলা'}
      </button>
    ))}
  </div>
);

export const ConnectionBanner: React.FC<{ connected: boolean; error: string | null; lang: Lang }> = ({ connected, error, lang }) => {
  // Don't flash "reconnecting" during the first moments of a page load.
  const [grace, setGrace] = useState(true);
  useEffect(() => {
    const id = window.setTimeout(() => setGrace(false), 2500);
    return () => window.clearTimeout(id);
  }, []);
  if (error) {
    return (
      <div role="alert" className="mx-4 mb-2 rounded-2xl bg-[#FDECEC] px-4 py-3 text-sm font-semibold text-[#9B1C1C]">
        {pick(lang, 'Something went wrong connecting. Your booking is safe, we will retry.', 'সংযোগে সমস্যা হচ্ছে। আপনার বুকিং নিরাপদ আছে, আমরা আবার চেষ্টা করছি।')}
      </div>
    );
  }
  if (connected || grace) return null;
  return (
    <div role="status" className="mx-4 mb-2 flex items-center gap-2 rounded-2xl bg-[#FFF3D6] px-4 py-3 text-sm font-semibold text-[#7A5200]">
      <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#7A5200]/30 border-t-[#7A5200]" aria-hidden="true" />
      {pick(lang, 'Reconnecting…', 'আবার সংযোগ হচ্ছে…')}
    </div>
  );
};

export const Logo: React.FC<{ dark?: boolean }> = ({ dark }) => (
  <div className="flex items-center gap-2">
    <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: dark ? LIME : BRAND }} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={dark ? BRAND : LIME} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 13c0-5 4-8 14-8 0 9-3 14-9 14-3 0-5-2-5-6Z" />
        <path d="M5 19c2-5 5-8 9-10" />
      </svg>
    </span>
    <span className={`font-display text-lg font-extrabold tracking-tight ${dark ? 'text-white' : 'text-[#124B3A]'}`}>Clean Lane</span>
  </div>
);
