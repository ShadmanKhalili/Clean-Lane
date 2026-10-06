import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MaterialCategory } from '../../types';
import {
  Building2,
  Calendar,
  FileText,
  Users,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
  TrendingUp,
  FileDown
} from 'lucide-react';

export const OrganisationDashboardView: React.FC = () => {
  const { role, lang, bookings, orgMembers, requestRecurringService, lots } = useApp();
  const [activeOrgTab, setActiveOrgTab] = useState<'overview' | 'calendar' | 'report' | 'members'>('overview');
  const [extraPickupModalOpen, setExtraPickupModalOpen] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialCategory[]>(['CARDBOARD_OCC', 'PET_BOTTLES']);
  const [arrangementNotes, setArrangementNotes] = useState('');

  const orgName =
    role === 'customer_business'
      ? 'Artisan Roastery & Café'
      : 'Green View Heights Committee';

  const siteAddress =
    role === 'customer_business'
      ? 'Road 60, Gulshan-2, Dhaka'
      : 'Plot 32, Road 11, Banani Block C, Dhaka';

  // Calculate building totals
  const buildingBookings = bookings.filter((b) =>
    role === 'customer_business' ? b.customerType === 'business' : b.customerType === 'apartment'
  );

  const totalBuildingKg = buildingBookings.reduce(
    (acc, b) => acc + (b.confirmedWeightKg || b.fieldWeightKg || 0),
    0
  );

  const handleRequestService = (e: React.FormEvent) => {
    e.preventDefault();
    requestRecurringService(orgName, 'weekly', selectedMaterials, arrangementNotes);
    setExtraPickupModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Organisation Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Building2 className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold text-slate-800">{orgName}</span>
            <span aria-hidden="true">·</span>
            <span>Site: {siteAddress}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            {lang === 'en' ? 'Organisation & Site Waste Operations' : 'প্রতিষ্ঠান ও সাইট বর্জ্য ব্যবস্থাপনা'}
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            PRD § 4.1 & B01: Centralized commercial reporting for shared complexes. Building totals are tracked independently from individual resident accounts.
          </p>
        </div>

        {/* Tab Controls (B01-B04) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveOrgTab('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeOrgTab === 'overview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveOrgTab('calendar')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeOrgTab === 'calendar'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Calendar (B02)
          </button>
          <button
            onClick={() => setActiveOrgTab('report')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeOrgTab === 'report'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Report (B03)
          </button>
          <button
            onClick={() => setActiveOrgTab('members')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeOrgTab === 'members'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Members (B04)
          </button>
        </div>
      </div>

      {/* Tab 1: Overview (B01) */}
      {activeOrgTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Indicator Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-medium text-slate-500 block">Next Scheduled Pickup</span>
              <div className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>Thursday, 08:30 AM</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Basement bay #2 · Collector Tariq Hossain
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-medium text-slate-500 block">Confirmed Building Weight</span>
              <div className="text-2xl font-bold font-mono text-emerald-800 tabular-nums">
                {totalBuildingKg.toFixed(1)} kg
              </div>
              <div className="text-[11px] text-emerald-700">
                Across {buildingBookings.length} completed cycles
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-medium text-slate-500 block">Open Exceptions / Issues</span>
              <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">0</div>
              <div className="text-[11px] text-slate-500">
                All collections completed on schedule
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setExtraPickupModalOpen(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Request Extra Pickup Arrangement</span>
            </button>
            <button
              onClick={() => setActiveOrgTab('report')}
              className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-slate-500" />
              <span>View Building Period Report</span>
            </button>
          </div>

          {/* Building Attribution Safeguard Note */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl text-xs text-emerald-950 space-y-1">
            <span className="font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              PRD § R-08 Attribution Safeguard:
            </span>
            <p className="leading-relaxed text-[11px]">
              Building-level and individual resident rewards maintain separate attribution rules. The platform strictly prohibits awarding individual residents points for the entire complex’s gross weight.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Service Calendar (B02) */}
      {activeOrgTab === 'calendar' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Weekly Collection Schedule</h3>
              <p className="text-xs text-slate-500">
                Authorised site schedule for {orgName}.
              </p>
            </div>
            <button
              onClick={() => setExtraPickupModalOpen(true)}
              className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Request Schedule Change
            </button>
          </div>

          <div className="space-y-3">
            {[
              {
                date: '2026-10-08 (Thursday)',
                time: '08:30 AM - 10:30 AM',
                status: 'CONFIRMED',
                driver: 'Tariq Hossain (#DH-14)',
                materials: 'Cardboard & PET bottles'
              },
              {
                date: '2026-10-15 (Thursday)',
                time: '08:30 AM - 10:30 AM',
                status: 'SCHEDULED',
                driver: 'Enterprise Route #1',
                materials: 'Cardboard & PET bottles'
              },
              {
                date: '2026-10-22 (Thursday)',
                time: '08:30 AM - 10:30 AM',
                status: 'SCHEDULED',
                driver: 'Enterprise Route #1',
                materials: 'Cardboard & PET bottles'
              }
            ].map((slot, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{slot.date}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-slate-600">{slot.time}</span>
                  </div>
                  <div className="text-slate-500">
                    Driver: {slot.driver} · Streams: {slot.materials}
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 self-start sm:self-auto">
                  {slot.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Performance Report (B03) */}
      {activeOrgTab === 'report' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Period Performance & Mass Summary</h3>
              <p className="text-xs text-slate-500">
                Official recovery record for {orgName} (September–October 2026).
              </p>
            </div>
            <button
              onClick={() => alert('Downloaded formal building recovery summary (PDF).')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export PDF Statement</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-sans">TOTAL PICKUPS</span>
              <span className="text-lg font-bold text-slate-900">4</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-sans">CONFIRMED WEIGHT</span>
              <span className="text-lg font-bold text-emerald-800">{totalBuildingKg.toFixed(1)} kg</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-sans">ON-TIME RATE</span>
              <span className="text-lg font-bold text-slate-900">100%</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-sans">CONTAMINATION RATE</span>
              <span className="text-lg font-bold text-slate-900">&lt; 1.5%</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Members & Permissions (B04) */}
      {activeOrgTab === 'members' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Authorised Contacts & Site Roles</h3>
              <p className="text-xs text-slate-500">
                PRD § B04: Site managers, building supervisors, and finance viewers.
              </p>
            </div>
            <button
              onClick={() => alert('Invitation link copied to clipboard.')}
              className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Invite Site Member
            </button>
          </div>

          <div className="space-y-3">
            {orgMembers.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 block">{m.name}</span>
                  <span className="text-slate-500 font-mono text-[11px]">{m.emailOrPhone}</span>
                </div>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">
                  {m.role.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extra Pickup Request Modal */}
      {extraPickupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Request Service Arrangement</h3>
            <p className="text-xs text-slate-500">
              PRD Flow D: Request an adjusted recurring schedule or extra collection bay run.
            </p>

            <form onSubmit={handleRequestService} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Site / Organisation</label>
                <input
                  type="text"
                  disabled
                  value={orgName}
                  className="w-full bg-slate-100 border border-slate-300 rounded-lg p-2 text-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Requested Timing & Notes</label>
                <textarea
                  rows={3}
                  required
                  value={arrangementNotes}
                  onChange={(e) => setArrangementNotes(e.target.value)}
                  placeholder="e.g. Renovation delivery boxes stacked in bay #2; need extra Friday morning collection run."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setExtraPickupModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
