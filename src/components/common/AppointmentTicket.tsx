import React from 'react';
import { Booking } from '../../types';
import { useApp } from '../../context/AppContext';
import { ChevronRight, ClipboardList, MapPin, Truck, XCircle } from 'lucide-react';
import { JourneyLine } from '../../design/JourneyLine';
import { MaterialChips, useJourney } from '../customer/BookingBits';
import { formatBookingDate, relativeDayLabel } from '../customer/dates';
import { isCancellable } from '../customer/useCustomerData';
import { DANGER_GHOST, GHOST, PRIMARY } from '../customer/ui';

interface AppointmentTicketProps {
  booking: Booking;
  onOpenChecklist?: () => void;
  onTrackStatus?: () => void;
  /** Shown only while the pickup can still be cancelled. */
  onCancel?: () => void;
  /** Collector name from the dispatch job (falls back to the booking's). */
  collectorName?: string;
  className?: string;
  isConfirmationView?: boolean;
}

/** A pickup ticket: when, where, what, and the journey your bag will take. */
export const AppointmentTicket: React.FC<AppointmentTicketProps> = ({
  booking,
  onOpenChecklist,
  onTrackStatus,
  onCancel,
  collectorName,
  className = '',
  isConfirmationView = false
}) => {
  const { lang } = useApp();
  const en = lang === 'en';
  const journey = useJourney(booking);
  const rel = relativeDayLabel(booking.scheduledDate, lang);
  const full = formatBookingDate(booking.scheduledDate, lang);
  const collector = collectorName || booking.collectorName;

  return (
    <div className={`relative overflow-hidden rounded-[28px] bg-white text-[#124B3A] ring-2 ring-[#124B3A] ${className}`}>
      <div className="flex items-center justify-between bg-[#124B3A] px-5 py-3 text-[#CBEA70]">
        <span className="text-sm font-extrabold">{isConfirmationView ? (en ? 'You are booked ✓' : 'বুকিং হয়েছে ✓') : en ? 'Your pickup' : 'আপনার পিকআপ'}</span>
        <span className="rounded-lg bg-white/10 px-2 py-0.5 text-xs font-bold tabular-nums">#{booking.id}</span>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <p className="text-xs font-bold text-[#124B3A]/60">{en ? 'Collector comes' : 'সংগ্রাহক আসবেন'}</p>
          <h3 className="font-display text-[28px] font-extrabold leading-tight">
            {rel} <span className="text-[#3C7A55]">({booking.scheduledTimeWindow})</span>
          </h3>
          {rel !== full && <p className="text-sm font-semibold text-[#124B3A]/65">{full}</p>}
          <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-[#124B3A]/75">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{booking.address}</span>
          </p>
          {collector && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-[#124B3A]/75">
              <Truck className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{collector}</span>
            </p>
          )}
        </div>

        <MaterialChips booking={booking} size="md" />

        <div className="rounded-2xl bg-[#FAF9F5] p-3">
          <p className="mb-2 text-xs font-bold text-[#124B3A]/60">{en ? 'Where your bag goes next' : 'আপনার ব্যাগ এরপর কোথায় যাবে'}</p>
          <JourneyLine stops={journey.stops} lang={lang} orientation="horizontal" />
        </div>
      </div>

      <div className="relative flex items-center" aria-hidden="true">
        <span className="-ml-3 h-6 w-6 rounded-full bg-[#FAF9F5] ring-2 ring-[#124B3A]" />
        <span className="mx-2 flex-1 border-t-2 border-dashed border-[#124B3A]/20" />
        <span className="-mr-3 h-6 w-6 rounded-full bg-[#FAF9F5] ring-2 ring-[#124B3A]" />
      </div>

      <div className="space-y-3 bg-[#FAF9F5]/60 p-5">
        <p className="text-sm font-semibold">
          {en ? 'Rinse bottles, flatten boxes, and put the bag out 15 minutes before.' : 'বোতল ধুয়ে, বাক্স চ্যাপ্টা করে ১৫ মিনিট আগে ব্যাগ বাইরে রাখুন।'}
        </p>
        {onTrackStatus && (
          <button type="button" onClick={onTrackStatus} className={PRIMARY}>
            {en ? 'See pickup details' : 'পিকআপের বিবরণ দেখুন'}
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
        <div className="flex flex-wrap items-center justify-center gap-x-3">
          {onOpenChecklist && (
            <button type="button" onClick={onOpenChecklist} className={GHOST}>
              <ClipboardList className="h-4 w-4" aria-hidden="true" />
              {en ? 'Preparation checklist' : 'প্রস্তুতির তালিকা'}
            </button>
          )}
          {onCancel && isCancellable(booking) && (
            <button type="button" onClick={onCancel} className={DANGER_GHOST}>
              <XCircle className="h-4 w-4" aria-hidden="true" />
              {en ? 'Cancel pickup' : 'পিকআপ বাতিল করুন'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
