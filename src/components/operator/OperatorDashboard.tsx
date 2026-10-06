import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EvidenceBadge } from '../common/EvidenceBadge';
import {
  Activity,
  Layers,
  MapPin,
  TrendingUp,
  AlertTriangle,
  History,
  DollarSign,
  Scale,
  Users,
  ShieldCheck,
  CheckCircle,
  FileText
} from 'lucide-react';

export const OperatorDashboard: React.FC = () => {
  const {
    bookings,
    lots,
    serviceZones,
    auditLogs,
    complaints,
    totalCollectedKg,
    totalAcceptedKg,
    totalProcessedKg,
    totalVerifiedEprKg,
    lang
  } = useApp();

  const [activeTab, setActiveTab] = useState<'metrics' | 'zones' | 'audit' | 'complaints'>('metrics');

  // Commercial ledger calculations
  const totalServiceFees = bookings.reduce((acc, b) => acc + (b.serviceFeeBdt || 0), 0);
  const totalMaterialPayouts = bookings.reduce((acc, b) => acc + (b.materialPayoutBdt || 0), 0);
  const totalPointsAwarded = bookings.reduce((acc, b) => acc + (b.earnedPoints || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Activity className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold text-slate-800">Clean Lane Operations Administration</span>
            <span aria-hidden="true">·</span>
            <span>Governance & Pilot Oversight</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            {lang === 'en' ? 'Pilot Performance, Mass Balance & Audit Log' : 'পাইলট পারফরম্যান্স ও অডিট রেকর্ড'}
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            PRD § 2.3 & § 18 Measurement Rule: Strictly report collected, accepted, processed, and verified quantities separately.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'metrics'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mass Balance & Ledger
          </button>
          <button
            onClick={() => setActiveTab('zones')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'zones'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Service Zones ({serviceZones.length})
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'complaints'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Disputes ({complaints.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'audit'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Log ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Mass Balance & Pilot Metrics */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          {/* North Star KPI Framework (PRD Section 2.2 & 2.3) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-medium text-slate-500 block">1. Collected Quantity (Field E1)</span>
              <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {totalCollectedKg.toFixed(1)} kg
              </div>
              <div className="text-[11px] text-slate-500">
                Gross weight reported at doorsteps
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-medium text-slate-500 block">2. Accepted Quantity (Hub Scale E2)</span>
              <div className="text-2xl font-bold font-mono text-emerald-800 tabular-nums">
                {totalAcceptedKg.toFixed(1)} kg
              </div>
              <div className="text-[11px] text-emerald-700">
                Verified on calibrated platform scales
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-medium text-slate-500 block">3. Processed Quantity (Mill E4)</span>
              <div className="text-2xl font-bold font-mono text-indigo-800 tabular-nums">
                {totalProcessedKg.toFixed(1)} kg
              </div>
              <div className="text-[11px] text-indigo-700">
                Documented mechanical recycling yields
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-medium text-slate-500 block">4. Audited EPR Claims (E5)</span>
              <div className="text-2xl font-bold font-mono text-emerald-900 tabular-nums">
                {totalVerifiedEprKg.toFixed(1)} kg
              </div>
              <div className="text-[11px] text-emerald-800">
                Third-party reviewed & sealed
              </div>
            </div>
          </div>

          {/* Mass Balance Funnel & Financial Ledger */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mass Balance Waterfall */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                Mass Balance & Shrinkage Reconciliation
              </h3>
              <p className="text-xs text-slate-500">
                Compares intake weight, sorting residue, and process loss to prevent "ghost recovery" claims.
              </p>

              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-700 font-sans">Gross Doorstep Pickup</span>
                  <span className="font-bold text-slate-900">{totalCollectedKg.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-700 font-sans">Moisture & Field Scale Shrinkage</span>
                  <span className="text-amber-800 font-bold">
                    -{(totalCollectedKg - totalAcceptedKg).toFixed(1)} kg ({(((totalCollectedKg - totalAcceptedKg) / (totalCollectedKg || 1)) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl text-emerald-900">
                  <span className="font-sans font-semibold">Accepted Net Hub Feedstock</span>
                  <span className="font-bold">{totalAcceptedKg.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-700 font-sans">Mechanical Process Conversion Loss</span>
                  <span className="text-rose-800 font-bold">
                    -{(totalAcceptedKg - totalProcessedKg).toFixed(1)} kg
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-xl text-indigo-900">
                  <span className="font-sans font-semibold">Net Finished Recovered Material</span>
                  <span className="font-bold">{totalProcessedKg.toFixed(1)} kg</span>
                </div>
              </div>
            </div>

            {/* Commercial Trail & Ledger (PRD Section 12) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                Commercial Ledger (Service Fees vs Payouts)
              </h3>
              <p className="text-xs text-slate-500">
                PRD § 12: Independent financial trail ensuring rewards, material buyback, and fees remain distinct.
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block">Service Fees Invoiced</span>
                  <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                    ৳{totalServiceFees.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Commercial & bulky rates</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block">Material Cash Payouts</span>
                  <span className="text-lg font-bold font-mono text-emerald-800 tabular-nums">
                    ৳{totalMaterialPayouts.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Disbursed to customers</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block">Total Circular Points Issued</span>
                  <span className="text-lg font-bold font-mono text-cyan-800 tabular-nums">
                    {totalPointsAwarded.toLocaleString()} pts
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Funded by partners & operators</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block">Estimated Reward Liability</span>
                  <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                    ৳{Math.round(totalPointsAwarded * 0.65).toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">At ৳0.65 / point conversion</span>
                </div>
              </div>

              <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 leading-relaxed">
                <strong>Commercial Principle:</strong> Rewards points liabilities are ring-fenced by brand sponsor contributions, preventing insolvency or cross-subsidies between municipal routes.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Service Zones Configuration */}
      {activeTab === 'zones' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Controlled Service Zones (Clean Lanes)</h3>
            <p className="text-xs text-slate-500">
              PRD § 1.1: A controlled waste-recovery clean lane, bounded by serviceable logistics.
            </p>
          </div>

          <div className="space-y-3">
            {serviceZones.map((zone) => (
              <div
                key={zone.id}
                className="p-5 rounded-xl border border-slate-200 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    <span className="font-bold text-slate-900 text-sm">{zone.name}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-slate-500">{zone.id}</span>
                  </div>
                  <p className="text-slate-600">{zone.coverageDescription}</p>
                  <div className="text-slate-500 text-[11px]">
                    Enterprise: <strong>{zone.assignedEnterprise}</strong> · Lead time: {zone.leadTimeHours} hrs
                  </div>
                </div>

                <div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      zone.status === 'active_clean_lane'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {zone.status === 'active_clean_lane' ? 'Active Clean Lane' : 'Expansion Waitlist'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Complaints & Disputes */}
      {activeTab === 'complaints' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Customer Complaints & Dispute Log</h3>
            <p className="text-xs text-slate-500">
              PRD § C-25 & Section 16: Visible dispute resolutions without silent editing of historical records.
            </p>
          </div>

          <div className="space-y-3">
            {complaints.map((cmp) => (
              <div
                key={cmp.id}
                className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{cmp.id}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-slate-700">{cmp.customerName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-slate-500">{cmp.type}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      cmp.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {cmp.status}
                  </span>
                </div>

                <p className="text-slate-700">{cmp.description}</p>

                {cmp.resolutionNotes && (
                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100 text-emerald-950 text-[11px]">
                    <strong>Resolution note: </strong> {cmp.resolutionNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Append-Only Immutable Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Append-Only Audit Trail (PRD § 15 & Architecture Principle)
            </h3>
            <p className="text-xs text-slate-500">
              Every state change preserves original value, new value, actor, reason, and timestamp.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Actor / Role</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Target</th>
                  <th className="py-2.5 px-3">Reason / Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {log.timestamp.replace('T', ' ').slice(0, 19)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-900 font-semibold">
                      {log.actor} ({log.actorRole})
                    </td>
                    <td className="py-2.5 px-3 text-emerald-800 font-bold">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {log.targetObject} #{log.targetId}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-700 max-w-md truncate">
                      {log.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
