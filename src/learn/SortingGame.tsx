import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Package, X } from 'lucide-react';
import { Confetti } from '../design/Celebrate';
import { MaterialGlyph } from '../design/materials';
import { pickRound, type RecycleItem } from './items';

type Lang = 'en' | 'bn';
type Phase = 'play' | 'feedback' | 'done';

const ROUND = 10;
const PASS_SCORE = 8;
const SWIPE_PX = 90;
const ADVANCE_MS = 2600;

const pick = <T,>(lang: Lang, en: T, bn: T): T => (lang === 'bn' ? bn : en);
const num = (n: number, lang: Lang) => n.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US');

/** One-minute sorting game: swipe, tap, or use arrow keys to sort 10 everyday items. */
export default function SortingGame({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const [deck, setDeck] = useState<RecycleItem[]>(() => pickRound(ROUND));
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('play');
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [choice, setChoice] = useState<boolean | null>(null);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<number | null>(null);
  const item = deck[index];

  const answer = useCallback(
    (recyclable: boolean) => {
      if (phase !== 'play' || !item) return;
      const correct = recyclable === item.recyclable;
      setChoice(recyclable);
      setAnswers((prev) => [...prev, correct]);
      setDragX(0);
      setPhase('feedback');
    },
    [phase, item]
  );

  const next = useCallback(() => {
    if (phase !== 'feedback') return;
    if (index + 1 >= deck.length) {
      setPhase('done');
    } else {
      setIndex((i) => i + 1);
      setChoice(null);
      setPhase('play');
    }
  }, [phase, index, deck.length]);

  // Auto-advance after feedback; the Next button also works. Cleanup cancels the timer.
  useEffect(() => {
    if (phase !== 'feedback') return;
    const id = window.setTimeout(next, ADVANCE_MS);
    return () => window.clearTimeout(id);
  }, [phase, next]);

  // Arrow keys: right = recyclable, left = not recyclable.
  useEffect(() => {
    if (phase !== 'play') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        answer(true);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        answer(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, answer]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (phase !== 'play') return;
    dragStart.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return;
    setDragX(e.clientX - dragStart.current);
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    if (dragStart.current === null) return;
    const dx = cancelled ? 0 : e.clientX - dragStart.current;
    dragStart.current = null;
    setDragging(false);
    if (dx > SWIPE_PX) answer(true);
    else if (dx < -SWIPE_PX) answer(false);
    else setDragX(0);
  };

  const restart = () => {
    setDeck(pickRound(ROUND));
    setIndex(0);
    setAnswers([]);
    setChoice(null);
    setDragX(0);
    setPhase('play');
  };

  const score = answers.filter(Boolean).length;

  if (phase === 'done') {
    const pass = score >= PASS_SCORE;
    return (
      <div className="relative overflow-hidden rounded-3xl bg-white p-6 text-center shadow-sm cl-pop">
        {pass && <Confetti count={36} top="30%" />}
        <p className="text-sm font-semibold uppercase tracking-wide text-[#53616D]">{pick(lang, 'Your score', 'আপনার স্কোর')}</p>
        <p className="mt-2 font-display text-5xl font-extrabold text-[#124B3A]">
          {num(score, lang)} / {num(ROUND, lang)}
        </p>
        <p className="mx-auto mt-4 max-w-xs text-lg font-semibold text-[#172521]">
          {pass
            ? pick(lang, 'You would fill a perfect Clean Lane bag', 'আপনি একদম পারফেক্ট Clean Lane ব্যাগ ভরে ফেলতেন')
            : pick(lang, 'Good start. Read the tips and play again.', 'ভালো শুরু। টিপসগুলো পড়ে আবার খেলুন।')}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={restart}
            className="h-14 rounded-2xl border-2 border-[#124B3A] bg-white font-bold text-[#124B3A] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#CBEA70]"
          >
            {pick(lang, 'Play again', 'আবার খেলুন')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-14 rounded-2xl bg-[#124B3A] font-bold text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-[#CBEA70]"
          >
            {pick(lang, 'Done', 'শেষ')}
          </button>
        </div>
      </div>
    );
  }

  if (!item) return null;

  const cardTransform =
    phase === 'play'
      ? `translateX(${dragX}px) rotate(${dragX / 18}deg)`
      : `translateX(${choice ? 520 : -520}px) rotate(${choice ? 25 : -25}deg)`;
  const correct = choice !== null && choice === item.recyclable;
  const rightHint = Math.max(0, Math.min(1, dragX / SWIPE_PX));
  const leftHint = Math.max(0, Math.min(1, -dragX / SWIPE_PX));
  const isLast = index + 1 === deck.length;

  return (
    <div className="relative space-y-5 overflow-hidden">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-[#124B3A]" aria-live="off">
          {pick(lang, `Item ${num(index + 1, lang)} of ${num(ROUND, lang)}`, `${num(index + 1, lang)} নম্বর / ${num(ROUND, lang)}`)}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 rounded-full px-4 text-sm font-semibold text-[#124B3A] hover:bg-[#124B3A]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#124B3A]"
        >
          {pick(lang, 'Exit', 'বের হন')}
        </button>
      </div>

      <div className="flex gap-1.5" aria-hidden="true">
        {deck.map((_, i) => {
          const done = i < answers.length;
          const ok = answers[i];
          return (
            <span
              key={i}
              className={`h-2 flex-1 rounded-full ${done ? (ok ? 'bg-[#124B3A]' : 'bg-[#E0567A]') : i === index ? 'bg-[#CBEA70]' : 'bg-[#124B3A]/15'}`}
            />
          );
        })}
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-3" aria-hidden="true">
          <span className="rounded-full bg-[#FDECEC] px-3 py-1 text-sm font-bold text-[#9B1C1C]" style={{ opacity: phase === 'play' ? leftHint : 0 }}>
            {pick(lang, 'Not recyclable', 'রিসাইকেল হয় না')}
          </span>
          <span className="rounded-full bg-[#E1F5EC] px-3 py-1 text-sm font-bold text-[#0E5C40]" style={{ opacity: phase === 'play' ? rightHint : 0 }}>
            {pick(lang, 'Recyclable', 'রিসাইকেল হয়')}
          </span>
        </div>

        <div
          key={index}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => endDrag(e, false)}
          onPointerCancel={(e) => endDrag(e, true)}
          style={{
            transform: cardTransform,
            transition: dragging ? 'none' : 'transform .35s ease',
            touchAction: 'pan-y',
            cursor: phase === 'play' ? (dragging ? 'grabbing' : 'grab') : 'default'
          }}
          className="cl-rise relative mx-auto flex min-h-[260px] select-none flex-col items-center justify-center gap-4 rounded-3xl border-2 border-[#EDE4D8] bg-white p-6 text-center shadow-lg"
        >
          {phase === 'feedback' && item.recyclable && item.material ? (
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#FAF5EC]">
              <MaterialGlyph material={item.material} size={36} />
            </span>
          ) : (
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#FAF5EC]" aria-hidden="true">
              <Package size={34} className="text-[#53616D]" />
            </span>
          )}
          <p className="font-display text-2xl font-extrabold leading-snug text-[#172521]">{pick(lang, item.en, item.bn)}</p>
          {phase === 'play' && (
            <p className="text-sm text-[#53616D]">{pick(lang, 'Swipe left or right, or use the buttons', 'বাঁয়ে বা ডানে সোয়াইপ করুন, অথবা বোতাম ব্যবহার করুন')}</p>
          )}
        </div>
      </div>

      {phase === 'play' ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => answer(false)}
            className="flex h-16 items-center justify-center gap-2 rounded-2xl bg-[#FDECEC] font-bold text-[#9B1C1C] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#CBEA70]"
          >
            <X size={22} aria-hidden="true" />
            {pick(lang, 'Not recyclable', 'রিসাইকেল হয় না')}
          </button>
          <button
            type="button"
            onClick={() => answer(true)}
            className="flex h-16 items-center justify-center gap-2 rounded-2xl bg-[#124B3A] font-bold text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-[#CBEA70]"
          >
            <Check size={22} aria-hidden="true" />
            {pick(lang, 'Recyclable', 'রিসাইকেল হয়')}
          </button>
        </div>
      ) : (
        <div
          role="status"
          aria-live="polite"
          className={`cl-rise space-y-3 rounded-3xl p-5 ${correct ? 'bg-[#E1F5EC] text-[#0E5C40]' : 'bg-[#FDECEC] text-[#9B1C1C]'}`}
        >
          <p className="flex items-center gap-2 text-lg font-bold">
            {correct ? <Check size={22} aria-hidden="true" /> : <X size={22} aria-hidden="true" />}
            <span>
              {correct ? pick(lang, 'Correct!', 'সঠিক!') : pick(lang, 'Not quite.', 'ঠিক হয়নি।')}{' '}
              {item.recyclable
                ? pick(lang, 'It is recyclable.', 'এটি রিসাইকেল করা যায়।')
                : pick(lang, 'It is not recyclable.', 'এটি রিসাইকেল করা যায় না।')}
            </span>
          </p>
          <p className="text-sm text-[#172521]">{pick(lang, item.tipEn, item.tipBn)}</p>
          <button
            type="button"
            onClick={next}
            className="h-12 w-full rounded-2xl bg-[#124B3A] font-bold text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-[#CBEA70]"
          >
            {isLast ? pick(lang, 'See score', 'ফলাফল দেখুন') : pick(lang, 'Next', 'পরবর্তী')}
          </button>
        </div>
      )}
    </div>
  );
}
