import React, { useEffect, useRef, useState } from 'react';
import { FlaskConical, ChevronUp, Presentation, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { USER_ROLES } from '../../routing';
import type { UserRole } from '../../types';

/**
 * Demo-only controls, kept out of the product UI: a small floating pill to
 * switch persona, open the pitch stage, or reset demo data. Real users of a
 * production build would not see this.
 */
const LABELS: Record<UserRole, { en: string; bn: string; group: 'customer' | 'ops' | 'gov' }> = {
  customer_household: { en: 'Household', bn: 'পরিবার', group: 'customer' },
  customer_apartment: { en: 'Apartment committee', bn: 'ভবন কমিটি', group: 'customer' },
  customer_business: { en: 'Business / café', bn: 'ব্যবসা', group: 'customer' },
  collector: { en: 'Field collector', bn: 'মাঠ সংগ্রাহক', group: 'ops' },
  aggregator: { en: 'Collection hub', bn: 'সংগ্রহ হাব', group: 'ops' },
  processor: { en: 'Recycler', bn: 'রিসাইক্লার', group: 'ops' },
  operator: { en: 'Operations', bn: 'অপারেশনস', group: 'gov' },
  brand_partner: { en: 'Brand partner', bn: 'ব্র্যান্ড পার্টনার', group: 'gov' }
};

export const DemoModePill: React.FC = () => {
  const { role, setRole, lang, resetDemoData } = useApp();
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const en = lang === 'en';

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

  const groups: { key: 'customer' | 'ops' | 'gov'; en: string; bn: string }[] = [
    { key: 'customer', en: 'Customers', bn: 'গ্রাহক' },
    { key: 'ops', en: 'Operations', bn: 'অপারেশনস' },
    { key: 'gov', en: 'Oversight', bn: 'তত্ত্বাবধান' }
  ];

  return (
    <div ref={ref} className={`fixed left-3 ${role === 'collector' ? 'bottom-[14.5rem]' : 'bottom-20'} md:bottom-4 z-[60] print:hidden`}>
      {open && (
        <div role="menu" aria-label={en ? 'Demo mode' : 'ডেমো মোড'} className="mb-2 w-64 rounded-2xl bg-[#172521] text-white shadow-2xl p-2 cl-rise">
          {groups.map((g) => (
            <div key={g.key} className="py-1">
              <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-white/50">{en ? g.en : g.bn}</p>
              {USER_ROLES.filter((r) => LABELS[r].group === g.key).map((r) => (
                <button
                  key={r}
                  role="menuitemradio"
                  aria-checked={role === r}
                  onClick={() => {
                    setRole(r);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-2 py-2 rounded-xl text-sm cursor-pointer ${role === r ? 'bg-[#CBEA70] text-[#172521] font-bold' : 'hover:bg-white/10'}`}
                >
                  {en ? LABELS[r].en : LABELS[r].bn}
                </button>
              ))}
            </div>
          ))}
          <div className="border-t border-white/10 mt-1 pt-1 space-y-0.5">
            <a role="menuitem" href="?pitch" className="flex items-center gap-2 px-2 py-2 rounded-xl text-sm hover:bg-white/10">
              <Presentation className="w-4 h-4 text-[#CBEA70]" aria-hidden="true" />
              {en ? 'Open pitch stage' : 'পিচ স্টেজ খুলুন'}
            </a>
            {confirmReset ? (
              <button role="menuitem" onClick={resetDemoData} className="w-full flex items-center gap-2 px-2 py-2 rounded-xl text-sm bg-[#B42318] font-bold cursor-pointer">
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                {en ? 'Tap again to erase changes' : 'মুছতে আবার চাপুন'}
              </button>
            ) : (
              <button role="menuitem" onClick={() => setConfirmReset(true)} className="w-full flex items-center gap-2 px-2 py-2 rounded-xl text-sm hover:bg-white/10 cursor-pointer">
                <RotateCcw className="w-4 h-4 text-white/60" aria-hidden="true" />
                {en ? 'Reset demo data' : 'ডেমো ডেটা রিসেট'}
              </button>
            )}
          </div>
        </div>
      )}
      <button
        onClick={() => {
          setOpen((o) => !o);
          setConfirmReset(false);
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-full bg-[#172521]/90 backdrop-blur text-white text-xs font-semibold shadow-lg hover:bg-[#172521] cursor-pointer"
      >
        <FlaskConical className="w-3.5 h-3.5 text-[#CBEA70]" aria-hidden="true" />
        <span className="text-white/60">{en ? 'Demo' : 'ডেমো'}</span>
        <span>{en ? LABELS[role].en : LABELS[role].bn}</span>
        <ChevronUp className={`w-3.5 h-3.5 transition-transform ${open ? '' : 'rotate-180'}`} aria-hidden="true" />
      </button>
    </div>
  );
};
