import React, { useEffect, useRef, useState } from 'react';
import { fmtNum, pick, type Lang } from './shared';

const PRESETS = [2, 5, 8, 12];
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'] as const;

/** Bottom sheet with a big numeric keypad for the doorstep weight. */
export const WeighSheet: React.FC<{ lang: Lang; who: string; onCancel: () => void; onConfirm: (kg: number) => Promise<void> }> = ({ lang, who, onCancel, onConfirm }) => {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const kg = text === '' || text === '.' ? 0 : Number(text);
  const valid = kg > 0 && kg <= 200;

  const press = (k: string) =>
    setText((t) => {
      if (k === 'del') return t.slice(0, -1);
      if (k === '.') return t.includes('.') ? t : (t || '0') + '.';
      if (t.includes('.') && t.split('.')[1].length >= 1) return t;
      if (!t.includes('.') && t.replace('.', '').length >= 3) return t;
      return t === '0' ? k : t + k;
    });

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const confirm = async () => {
    if (!valid || busy) return;
    setBusy(true);
    try {
      await onConfirm(kg);
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onCancel();
    else if (/^[0-9.]$/.test(e.key)) press(e.key);
    else if (e.key === 'Backspace') press('del');
    else if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'BUTTON') void confirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/45" onClick={onCancel}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={pick(lang, `Weigh the bag for ${who}`, `${who}-এর ব্যাগ ওজন করুন`)}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
        className="mx-auto w-full max-w-[480px] rounded-t-[32px] bg-[#FAF9F5] px-4 pb-6 pt-3 shadow-2xl outline-none"
        style={{ animation: 'cl-slide .28s cubic-bezier(.2,.8,.2,1) both' }}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[#124B3A]/20" aria-hidden="true" />
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-bold text-[#124B3A]">{pick(lang, `Weigh · ${who}`, `ওজন · ${who}`)}</p>
          <button type="button" onClick={onCancel} className="h-12 rounded-full px-4 text-sm font-bold text-[#124B3A]/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#124B3A]">
            {pick(lang, 'Cancel', 'বাতিল')}
          </button>
        </div>
        <output aria-live="polite" className="my-1 block text-center font-display text-[64px] font-extrabold leading-none text-[#124B3A]">
          {text === '' ? <span className="text-[#124B3A]/25">0</span> : text}
          <span className="ml-2 text-2xl text-[#124B3A]/60">{pick(lang, 'kg', 'কেজি')}</span>
        </output>
        <div className="my-3 grid grid-cols-4 gap-2" role="group" aria-label={pick(lang, 'Quick weights', 'দ্রুত ওজন')}>
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setText(String(p))}
              className="h-12 rounded-full bg-[#CBEA70]/60 text-[15px] font-bold text-[#124B3A] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#124B3A]"
            >
              {fmtNum(p, lang)} {pick(lang, 'kg', 'কেজি')}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {KEYS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              aria-label={k === 'del' ? pick(lang, 'Backspace', 'মুছুন') : k === '.' ? pick(lang, 'Decimal point', 'দশমিক') : k}
              className="grid h-14 place-items-center rounded-2xl bg-white text-2xl font-bold text-[#124B3A] shadow-sm ring-1 ring-[#124B3A]/10 active:scale-95 active:bg-[#CBEA70]/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#124B3A]"
            >
              {k === 'del' ? (
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 5H9l-6 7 6 7h12Z" />
                  <path d="m13 9 6 6m0-6-6 6" />
                </svg>
              ) : (
                k
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={!valid || busy}
          onClick={confirm}
          className="mt-3 flex h-16 w-full items-center justify-center rounded-2xl bg-[#124B3A] text-lg font-extrabold text-white disabled:opacity-40 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#CBEA70]"
        >
          {busy ? '…' : valid ? pick(lang, `Confirm ${fmtNum(kg, lang, kg % 1 ? 1 : 0)} kg`, `${fmtNum(kg, lang, kg % 1 ? 1 : 0)} কেজি নিশ্চিত করুন`) : pick(lang, 'Enter the weight', 'ওজন লিখুন')}
        </button>
      </div>
    </div>
  );
};
