import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerType, MaterialCategory } from '../../types';
import { MATERIAL_TAXONOMY } from '../../data/mockData';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
  ArrowLeft,
  Volume2,
  VolumeX,
  Camera,
  FileText,
  Sparkles,
  Edit2,
  ShieldCheck,
  Package,
  Layers,
  HelpCircle
} from 'lucide-react';
import { speakInstruction, stopSpeaking } from '../../utils/statusDictionary';

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRewards?: () => void;
  onOpenHelp?: (bookingId: string) => void;
}

export const NewBookingModal: React.FC<NewBookingModalProps> = ({
  isOpen,
  onClose,
  onOpenRewards,
  onOpenHelp
}) => {
  const { lang, role, serviceZones, savedLocations, selectedLocationId, createBooking } = useApp();

  // Booking Steps:
  // Step 1: C08 Choose materials
  // Step 2: C09 Choose time
  // Step 3: C10 Review booking
  // Step 4: C11 Booking confirmation & status
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Selected Location
  const currentLocation =
    savedLocations.find((l) => l.id === selectedLocationId) || savedLocations[0];
  const [address, setAddress] = useState(currentLocation?.address || 'House 14, Road 52, Gulshan-2, Dhaka');
  const [selectedZone, setSelectedZone] = useState(currentLocation?.zoneId || 'ZONE-GUL-02');
  const [accessInstructions, setAccessInstructions] = useState(
    currentLocation?.accessInstructions || 'Apartment 4B, security will buzz elevator. Sacks kept outside door.'
  );

  // Material selections: Map category -> band ('small' | 'medium' | 'large' | 'not_sure')
  const [selectedMaterials, setSelectedMaterials] = useState<
    Array<{ category: MaterialCategory; band: 'small' | 'medium' | 'large' | 'not_sure'; photoAdded?: boolean }>
  >([
    { category: 'PET_BOTTLES', band: 'small' },
    { category: 'CARDBOARD_OCC', band: 'medium' }
  ]);

  // Step 2: Date & Window
  const [scheduledDate, setScheduledDate] = useState('2026-10-07');
  const [scheduledWindow, setScheduledWindow] = useState('08:30 AM - 11:30 AM');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [notes, setNotes] = useState('');

  // Step 3: Submission & Duplicate tap prevention
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

  // Audio Guidance Active State
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!isOpen) return null;

  const currentZoneObj = serviceZones.find((z) => z.id === selectedZone);
  const isZoneActive = currentZoneObj?.status === 'active_clean_lane';

  // Audio assistance trigger
  const handleToggleVoice = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    let text = '';
    if (currentStep === 1) {
      text =
        lang === 'bn'
          ? 'ধাপ ১: আপনার কাছে কী কী পুনর্ব্যবহারযোগ্য জিনিস আছে তা বেছে নিন। যেমন বোতল, কার্টন বা ক্যান। এরপর পরিমাণের মাপ বেছে নিন।'
          : 'Step 1: Choose the recyclable materials you have, such as plastic bottles, cardboard, or cans. Then select about how much you have.';
    } else if (currentStep === 2) {
      text =
        lang === 'bn'
          ? 'ধাপ ২: সংগ্রহের জন্য সুবিধাজনক তারিখ এবং সময় বেছে নিন। সকালে, দুপুরে বা সন্ধ্যায়।'
          : 'Step 2: Choose a convenient collection date and time window. Morning, afternoon, or evening.';
    } else if (currentStep === 3) {
      text =
        lang === 'bn'
          ? 'ধাপ ৩: আপনার পিকআপের ঠিকানা, সময় এবং জিনিসপত্র মিলিয়ে নিন। মনে রাখবেন, স্কেলে ডিজিটাল ওজনের পর চূড়ান্ত পয়েন্ট নির্ধারিত হবে।'
          : 'Step 3: Review your pickup details. Remember, final weight and points are confirmed after scale checking.';
    } else if (currentStep === 4) {
      text =
        lang === 'bn'
          ? 'আপনার সংগ্রহের অনুরোধ গ্রহণ করা হয়েছে। নির্ধারিত সময়ে কালেক্টর আপনার ঠিকানায় আসবেন।'
          : 'Your pickup has been requested. An approved collector will arrive during your selected window.';
    }

    setIsSpeaking(true);
    speakInstruction(text, lang);
    setTimeout(() => setIsSpeaking(false), 8000);
  };

  // Toggle material in Step 1
  const toggleMaterial = (cat: MaterialCategory) => {
    const exists = selectedMaterials.find((m) => m.category === cat);
    if (exists) {
      if (selectedMaterials.length > 1) {
        setSelectedMaterials(selectedMaterials.filter((m) => m.category !== cat));
      }
    } else {
      setSelectedMaterials([...selectedMaterials, { category: cat, band: 'small' }]);
    }
  };

  const updateMaterialBand = (cat: MaterialCategory, band: 'small' | 'medium' | 'large' | 'not_sure') => {
    setSelectedMaterials(
      selectedMaterials.map((m) => (m.category === cat ? { ...m, band } : m))
    );
  };

  const bandDisplayMap: Record<string, { labelEn: string; labelBn: string; range: string }> = {
    small: { labelEn: 'Small (1–2 bags)', labelBn: 'সামান্য (১-২ ব্যাগ)', range: '2–5 kg' },
    medium: { labelEn: 'Medium (3–5 bags)', labelBn: 'মাঝারি (৩-৫ ব্যাগ)', range: '5–15 kg' },
    large: { labelEn: 'Large (bulk / sacks)', labelBn: 'অনেক (বস্তা বা বাল্ক)', range: '15–40 kg' },
    not_sure: { labelEn: "I'm not sure", labelBn: 'নিশ্চিত নই', range: 'Unmeasured band' }
  };

  // Calculate estimated commercial fee & payout
  const serviceFee = role === 'customer_business' ? 150 : 0;
  const estimatedPayout = selectedMaterials.reduce((acc, m) => {
    const info = MATERIAL_TAXONOMY[m.category];
    const kgEstimate = m.band === 'small' ? 3.5 : m.band === 'medium' ? 8 : m.band === 'large' ? 22 : 4;
    return acc + Math.round(kgEstimate * info.unitValueBdtPerKg);
  }, 0);

  const estimatedPoints = selectedMaterials.reduce((acc, m) => {
    const info = MATERIAL_TAXONOMY[m.category];
    const kgEstimate = m.band === 'small' ? 3.5 : m.band === 'medium' ? 8 : m.band === 'large' ? 22 : 4;
    return acc + Math.round(kgEstimate * info.rewardPointsPerKg);
  }, 0);

  // Submission handler with duplicate protection
  const handleConfirmPickup = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const bookingMaterials = selectedMaterials.map((m) => ({
      category: m.category,
      approximateBandKg: bandDisplayMap[m.band].range
    }));

    const newBooking = createBooking({
      customerId:
        role === 'customer_apartment'
          ? 'CUST-APT-402'
          : role === 'customer_business'
          ? 'CUST-BIZ-511'
          : 'CUST-H-801',
      customerName:
        role === 'customer_apartment'
          ? 'Green View Heights Committee'
          : role === 'customer_business'
          ? 'Artisan Roastery & Café'
          : 'Nasreen Akhter',
      customerType:
        role === 'customer_apartment'
          ? 'apartment'
          : role === 'customer_business'
          ? 'business'
          : 'household',
      phone: '+880 1712 345678',
      address,
      zoneId: selectedZone,
      accessInstructions,
      scheduledDate,
      scheduledTimeWindow: scheduledWindow,
      isRecurring: false,
      serviceType: role === 'customer_business' ? 'COMMERCIAL_BATCH' : 'DOORSTEP_RECOVERY',
      materials: bookingMaterials,
      serviceFeeBdt: serviceFee,
      notes
    });

    setCreatedBookingId(newBooking.id);
    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep(4); // Advance to C11 Confirmation
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[94vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Top Header & Spoken Guidance Bar */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 font-mono">
              {currentStep < 4
                ? lang === 'en'
                  ? `Step ${currentStep} of 3`
                  : `ধাপ ${currentStep} / ৩`
                : lang === 'en'
                ? 'Booking Confirmation'
                : 'বুকিং নিশ্চিতকরণ'}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {currentStep === 1 && (lang === 'en' ? 'Choose materials' : 'উপকরণ নির্বাচন করুন')}
              {currentStep === 2 && (lang === 'en' ? 'Choose a time' : 'সংগ্রহের সময় নির্ধারণ করুন')}
              {currentStep === 3 && (lang === 'en' ? 'Review booking' : 'বুকিং পর্যালোচনা করুন')}
              {currentStep === 4 && (lang === 'en' ? 'Pickup requested' : 'পিকআপের অনুরোধ গৃহীত')}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Spoken Guidance Button (Cognitive accessibility requirement) */}
            <button
              onClick={handleToggleVoice}
              type="button"
              className={`min-h-[44px] px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isSpeaking
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title={lang === 'en' ? 'Listen to instructions' : 'নির্দেশনা শুনুন'}
              aria-label={lang === 'en' ? 'Listen to spoken instructions' : 'নির্দেশনা শুনুন'}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4 text-amber-700" />
                  <span className="hidden sm:inline">{lang === 'en' ? 'Stop' : 'থামুন'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-700" />
                  <span className="hidden sm:inline">{lang === 'en' ? 'Listen' : 'শুনুন'}</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              type="button"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              aria-label="Close booking modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP BODY */}
        {/* ========================================================================= */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-700 flex-1">
          {/* ===================================================================== */}
          {/* STEP 1: C08 CHOOSE MATERIALS */}
          {/* ===================================================================== */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 flex items-start gap-3">
                <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 space-y-0.5">
                  <p className="font-semibold">
                    {lang === 'en'
                      ? 'Select eligible clean materials. You can choose more than one.'
                      : 'পরিচ্ছন্ন ও শুকনো উপকরণ নির্বাচন করুন। একাধিক উপকরণ নির্বাচন করতে পারেন।'}
                  </p>
                  <p className="text-emerald-800 text-[11px]">
                    {lang === 'en'
                      ? 'No technical knowledge needed. We accept bottles, boxes, cartons, and clean plastic containers.'
                      : 'কোনো জটিল মাপের প্রয়োজন নেই। বোতল, শক্ত কাগজ ও ক্যান জমা নেওয়া হয়।'}
                  </p>
                </div>
              </div>

              {/* Material Cards */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  {lang === 'en' ? 'Available Materials in your clean lane' : 'আপনার লেনের অনুমোদিত উপকরণ'}
                </label>

                <div className="grid grid-cols-1 gap-3">
                  {(Object.keys(MATERIAL_TAXONOMY) as MaterialCategory[]).map((catKey) => {
                    const item = MATERIAL_TAXONOMY[catKey];
                    const selected = selectedMaterials.find((m) => m.category === catKey);
                    const isSelected = !!selected;

                    return (
                      <div
                        key={catKey}
                        className={`rounded-2xl border transition-all p-4 ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/30 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        {/* Choice Card Tap Header */}
                        <button
                          type="button"
                          onClick={() => toggleMaterial(catKey)}
                          className="w-full flex items-center justify-between text-left cursor-pointer min-h-[44px]"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                                isSelected
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'bg-white border-slate-300 text-transparent'
                              }`}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 text-sm block">
                                {lang === 'en' ? item.name : item.nameBn}
                              </span>
                              <span className="text-xs text-slate-500">
                                {lang === 'en' ? item.description : item.prepInstructionsBn}
                              </span>
                            </div>
                          </div>

                          <div className="text-right pl-2">
                            <span className="text-xs font-bold text-emerald-800 block">
                              +{item.rewardPointsPerKg} {lang === 'en' ? 'pts/kg' : 'পয়েন্ট/কেজি'}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              ~৳{item.unitValueBdtPerKg}/kg
                            </span>
                          </div>
                        </button>

                        {/* "About how much?" Section (C08 forgiving choices) */}
                        {isSelected && (
                          <div className="mt-3.5 pt-3 border-t border-emerald-100 space-y-2">
                            <span className="text-xs font-bold text-slate-800 block">
                              {lang === 'en' ? 'About how much do you have?' : 'আনুমানিক কতটুকু আছে?'}
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {(['small', 'medium', 'large', 'not_sure'] as const).map((bandKey) => {
                                const isBandSelected = selected.band === bandKey;
                                const bandInfo = bandDisplayMap[bandKey];
                                return (
                                  <button
                                    key={bandKey}
                                    type="button"
                                    onClick={() => updateMaterialBand(catKey, bandKey)}
                                    className={`p-2.5 rounded-xl text-xs font-semibold text-center border cursor-pointer min-h-[44px] transition-all ${
                                      isBandSelected
                                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    }`}
                                  >
                                    <span className="block leading-snug">
                                      {lang === 'en' ? bandInfo.labelEn : bandInfo.labelBn}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Exclusion safety reminder */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p>
                  {lang === 'en'
                    ? 'Please ensure items are empty and dry. We cannot accept wet food waste, hazardous chemicals, or medical waste.'
                    : 'উপকরণগুলো শুকনো ও পরিষ্কার রাখুন। ভেজা খাবার বা চিকিৎসা বর্জ্য গ্রহণ করা হয় না।'}
                </p>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* STEP 2: C09 CHOOSE TIME */}
          {/* ===================================================================== */}
          {currentStep === 2 && (
            <div className="space-y-5">
              {/* Pickup Address Confirmation */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-wider">
                    {lang === 'en' ? 'Service Address' : 'সেবার ঠিকানা'}
                  </span>
                  <span className="text-emerald-800 font-bold font-mono text-[11px]">
                    {selectedZone} · Active
                  </span>
                </div>
                <p className="font-bold text-slate-900 text-sm">{address}</p>
                <p className="text-xs text-slate-500">{accessInstructions}</p>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  {lang === 'en' ? 'Choose Date' : 'তারিখ নির্ধারণ করুন'}
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { date: '2026-10-06', labelEn: 'Today', labelBn: 'আজ', day: 'Tue' },
                    { date: '2026-10-07', labelEn: 'Tomorrow', labelBn: 'আগামীকাল', day: 'Wed' },
                    { date: '2026-10-08', labelEn: 'Thursday', labelBn: 'বৃহস্পতিবার', day: 'Thu' }
                  ].map((d) => (
                    <button
                      key={d.date}
                      type="button"
                      onClick={() => setScheduledDate(d.date)}
                      className={`p-3 rounded-2xl border text-center cursor-pointer min-h-[56px] transition-all ${
                        scheduledDate === d.date
                          ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="block text-xs font-semibold">
                        {lang === 'en' ? d.labelEn : d.labelBn}
                      </span>
                      <span className="block text-[11px] text-slate-500 font-mono mt-0.5">{d.date}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Broad Time Windows (C09 requirement: morning, afternoon, evening) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  {lang === 'en' ? 'Collection Window' : 'সংগ্রহের সময়'}
                </label>
                <div className="space-y-2">
                  {[
                    {
                      window: '08:30 AM - 11:30 AM',
                      labelEn: 'Morning (08:30 AM – 11:30 AM)',
                      labelBn: 'সকাল (০৮:৩০ - ১১:৩০)',
                      descEn: 'Collector Tariq on Banani/Gulshan primary run'
                    },
                    {
                      window: '02:00 PM - 04:30 PM',
                      labelEn: 'Afternoon (02:00 PM – 04:30 PM)',
                      labelBn: 'দুপুর (০২:০০ - ০৪:৩০)',
                      descEn: 'Collector Kamrul on Corridor #2 run'
                    },
                    {
                      window: '05:00 PM - 07:30 PM',
                      labelEn: 'Evening (05:00 PM – 07:30 PM)',
                      labelBn: 'সন্ধ্যা (০৫:০০ - ০৭:৩০)',
                      descEn: 'Evening residential sweep run'
                    }
                  ].map((tw) => (
                    <button
                      key={tw.window}
                      type="button"
                      onClick={() => setScheduledWindow(tw.window)}
                      className={`w-full p-3.5 rounded-2xl border text-left cursor-pointer min-h-[52px] flex items-center justify-between transition-all ${
                        scheduledWindow === tw.window
                          ? 'border-emerald-600 bg-emerald-50/40 text-slate-900 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Clock
                          className={`w-4 h-4 ${
                            scheduledWindow === tw.window ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        />
                        <div>
                          <span className="font-bold text-xs sm:text-sm block">
                            {lang === 'en' ? tw.labelEn : tw.labelBn}
                          </span>
                          <span className="text-[11px] text-slate-500">{tw.descEn}</span>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          scheduledWindow === tw.window
                            ? 'border-emerald-600 bg-emerald-600'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {scheduledWindow === tw.window && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Access Note (Progressive disclosure behind "+ Add a note") */}
              <div>
                {!showNoteInput ? (
                  <button
                    type="button"
                    onClick={() => setShowNoteInput(true)}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 cursor-pointer py-1"
                  >
                    <span>+ {lang === 'en' ? 'Add note for collector' : 'কালেক্টরের জন্য বিশেষ নির্দেশনা যোগ করুন'}</span>
                  </button>
                ) : (
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      {lang === 'en' ? 'Collector Instructions' : 'কালেক্টরের জন্য নোট'}
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={
                        lang === 'en'
                          ? 'e.g. Leave sacks with building security; call upon arrival'
                          : 'যেমন: দারোয়ানের কাছে ব্যাগ রাখা থাকবে'
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* STEP 3: C10 REVIEW BOOKING */}
          {/* ===================================================================== */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                {lang === 'en'
                  ? 'Please review your choices before confirming. You can edit any section.'
                  : 'নিশ্চিত করার আগে আপনার তথ্য মিলিয়ে নিন। যেকোনো অংশ পরিবর্তন করতে এডিট বাটন চাপুন।'}
              </p>

              {/* Review Section 1: Where */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between gap-3">
                <div className="space-y-0.5 text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] block">
                    1. {lang === 'en' ? 'Where' : 'কোথায়'}
                  </span>
                  <p className="font-bold text-slate-900">{address}</p>
                  <p className="text-slate-500 text-[11px]">
                    {lang === 'en' ? 'Zone:' : 'জোন:'} {selectedZone} · {accessInstructions}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 rounded-lg flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Edit' : 'পরিবর্তন'}</span>
                </button>
              </div>

              {/* Review Section 2: When */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between gap-3">
                <div className="space-y-0.5 text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] block">
                    2. {lang === 'en' ? 'When' : 'কখন'}
                  </span>
                  <p className="font-bold text-slate-900">
                    {scheduledDate} · {scheduledWindow}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    {notes ? `Note: ${notes}` : lang === 'en' ? 'Doorstep collection run' : 'বাসায় সংগ্রহ'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 rounded-lg flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Edit' : 'পরিবর্তন'}</span>
                </button>
              </div>

              {/* Review Section 3: What */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between gap-3">
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] block">
                    3. {lang === 'en' ? 'What' : 'কী কী উপকরণ'}
                  </span>
                  <div className="space-y-1">
                    {selectedMaterials.map((m) => (
                      <div key={m.category} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        <span className="font-semibold text-slate-800">
                          {MATERIAL_TAXONOMY[m.category].name}:
                        </span>
                        <span className="text-slate-600 font-mono text-[11px]">
                          {bandDisplayMap[m.band].labelEn}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 rounded-lg flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Edit' : 'পরিবর্তন'}</span>
                </button>
              </div>

              {/* Review Financial & Points Breakdown (Order: Fee -> Possible Payout -> Possible Points) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs">
                {/* 4. Fee */}
                <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                  <span className="font-sans text-[10px] text-slate-500 block mb-0.5">
                    {lang === 'en' ? '4. SERVICE FEE' : '৪. সার্ভিস ফি'}
                  </span>
                  <span className="text-base font-bold text-slate-900">
                    ৳{serviceFee}{' '}
                    <span className="text-[10px] font-sans text-slate-500">
                      {serviceFee === 0 ? '(Free Pilot)' : ''}
                    </span>
                  </span>
                </div>

                {/* 5. Possible Payout */}
                <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                  <span className="font-sans text-[10px] text-slate-500 block mb-0.5">
                    {lang === 'en' ? '5. POSSIBLE PAYOUT' : '৫. সম্ভাব্য মূল্য'}
                  </span>
                  <span className="text-base font-bold text-slate-900">
                    ~৳{estimatedPayout}
                  </span>
                </div>

                {/* 6. Possible Points */}
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="font-sans text-[10px] text-emerald-800 block mb-0.5">
                    {lang === 'en' ? '6. POSSIBLE POINTS' : '৬. সম্ভাব্য পয়েন্ট'}
                  </span>
                  <span className="text-base font-bold text-emerald-950">
                    ~{estimatedPoints} pts
                  </span>
                </div>
              </div>

              {/* Explicit Truthful Notice (PRD Section C10) */}
              <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 text-amber-950 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>
                    {lang === 'en'
                      ? 'Final quantity and points are confirmed after the material is checked.'
                      : 'চূড়ান্ত পরিমাণ এবং পয়েন্ট ডিজিটাল স্কেলে যাচাইয়ের পর নিশ্চিত করা হবে।'}
                  </span>
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  {lang === 'en'
                    ? 'Field estimates indicate initial scope. Certified platform scale measurement at the aggregation center determines exact reward points and cash payout.'
                    : 'কালেক্টর সংগ্রহের পর একত্রীকরণ কেন্দ্রে ডিজিটাল স্কেলে মেপে চূড়ান্ত রসিদ ও পয়েন্ট বরাদ্দ করা হবে।'}
                </p>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* STEP 4: C11 BOOKING CONFIRMATION & STATUS */}
          {/* ===================================================================== */}
          {currentStep === 4 && (
            <div className="space-y-5">
              {/* Restrained Loop Animation & Large Confirmation Banner (Signature Moment 2) */}
              <div className="p-6 bg-[#F2F7E9] rounded-3xl border border-[#CBEA70] text-center space-y-3">
                {/* Loop Animation Ring */}
                <div className="py-1 flex items-center justify-center">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#E8E5DA"
                        strokeWidth="5"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#124B3A"
                        strokeWidth="5"
                        strokeDasharray="180"
                        strokeDashoffset="45"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#CBEA70"
                        strokeWidth="5"
                        strokeDasharray="50"
                        strokeDashoffset="120"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-11 h-11 rounded-2xl bg-[#124B3A] text-[#CBEA70] flex items-center justify-center shadow-xs">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#124B3A]">
                    {lang === 'en' ? 'Pickup requested' : 'সংগ্রহের অনুরোধ গৃহীত'}
                  </h3>
                  <p className="text-xs text-[#53625C] max-w-sm mx-auto mt-0.5">
                    {lang === 'en'
                      ? 'Your booking is recorded in the Clean Lane dispatch system.'
                      : 'আপনার অনুরোধটি ক্লিন লেন ডিসপ্যাচ সিস্টেমে সংরক্ষিত হয়েছে।'}
                  </p>
                </div>

                <div className="inline-block px-3.5 py-1 bg-white rounded-xl border border-[#CBEA70] font-mono text-xs font-bold text-[#124B3A] shadow-2xs">
                  {createdBookingId || 'CL-BK-9281'}
                </div>
              </div>

              {/* Status Card: What Happened & What Happens Next (PRD Status Pattern) */}
              <div className="p-4 bg-white rounded-2xl border border-[#E8E5DA] space-y-3 text-xs">
                <div>
                  <span className="font-bold text-[#53625C] uppercase tracking-wider text-[10px] block font-mono">
                    {lang === 'en' ? 'WHAT HAPPENED' : 'যা ঘটেছে'}
                  </span>
                  <p className="text-[#172521] font-semibold mt-0.5">
                    {lang === 'en'
                      ? `Pickup requested for ${scheduledDate} during ${scheduledWindow}.`
                      : `${scheduledDate} তারিখে ${scheduledWindow} সময়ের মধ্যে সংগ্রহের অনুরোধ নিশ্চিত হয়েছে।`}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E8E5DA]">
                  <span className="font-bold text-[#124B3A] uppercase tracking-wider text-[10px] block font-mono">
                    {lang === 'en' ? 'WHAT HAPPENS NEXT' : 'পরবর্তী পদক্ষেপ'}
                  </span>
                  <p className="text-[#53625C] font-medium mt-0.5">
                    {lang === 'en'
                      ? 'A licensed collector will be assigned to your street corridor before arrival. Next milestone: Quantity will be checked at certified hub scale.'
                      : 'নির্ধারিত সময়ের আগে একজন অনুমোদিত কালেক্টরকে নিযুক্ত করা হবে। পরবর্তী ধাপ: ডিজিটাল স্কেলে পরিমাণ নিশ্চিতকরণ।'}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E8E5DA] text-[#53625C] text-[11px]">
                  <strong>{lang === 'en' ? 'Preparation Reminder:' : 'প্রস্তুতির নিয়ম:'}</strong>{' '}
                  {lang === 'en'
                    ? 'Keep segregated materials clean and dry in bags outside your door or at the ground reception.'
                    : 'বর্জ্যগুলো পরিষ্কার ও শুকনো অবস্থায় ব্যাগে ভরে রাখুন।'}
                </div>
              </div>

              {/* Bridge to C14 Rewards with Fresh Lime Accent */}
              <div className="p-4 bg-[#F8F7F1] rounded-2xl border border-[#E8E5DA] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#124B3A] block">
                    {lang === 'en' ? 'Circular Rewards' : 'সার্কুলার রিওয়ার্ডস'}
                  </span>
                  <span className="text-[11px] text-[#53625C]">
                    {lang === 'en'
                      ? 'Earn points to redeem grocery vouchers and telecom data'
                      : 'মুদি ভাউচার বা মোবাইল ডেটার জন্য পয়েন্ট অর্জন করুন'}
                  </span>
                </div>
                {onOpenRewards && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenRewards();
                    }}
                    className="min-h-[40px] px-3.5 py-1.5 bg-[#124B3A] text-white hover:bg-[#0D382B] rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    {lang === 'en' ? 'See Rewards' : 'রিওয়ার্ড দেখুন'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM ACTION BAR (Touch target >= 48px, high contrast, verb-led) */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex items-center justify-between gap-3 shrink-0">
          {currentStep > 1 && currentStep < 4 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
              className="min-h-[48px] px-4 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'en' ? 'Back' : 'পেছনে'}</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep === 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
            >
              <span>{lang === 'en' ? 'Choose a time' : 'সময় নির্ধারণ করুন'}</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          )}

          {currentStep === 2 && (
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
            >
              <span>{lang === 'en' ? 'Review booking' : 'বুকিং পর্যালোচনা করুন'}</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          )}

          {currentStep === 3 && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmPickup}
              className={`w-full sm:w-auto min-h-[48px] px-7 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all ${
                isSubmitting
                  ? 'bg-slate-400 text-white cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isSubmitting ? (
                <span>{lang === 'en' ? 'Confirming pickup...' : 'নিশ্চিত করা হচ্ছে...'}</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Confirm pickup' : 'পিকআপ নিশ্চিত করুন'}</span>
                </>
              )}
            </button>
          )}

          {currentStep === 4 && (
            <div className="flex items-center gap-2.5 w-full justify-end">
              {onOpenHelp && createdBookingId && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenHelp(createdBookingId);
                  }}
                  className="min-h-[48px] px-4 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  {lang === 'en' ? 'Get Help' : 'সাহায্য নিন'}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="min-h-[48px] px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs sm:text-sm font-bold cursor-pointer transition-all"
              >
                {lang === 'en' ? 'Done' : 'সম্পন্ন'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
