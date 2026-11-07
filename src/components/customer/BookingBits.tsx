import React from 'react';
import { useApp } from '../../context/AppContext';
import { customerJourney } from '../../design/journey';
import { JourneyLine } from '../../design/JourneyLine';
import { MATERIALS, MaterialGlyph } from '../../design/materials';
import type { Booking } from '../../types';

/** Material colour + shape chips for a booking. */
export const MaterialChips: React.FC<{ booking: Booking; size?: 'sm' | 'md'; className?: string }> = ({ booking, size = 'sm', className = '' }) => {
  const { lang } = useApp();
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`} aria-label={lang === 'en' ? 'Materials' : 'উপকরণ'}>
      {booking.materials.map((m) => {
        const t = MATERIALS[m.category];
        if (!t) return null;
        return (
          <li
            key={m.category}
            className={`inline-flex items-center gap-1.5 rounded-full font-bold text-[#172521] ${size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'}`}
            style={{ background: t.tint }}
          >
            <MaterialGlyph material={m.category} size={size === 'md' ? 18 : 14} />
            {lang === 'en' ? t.en : t.bn}
          </li>
        );
      })}
    </ul>
  );
};

/** The journey for one booking, using the shared journey model and line. */
export const useJourney = (booking: Booking) => {
  const { lots, custodyEvents } = useApp();
  return React.useMemo(() => customerJourney(booking, lots, custodyEvents), [booking, lots, custodyEvents]);
};

/** Compact horizontal journey for list rows: dots only, current stop named underneath. */
export const MiniJourney: React.FC<{ booking: Booking }> = ({ booking }) => {
  const { lang } = useApp();
  const j = useJourney(booking);
  const muted = j.outcome === 'cancelled' || j.outcome === 'missed';
  const current = j.stops.find((s) => s.state === 'current') ?? j.stops[j.stops.length - 1];
  const caption =
    j.outcome === 'cancelled'
      ? lang === 'en' ? 'Cancelled' : 'বাতিল'
      : j.outcome === 'missed'
      ? lang === 'en' ? 'Missed. Talk to us to rebook' : 'ছুটে গেছে। নতুন সময়ের জন্য আমাদের জানান'
      : j.outcome === 'complete'
      ? lang === 'en' ? 'Ready to become something new' : 'নতুন কিছু হওয়ার পথে'
      : current.id === 'picked_up'
      ? lang === 'en' ? 'Waiting for pickup' : 'পিকআপের অপেক্ষায়'
      : lang === 'en' ? current.en : current.bn;
  return (
    <div>
      <JourneyLine stops={j.stops} lang={lang} orientation="horizontal" muted={muted} className="mx-auto max-w-[300px] [&_li>span:nth-child(n+2)]:sr-only" />
      <p className="mt-1 text-center text-xs font-bold text-[#124B3A]">{caption}</p>
    </div>
  );
};
