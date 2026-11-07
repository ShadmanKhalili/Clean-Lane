import React, { Suspense, lazy, useState } from 'react';
import { Gamepad2, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { CARD, FOCUS } from './ui';

const SortingGame = lazy(() => import('../../learn/SortingGame'));
const RecycleSearch = lazy(() => import('../../learn/RecycleSearch'));

const Loading: React.FC = () => <p className="p-6 text-center text-sm font-semibold text-[#124B3A]/70" role="status">…</p>;

type Which = 'search' | 'game' | null;

/** Two quiet entry points: "Can I recycle this?" and the one-minute sorting game. */
export const LearnEntry: React.FC<{ className?: string; compact?: boolean }> = ({ className = '', compact = false }) => {
  const { lang } = useApp();
  const en = lang === 'en';
  const [open, setOpen] = useState<Which>(null);
  const close = () => setOpen(null);
  const btn = `flex items-center gap-3 text-left ${compact ? 'rounded-2xl border border-[#EDE4D8] bg-white p-3.5' : `${CARD} p-4`} hover:ring-[#124B3A]/30 cursor-pointer ${FOCUS}`;

  return (
    <>
      <div className={`grid gap-2.5 ${compact ? '' : 'sm:grid-cols-2'} ${className}`}>
        <button type="button" onClick={() => setOpen('search')} className={btn}>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#E3F0FC] text-[#1E7FD8]">
            <Search className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-[15px] font-extrabold text-[#124B3A]">{en ? 'Can I recycle this?' : 'এটা কি রিসাইকেল হয়?'}</span>
            <span className="block text-xs font-medium text-[#124B3A]/60">{en ? 'Type any item, get a clear answer' : 'যেকোনো জিনিসের নাম লিখে উত্তর পান'}</span>
          </span>
        </button>
        <button type="button" onClick={() => setOpen('game')} className={btn}>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#EAF5C9] text-[#124B3A]">
            <Gamepad2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-[15px] font-extrabold text-[#124B3A]">{en ? 'Play: sort it right (1 min)' : 'খেলুন: ঠিকমতো বাছাই (১ মিনিট)'}</span>
            <span className="block text-xs font-medium text-[#124B3A]/60">{en ? 'Ten items. How many can you place?' : 'দশটি জিনিস। কয়টি ঠিক পারবেন?'}</span>
          </span>
        </button>
      </div>

      <Modal open={open === 'search'} onClose={close} title={en ? 'Can I recycle this?' : 'এটা কি রিসাইকেল হয়?'} closeLabel={en ? 'Close' : 'বন্ধ করুন'}>
        <Suspense fallback={<Loading />}>
          <RecycleSearch lang={lang} />
        </Suspense>
      </Modal>
      <Modal open={open === 'game'} onClose={close} size="lg" title={en ? 'Sort it right' : 'ঠিকমতো বাছাই করুন'} closeLabel={en ? 'Close' : 'বন্ধ করুন'}>
        <Suspense fallback={<Loading />}>
          <SortingGame lang={lang} onClose={close} />
        </Suspense>
      </Modal>
    </>
  );
};
