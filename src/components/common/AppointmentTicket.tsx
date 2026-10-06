import React from 'react';
import { Booking } from '../../types';
import { useApp } from '../../context/AppContext';
import { MapPin, Clock, Calendar, CheckCircle2, FileCheck2, ChevronRight, Sparkles } from 'lucide-react';
import { MaterialIllustration } from './MaterialIllustrations';

interface AppointmentTicketProps {
  booking: Booking;
  onOpenChecklist?: () => void;
  onTrackStatus?: () => void;
  className?: string;
  isConfirmationView?: boolean;
}

export const AppointmentTicket: React.FC<AppointmentTicketProps> = ({
  booking,
  onOpenChecklist,
  onTrackStatus,
  className = '',
  isConfirmationView = false
}) => {
  const { lang } = useApp();

  return (
    <div
      className={`relative bg-white rounded-[28px] border-2 border-[#25345C] shadow-md overflow-hidden text-[#202B38] ${className}`}
    >
      {/* Top Ticket Header Bar */}
      <div className="bg-[#25345C] text-white px-5 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C9F1DC] animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#C9F1DC]">
            {isConfirmationView
              ? lang === 'en'
                ? 'Appointment Confirmed'
                : 'বুকিং রসিদ'
              : lang === 'en'
              ? 'Upcoming Pickup'
              : 'আসন্ন সংগ্রহ'}
          </span>
        </div>
        <span className="text-xs font-mono text-slate-300 font-bold">
          #{booking.id}
        </span>
      </div>

      {/* Main Ticket Body */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Date & Time Window Highlight */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#53616D] block">
            {lang === 'en' ? 'Collection Window' : 'সংগ্রহের নির্ধারিত সময়'}
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-[#25345C] tracking-tight">
            {booking.scheduledDate}{' '}
            <span className="text-[#12613F] font-bold">
              ({booking.scheduledTimeWindow})
            </span>
          </h3>
          <p className="text-xs text-[#53616D] flex items-center gap-1.5 pt-1">
            <MapPin className="w-3.5 h-3.5 text-[#25345C] shrink-0" />
            <span className="truncate">{booking.address}</span>
          </p>
        </div>

        {/* Selected Material Pills & Illustrations */}
        <div className="p-3.5 bg-[#FFF9F0] rounded-2xl border border-[#EDE4D8] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            {booking.materials.map((m) => (
              <div
                key={m.category}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-xl border border-[#EDE4D8] text-xs font-bold text-[#202B38] shrink-0"
              >
                <MaterialIllustration category={m.category} size="sm" />
                <span className="capitalize">{m.category.replace('_', ' ').toLowerCase()}</span>
              </div>
            ))}
          </div>

          <span className="text-[11px] font-mono text-[#12613F] font-bold bg-[#C9F1DC]/60 px-2 py-0.5 rounded-md shrink-0">
            Clean Stream
          </span>
        </div>

        {/* Signature Curved Path Motif (Materials Ready → Collected → Checked) */}
        <div className="py-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#53616D] px-2 mb-1">
            <span className="text-[#12613F]">1. Materials ready</span>
            <span className="text-[#25345C]">2. Collector pickup</span>
            <span className="text-[#7A4D00]">3. Hub scale check</span>
          </div>
          {/* Subtle curved pathway SVG */}
          <svg viewBox="0 0 300 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-4">
            <path
              d="M 10 8 C 60 8, 90 4, 150 4 C 210 4, 240 12, 290 8"
              stroke="#EDE4D8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="10" cy="8" r="4" fill="#12613F" />
            <circle cx="150" cy="4" r="4" fill="#25345C" />
            <circle cx="290" cy="8" r="4" fill="#F5BF55" />
          </svg>
        </div>

        {/* Preparation Prompt Banner */}
        <div className="p-3.5 bg-[#FEF8EB] border border-[#F5BF55] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#7A4D00] shrink-0 mt-0.5 sm:mt-0" />
            <span className="font-semibold text-[#202B38]">
              {lang === 'en'
                ? 'Rinse bottles, flatten boxes & leave bags 15 mins prior.'
                : 'বোতল পরিষ্কার করুন ও কার্টুন চ্যাপ্টা করে প্রস্তুত রাখুন।'}
            </span>
          </div>

          {onOpenChecklist && (
            <button
              type="button"
              onClick={onOpenChecklist}
              className="px-3.5 py-1.5 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer transition-colors"
            >
              {lang === 'en' ? 'Preparation Checklist' : 'প্রস্তুতি চেকলিস্ট'}
            </button>
          )}
        </div>

        {/* Primary Action */}
        {onTrackStatus && (
          <button
            type="button"
            onClick={onTrackStatus}
            className="w-full min-h-[48px] bg-[#25345C] hover:bg-[#1B2644] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <span>{lang === 'en' ? 'Track Live Status' : 'লাইভ ট্র্যাকিং দেখুন'}</span>
            <ChevronRight className="w-4 h-4 text-[#C9F1DC]" />
          </button>
        )}
      </div>
    </div>
  );
};
