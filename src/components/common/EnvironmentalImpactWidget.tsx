import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MATERIALS, MaterialGlyph } from '../../design/materials';
import { impactForKg, picturedImpact } from '../customer/impact';
import { nf } from '../customer/ui';
import { useCustomerData } from '../customer/useCustomerData';

interface EnvironmentalImpactWidgetProps {
  className?: string;
  defaultExpanded?: boolean;
}

/**
 * Impact you can picture: "about 330 half-litre bottles kept out of the canals",
 * with kilograms as the quiet second line. Counts are indicative, from typical
 * item weights.
 */
export const EnvironmentalImpactWidget: React.FC<EnvironmentalImpactWidgetProps> = ({ className = '', defaultExpanded = false }) => {
  const { lang } = useApp();
  const en = lang === 'en';
  const { myBookings, confirmedKg, awaitingKg } = useCustomerData();
  const [open, setOpen] = useState(defaultExpanded);
  const items = picturedImpact(myBookings);
  const totalKg = confirmedKg + awaitingKg;
  const top = items[0];
  const { co2eKg } = impactForKg(totalKg);

  return (
    <section className={`rounded-[28px] bg-white p-5 text-[#124B3A] ring-1 ring-[#124B3A]/10 ${className}`} aria-labelledby="impact-title">
      <h2 id="impact-title" className="text-xs font-bold tracking-wide text-[#124B3A]/60">
        {en ? 'What your bags did' : 'আপনার ব্যাগগুলো কী করেছে'}
      </h2>
      {top ? (
        <>
          <p className="mt-1 flex items-center gap-3 font-display text-[26px] font-extrabold leading-tight">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl" style={{ background: MATERIALS[top.material].tint }}>
              <MaterialGlyph material={top.material} size={28} />
            </span>
            <span>
              {en
                ? `≈ ${nf(top.count, lang)} ${MATERIALS[top.material].itemEn} kept out of the canals`
                : `≈ ${nf(top.count, lang)}টি ${MATERIALS[top.material].itemBn} খাল-নালা থেকে দূরে`}
            </span>
          </p>
          {items.length > 1 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {items.slice(1).map((it) => (
                <li key={it.material} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold" style={{ background: MATERIALS[it.material].tint }}>
                  <MaterialGlyph material={it.material} size={16} />≈ {nf(it.count, lang)} {en ? MATERIALS[it.material].itemEn : MATERIALS[it.material].itemBn}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-sm font-semibold text-[#124B3A]/65">
            {en ? `That is ${nf(totalKg, lang, 1)} kg in all.` : `মোট ${nf(totalKg, lang, 1)} কেজি।`}{' '}
            {awaitingKg > 0 && (en ? `${nf(awaitingKg, lang, 1)} kg still waiting for the hub scale.` : `${nf(awaitingKg, lang, 1)} কেজি হাবের স্কেলের অপেক্ষায়।`)}
          </p>
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="mt-2 inline-flex min-h-10 items-center gap-1 rounded-xl text-sm font-bold underline-offset-4 hover:underline focus:outline-none focus-visible:ring-4 focus-visible:ring-[#CBEA70]"
          >
            {open ? (en ? 'Hide the rough maths' : 'হিসাব লুকান') : en ? 'How we picture it' : 'কীভাবে হিসাব করি'}
            {open ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
          </button>
          {open && (
            <p className="rounded-2xl bg-[#FAF9F5] p-3 text-xs font-medium leading-relaxed text-[#124B3A]/75">
              {en
                ? `We split each bag's weight across what you put in it, then divide by a typical item weight. It is a friendly estimate, not a measurement. Making new plastic instead would also have released roughly ${nf(co2eKg, lang)} kg of CO₂ (indicative).`
                : `প্রতিটি ব্যাগের ওজন আপনার দেওয়া জিনিসের মধ্যে ভাগ করে, একটি সাধারণ জিনিসের ওজন দিয়ে ভাগ করা হয়। এটি আনুমানিক, মাপা নয়। নতুন প্লাস্টিক বানালে প্রায় ${nf(co2eKg, lang)} কেজি CO₂ নির্গত হতো (আনুমানিক)।`}
            </p>
          )}
        </>
      ) : (
        <p className="mt-1 text-base font-semibold text-[#124B3A]/75">
          {en ? 'After your first weighed pickup, you will see it here as things you can picture, like bottles and boxes.' : 'প্রথম পিকআপ ওজন হলে এখানে বোতল ও বাক্সের মতো চেনা জিনিসের হিসাবে দেখতে পাবেন।'}
        </p>
      )}
    </section>
  );
};
