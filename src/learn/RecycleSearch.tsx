import React, { useId, useMemo, useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import { MATERIALS, MaterialGlyph } from '../design/materials';
import { ITEMS, searchItems, type RecycleItem } from './items';

type Lang = 'en' | 'bn';

const pick = <T,>(lang: Lang, en: T, bn: T): T => (lang === 'bn' ? bn : en);

const POPULAR_IDS = [
  'pet-water-bottle',
  'chip-packet',
  'aluminium-can',
  'cardboard-delivery-box',
  'polythene-bag-clean',
  'pizza-box-greasy'
];
const POPULAR = POPULAR_IDS.map((id) => ITEMS.find((i) => i.id === id)).filter((i): i is RecycleItem => Boolean(i));

/** "Can I recycle this?" lookup. Yes/no is stated in text and icon, never colour alone. */
export default function RecycleSearch({ lang }: { lang: Lang }) {
  const [query, setQuery] = useState('');
  const inputId = useId();
  const resultsId = useId();
  const results = useMemo(() => searchItems(query), [query]);
  const isBlank = query.trim() === '';

  const countText = pick(
    lang,
    `${results.length} ${results.length === 1 ? 'match' : 'matches'}`,
    `${results.length.toLocaleString('bn-BD')}টি মিল পাওয়া গেছে`
  );

  return (
    <section className="cl-rise space-y-4" aria-label={pick(lang, 'Can I recycle this?', 'এটা কি রিসাইকেল করা যায়?')}>
      <div>
        <label htmlFor={inputId} className="block font-display text-xl font-bold text-[#172521]">
          {pick(lang, 'Can I recycle this?', 'এটা কি রিসাইকেল করা যায়?')}
        </label>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#53616D]" size={20} aria-hidden="true" />
          <input
            id={inputId}
            type="text"
            autoFocus
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={pick(lang, 'Try: bottle, chips, can', 'যেমন: বোতল, চিপস, ক্যান')}
            aria-controls={resultsId}
            className="h-14 w-full rounded-2xl border-2 border-[#124B3A]/20 bg-white pl-12 pr-14 text-lg text-[#172521] placeholder:text-[#53616D]/70 focus:border-[#124B3A] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#CBEA70]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label={pick(lang, 'Clear search', 'খোঁজ মুছুন')}
              className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-[#53616D] hover:bg-[#124B3A]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CBEA70]"
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {isBlank ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-[#53616D]">{pick(lang, 'Popular items', 'জনপ্রিয় জিনিসপত্র')}</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR.map((item) => {
              const label = pick(lang, item.en, item.bn);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setQuery(label)}
                  className="min-h-11 rounded-full border border-[#124B3A]/20 bg-white px-4 text-sm font-semibold text-[#124B3A] hover:bg-[#CBEA70]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#124B3A]"
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div id={resultsId} aria-live="polite" className="space-y-3">
          <p className="text-sm text-[#53616D]">{countText}</p>
          {results.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#124B3A]/30 bg-white p-5 text-center">
              <p className="font-display text-lg font-bold text-[#172521]">
                {pick(lang, 'We do not have this one yet.', 'এটি এখনও আমাদের তালিকায় নেই।')}
              </p>
              <p className="mt-1 text-sm text-[#53616D]">
                {pick(
                  lang,
                  'When in doubt, keep it out of the Clean Lane bag.',
                  'সন্দেহ হলে Clean Lane ব্যাগে না দিয়ে বাইরে রাখুন।'
                )}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {results.map((item) => (
                <ResultCard key={item.id} item={item} lang={lang} />
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

function ResultCard({ item, lang }: { item: RecycleItem; lang: Lang }) {
  const verdict = item.recyclable
    ? pick(lang, 'Yes — put it in your Clean Lane bag', 'হ্যাঁ — আপনার Clean Lane ব্যাগে দিন')
    : pick(lang, 'No — keep it out', 'না — বাইরে রাখুন');
  const tipLabel = pick(lang, 'Tip', 'টিপ');
  const mat = item.recyclable && item.material ? MATERIALS[item.material] : null;

  return (
    <li className="cl-rise rounded-3xl border border-[#EDE4D8] bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {mat && (
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl" style={{ background: mat.tint }}>
            <MaterialGlyph material={mat.id} size={24} />
          </span>
        )}
        <h3 className="min-w-0 pt-1 font-display text-lg font-bold leading-snug text-[#172521]">{pick(lang, item.en, item.bn)}</h3>
      </div>
      <p
        className={`mt-3 flex items-center gap-2 rounded-2xl px-3 py-2 font-bold ${
          item.recyclable ? 'bg-[#E1F5EC] text-[#0E5C40]' : 'bg-[#FDECEC] text-[#9B1C1C]'
        }`}
      >
        {item.recyclable ? <Check size={20} aria-hidden="true" /> : <X size={20} aria-hidden="true" />}
        <span>{verdict}</span>
      </p>
      <p className="mt-3 text-sm text-[#172521]">
        <span className="font-semibold">{tipLabel}: </span>
        {pick(lang, item.tipEn, item.tipBn)}
      </p>
    </li>
  );
}
