import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MaterialGlyph, MATERIALS } from '../../design/materials';
import type { MaterialCategory } from '../../types';
import { Camera, Check, ChevronRight, CloudOff, Minus, Plus, RefreshCw } from 'lucide-react';

export type Lang = 'en' | 'bn';
export const pick = (lang: Lang, en: string, bn: string) => (lang === 'en' ? en : bn);

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
export const fmtNum = (n: number | string, lang: Lang, digits?: number) => {
  const s = typeof n === 'number' ? (digits === undefined ? String(n) : n.toFixed(digits)) : n;
  return lang === 'bn' ? s.replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]) : s;
};

/** "09:00 AM - 11:30 AM (Today)" -> readable in both languages. */
export const windowText = (w: string, lang: Lang) => {
  const today = /\(today\)/i.test(w);
  const core = w.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  const date = /\(([^)]*)\)/.exec(w)?.[1];
  if (lang === 'en') return `${today ? 'Today · ' : date ? `${date} · ` : ''}${core}`;
  const bn = core.replace(/AM/gi, 'সকাল').replace(/PM/gi, 'বিকাল');
  return `${today ? 'আজ · ' : date ? `${date} · ` : ''}${fmtNum(bn, 'bn')}`;
};

/* ------------------------------------------------------------------ */
/* Theme: normal and "sun mode" (black on white, thick borders, larger text) */
/* ------------------------------------------------------------------ */
export const COLLECTOR_CSS = `
.cf-root{--ink:#124B3A;--bg:#FAF9F5;--card:#fff;--line:rgba(18,75,58,.16);--muted:rgba(18,75,58,.68);--prim:#124B3A;--prim-fg:#fff;--acc:#CBEA70;--soft:#EEF5E4;--bw:1px;--warn-bg:#FFF4DD;--warn-fg:#6B4A00;--calm-bg:#E8F0F5;--calm-fg:#25345C;font-size:16px;color:var(--ink);font-family:inherit}
.cf-root[data-sun="1"]{--ink:#000;--bg:#fff;--card:#fff;--line:#000;--muted:#000;--prim:#000;--prim-fg:#fff;--acc:#fff;--soft:#fff;--bw:3px;--warn-bg:#fff;--warn-fg:#000;--calm-bg:#fff;--calm-fg:#000;font-size:18px;background:#fff}
.cf-card{background:var(--card);border:var(--bw) solid var(--line);border-radius:28px}
.cf-soft{background:var(--soft);border:var(--bw) solid var(--line);border-radius:18px}
.cf-muted{color:var(--muted)}
.cf-btn{display:flex;align-items:center;justify-content:center;gap:.5em;min-height:56px;padding:0 1.25em;border-radius:18px;font-weight:800;background:var(--card);color:var(--ink);border:max(var(--bw),2px) solid var(--line);cursor:pointer;touch-action:manipulation;transition:transform .12s}
.cf-btn:active{transform:scale(.98)}
.cf-btn-primary{background:var(--prim);color:var(--prim-fg);border-color:var(--prim)}
.cf-btn[disabled]{opacity:.4;cursor:not-allowed}
.cf-root :focus-visible,.cf-sheet :focus-visible{outline:4px solid #2152C4;outline-offset:2px}
.cf-root[data-sun="1"] :focus-visible,.cf-root[data-sun="1"] .cf-sheet :focus-visible{outline-color:#000;outline-width:5px}
.cf-calm{background:var(--calm-bg);color:var(--calm-fg);border:var(--bw) solid color-mix(in srgb,var(--calm-fg) 22%,transparent);border-radius:20px}
.cf-root[data-sun="1"] .cf-calm{border-color:#000}
.cf-track{position:relative;height:64px;border-radius:32px;background:var(--prim);color:var(--prim-fg);overflow:hidden;user-select:none;-webkit-user-select:none;border:var(--bw) solid var(--prim)}
.cf-root[data-sun="1"] .cf-track{border:3px solid #000}
.cf-thumb{position:absolute;left:4px;top:4px;width:56px;height:56px;border-radius:50%;background:var(--card);color:var(--ink);display:grid;place-items:center;touch-action:none;cursor:grab;box-shadow:0 2px 8px rgba(0,0,0,.25)}
.cf-thumb:active{cursor:grabbing}
.cf-root[data-sun="1"] .cf-thumb{border:3px solid #000;background:#fff;color:#000}
.cf-root[data-sun="1"] .cf-track .cf-fill{background:#fff;opacity:.3}
.cf-sheet-bg{position:fixed;inset:0;z-index:70;display:flex;align-items:flex-end;background:rgba(0,0,0,.5)}
.cf-sheet{width:100%;max-width:520px;margin:0 auto;max-height:100dvh;overflow-y:auto;background:var(--bg);color:var(--ink);border-radius:32px 32px 0 0;padding:12px 16px 20px;animation:cf-slide .28s cubic-bezier(.2,.8,.2,1) both}
.cf-root[data-sun="1"] .cf-sheet{border-top:4px solid #000}
.cf-key{display:grid;place-items:center;height:60px;border-radius:18px;background:var(--card);border:max(var(--bw),1px) solid var(--line);font-size:1.75em;font-weight:800;cursor:pointer;touch-action:manipulation;color:var(--ink)}
.cf-key:active{background:var(--acc);transform:scale(.97)}
.cf-root[data-sun="1"] .cf-key:active{background:#000;color:#fff}
.cf-chip{display:inline-flex;align-items:center;gap:.5em;border-radius:999px;padding:.5em .9em .5em .6em;font-weight:800;font-size:1em;background:var(--soft);border:var(--bw) solid var(--line)}
.cf-switch{width:56px;height:32px;border-radius:999px;border:max(var(--bw),2px) solid var(--line);background:var(--card);position:relative;flex:none;cursor:pointer}
.cf-switch::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:var(--ink);transition:transform .18s}
.cf-switch[aria-checked="true"]{background:var(--prim)}
.cf-switch[aria-checked="true"]::after{transform:translateX(24px);background:var(--prim-fg)}
@keyframes cf-slide{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}
@keyframes cf-nudge{0%,100%{transform:translateX(0)}50%{transform:translateX(10px)}}
.cf-nudge{animation:cf-nudge 1.8s ease-in-out infinite}
html[data-cf-sun="1"] [role="dialog"]{background:#fff!important;color:#000!important;border:4px solid #000!important}
html[data-cf-sun="1"] [role="dialog"] [class*="text-slate"],html[data-cf-sun="1"] [role="dialog"] [class*="text-emerald"]{color:#000!important}
html[data-cf-sun="1"] [role="dialog"] [class*="border-slate"],html[data-cf-sun="1"] [role="dialog"] [class*="border-emerald"]{border-color:#000!important;border-width:2px!important}
html[data-cf-sun="1"] [role="dialog"] [class*="bg-slate-"],html[data-cf-sun="1"] [role="dialog"] [class*="bg-emerald-"],html[data-cf-sun="1"] [role="dialog"] [class*="bg-amber-"]{background:#fff!important}
html[data-cf-sun="1"] [role="dialog"] button[class*="bg-emerald-7"],html[data-cf-sun="1"] [role="dialog"] button[class*="bg-slate-9"],html[data-cf-sun="1"] [role="dialog"] button[class*="bg-\\[#25345C\\]"]{background:#000!important;color:#fff!important}
`;

