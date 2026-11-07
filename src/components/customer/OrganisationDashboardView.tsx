import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Booking } from '../../types';
import { Building2, Calendar, Plus, ShieldCheck, FileDown, Truck, XCircle, ChevronRight, Recycle } from 'lucide-react';
import { formatBookingDate, relativeDayLabel } from './dates';
import { COMPLETED_BOOKING_STATUSES, isCancellable, useCustomerData } from './useCustomerData';
import { SupportCasesList } from './SupportCasesList';
import { bookingStatusLabel, materialLabel } from './labels';

interface OrganisationDashboardViewProps {
  onBookPickup: () => void;
  onOpenStatus: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onRequestRecurring: () => void;
  onGetHelp: (bookingId?: string) => void;
}

type OrgTab = 'overview' | 'calendar' | 'report' | 'members';

/** Home view for apartment-committee and business customers. */
export const OrganisationDashboardView: React.FC<OrganisationDashboardViewProps> = ({
  onBookPickup,
  onOpenStatus,
  onCancel,
  onRequestRecurring,
  onGetHelp
}) => {
  const { lang, orgMembers, jobs, showToast } = useApp();
  const { customer, myBookings, upcoming, nextBooking, nextJob, attentionBooking, confirmedKg, awaitingKg, myComplaints } = useCustomerData();
  const [activeOrgTab, setActiveOrgTab] = useState<OrgTab>('overview');

  const isBusiness = customer.customerType === 'business';
  const siteAddress = myBookings[0]?.address ?? '';

  const completed = myBookings.filter((b) => COMPLETED_BOOKING_STATUSES.includes(b.status));
  const missed = myBookings.filter((b) => b.status === 'MISSED' || b.status === 'DISPUTED');
  const openCases = myComplaints.filter((c) => c.status === 'OPEN' || c.status === 'INVESTIGATING').length;
  const openIssues = missed.length + openCases;
  const rejectedKg = myBookings.reduce((sum, b) => sum + (b.rejectedWeightKg ?? 0), 0);
  const weighedKg = confirmedKg + awaitingKg;
  const contaminationPct = weighedKg > 0 ? (rejectedKg / (weighedKg + rejectedKg)) * 100 : null;
  const completionRate = completed.length + missed.length > 0 ? (completed.length / (completed.length + missed.length)) * 100 : null;
  const dates = myBookings.map((b) => b.scheduledDate).filter((d) => /^\d{4}-\d{2}-\d{2}/.test(d)).sort();
  const period = dates.length ? `${formatBookingDate(dates[0], lang)} – ${formatBookingDate(dates[dates.length - 1], lang)}` : '';

  const orgKey = customer.name.toLowerCase().split(' ').slice(0, 2).join(' ');
  const members = orgMembers.filter((m) => m.assignedSite.toLowerCase().startsWith(orgKey));

  const nextCollector = nextJob?.collectorName ?? nextBooking?.collectorName;

  const downloadCsv = () => {
    const rows = [
      ['Booking', 'Date', 'Window', 'Status', 'Confirmed kg', 'Field kg', 'Points'],
      ...myBookings.map((b) => [
        b.id,
        b.scheduledDate,
        b.scheduledTimeWindow,
        b.status,
        String(b.confirmedWeightKg ?? ''),
        String(b.fieldWeightKg ?? ''),
        String(b.earnedPoints ?? '')
      ])
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    try {
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `clean-lane-${customer.id}-statement.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast(lang === 'en' ? 'Could not create the statement file.' : 'স্টেটমেন্ট ফাইল তৈরি করা যায়নি।');
    }
  };

  const tabs: { id: OrgTab; en: string; bn: string }[] = [
    { id: 'overview', en: 'Dashboard', bn: 'ড্যাশবোর্ড' },
    { id: 'calendar', en: 'Schedule', bn: 'সময়সূচি' },
    { id: 'report', en: 'Report', bn: 'রিপোর্ট' },
    { id: 'members', en: 'Members', bn: 'সদস্য' }
  ];

  const card = 'bg-white rounded-2xl border border-[#EDE4D8] shadow-2xs';

  return (
    <div className="space-y-5">
      <div className={`${card} p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-[#53616D] flex-wrap">
            <Building2 className="w-4 h-4 text-[#12613F] shrink-0" aria-hidden="true" />
            <span className="font-bold text-[#202B38]">{customer.name}</span>
            {siteAddress && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate">{siteAddress}</span>
              </>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#25345C] mt-1">
            {isBusiness
              ? lang === 'en'
                ? 'Business waste recovery'
                : 'ব্যবসা প্রতিষ্ঠানের বর্জ্য পুনরুদ্ধার'
              : lang === 'en'
              ? 'Building waste recovery'
              : 'ভবনের বর্জ্য পুনরুদ্ধার'}
          </h1>
          <p className="text-xs text-[#53616D] max-w-2xl mt-1">
            {lang === 'en'
              ? 'Site totals are tracked separately from individual resident accounts.'
              : 'সাইটের হিসাব আলাদাভাবে রাখা হয়, ব্যক্তিগত বাসিন্দার হিসাবের সঙ্গে মেশানো হয় না।'}
          </p>
        </div>

        <div role="tablist" aria-label={lang === 'en' ? 'Organisation sections' : 'প্রতিষ্ঠানের বিভাগ'} className="flex items-center gap-1.5 p-1 bg-[#FAF5EC] rounded-xl border border-[#EDE4D8] self-start md:self-auto overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeOrgTab === tab.id}
              onClick={() => setActiveOrgTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeOrgTab === tab.id ? 'bg-[#25345C] text-white shadow-xs' : 'text-[#53616D] hover:text-[#202B38]'
              }`}
            >
              {lang === 'en' ? tab.en : tab.bn}
            </button>
          ))}
        </div>
      </div>

      {activeOrgTab === 'overview' && (
        <div className="space-y-5">
          {attentionBooking && (
            <div role="alert" className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
              <span className="font-bold">
                {lang === 'en' ? `Pickup #${attentionBooking.id} needs attention.` : `#${attentionBooking.id} পিকআপটি পর্যালোচনার অপেক্ষায়।`}
              </span>
              <button
                type="button"
                onClick={() => onGetHelp(attentionBooking.id)}
                className="px-4 py-2 bg-amber-900 text-white rounded-xl font-bold cursor-pointer self-start sm:self-auto"
              >
                {lang === 'en' ? 'Get help' : 'সহায়তা নিন'}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`${card} p-5 space-y-1`}>
              <span className="text-xs font-medium text-[#53616D] block">{lang === 'en' ? 'Next scheduled pickup' : 'পরবর্তী নির্ধারিত পিকআপ'}</span>
              {nextBooking ? (
                <>
                  <div className="text-lg font-black text-[#25345C] flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#12613F]" aria-hidden="true" />
                    <span>{relativeDayLabel(nextBooking.scheduledDate, lang)}</span>
                  </div>
                  <div className="text-[11px] text-[#53616D]">{nextBooking.scheduledTimeWindow}</div>
                  <div className="text-[11px] text-[#53616D] flex items-center gap-1">
                    <Truck className="w-3 h-3" aria-hidden="true" />
                    {nextCollector ?? (lang === 'en' ? 'Collector not assigned yet' : 'সংগ্রাহক এখনো নির্ধারিত হয়নি')}
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2 text-xs font-bold">
                    <button type="button" onClick={() => onOpenStatus(nextBooking)} className="text-[#25345C] hover:underline cursor-pointer flex items-center gap-0.5">
                      {lang === 'en' ? 'Track' : 'ট্র্যাক করুন'}
                      <ChevronRight className="w-3 h-3" aria-hidden="true" />
                    </button>
                    {isCancellable(nextBooking) && (
                      <button type="button" onClick={() => onCancel(nextBooking)} className="text-rose-700 hover:underline cursor-pointer flex items-center gap-0.5">
                        <XCircle className="w-3 h-3" aria-hidden="true" />
                        {lang === 'en' ? 'Cancel pickup' : 'বাতিল করুন'}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-lg font-black text-[#202B38]">{lang === 'en' ? 'Nothing scheduled' : 'কিছু নির্ধারিত নেই'}</div>
                  <div className="text-[11px] text-[#53616D]">{lang === 'en' ? 'Book a pickup to get started.' : 'শুরু করতে একটি পিকআপ বুক করুন।'}</div>
                </>
              )}
            </div>

            <div className={`${card} p-5 space-y-1`}>
              <span className="text-xs font-medium text-[#53616D] block">{lang === 'en' ? 'Confirmed weight' : 'নিশ্চিত ওজন'}</span>
              <div className="text-2xl font-black font-mono text-[#12613F] tabular-nums">{confirmedKg.toFixed(1)} kg</div>
              <div className="text-[11px] text-[#53616D]">
                {lang === 'en' ? `Across ${completed.length} completed pickup(s)` : `${completed.length}টি সম্পন্ন পিকআপে`}
                {awaitingKg > 0 && (lang === 'en' ? ` · ${awaitingKg.toFixed(1)} kg awaiting hub scale` : ` · ${awaitingKg.toFixed(1)} কেজি হাব স্কেলের অপেক্ষায়`)}
              </div>
            </div>

            <div className={`${card} p-5 space-y-1`}>
              <span className="text-xs font-medium text-[#53616D] block">{lang === 'en' ? 'Open issues' : 'চলমান সমস্যা'}</span>
              <div className="text-2xl font-black font-mono text-[#202B38] tabular-nums">{openIssues}</div>
              <div className="text-[11px] text-[#53616D]">
                {openIssues === 0
                  ? lang === 'en'
                    ? 'No missed pickups or open support cases'
                    : 'কোনো ছুটে যাওয়া পিকআপ বা খোলা অভিযোগ নেই'
                  : lang === 'en'
                  ? `${missed.length} flagged pickup(s), ${openCases} open case(s)`
                  : `${missed.length}টি চিহ্নিত পিকআপ, ${openCases}টি খোলা অভিযোগ`}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onBookPickup}
              className="px-4 py-2.5 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>{lang === 'en' ? 'Book a pickup' : 'পিকআপ বুক করুন'}</span>
            </button>
            <button
              type="button"
              onClick={onRequestRecurring}
              className="px-4 py-2.5 bg-white border border-[#EDE4D8] text-[#25345C] hover:bg-[#FAF5EC] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Recycle className="w-4 h-4 text-[#12613F]" aria-hidden="true" />
              <span>{lang === 'en' ? 'Request a regular schedule' : 'নিয়মিত সূচির অনুরোধ'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveOrgTab('report')}
              className="px-4 py-2.5 bg-white border border-[#EDE4D8] text-[#53616D] hover:bg-[#FAF5EC] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <FileDown className="w-4 h-4" aria-hidden="true" />
              <span>{lang === 'en' ? 'View period report' : 'সময়কালের রিপোর্ট'}</span>
            </button>
          </div>

          <div className="p-4 bg-[#E8FAF1] border border-[#C9F1DC] rounded-2xl text-xs text-emerald-950 space-y-1">
            <span className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#12613F]" aria-hidden="true" />
              {lang === 'en' ? 'How site rewards are attributed' : 'সাইটের পুরস্কার কীভাবে হিসাব হয়'}
            </span>
            <p className="leading-relaxed text-[11px]">
              {lang === 'en'
                ? 'Points are credited to this site account. Individual residents are not credited for the whole complex’s weight.'
                : 'পয়েন্ট এই সাইটের অ্যাকাউন্টে জমা হয়। পুরো কমপ্লেক্সের ওজনের জন্য আলাদা কোনো বাসিন্দাকে পয়েন্ট দেওয়া হয় না।'}
            </p>
          </div>

          <SupportCasesList />
        </div>
      )}

      {activeOrgTab === 'calendar' && (
        <div className={`${card} p-5 sm:p-6 space-y-4`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#202B38]">{lang === 'en' ? 'Collection schedule' : 'সংগ্রহের সময়সূচি'}</h3>
              <p className="text-xs text-[#53616D]">{customer.name}</p>
            </div>
            <button type="button" onClick={onBookPickup} className="px-3.5 py-1.5 bg-[#25345C] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer shrink-0">
              {lang === 'en' ? 'Book a pickup' : 'পিকআপ বুক করুন'}
            </button>
          </div>

          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#53616D]">{lang === 'en' ? 'Upcoming' : 'আসন্ন'}</h4>
          {upcoming.length === 0 ? (
            <p className="text-xs text-[#53616D]">{lang === 'en' ? 'No upcoming pickups.' : 'কোনো আসন্ন পিকআপ নেই।'}</p>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((b) => {
                const collector = jobs.find((j) => j.bookingId === b.id)?.collectorName ?? b.collectorName;
                return (
                  <li key={b.id} className="p-4 rounded-xl border border-[#EDE4D8] bg-[#FAF9F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#202B38]">{formatBookingDate(b.scheduledDate, lang)}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-[#53616D]">{b.scheduledTimeWindow}</span>
                      </div>
                      <div className="text-[#53616D]">
                        {collector ? `${lang === 'en' ? 'Collector' : 'সংগ্রাহক'}: ${collector} · ` : ''}
                        {b.materials.map((m) => materialLabel(m.category, lang)).join(', ')}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-900">{bookingStatusLabel(b.status, lang)}</span>
                      <button type="button" onClick={() => onOpenStatus(b)} className="font-bold text-[#25345C] hover:underline cursor-pointer">
                        {lang === 'en' ? 'Details' : 'বিবরণ'}
                      </button>
                      {isCancellable(b) && (
                        <button type="button" onClick={() => onCancel(b)} className="font-bold text-rose-700 hover:underline cursor-pointer">
                          {lang === 'en' ? 'Cancel' : 'বাতিল'}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#53616D] pt-2">{lang === 'en' ? 'Recent' : 'সাম্প্রতিক'}</h4>
          <ul className="space-y-2">
            {myBookings
              .filter((b) => !upcoming.includes(b))
              .map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    onClick={() => onOpenStatus(b)}
                    className="w-full text-left p-3 rounded-xl border border-[#EDE4D8] bg-white hover:border-[#25345C] flex items-center justify-between gap-3 text-xs cursor-pointer"
                  >
                    <span>
                      <span className="font-bold text-[#202B38]">{formatBookingDate(b.scheduledDate, lang)}</span>
                      <span className="text-[#53616D]"> · #{b.id}</span>
                    </span>
                    <span className="font-bold text-[#53616D]">
                      {bookingStatusLabel(b.status, lang)}
                      {b.confirmedWeightKg ? ` · ${b.confirmedWeightKg} kg` : ''}
                    </span>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}

      {activeOrgTab === 'report' && (
        <div className={`${card} p-5 sm:p-6 space-y-4`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#202B38]">{lang === 'en' ? 'Period performance & mass summary' : 'সময়কালের কার্যক্রম ও ওজনের সারাংশ'}</h3>
              <p className="text-xs text-[#53616D]">
                {customer.name}
                {period ? ` · ${period}` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={downloadCsv}
              disabled={myBookings.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF5EC] hover:bg-[#EDE4D8] text-[#25345C] rounded-lg text-xs font-bold cursor-pointer disabled:opacity-40 shrink-0"
            >
              <FileDown className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{lang === 'en' ? 'Download CSV' : 'CSV ডাউনলোড'}</span>
            </button>
          </div>

          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[
              { l: lang === 'en' ? 'Completed pickups' : 'সম্পন্ন পিকআপ', v: String(completed.length) },
              { l: lang === 'en' ? 'Confirmed weight' : 'নিশ্চিত ওজন', v: `${confirmedKg.toFixed(1)} kg` },
              { l: lang === 'en' ? 'Completion rate' : 'সম্পন্নের হার', v: completionRate === null ? '—' : `${completionRate.toFixed(0)}%` },
              { l: lang === 'en' ? 'Rejected share' : 'বাতিল অংশ', v: contaminationPct === null ? '—' : `${contaminationPct.toFixed(1)}%` }
            ].map((x) => (
              <div key={x.l} className="p-3 bg-[#FAF9F5] rounded-xl border border-[#EDE4D8]">
                <dt className="text-[10px] text-[#53616D] uppercase tracking-wider">{x.l}</dt>
                <dd className="text-lg font-black font-mono text-[#25345C]">{x.v}</dd>
              </div>
            ))}
          </dl>
          {myBookings.length === 0 && (
            <p className="text-xs text-[#53616D]">{lang === 'en' ? 'No pickups yet. Your report appears after your first collection.' : 'এখনো কোনো পিকআপ নেই। প্রথম সংগ্রহের পর রিপোর্ট দেখা যাবে।'}</p>
          )}
        </div>
      )}

      {activeOrgTab === 'members' && (
        <div className={`${card} p-5 sm:p-6 space-y-4`}>
          <div>
            <h3 className="text-base font-bold text-[#202B38]">{lang === 'en' ? 'Authorised contacts' : 'অনুমোদিত যোগাযোগকারী'}</h3>
            <p className="text-xs text-[#53616D]">
              {lang === 'en'
                ? 'To add or change contacts, ask your Clean Lane coordinator.'
                : 'যোগাযোগকারী যোগ বা বদলাতে আপনার ক্লিন লেন সমন্বয়কারীকে জানান।'}
            </p>
          </div>

          {members.length === 0 ? (
            <p className="text-xs text-[#53616D]">{lang === 'en' ? 'No contacts are listed for this site yet.' : 'এই সাইটের জন্য এখনো কোনো যোগাযোগকারী নেই।'}</p>
          ) : (
            <ul className="space-y-3">
              {members.map((m) => (
                <li key={m.id} className="p-4 rounded-xl border border-[#EDE4D8] bg-[#FAF9F5] flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-[#202B38] block">{m.name}</span>
                    <span className="text-[#53616D] font-mono text-[11px]">{m.emailOrPhone}</span>
                  </div>
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-white border border-[#EDE4D8] text-[#202B38] font-medium">{m.role.replace(/_/g, ' ')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
