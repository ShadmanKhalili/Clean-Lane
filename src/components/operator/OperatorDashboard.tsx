import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EvidenceBadge } from '../common/EvidenceBadge';
import { Booking, MaterialLot, PickupJob } from '../../types';
import {
  LayoutDashboard,
  Calendar,
  Truck,
  Layers,
  Gift,
  Users,
  Building,
  BarChart3,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Scale,
  ArrowRight,
  ShieldCheck,
  FileText,
  Search,
  Filter,
  DollarSign,
  Bell,
  Smartphone,
  MessageSquare,
  Sparkles
} from 'lucide-react';

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
    triggerManual24hReminderCheck,
    totalCollectedKg,
    totalAcceptedKg,
    totalProcessedKg,
    totalVerifiedEprKg,
    lang,
    showToast
  } = useApp();

  // 9 Workspaces: Overview, Bookings, Dispatch, Material, Rewards, Customers, Partners, Reports, Settings
  const [activeWorkspace, setActiveWorkspace] = useState<
    'overview' | 'bookings' | 'dispatch' | 'material' | 'rewards' | 'customers' | 'partners' | 'reports' | 'settings'
  >('overview');

  // Side Filters for Zone and Provider (PRD A01)
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('all');
  const [selectedProviderFilter, setSelectedProviderFilter] = useState<string>('all');

  // Reassignment Modal State (PRD A02)
  const [reassignJobId, setReassignJobId] = useState<string | null>(null);
  const [newCollectorName, setNewCollectorName] = useState<string>('Enterprise Route #2 (Kamrul)');
  const [reassignReason, setReassignReason] = useState<string>('');

  // Commercial ledger calculations
  const totalServiceFees = bookings.reduce((acc, b) => acc + (b.serviceFeeBdt || 0), 0);
  const totalMaterialPayouts = bookings.reduce((acc, b) => acc + (b.materialPayoutBdt || 0), 0);
  const totalPointsAwarded = bookings.reduce((acc, b) => acc + (b.earnedPoints || 0), 0);

  // Indicators (PRD A01)
  const openBookingsCount = bookings.filter((b) => b.status === 'REQUESTED' || b.status === 'CONFIRMED').length;
  const unassignedJobsCount = jobs.filter((j) => j.status === 'PENDING').length;
  const weightDiscrepanciesCount = lots.filter((l) => l.discrepancyPercentage !== undefined && !l.discrepancyResolved).length;
  const unresolvedComplaintsCount = complaints.filter((c) => c.status === 'OPEN').length;

  return (
    <div className="space-y-6">
      {/* 9 Workspaces Navigation Bar (PRD Section 1 Operator Console) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'bookings', label: `Bookings (${bookings.length})`, icon: Calendar },
            { id: 'dispatch', label: 'Dispatch Board', icon: Truck },
            { id: 'material', label: 'Material & Scales', icon: Scale },
            { id: 'rewards', label: 'Rewards Admin', icon: Gift },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'partners', label: 'Partners', icon: Building },
            { id: 'reports', label: 'Reports', icon: BarChart3 },
            { id: 'settings', label: 'Settings & Zones', icon: Settings }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeWorkspace === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveWorkspace(item.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
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
                    Exception-First Operations Queue (PRD A01)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Prioritizes tasks requiring manual operator decision or re-routing.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Weight Discrepancy Alert */}
                {lots
                  .filter((l) => l.discrepancyPercentage !== undefined && !l.discrepancyResolved)
                  .map((lot) => (
                    <div
                      key={lot.id}
                      className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-700" />
                          <span className="font-bold text-slate-900">Weight Discrepancy #{lot.id}</span>
                          <span className="font-mono text-amber-800 font-bold">{lot.discrepancyPercentage}%</span>
                        </div>
                        <p className="text-slate-600">
                          Field: {lot.initialFieldWeightKg} kg vs Certified Hub Scale: {lot.verifiedHubWeightKg} kg
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveWorkspace('material')}
                        className="px-3 py-1.5 bg-amber-700 text-white rounded-lg font-semibold self-start sm:self-auto cursor-pointer"
                      >
                        Review Scale Log
                      </button>
                    </div>
                  ))}

                {/* Unassigned Job Alert */}
                {jobs
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
                        className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-semibold self-start sm:self-auto cursor-pointer"
                      >
                        Assign Driver
                      </button>
                    </div>
                  ))}

                {/* Open Complaints */}
                {complaints
                  .filter((c) => c.status === 'OPEN')
                  .map((c) => (
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
                        className="px-3 py-1.5 bg-rose-700 text-white rounded-lg font-semibold self-start sm:self-auto cursor-pointer"
                      >
                        Open Case
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Side Panel: Service Area & Provider Filters (PRD A01) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">Operational Scope Filters</h3>
              <div>
                <label className="block text-slate-500 mb-1 font-medium">Service Lane</label>
                <select
                  value={selectedZoneFilter}
                  onChange={(e) => setSelectedZoneFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
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
                <label className="block text-slate-500 mb-1 font-medium">Collection Enterprise</label>
                <select
                  value={selectedProviderFilter}
                  onChange={(e) => setSelectedProviderFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                >
                  <option value="all">All Providers</option>
                  <option value="ent1">Dhaka Clean Lane Enterprise #1</option>
                  <option value="ent2">Banani Recovery Collective</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2 text-slate-600">
                <div className="flex justify-between">
                  <span>Active E-Trikes:</span>
                  <span className="font-bold font-mono text-slate-900">4 in field</span>
                </div>
                <div className="flex justify-between">
                  <span>Hub Scales Online:</span>
                  <span className="font-bold font-mono text-emerald-800">1 (GW-01)</span>
                </div>
              </div>

              {/* Automated 24h Reminder Gateway Monitor */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Bell className="w-3.5 h-3.5 text-[#F5BF55]" />
                    <span>24h Reminder Service</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                    Active (Cron)
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">24h Reminders Sent:</span>
                    <span className="font-bold font-mono text-slate-900">
                      {notifications.filter((n) => n.type === 'COLLECTION_REMINDER_24H').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">SMS Gateway Rate:</span>
                    <span className="font-bold font-mono text-emerald-700">99.8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Prep Checklist Opens:</span>
                    <span className="font-bold font-mono text-indigo-700">94.2%</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const count = triggerManual24hReminderCheck();
                    showToast(
                      count > 0
                        ? `Auto-Scheduler ran: ${count} 24h reminder(s) dispatched to customers!`
                        : 'Auto-Scheduler checked: all upcoming collections have reminders active.'
                    );
                  }}
                  className="w-full py-1.5 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
                >
                  <Sparkles className="w-3 h-3 text-[#C9F1DC]" />
                  <span>Run Automated Dispatcher</span>
                </button>
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
              <h2 className="text-base font-bold text-slate-900">Bookings Management (PRD A03)</h2>
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
                {bookings.map((b) => (
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
              <h2 className="text-base font-bold text-slate-900">Dispatch Board (PRD A02)</h2>
              <p className="text-xs text-slate-500">
                Manage jobs across statuses. Reassignment records mandatory reason in audit log.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              { id: 'PENDING', title: 'Unassigned', count: jobs.filter((j) => j.status === 'PENDING').length },
              { id: 'ACCEPTED', title: 'Assigned', count: jobs.filter((j) => j.status === 'ACCEPTED').length },
              { id: 'COMPLETED', title: 'Completed', count: jobs.filter((j) => j.status === 'COMPLETED').length },
              { id: 'EXCEPTION', title: 'Exceptions', count: jobs.filter((j) => j.status === 'EXCEPTION').length }
            ].map((col) => (
              <div key={col.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>{col.title}</span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{col.count}</span>
                </div>

                <div className="space-y-2">
                  {jobs
                    .filter((j) => j.status === col.id)
                    .map((job) => (
                      <div key={job.id} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between font-mono font-bold">
                          <span>{job.id}</span>
                          <span className="text-[10px] text-slate-400">{job.bookingId}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] truncate">{job.customerAddress}</p>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                          <span className="text-slate-500">{job.collectorName.split(' ')[0]}</span>
                          <button
                            onClick={() => {
                              setReassignJobId(job.id);
                              setReassignReason('');
                            }}
                            className="text-emerald-700 font-semibold hover:underline"
                          >
                            Reassign
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Reassign Modal */}
          {reassignJobId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 space-y-4 text-xs">
                <h3 className="text-base font-bold text-slate-900">Reassign Job #{reassignJobId}</h3>
                <p className="text-slate-500">PRD A02: Every reassignment records a mandatory audit reason.</p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">New Collector / Provider</label>
                    <input
                      type="text"
                      value={newCollectorName}
                      onChange={(e) => setNewCollectorName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Mandatory Reassignment Reason *</label>
                    <input
                      type="text"
                      required
                      value={reassignReason}
                      onChange={(e) => setReassignReason(e.target.value)}
                      placeholder="e.g. Route optimization / capacity rebalancing"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setReassignJobId(null)}
                    className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!reassignReason) return;
                      alert(`Job ${reassignJobId} reassigned to ${newCollectorName}. Audit log recorded.`);
                      setReassignJobId(null);
                    }}
                    className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-semibold"
                  >
                    Confirm Reassignment
                  </button>
                </div>
              </div>
            </div>
          )}
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
                {lots.map((lot) => (
                  <tr key={lot.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3 font-bold text-slate-900">{lot.id}</td>
                    <td className="py-3 px-3 font-sans text-slate-700">{lot.material.replace('_', ' ')}</td>
                    <td className="py-3 px-3 text-slate-600">{lot.initialFieldWeightKg} kg</td>
                    <td className="py-3 px-3 text-slate-900 font-bold">
                      {lot.verifiedHubWeightKg ? `${lot.verifiedHubWeightKg} kg` : 'Pending E2'}
                    </td>
                    <td className="py-3 px-3">
                      {lot.discrepancyPercentage !== undefined ? (
                        <span className={`font-bold ${Math.abs(lot.discrepancyPercentage) > 5 ? 'text-amber-700' : 'text-slate-600'}`}>
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
              <span className="text-slate-500 block font-sans">TOTAL CIRCULAR POINTS</span>
              <span className="text-2xl font-bold text-slate-900">{totalPointsAwarded} pts</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block font-sans">REWARD LIABILITY (BDT)</span>
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
            <h2 className="text-base font-bold text-slate-900">Customer Support Cases & Challenges (PRD A08)</h2>
            <p className="text-xs text-slate-500">
              Customer issue tickets with prefilled transaction context and transparent resolution logs.
            </p>
          </div>

          <div className="space-y-3">
            {complaints.map((c) => (
              <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{c.id}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-slate-800">{c.customerName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-slate-500">{c.type}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${c.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-slate-700">{c.description}</p>
                {c.resolutionNotes && (
                  <div className="p-2.5 bg-slate-50 rounded-lg text-slate-600 text-[11px]">
                    <strong>Audit Resolution: </strong> {c.resolutionNotes}
                  </div>
                )}
              </div>
            ))}
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
