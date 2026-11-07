import React from 'react';
import { LifeBuoy } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { ServiceComplaint } from '../../types';
import { formatDateOnly } from './dates';
import { useCustomerData } from './useCustomerData';

const TYPE_LABEL: Record<ServiceComplaint['type'], { en: string; bn: string }> = {
  MISSED_COLLECTION: { en: 'Collector did not arrive', bn: 'কালেক্টর উপস্থিত হননি' },
  WEIGHT_DISCREPANCY: { en: 'Weight or points seem incorrect', bn: 'ওজন বা পয়েন্ট অমিল' },
  POINTS_CALCULATION: { en: 'Material left behind', bn: 'উপকরণ রেখে যাওয়া হয়েছে' },
  BEHAVIOR: { en: 'Staff or access conduct', bn: 'আচরণ বা প্রবেশ সংক্রান্ত সমস্যা' },
  OTHER: { en: 'Other question or problem', bn: 'অন্যান্য জিজ্ঞাসা বা সমস্যা' }
};

const STATUS: Record<ServiceComplaint['status'], { en: string; bn: string; cls: string }> = {
  OPEN: { en: 'Open', bn: 'গৃহীত', cls: 'bg-amber-100 text-amber-900' },
  INVESTIGATING: { en: 'Being reviewed', bn: 'পর্যালোচনাধীন', cls: 'bg-sky-100 text-sky-900' },
  RESOLVED: { en: 'Resolved', bn: 'সমাধান হয়েছে', cls: 'bg-emerald-100 text-emerald-900' },
  REJECTED: { en: 'Closed', bn: 'বন্ধ', cls: 'bg-slate-200 text-slate-800' }
};

/** The signed-in customer's support cases with status and the operator's resolution note. */
export const SupportCasesList: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { lang } = useApp();
  const { myComplaints } = useCustomerData();
  if (myComplaints.length === 0) return null;

  return (
    <section className={`p-5 bg-white rounded-3xl border border-[#EDE4D8] space-y-3 shadow-2xs text-xs ${className}`} aria-labelledby="support-cases-heading">
      <h3 id="support-cases-heading" className="font-bold text-sm text-[#202B38] flex items-center gap-2">
        <LifeBuoy className="w-4 h-4 text-[#25345C]" aria-hidden="true" />
        {lang === 'en' ? 'My support cases' : 'আমার অভিযোগসমূহ'}
      </h3>
      <ul className="space-y-2">
        {myComplaints.map((c) => {
          const st = STATUS[c.status];
          return (
            <li key={c.id} className="p-3 bg-[#FAF9F5] rounded-xl border border-[#EDE4D8] space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-[#25345C]">{c.id}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${st.cls}`}>{lang === 'en' ? st.en : st.bn}</span>
              </div>
              <div className="font-semibold text-[#202B38]">{lang === 'en' ? TYPE_LABEL[c.type].en : TYPE_LABEL[c.type].bn}</div>
              <div className="text-[11px] text-[#53616D]">
                {formatDateOnly(c.createdAt, lang)}
                {c.bookingId ? ` · #${c.bookingId}` : ''}
              </div>
              {c.resolutionNotes && (
                <p className="text-[11px] text-[#12613F] bg-white border border-[#C9F1DC] rounded-lg p-2 leading-relaxed">
                  <strong>{lang === 'en' ? 'Resolution: ' : 'সমাধান: '}</strong>
                  {c.resolutionNotes}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};