const SUN_KEY = 'cleanlane.collector.sun';
export const useSunMode = () => {
  const [sun, setSun] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SUN_KEY) === '1';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(SUN_KEY, sun ? '1' : '0');
    } catch {
      /* private mode: fine, just not remembered */
    }
    // Portalled dialogs live outside the collector root, so mirror the flag on <html>.
    if (sun) document.documentElement.setAttribute('data-cf-sun', '1');
    else document.documentElement.removeAttribute('data-cf-sun');
    return () => document.documentElement.removeAttribute('data-cf-sun');
  }, [sun]);
  return [sun, setSun] as const;
};

/* ------------------------------------------------------------------ */
/* Swipe-to-complete: drag the thumb across; a real button does the same */
/* ------------------------------------------------------------------ */
export const SwipeToComplete: React.FC<{
  label: string;
  altLabel: string;
  onComplete: () => void;
  lang: Lang;
  hint?: boolean;
}> = ({ label, altLabel, onComplete, lang, hint = true }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [max, setMax] = useState(200);
  const [drag, setDrag] = useState(false);
  const [done, setDone] = useState(false);
  const start = useRef(0);

  useLayoutEffect(() => {
    const measure = () => trackRef.current && setMax(Math.max(60, trackRef.current.clientWidth - 64));
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const finish = useCallback(() => {
    setDone(true);
    setX(max);
    window.setTimeout(onComplete, 140);
  }, [max, onComplete]);

  const onDown = (e: React.PointerEvent) => {
    if (done) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    start.current = e.clientX - x;
    setDrag(true);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag || done) return;
    setX(Math.min(max, Math.max(0, e.clientX - start.current)));
  };
  const onUp = () => {
    if (!drag) return;
    setDrag(false);
    if (x >= max * 0.82) finish();
    else setX(0);
  };

  const pct = max ? x / max : 0;
  return (
    <div>
      <div ref={trackRef} className="cf-track" aria-hidden="true" data-testid="swipe-track">
        <div className="cf-fill absolute inset-y-0 left-0 bg-white/25" style={{ width: x + 60, transition: drag ? 'none' : 'width .25s' }} />
        <span
          className="absolute inset-0 flex items-center justify-center pl-16 pr-4 text-center text-[1.05em] font-extrabold leading-tight"
          style={{ opacity: 1 - pct * 1.3 }}
        >
          {label}
        </span>
        <div
          data-testid="swipe-thumb"
          className={`cf-thumb ${!drag && !done && hint ? 'cf-nudge' : ''}`}
          style={{ transform: `translateX(${x}px)`, transition: drag ? 'none' : 'transform .25s cubic-bezier(.2,.8,.2,1)', animationPlayState: drag ? 'paused' : 'running' }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          {done ? <Check size={28} strokeWidth={3} /> : <ChevronRight size={30} strokeWidth={3} />}
        </div>
      </div>
      <button type="button" onClick={finish} className="cf-btn mt-2 w-full !min-h-[48px] !text-[.95em]" data-testid="swipe-alt">
        <span className="cf-muted font-semibold">{pick(lang, 'Or tap:', 'অথবা ট্যাপ করুন:')}</span> {altLabel}
      </button>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Bottom sheet                                                         */
/* ------------------------------------------------------------------ */
export const Sheet: React.FC<{ label: string; onClose: () => void; children: React.ReactNode }> = ({ label, onClose, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const lock = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = lock;
      prev?.focus?.();
    };
  }, []);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Tab' && ref.current) {
      const f = Array.from(ref.current.querySelectorAll<HTMLElement>('button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'));
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus());
      else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus());
    }
  };
  return (
    <div className="cf-sheet-bg" onClick={onClose}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={label} className="cf-sheet outline-none" onClick={(e) => e.stopPropagation()} onKeyDown={onKey}>
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full" style={{ background: 'var(--line)' }} aria-hidden="true" />
        {children}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Big numeric keypad for the doorstep weight (pattern of live WeighSheet) */
/* ------------------------------------------------------------------ */
const PRESETS = [2, 5, 8, 12];
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'] as const;

export interface WeighResult {
  kg: number;
  material: MaterialCategory;
  bags: number;
  partial: boolean;
  note: string;
  photo: boolean;
  basis: 'field_scale' | 'estimate' | 'not_measured';
}

export const WeighPad: React.FC<{
  lang: Lang;
  who: string;
  materials: MaterialCategory[];
  offline: boolean;
  tag: string;
  onTag: (v: string) => void;
  onScan: () => void;
  onCancel: () => void;
  onConfirm: (r: WeighResult) => void;
}> = ({ lang, who, materials, offline, tag, onTag, onScan, onCancel, onConfirm }) => {
  const [text, setText] = useState('');
  const [material, setMaterial] = useState<MaterialCategory>(materials[0] ?? 'PET_BOTTLES');
  const [bags, setBags] = useState(2);
  const [more, setMore] = useState(false);
  const [partial, setPartial] = useState(false);
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState(true);
  const [basis, setBasis] = useState<WeighResult['basis']>('field_scale');
  const kg = text === '' || text === '.' ? 0 : Number(text);
  const valid = kg > 0 && kg <= 200 && (!partial || note.trim().length > 0);

  const press = (k: string) =>
    setText((t) => {
      if (k === 'del') return t.slice(0, -1);
      if (k === '.') return t.includes('.') ? t : (t || '0') + '.';
      if (t.includes('.') && t.split('.')[1].length >= 1) return t;
      if (!t.includes('.') && t.length >= 3) return t;
      return t === '0' ? k : t + k;
    });

  const onKeyDown = (e: React.KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (/^[0-9.]$/.test(e.key)) press(e.key);
    else if (e.key === 'Backspace') press('del');
  };

  const submit = () => valid && onConfirm({ kg, material, bags, partial, note, photo, basis });
  const kgText = kg % 1 ? kg.toFixed(1) : String(kg);
  const pool = materials.length ? materials : (['PET_BOTTLES'] as MaterialCategory[]);

  return (
    <Sheet label={pick(lang, `Weigh the bag at ${who}`, `${who} — ব্যাগ ওজন করুন`)} onClose={onCancel}>
      <div onKeyDown={onKeyDown}>
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-[1.05em] font-extrabold">{pick(lang, 'Weigh', 'ওজন')} · {who}</p>
          <button type="button" onClick={onCancel} className="h-12 shrink-0 rounded-full px-4 font-bold cf-muted">{pick(lang, 'Cancel', 'বাতিল')}</button>
        </div>

        <output aria-live="polite" className="my-1 block text-center font-display text-[64px] font-extrabold leading-none" data-testid="weigh-display">
          {text === '' ? <span style={{ opacity: 0.25 }}>0</span> : fmtNum(text, lang)}
          <span className="ml-2 text-2xl cf-muted">{pick(lang, 'kg', 'কেজি')}</span>
        </output>

        <div className="my-2 grid grid-cols-4 gap-2" role="group" aria-label={pick(lang, 'Quick weights', 'দ্রুত ওজন')}>
          {PRESETS.map((p) => (
            <button key={p} type="button" onClick={() => setText(String(p))} className="cf-chip !justify-center !rounded-2xl !py-3 !pl-2 !pr-2 active:scale-95">
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
              className="cf-key"
              aria-label={k === 'del' ? pick(lang, 'Backspace', 'মুছুন') : k === '.' ? pick(lang, 'Decimal point', 'দশমিক') : k}
            >
              {k === 'del' ? (
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 5H9l-6 7 6 7h12Z" />
                  <path d="m13 9 6 6m0-6-6 6" />
                </svg>
              ) : (
                fmtNum(k, lang)
              )}
            </button>
          ))}
        </div>

        <fieldset className="mt-3">
          <legend className="mb-1 text-[.85em] font-bold cf-muted">{pick(lang, 'What is in the bag?', 'ব্যাগে কী আছে?')}</legend>
          <div className="flex flex-wrap gap-2">
            {pool.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={material === m}
                onClick={() => setMaterial(m)}
                className="cf-chip !min-h-[48px]"
                style={material === m ? { background: 'var(--prim)', color: 'var(--prim-fg)', borderColor: 'var(--prim)' } : undefined}
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white"><MaterialGlyph material={m} size={20} /></span>
                {pick(lang, MATERIALS[m].en, MATERIALS[m].bn)}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="font-bold">{pick(lang, 'Bags', 'ব্যাগ')}</span>
          <div className="flex items-center gap-2">
            <button type="button" className="cf-btn !min-h-[48px] !w-12 !px-0" aria-label={pick(lang, 'Fewer bags', 'ব্যাগ কমান')} onClick={() => setBags((b) => Math.max(1, b - 1))}><Minus size={20} /></button>
            <span className="w-8 text-center text-xl font-extrabold" aria-live="polite">{fmtNum(bags, lang)}</span>
            <button type="button" className="cf-btn !min-h-[48px] !w-12 !px-0" aria-label={pick(lang, 'More bags', 'ব্যাগ বাড়ান')} onClick={() => setBags((b) => Math.min(20, b + 1))}><Plus size={20} /></button>
          </div>
        </div>

        <button type="button" onClick={() => setMore((v) => !v)} aria-expanded={more} className="mt-2 flex h-12 w-full items-center justify-between rounded-xl px-1 text-[.95em] font-bold cf-muted">
          <span>{pick(lang, 'More: partial pickup, photo, bag tag', 'আরও: আংশিক পিকআপ, ছবি, ব্যাগ ট্যাগ')}</span>
          <ChevronRight size={18} style={{ transform: more ? 'rotate(90deg)' : undefined }} aria-hidden="true" />
        </button>
        {more && (
          <div className="cf-soft space-y-3 p-3">
            <div className="flex items-center justify-between gap-3">
              <span id="cf-photo-l" className="font-semibold">{pick(lang, 'Photo taken', 'ছবি তোলা হয়েছে')}</span>
              <button type="button" role="switch" aria-checked={photo} aria-labelledby="cf-photo-l" className="cf-switch" onClick={() => setPhoto((v) => !v)} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span id="cf-partial-l" className="font-semibold">{pick(lang, 'Only part of it was collected', 'কিছু অংশ নেওয়া হয়নি')}</span>
              <button type="button" role="switch" aria-checked={partial} aria-labelledby="cf-partial-l" className="cf-switch" onClick={() => setPartial((v) => !v)} />
            </div>
            {partial && (
              <div>
                <label htmlFor="cf-note" className="mb-1 block text-[.85em] font-bold">{pick(lang, 'What was left behind, and why?', 'কী রেখে এলেন, কেন?')}</label>
                <input id="cf-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder={pick(lang, 'e.g. wet cartons left behind', 'যেমন: ভেজা কার্টন রেখে এসেছি')} className="h-12 w-full rounded-xl border-2 bg-white px-3 text-black" style={{ borderColor: 'var(--line)' }} />
              </div>
            )}
            <div>
              <label htmlFor="cf-basis" className="mb-1 block text-[.85em] font-bold">{pick(lang, 'How was it weighed?', 'কীভাবে ওজন হলো?')}</label>
              <select id="cf-basis" value={basis} onChange={(e) => setBasis(e.target.value as WeighResult['basis'])} className="h-12 w-full rounded-xl border-2 bg-white px-3 text-black" style={{ borderColor: 'var(--line)' }}>
                <option value="field_scale">{pick(lang, 'Portable scale', 'বহনযোগ্য স্কেল')}</option>
                <option value="estimate">{pick(lang, 'Estimate by eye (not confirmed)', 'আন্দাজে (নিশ্চিত নয়)')}</option>
                <option value="not_measured">{pick(lang, 'Not weighed here', 'এখানে ওজন হয়নি')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="cf-tag" className="mb-1 block text-[.85em] font-bold">{pick(lang, 'Bag tag', 'ব্যাগ ট্যাগ')}</label>
              <div className="flex gap-2">
                <input id="cf-tag" value={tag} onChange={(e) => onTag(e.target.value)} className="h-12 min-w-0 flex-1 rounded-xl border-2 bg-white px-3 font-mono text-black" style={{ borderColor: 'var(--line)' }} />
                <button type="button" onClick={onScan} className="cf-btn !min-h-[48px]" aria-label={pick(lang, 'Scan the bag tag with the camera', 'ক্যামেরায় ব্যাগ ট্যাগ স্ক্যান করুন')}><Camera size={20} aria-hidden="true" /></button>
              </div>
            </div>
          </div>
        )}

        <button type="button" disabled={!valid} onClick={submit} className="cf-btn cf-btn-primary mt-3 !min-h-[64px] w-full !text-[1.1em]" data-testid="weigh-confirm">
          {valid
            ? offline
              ? pick(lang, `Save ${kgText} kg on phone`, `${fmtNum(kgText, lang)} কেজি ফোনে সংরক্ষণ`)
              : pick(lang, `Confirm ${kgText} kg`, `${fmtNum(kgText, lang)} কেজি নিশ্চিত করুন`)
            : partial && kg > 0
            ? pick(lang, 'Add a note', 'একটি নোট লিখুন')
            : pick(lang, 'Enter the weight', 'ওজন লিখুন')}
        </button>
      </div>
    </Sheet>
  );
};

/* ------------------------------------------------------------------ */
/* Calm sync state                                                      */
/* ------------------------------------------------------------------ */
export const SyncBanner: React.FC<{ lang: Lang; offline: boolean; queued: number; onSync: () => void }> = ({ lang, offline, queued, onSync }) => {
  if (!offline && queued === 0) {
    return (
      <p role="status" className="flex items-center gap-2 px-1 text-[.9em] font-semibold cf-muted">
        <Check size={16} aria-hidden="true" /> {pick(lang, 'Everything is saved and synced', 'সবকিছু সংরক্ষিত ও সিঙ্ক হয়েছে')}
      </p>
    );
  }
  return (
    <div role="status" className="cf-calm flex flex-wrap items-center gap-3 p-3.5" data-testid="sync-banner">
      <CloudOff size={24} aria-hidden="true" className="shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-extrabold leading-snug">
          {offline ? pick(lang, 'Saved on phone — will sync', 'ফোনে সংরক্ষিত — পরে সিঙ্ক হবে') : pick(lang, 'Waiting to sync', 'সিঙ্কের অপেক্ষায়')}
        </p>
        <p className="text-[.88em] opacity-80">
          {queued > 0
            ? pick(lang, `${queued} pickup${queued > 1 ? 's' : ''} safe on this phone.`, `${fmtNum(queued, lang)}টি পিকআপ এই ফোনে নিরাপদ।`)
            : pick(lang, 'No signal needed. Keep working.', 'সিগন্যাল লাগবে না। কাজ চালিয়ে যান।')}
        </p>
      </div>
      <button type="button" onClick={onSync} className="cf-btn !min-h-[48px] shrink-0 !text-[.9em]">
        <RefreshCw size={16} aria-hidden="true" /> {offline ? pick(lang, "I'm online — sync", 'অনলাইন — সিঙ্ক করুন') : pick(lang, 'Sync now', 'এখনই সিঙ্ক')}
      </button>
    </div>
  );
};
