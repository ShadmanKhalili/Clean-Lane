import React, { useMemo, useState } from 'react';
import { isOverTolerance } from '../../domain/rules';
import { useApp } from '../../context/AppContext';
import { EvidenceBadge } from '../common/EvidenceBadge';
import { Modal } from '../common/Modal';
import { ServiceComplaint } from '../../types';
import {
  LayoutDashboard,
  Calendar,
  Truck,
  Gift,
  Users,
  Building,
  BarChart3,
  Settings,
  AlertTriangle,
  Scale,
  Bell,
  Sparkles,
  History
} from 'lucide-react';

type Workspace =
  | 'overview'
  | 'bookings'
  | 'dispatch'
  | 'material'
  | 'rewards'
  | 'customers'
  | 'partners'
  | 'reports'
  | 'audit'
  | 'settings';

const COMPLAINT_BADGE: Record<ServiceComplaint['status'], string> = {
  OPEN: 'bg-rose-100 text-rose-800',
  INVESTIGATING: 'bg-amber-100 text-amber-800',
  RESOLVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-slate-200 text-slate-700'
};

export const OperatorDashboard: React.FC = () => {
  const {
    bookings,
    jobs,
    lots,
    serviceZones,
    auditLogs,
    complaints,
    rewards,
    notifications,
    pointsLedger,
    reassignJob,
    resolveComplaint,
    triggerManual24hReminderCheck,
    totalCollectedKg,
    totalAcceptedKg,
    totalProcessedKg,
    totalVerifiedEprKg,
    lang
  } = useApp();

  // 9 Workspaces: Overview, Bookings, Dispatch, Material, Rewards, Customers, Partners, Reports, Settings
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>('overview');
  const t = (en: string, bn: string) => (lang === 'en' ? en : bn);

  // Side Filters for Zone and Provider (PRD A01)
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('all');
  const [selectedProviderFilter, setSelectedProviderFilter] = useState<string>('all');

  // Reassignment Modal State (PRD A02)
  const [reassignJobId, setReassignJobId] = useState<string | null>(null);
  const [newCollectorName, setNewCollectorName] = useState<string>('Enterprise Route #2 (Kamrul)');
  const [reassignReason, setReassignReason] = useState<string>('');

  const [reassignError, setReassignError] = useState<string>('');
  const [resolutionDrafts, setResolutionDrafts] = useState<Record<string, string>>({});
  const [auditActionFilter, setAuditActionFilter] = useState<string>('all');
  const [reminderMessage, setReminderMessage] = useState<string>('');

  // Zone / provider scope: a booking belongs to a zone, and a zone to an enterprise.
  const providers = useMemo(() => Array.from(new Set(serviceZones.map((z) => z.assignedEnterprise))), [serviceZones]);
  const bookingInScope = (bookingId?: string) => {
    if (selectedZoneFilter === 'all' && selectedProviderFilter === 'all') return true;
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return false;
    if (selectedZoneFilter !== 'all' && booking.zoneId !== selectedZoneFilter) return false;
    if (selectedProviderFilter !== 'all') {
      const zone = serviceZones.find((z) => z.id === booking.zoneId);
      if (zone?.assignedEnterprise !== selectedProviderFilter) return false;
    }
    return true;
  };
  const scopedBookings = bookings.filter((b) => bookingInScope(b.id));
  const scopedJobs = jobs.filter((j) => bookingInScope(j.bookingId));
  const scopedLots = lots.filter((l) => !l.sourceBookingId || bookingInScope(l.sourceBookingId));
  const scopedComplaints = complaints.filter((c) => !c.bookingId || bookingInScope(c.bookingId));
  const isScoped = selectedZoneFilter !== 'all' || selectedProviderFilter !== 'all';

  // Circular points issued = settled ledger credits (not potential / cancelled bookings).
  const totalPointsAwarded = pointsLedger
    .filter((e) => e.type === 'CREDIT' && e.status === 'AVAILABLE')
    .reduce((acc, e) => acc + e.amount, 0);

  // Indicators (PRD A01)
  const openBookingsCount = scopedBookings.filter((b) => b.status === 'REQUESTED' || b.status === 'CONFIRMED').length;
  const unassignedJobsCount = scopedJobs.filter((j) => j.status === 'PENDING').length;
  const discrepantLots = scopedLots.filter((l) => isOverTolerance(l.discrepancyPercentage) && !l.discrepancyResolved);
  const weightDiscrepanciesCount = discrepantLots.length;
  const openComplaints = scopedComplaints.filter((c) => c.status === 'OPEN' || c.status === 'INVESTIGATING');
  const unresolvedComplaintsCount = openComplaints.length;

  // Telemetry derived from state
  const collectorsInField = new Set(
    jobs.filter((j) => j.status === 'ACCEPTED' || j.status === 'EN_ROUTE').map((j) => j.collectorName)
  ).size;
  const reminders24h = notifications.filter((n) => n.type === 'COLLECTION_REMINDER_24H');
  const reminders24hSent = reminders24h.length;
  const reminders24hRead = reminders24h.filter((n) => n.read).length;

  const knownCollectors = useMemo(() => Array.from(new Set(jobs.map((j) => j.collectorName).filter(Boolean))), [jobs]);
  const sortedAudit = useMemo(
    () => [...auditLogs].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [auditLogs]
  );
  const auditActions = useMemo(() => Array.from(new Set(auditLogs.map((a) => a.action))).sort(), [auditLogs]);
  const visibleAudit = auditActionFilter === 'all' ? sortedAudit : sortedAudit.filter((a) => a.action === auditActionFilter);

  const handleReassign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignJobId) return;
    if (!newCollectorName.trim() || !reassignReason.trim()) {
      setReassignError(t('A collector and a reason are both required.', 'সংগ্রাহক ও কারণ দুটিই আবশ্যক।'));
      return;
    }
    reassignJob(reassignJobId, newCollectorName.trim(), reassignReason.trim());
    setReassignJobId(null);
    setReassignError('');
  };

  const handleReminderRun = () => {
    const count = triggerManual24hReminderCheck();
    setReminderMessage(
      count > 0
        ? `Scheduler ran: ${count} 24h reminder(s) dispatched to customers.`
        : 'Scheduler checked: all upcoming collections already have reminders.'
    );
  };

  return (
    <div className="space-y-6">
      {/* 9 Workspaces Navigation Bar (PRD Section 1 Operator Console) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto" role="tablist" aria-label={t('Operator workspaces', 'অপারেটর ওয়ার্কস্পেস')}>
          {[
            { id: 'overview', label: t('Overview', 'ওভারভিউ'), icon: LayoutDashboard },
            { id: 'bookings', label: `${t('Bookings', 'বুকিং')} (${bookings.length})`, icon: Calendar },
            { id: 'dispatch', label: t('Dispatch Board', 'ডিসপ্যাচ বোর্ড'), icon: Truck },
            { id: 'material', label: t('Material & Scales', 'উপাদান ও স্কেল'), icon: Scale },
            { id: 'rewards', label: t('Rewards Admin', 'রিওয়ার্ড'), icon: Gift },
            { id: 'customers', label: `${t('Customers', 'গ্রাহক')} (${unresolvedComplaintsCount})`, icon: Users },
            { id: 'partners', label: t('Partners', 'পার্টনার'), icon: Building },
            { id: 'reports', label: t('Reports', 'রিপোর্ট'), icon: BarChart3 },
            { id: 'audit', label: `${t('Audit trail', 'অডিট ট্রেইল')} (${auditLogs.length})`, icon: History },
            { id: 'settings', label: t('Settings & Zones', 'সেটিংস ও জোন'), icon: Settings }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeWorkspace === item.id;
            return (
              <button
                key={item.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveWorkspace(item.id as Workspace)}
                className={`flex items-center gap-1.5 px-3 min-h-11 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* WORKSPACE 1: OVERVIEW (Wireframe A01 - Exception-First Work Queue) */}
      {/* ========================================================================= */}
      {activeWorkspace === 'overview' && (
        <div className="space-y-6">
          {isScoped && (
            <div role="status" className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-center justify-between gap-2">
              <span>{t('Showing a filtered scope (zone / enterprise). Counts below reflect the filter.', 'ফিল্টার করা স্কোপ দেখানো হচ্ছে।')}</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedZoneFilter('all');
                  setSelectedProviderFilter('all');
                }}
                className="px-3 min-h-11 font-semibold underline cursor-pointer"
              >
                {t('Clear filters', 'ফিল্টার মুছুন')}
              </button>
            </div>
          )}
          {/* Top Indicators Bar (PRD A01) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-medium text-slate-500 block">Open Bookings</span>
              <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">{openBookingsCount}</div>
              <span className="text-[10px] text-slate-400 block">Scheduled in lane</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-medium text-amber-800 block">Unassigned Jobs</span>
              <div className="text-2xl font-bold font-mono text-amber-900 tabular-nums">{unassignedJobsCount}</div>
              <span className="text-[10px] text-amber-700 block">Awaiting driver dispatch</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-medium text-rose-800 block">Weight Discrepancies</span>
              <div className="text-2xl font-bold font-mono text-rose-900 tabular-nums">{weightDiscrepanciesCount}</div>
              <span className="text-[10px] text-rose-700 block">&gt; ±5% field vs scale</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-medium text-slate-500 block">Open Disputes</span>
              <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">{unresolvedComplaintsCount}</div>
              <span className="text-[10px] text-slate-400 block">Customer tickets pending</span>
            </div>
          </div>

          {/* Main Area: Exception-First Work Queue (PRD A01) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {t('Exception-First Operations Queue (PRD A01)', 'ব্যতিক্রম-প্রথম অপারেশন কিউ (PRD A01)')}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Prioritizes tasks requiring manual operator decision or re-routing.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Weight Discrepancy Alert */}
                {discrepantLots.map((lot) => (
                    <div
                      key={lot.id}
                      className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-700" aria-hidden="true" />
                          <span className="font-bold text-slate-900">Weight Discrepancy #{lot.id}</span>
                          <span className="font-mono text-amber-800 font-bold">{lot.discrepancyPercentage}%</span>
                        </div>
                        <p className="text-slate-600">
                          Field: {lot.initialFieldWeightKg} kg vs Certified Hub Scale: {lot.verifiedHubWeightKg} kg
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveWorkspace('material')}
                        className="px-3 min-h-11 bg-amber-700 text-white rounded-lg font-semibold self-start sm:self-auto cursor-pointer"
                      >
                        Review Scale Log
                      </button>
                    </div>
                  ))}

                {/* Unassigned Job Alert */}
                {scopedJobs
                  .filter((j) => j.status === 'PENDING')
                  .map((job) => (
                    <div
                      key={job.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">Unassigned Job #{job.id}</div>
                        <p className="text-slate-600">{job.customerAddress} ({job.scheduledWindow})</p>
                      </div>
                      <button
                        onClick={() => setActiveWorkspace('dispatch')}
                        className="px-3 min-h-11 bg-slate-900 text-white rounded-lg font-semibold self-start sm:self-auto cursor-pointer"
                      >
                        {t('Assign Driver', 'ড্রাইভার নির্ধারণ')}
                      </button>
                    </div>
                  ))}

                {/* Open Complaints */}
                {openComplaints.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">Customer Challenge #{c.id}</div>
                        <p className="text-slate-600">{c.description}</p>
                      </div>
                      <button
                        onClick={() => setActiveWorkspace('customers')}
                        className="px-3 min-h-11 bg-rose-700 text-white rounded-lg font-semibold self-start sm:self-auto cursor-pointer"
                      >
                        {t('Open Case', 'কেস খুলুন')}
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Side Panel: Service Area & Provider Filters (PRD A01) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">Operational Scope Filters</h3>
              <div>
                <label htmlFor="op-zone" className="block text-slate-500 mb-1 font-medium">Service Lane</label>
                <select
                  id="op-zone"
                  value={selectedZoneFilter}
                  onChange={(e) => setSelectedZoneFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 min-h-11 text-slate-900"
                >
                  <option value="all">All Pilot Zones (Dhaka North)</option>
                  {serviceZones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="op-provider" className="block text-slate-500 mb-1 font-medium">Collection Enterprise</label>
                <select
                  id="op-provider"
                  value={selectedProviderFilter}
                  onChange={(e) => setSelectedProviderFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 min-h-11 text-slate-900"
                >
                  <option value="all">All Providers</option>
                  {providers.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2 text-slate-600">
                <div className="flex justify-between">
                  <span>Collectors with active jobs:</span>
                  <span className="font-bold font-mono text-slate-900">{collectorsInField}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hub scales registered:</span>
                  <span className="font-bold font-mono text-emerald-800">1 (GW-01) <span className="font-sans font-normal text-slate-400">· sample</span></span>
                </div>
              </div>

              {/* Automated 24h Reminder Gateway Monitor */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Bell className="w-3.5 h-3.5 text-[#F5BF55]" aria-hidden="true" />
                    <span>24h Reminder Service</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                    Manual trigger · demo
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">24h Reminders Sent:</span>
                    <span className="font-bold font-mono text-slate-900">
                      {reminders24hSent}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Read by customers:</span>
                    <span className="font-bold font-mono text-indigo-700">{reminders24hRead} / {reminders24hSent}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReminderRun}
                  className="w-full min-h-11 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
                >
                  <Sparkles className="w-3 h-3 text-[#C9F1DC]" aria-hidden="true" />
                  <span>Run Automated Dispatcher</span>
                </button>
                {reminderMessage && (
                  <p role="status" className="text-[11px] text-slate-600">{reminderMessage}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* WORKSPACE 2: BOOKINGS (Wireframe A03 Booking Detail) */}
      {/* ========================================================================= */}
      {activeWorkspace === 'bookings' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">{t('Bookings Management (PRD A03)', 'বুকিং ব্যবস্থাপনা (PRD A03)')}</h2>
              <p className="text-xs text-slate-500">
                Role-limited customer records, collection windows, and service terms.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Booking ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Address</th>
                  <th className="py-2.5 px-3">Window</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Evidence</th>
                  <th className="py-2.5 px-3 text-right">Confirmed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {scopedBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3 font-bold text-slate-900">{b.id}</td>
                    <td className="py-3 px-3 font-sans text-slate-700">{b.customerName}</td>
                    <td className="py-3 px-3 font-sans text-slate-500 max-w-xs truncate">{b.address}</td>
                    <td className="py-3 px-3 text-slate-600">{b.scheduledDate}</td>
                    <td className="py-3 px-3 font-sans text-[11px] font-semibold text-slate-800">
                      {b.status}
                    </td>
                    <td className="py-3 px-3">
                      <EvidenceBadge level={b.evidenceLevel} interactive={false} />
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {b.confirmedWeightKg ? `${b.confirmedWeightKg} kg` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* WORKSPACE 3: DISPATCH BOARD (Wireframe A02) */}
      {/* ========================================================================= */}
      {activeWorkspace === 'dispatch' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">{t('Dispatch Board (PRD A02)', 'ডিসপ্যাচ বোর্ড (PRD A02)')}</h2>
              <p className="text-xs text-slate-500">
                Manage jobs across statuses. Reassignment records mandatory reason in audit log.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              { id: 'PENDING', title: 'Unassigned', statuses: ['PENDING'] },
              { id: 'ACCEPTED', title: 'Assigned / In progress', statuses: ['ACCEPTED', 'EN_ROUTE'] },
              { id: 'COMPLETED', title: 'Completed', statuses: ['COMPLETED'] },
              { id: 'EXCEPTION', title: 'Exceptions', statuses: ['EXCEPTION'] }
            ].map((colDef) => ({ ...colDef, jobs: scopedJobs.filter((j) => colDef.statuses.includes(j.status)) })).map((col) => (
              <div key={col.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>{col.title}</span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{col.jobs.length}</span>
                </div>

                <div className="space-y-2">
                  {col.jobs.map((job) => (
                      <div key={job.id} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between font-mono font-bold">
                          <span>{job.id}</span>
                          <span className="text-[10px] text-slate-400">{job.bookingId}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] truncate">{job.customerAddress}</p>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                          <span className="text-slate-500">{job.collectorName.split(' ')[0]}</span>
                          {(job.status === 'PENDING' || job.status === 'ACCEPTED' || job.status === 'EN_ROUTE') && (
                            <button
                              type="button"
                              onClick={() => {
                                setReassignJobId(job.id);
                                setReassignReason('');
                                setReassignError('');
                              }}
                              className="text-emerald-700 font-semibold hover:underline min-h-11 px-2 cursor-pointer"
                            >
                              {t('Reassign', 'পুনর্বণ্টন')}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <Modal
            open={Boolean(reassignJobId)}
            onClose={() => setReassignJobId(null)}
            size="sm"
            title={`${t('Reassign Job', 'কাজ পুনর্বণ্টন')} #${reassignJobId}`}
            description="PRD A02: Every reassignment records a mandatory audit reason."
          >
            <form onSubmit={handleReassign} className="space-y-3 text-xs">
              <div>
                <label htmlFor="reassign-collector" className="block text-slate-700 font-medium mb-1">New Collector / Provider</label>
                <input
                  id="reassign-collector"
                  type="text"
                  list="reassign-collector-list"
                  value={newCollectorName}
                  onChange={(e) => setNewCollectorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 min-h-11 text-slate-900"
                />
                <datalist id="reassign-collector-list">
                  {knownCollectors.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div>
                <label htmlFor="reassign-reason" className="block text-slate-700 font-medium mb-1">Mandatory Reassignment Reason *</label>
                <input
                  id="reassign-reason"
                  type="text"
                  required
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder="e.g. Route optimization / capacity rebalancing"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 min-h-11 text-slate-900"
                />
              </div>
              {reassignError && (
                <p role="alert" className="text-rose-700 font-semibold">{reassignError}</p>
              )}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button type="button" onClick={() => setReassignJobId(null)} className="px-3.5 min-h-11 bg-white border border-slate-300 rounded-lg text-slate-600 cursor-pointer">
                  {t('Cancel', 'বাতিল')}
                </button>
                <button type="submit" className="px-4 min-h-11 bg-slate-900 text-white rounded-lg font-semibold cursor-pointer">
                  {t('Confirm Reassignment', 'পুনর্বণ্টন নিশ্চিত করুন')}
                </button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {/* ========================================================================= */}
      {/* WORKSPACE 4: MATERIAL & SCALES (Wireframes A04 Aggregation Receipt, A05 Lot Detail) */}
      {/* ========================================================================= */}
      {activeWorkspace === 'material' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Material Traceability & Scale Ledger (PRD A04, A05)</h2>
            <p className="text-xs text-slate-500">
              Preserves field pickup and certified receiving measurements separately. Full mass balance audit trail.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200 font-mono">
                <tr>
                  <th className="py-2.5 px-3">Lot Identifier</th>
                  <th className="py-2.5 px-3">Material Category</th>
                  <th className="py-2.5 px-3">Field Pickup (E1)</th>
                  <th className="py-2.5 px-3">Hub Scale (E2)</th>
                  <th className="py-2.5 px-3">Discrepancy</th>
                  <th className="py-2.5 px-3">Current Custodian</th>
                  <th className="py-2.5 px-3 text-right">Evidence Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {scopedLots.map((lot) => (
                  <tr key={lot.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3 font-bold text-slate-900">{lot.id}</td>
                    <td className="py-3 px-3 font-sans text-slate-700">{lot.material.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-3 text-slate-600">{lot.initialFieldWeightKg} kg</td>
                    <td className="py-3 px-3 text-slate-900 font-bold">
                      {lot.verifiedHubWeightKg ? `${lot.verifiedHubWeightKg} kg` : 'Pending E2'}
                    </td>
                    <td className="py-3 px-3">
                      {lot.discrepancyPercentage !== undefined ? (
                        <span className={`font-bold ${isOverTolerance(lot.discrepancyPercentage) ? 'text-amber-700' : 'text-slate-600'}`}>
                          {lot.discrepancyPercentage}%
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-600 text-[11px]">{lot.currentCustodian}</td>
                    <td className="py-3 px-3 text-right">
                      <EvidenceBadge level={lot.evidenceLevel} interactive={false} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* WORKSPACE 5: REWARDS ADMIN (Wireframe A07) */}
      {/* ========================================================================= */}
      {activeWorkspace === 'rewards' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Rewards Administration & Rules (PRD A07)</h2>
            <p className="text-xs text-slate-500">
              Reward liabilities, funding sources, rule versions, and partner redemption inventories.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block font-sans">POINTS ISSUED (SETTLED CREDITS)</span>
              <span className="text-2xl font-bold text-slate-900">{totalPointsAwarded} pts</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block font-sans">EST. LIABILITY (BDT, ৳0.65/pt assumption)</span>
              <span className="text-2xl font-bold text-emerald-800">৳{Math.round(totalPointsAwarded * 0.65)}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block font-sans">ACTIVE CATALOGUE OFFERS</span>
              <span className="text-2xl font-bold text-slate-900">{rewards.length} partners</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* WORKSPACE 6: CUSTOMERS (Wireframe A08 Customer Cases) */}
      {/* ========================================================================= */}
      {activeWorkspace === 'customers' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">{t('Customer Support Cases & Challenges (PRD A08)', 'গ্রাহক সহায়তা কেস (PRD A08)')}</h2>
            <p className="text-xs text-slate-500">
              Customer issue tickets with prefilled transaction context and transparent resolution logs.
            </p>
          </div>

          <div className="space-y-3">
            {scopedComplaints.length === 0 && (
              <p className="p-6 text-center bg-slate-50 rounded-xl text-xs text-slate-500">No cases in this scope.</p>
            )}
            {scopedComplaints.map((c) => {
              const canResolve = c.status === 'OPEN' || c.status === 'INVESTIGATING';
              const draft = resolutionDrafts[c.id] ?? '';
              return (
                <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{c.id}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-slate-800">{c.customerName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-slate-500">{c.type}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${COMPLAINT_BADGE[c.status]}`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-slate-700">{c.description}</p>
                  {c.bookingId && <p className="text-[11px] text-slate-500 font-mono">Booking: {c.bookingId}</p>}
                  {c.resolutionNotes && (
                    <div className="p-2.5 bg-slate-50 rounded-lg text-slate-600 text-[11px]">
                      <strong>Audit Resolution: </strong> {c.resolutionNotes}
                      {c.resolvedAt && <span className="text-slate-400"> · {c.resolvedAt.split('T')[0]}</span>}
                    </div>
                  )}
                  {canResolve && (
                    <form
                      className="flex flex-col sm:flex-row sm:items-end gap-2 pt-2 border-t border-slate-100"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!draft.trim()) return;
                        resolveComplaint(c.id, draft.trim());
                        setResolutionDrafts((prev) => ({ ...prev, [c.id]: '' }));
                      }}
                    >
                      <div className="flex-1">
                        <label htmlFor={`resolve-${c.id}`} className="block text-slate-600 font-medium mb-1">
                          {t('Resolution note (visible to the customer) *', 'সমাধানের নোট *')}
                        </label>
                        <input
                          id={`resolve-${c.id}`}
                          type="text"
                          required
                          value={draft}
                          onChange={(e) => setResolutionDrafts((prev) => ({ ...prev, [c.id]: e.target.value }))}
                          placeholder="e.g. Re-weighed on certified scale; points adjusted."
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 min-h-11 text-slate-900"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!draft.trim()}
                        className="px-4 min-h-11 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg font-semibold cursor-pointer"
                      >
                        {t('Resolve', 'সমাধান করুন')}
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* WORKSPACE 7: PARTNERS */}
      {/* ========================================================================= */}
      {activeWorkspace === 'partners' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
          <h2 className="text-base font-bold text-slate-900">Authorized Recovery Partners & Processors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block text-sm">Bengal Polymers & Flake Mill</span>
              <span className="text-slate-500 block">Savar Industrial Zone · License #DOE-RECY-984</span>
              <span className="text-emerald-700 font-semibold block text-[11px]">Approved PET Flake Downstream</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block text-sm">Meghna Paper & Pulp Line 2</span>
              <span className="text-slate-500 block">Narayanganj Complex · License #DOE-PULP-112</span>
              <span className="text-emerald-700 font-semibold block text-[11px]">Approved OCC Cardboard Hydrapulping</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* WORKSPACE 8: REPORTS */}
      {/* ========================================================================= */}
      {activeWorkspace === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs font-mono">
          <h2 className="text-base font-bold text-slate-900 font-sans">Pilot Performance & Measurement Report</h2>
          <p className="text-slate-500 font-sans">PRD § 2.3: Collected, Accepted, Processed, and Verified reported strictly separately.</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-sans">1. COLLECTED</span>
              <span className="text-lg font-bold text-slate-900">{totalCollectedKg.toFixed(1)} kg</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-sans">2. ACCEPTED</span>
              <span className="text-lg font-bold text-emerald-800">{totalAcceptedKg.toFixed(1)} kg</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-sans">3. PROCESSED</span>
              <span className="text-lg font-bold text-indigo-800">{totalProcessedKg.toFixed(1)} kg</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-sans">4. VERIFIED EPR</span>
              <span className="text-lg font-bold text-emerald-950">{totalVerifiedEprKg.toFixed(1)} kg</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* WORKSPACE: AUDIT TRAIL */}
      {/* ========================================================================= */}
      {activeWorkspace === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">{t('Audit trail', 'অডিট ট্রেইল')}</h2>
              <p className="text-xs text-slate-500">
                Append-only record of every state change, newest first. {visibleAudit.length} of {auditLogs.length} events.
              </p>
            </div>
            <div className="sm:w-64">
              <label htmlFor="audit-filter" className="block text-xs font-medium text-slate-600 mb-1">Filter by action</label>
              <select
                id="audit-filter"
                value={auditActionFilter}
                onChange={(e) => setAuditActionFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 min-h-11 text-xs text-slate-900"
              >
                <option value="all">All actions</option>
                {auditActions.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {visibleAudit.length === 0 ? (
            <p className="p-6 text-center bg-slate-50 rounded-xl text-xs text-slate-500">No audit events match this filter.</p>
          ) : (
            <ol className="space-y-2">
              {visibleAudit.map((ev) => (
                <li key={ev.id} className="p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono font-bold text-slate-900">{ev.action}</span>
                    <time dateTime={ev.timestamp} className="font-mono text-[11px] text-slate-500">
                      {ev.timestamp.replace('T', ' ').slice(0, 19)}
                    </time>
                  </div>
                  <div className="text-slate-600">
                    <span className="font-mono">{ev.targetObject}</span> <span className="font-mono font-semibold text-slate-800 break-all">{ev.targetId}</span>
                    <span aria-hidden="true"> · </span>
                    {ev.actor} <span className="text-slate-400">({ev.actorRole})</span>
                  </div>
                  {(ev.priorValue || ev.newValue) && (
                    <div className="font-mono text-[11px] text-slate-600">
                      {ev.priorValue ?? '—'} <span aria-hidden="true">→</span> {ev.newValue ?? '—'}
                    </div>
                  )}
                  {ev.reason && <p className="text-slate-700">{ev.reason}</p>}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* WORKSPACE 9: SETTINGS & SERVICE ZONES (Wireframe A09) */}
      {/* ========================================================================= */}
      {activeWorkspace === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Service Zones & Partner Settings (PRD A09)</h2>
            <p className="text-xs text-slate-500">
              Changes require effective dates and are logged in the immutable audit history.
            </p>
          </div>

          <div className="space-y-3">
            {serviceZones.map((z) => (
              <div key={z.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{z.name}</span>
                  <span className="text-slate-500">{z.coverageDescription}</span>
                </div>
                <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {z.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
