import React from 'react';
import { Booking } from '../../types';
import { useApp } from '../../context/AppContext';
import { MapPin, Clock, Calendar, CheckCircle2, FileCheck2, ChevronRight, Sparkles } from 'lucide-react';
import { MaterialIllustration } from './MaterialIllustrations';
import { MATERIAL_TAXONOMY } from '../../data/mockData';

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
      className={`relative bg-white rounded-[32px] border-2 border-[#25345C] shadow-md overflow-hidden text-[#202B38] ${className}`}
    >
      {/* Top Ticket Header Bar */}
      <div className="bg-[#25345C] text-white px-5 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C9F1DC] animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#C9F1DC]">
            {isConfirmationView
              ? lang === 'en'
                ? 'Appointment Confirmed ✓'
                : 'বুকিং রসিদ ✓'
              : lang === 'en'
              ? 'Upcoming Pickup Ticket'
              : 'আসন্ন সংগ্রহ রসিদ'}
          </span>
        </div>
        <span className="text-xs font-mono text-[#C9F1DC] font-bold bg-[#1B2644] px-2.5 py-1 rounded-lg border border-[#C9F1DC]/20">
          #{booking.id}
        </span>
      </div>

      {/* Main Ticket Upper Section */}
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

        {/* Selected Material Cards & Illustrations */}
        <div className="p-3.5 bg-[#FFF9F0] rounded-2xl border border-[#EDE4D8] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            {booking.materials.map((m) => {
              const tax = MATERIAL_TAXONOMY[m.category];
              const matName = tax
                ? lang === 'en'
                  ? tax.name.split('(')[0].trim()
                  : tax.nameBn
                : m.category.replace(/_/g, ' ');

              return (
                <div
                  key={m.category}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-[#EDE4D8] text-xs font-bold text-[#202B38] shrink-0 shadow-2xs"
                >
                  <MaterialIllustration category={m.category} size="sm" />
                  <span className="truncate max-w-[150px]">{matName}</span>
                </div>
              );
            })}
          </div>

          <span className="text-[11px] font-mono text-[#12613F] font-bold bg-[#C9F1DC] px-2.5 py-1 rounded-lg shrink-0">
            {lang === 'en' ? 'Clean Stream' : 'পরিচ্ছন্ন ধারা'}
          </span>
        </div>

        {/* Signature Curved Path Motif (Materials Ready → Collected → Checked) */}
        <div className="py-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#53616D] px-1 mb-1.5">
            <span className="text-[#12613F]">
              {lang === 'en' ? '1. Materials ready' : '১. উপাদান প্রস্তুত'}
            </span>
            <span className="text-[#25345C]">
              {lang === 'en' ? '2. Doorstep pickup' : '২. ডোরস্টেপ সংগ্রহ'}
            </span>
            <span className="text-[#7A4D00]">
              {lang === 'en' ? '3. Hub scale check' : '৩. হাবে ওজন যাচাই'}
            </span>
          </div>
          {/* Subtle curved pathway SVG */}
          <svg viewBox="0 0 320 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-4">
            <path
              d="M 12 9 C 70 9, 100 4, 160 4 C 220 4, 250 14, 308 9"
              stroke="#EDE4D8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="12" cy="9" r="4.5" fill="#12613F" />
            <circle cx="160" cy="4" r="4.5" fill="#25345C" />
            <circle cx="308" cy="9" r="4.5" fill="#F5BF55" stroke="#25345C" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* TICKET PERFORATION & CUTOUT NOTCHES */}
      <div className="relative flex items-center justify-between my-1">
        {/* Left Circular Punch Notch */}
        <div className="w-6 h-6 -ml-3 rounded-full bg-[#FFF9F0] border-r-2 border-[#25345C] shrink-0" />
        {/* Dashed Perforation Line */}
        <div className="flex-1 border-t-2 border-dashed border-[#EDE4D8] mx-2" />
        {/* Right Circular Punch Notch */}
        <div className="w-6 h-6 -mr-3 rounded-full bg-[#FFF9F0] border-l-2 border-[#25345C] shrink-0" />
      </div>

      {/* Lower Ticket Stub: Preparation & Scan Code */}
      <div className="p-5 sm:p-6 bg-[#FAF5EC]/40 space-y-4">
        {/* Preparation Prompt Banner */}
        <div className="p-3.5 bg-white border border-[#EDE4D8] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#7A4D00] shrink-0 mt-0.5 sm:mt-0" />
            <span className="font-medium text-[#202B38]">
              {lang === 'en'
                ? 'Rinse bottles, flatten boxes & place bags outside 15 mins prior.'
                : 'বোতল পরিষ্কার করুন ও কার্টুন চ্যাপ্টা করে ১৫ মিনিট পূর্বে প্রস্তুত রাখুন।'}
            </span>
          </div>

          {onOpenChecklist && (
            <button
              type="button"
              onClick={onOpenChecklist}
              className="px-3.5 py-1.5 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer transition-colors active:scale-95"
            >
              {lang === 'en' ? 'Preparation Checklist' : 'প্রস্তুতি চেকলিস্ট'}
            </button>
          )}
        </div>

        {/* Barcode & Reference Stamp */}
        <div className="flex items-center justify-between pt-1">
          <div className="font-mono text-[11px] text-[#53616D]">
            <span>{lang === 'en' ? 'DOORSTEP TAG: ' : 'ডোরস্টেপ ট্যাগ: '}</span>
            <strong className="text-[#25345C]">{booking.id}</strong>
          </div>
          {/* Subtle simulated barcode glyph */}
          <div className="flex items-center gap-0.5 opacity-60">
            <span className="w-0.5 h-6 bg-[#25345C]" />
            <span className="w-1.5 h-6 bg-[#25345C]" />
            <span className="w-0.5 h-6 bg-[#25345C]" />
            <span className="w-1 h-6 bg-[#25345C]" />
            <span className="w-0.5 h-6 bg-[#25345C]" />
            <span className="w-1.5 h-6 bg-[#25345C]" />
            <span className="w-0.5 h-6 bg-[#25345C]" />
            <span className="w-1 h-6 bg-[#25345C]" />
          </div>
        </div>

        {/* Primary Action */}
        {onTrackStatus && (
          <button
            type="button"
            onClick={onTrackStatus}
            className="w-full min-h-[50px] bg-[#25345C] hover:bg-[#1B2644] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-[0.985]"
          >
            <span>{lang === 'en' ? 'Track Live Status' : 'লাইভ ট্র্যাকিং দেখুন'}</span>
            <ChevronRight className="w-4 h-4 text-[#C9F1DC]" />
          </button>
        )}
      </div>
    </div>
  );
};
