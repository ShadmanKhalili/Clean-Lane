import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EvidenceBadge } from '../common/EvidenceBadge';
import { StatusTracker } from '../common/StatusTracker';
import { NewBookingModal } from './NewBookingModal';
import { MaterialGuideModal } from './MaterialGuideModal';
import { DisputeModal } from './DisputeModal';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  BookOpen,
  AlertCircle,
  Coins,
  ChevronRight,
  ShieldCheck,
  Building,
  Home,
  Store,
  ChevronDown,
  ArrowUpRight
} from 'lucide-react';

interface CustomerPortalProps {
  onNavigateToRewards: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ onNavigateToRewards }) => {
  const {
    role,
    lang,
    bookings,
    pointsLedger,
    customerAvailablePoints,
    customerPendingPoints,
    serviceZones
  } = useApp();

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeBookingId, setDisputeBookingId] = useState<string | undefined>(undefined);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(bookings[0]?.id || null);

  const activeZone = serviceZones[0];

  const roleTitle =
    role === 'customer_apartment'
      ? 'Green View Heights Committee'
      : role === 'customer_business'
      ? 'Artisan Roastery & Café'
      : 'Nasreen Akhter';

  const roleIcon =
    role === 'customer_apartment' ? (
      <Building className="w-4 h-4 text-emerald-700" />
    ) : role === 'customer_business' ? (
      <Store className="w-4 h-4 text-emerald-700" />
    ) : (
      <Home className="w-4 h-4 text-emerald-700" />
    );

  return (
    <div className="space-y-8">
      {/* Overview & Account Context Bar */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {roleIcon}
              <span className="font-semibold text-slate-700">{roleTitle}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-500">{activeZone.name}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {lang === 'en' ? 'Waste Recovery & Circular Rewards' : 'বর্জ্য পুনরুদ্ধার ও বৃত্তাকার রিওয়ার্ডস'}
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl">
              {lang === 'en'
                ? 'Operated in an authorized clean lane. Quantities are verified on calibrated scales before entering licensed recycling streams.'
                : 'অনুমোদিত ক্লিন লেনে পরিচালিত। লাইসেন্সপ্রাপ্ত রিসাইক্লিং স্ট্রিমে যাওয়ার পূর্বে অনুমোদিত স্কেলে ওজন যাচাই করা হয়।'}
            </p>
          </div>

          {/* Points Breakdown Box (Available vs Pending) */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Coins className="w-3.5 h-3.5 text-emerald-700" />
                <span>{lang === 'en' ? 'Available Points' : 'ব্যবহারযোগ্য পয়েন্ট'}</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                {customerAvailablePoints}
              </div>
              <div className="text-[11px] text-slate-500">
                ≈ ৳{Math.round(customerAvailablePoints * 0.65)} redeemable value
              </div>
            </div>

            <div className="h-10 w-px bg-slate-200" />

            <div>
              <div className="flex items-center gap-1.5 text-xs text-amber-700 font-medium">
                <span>{lang === 'en' ? 'Pending Hold' : 'যাচাইধীন পয়েন্ট'}</span>
              </div>
              <div className="text-xl font-semibold text-amber-900 font-mono tabular-nums">
                {customerPendingPoints}
              </div>
              <div className="text-[11px] text-amber-800">
                Awaits hub scale confirmation (E2)
              </div>
            </div>

            <button
              onClick={onNavigateToRewards}
              className="ml-2 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
            >
              <span>{lang === 'en' ? 'Redeem' : 'রিডিম করুন'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Action Row */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'en' ? 'Book Collection' : 'বুকিং করুন'}</span>
            </button>

            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200"
            >
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>{lang === 'en' ? 'Segregation Guidelines' : 'পৃথকীকরণ নির্দেশিকা'}</span>
            </button>

            <button
              onClick={() => {
                setDisputeBookingId(undefined);
                setIsDisputeModalOpen(true);
              }}
              className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors border border-slate-300"
            >
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>{lang === 'en' ? 'Challenge Record' : 'রেকর্ড আপত্তি'}</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Active Pilot Zone: Gulshan-2 Lane 45-68 Corridor</span>
          </div>
        </div>

        {/* Clean Lane Pilot Overview Strip */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2 space-y-1.5 text-xs text-slate-600">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Verified Clean Lane Protocol (Dhaka North Pilot)</span>
            </div>
            <p className="leading-relaxed">
              Materials collected from your doorstep are logged with unique batch identifiers, weighed on calibrated platform scales at Gulshan Hub #3, and delivered directly to authorized recycling mills. No unsegregated landfill dumps.
            </p>
          </div>
          <div className="relative rounded-xl overflow-hidden h-28 bg-slate-100 border border-slate-200">
            <img
              src="/src/assets/images/hero_clean_lane_pickup_1791258399912.jpg"
              alt="Clean Lane Segregated Collection"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Zero-broken-image fallback
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-2.5">
              <span className="text-[11px] font-medium text-white font-mono">
                Clean Lane E-Trike Collection
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Bookings & Active Collections Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {lang === 'en' ? 'Collections & Traceable Transactions' : 'সংগ্রহ ও ট্র্যাকিং লেনদেন'}
            </h2>
            <p className="text-xs text-slate-500">
              PRD § 7.4 & 1.3: Real-time progress with honest evidence levels.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">{bookings.length} recorded</span>
        </div>

        <div className="space-y-3">
          {bookings.map((booking) => {
            const isExpanded = expandedBookingId === booking.id;
            return (
              <div
                key={booking.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs transition-all"
              >
                {/* Booking Header Row */}
                <div
                  onClick={() => setExpandedBookingId(isExpanded ? null : booking.id)}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono font-semibold text-slate-800">{booking.id}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {booking.scheduledDate}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {booking.scheduledTimeWindow}
                      </span>
                      {booking.isRecurring && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-700 font-medium">Recurring {booking.recurringFrequency}</span>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-semibold text-slate-900">
                        {booking.serviceType.replace('_', ' ')}
                      </span>
                      <EvidenceBadge level={booking.evidenceLevel} />
                    </div>

                    <div className="text-xs text-slate-600 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-md">{booking.address}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Weight & Points</div>
                      <div className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                        {booking.confirmedWeightKg
                          ? `${booking.confirmedWeightKg} kg confirmed`
                          : booking.fieldWeightKg
                          ? `${booking.fieldWeightKg} kg in-field`
                          : 'Awaiting pickup'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {booking.pointsStatus === 'available' ? (
                          <span className="text-emerald-700 font-medium font-mono">+{booking.earnedPoints} pts available</span>
                        ) : (
                          <span className="text-amber-700 font-medium font-mono">~{booking.earnedPoints} pts pending E2</span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                      aria-label="Toggle details"
                    >
                      <ChevronDown
                        className={`w-5 h-5 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-slate-700' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-slate-50/50 border-t border-slate-200 space-y-4">
                    {/* Status Tracker */}
                    <StatusTracker currentLevel={booking.evidenceLevel} notes={booking.notes} />

                    {/* Breakdown Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                        <span className="text-slate-400 font-medium block">Materials & Bands</span>
                        <div className="space-y-1 text-slate-700">
                          {booking.materials.map((m, idx) => (
                            <div key={idx} className="flex justify-between font-mono">
                              <span>{m.category.replace('_', ' ')}</span>
                              <span className="text-slate-500">{m.approximateBandKg}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                        <span className="text-slate-400 font-medium block">Collector Assignment</span>
                        <div className="text-slate-800 font-medium">
                          {booking.collectorName || 'Assigning nearest authorized route'}
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          Zone: {booking.zoneId}
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                        <span className="text-slate-400 font-medium block">Commercial Trail (PRD § 12)</span>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Service Fee:</span>
                          <span className="font-mono text-slate-900">৳{booking.serviceFeeBdt}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Material Payout:</span>
                          <span className="font-mono text-emerald-700">
                            {booking.materialPayoutBdt ? `৳${booking.materialPayoutBdt}` : 'Pending intake'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Points Awarded:</span>
                          <span className="font-mono text-slate-900">{booking.earnedPoints} pts</span>
                        </div>
                      </div>
                    </div>

                    {/* Action footer */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-slate-500 font-mono">
                        Reference Hash: CL-TRX-{booking.id.replace('CL-BK-', '')}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDisputeBookingId(booking.id);
                          setIsDisputeModalOpen(true);
                        }}
                        className="text-xs text-slate-600 hover:text-slate-900 font-medium underline underline-offset-4"
                      >
                        Challenge this record
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Points Ledger Activity */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {lang === 'en' ? 'Points Ledger Audit Trail' : 'পয়েন্ট লেজার রেকর্ড'}
            </h2>
            <p className="text-xs text-slate-500">
              PRD § 10.2: Append-only ledger separating Potential, Pending, Available, and Redeemed.
            </p>
          </div>
          <button
            onClick={onNavigateToRewards}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Open Rewards Shop →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Event / Description</th>
                <th className="py-2.5 px-3">Rule Version</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Points Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {pointsLedger
                .filter((p) => p.customerId === 'CUST-H-801')
                .map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 text-slate-600">
                      {entry.timestamp.split('T')[0]}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-800 max-w-sm truncate">
                      {entry.description}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {entry.ruleVersion}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-sm text-[11px] font-medium ${
                          entry.status === 'AVAILABLE'
                            ? 'bg-emerald-50 text-emerald-700'
                            : entry.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold tabular-nums ${
                        entry.amount > 0 ? 'text-emerald-700' : 'text-slate-800'
                      }`}
                    >
                      {entry.amount > 0 ? `+${entry.amount}` : entry.amount}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modals */}
      <NewBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
      <MaterialGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
      <DisputeModal
        isOpen={isDisputeModalOpen}
        bookingId={disputeBookingId}
        onClose={() => setIsDisputeModalOpen(false)}
      />
    </div>
  );
};
