import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerType, MaterialCategory } from '../../types';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Volume2,
  VolumeX,
  Package,
  Sparkles,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Check,
  Building,
  Info
} from 'lucide-react';
import { speakInstruction, stopSpeaking } from '../../utils/statusDictionary';
import { BrandJourneyDevice } from '../common/BrandJourneyDevice';
import { MaterialIllustration } from '../common/MaterialIllustrations';

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

  // 4 Steps:
  // Step 1: R03 Material choice (picture first, words second)
  // Step 2: R04 Time selection (appointment)
  // Step 3: R05 Review (a receipt before commitment)
  // Step 4: R06 Confirmation (reassuring, not over-celebratory)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Address State
  const currentLocation =
    savedLocations.find((l) => l.id === selectedLocationId) || savedLocations[0];
  const [address, setAddress] = useState(currentLocation?.address || 'House 14, Road 52, Gulshan-2, Dhaka');
  const [selectedZone, setSelectedZone] = useState(currentLocation?.zoneId || 'ZONE-GUL-02');

  // Selected Material Categories
  const [selectedCats, setSelectedCats] = useState<MaterialCategory[]>([
    'PET_BOTTLES',
    'CARDBOARD_OCC'
  ]);

  // Examples Sheet Modal State
  const [showExamplesModal, setShowExamplesModal] = useState(false);

  // Power User Exact Details toggle
  const [showExactDetails, setShowExactDetails] = useState(false);
  const [quantityBand, setQuantityBand] = useState<'normal' | 'large'>('normal');

  // Step 2: Date & Window
  const [scheduledDay, setScheduledDay] = useState<'today' | 'tomorrow' | 'thursday'>('tomorrow');
  const [scheduledWindow, setScheduledWindow] = useState<'morning' | 'afternoon'>('morning');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [accessNote, setAccessNote] = useState('');

  // Step 3 & 4 Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

  // Audio Voice
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!isOpen) return null;

  // Material item definitions with recognizable, friendly representations
  const materialChoices: Array<{
    id: MaterialCategory;
    titleEn: string;
    titleBn: string;
    subtitleEn: string;
    subtitleBn: string;
    tag: string;
    tagBn?: string;
    illustrationIcon: string;
    acceptedList: string[];
    acceptedListBn?: string[];
    rejectedList: string[];
    rejectedListBn?: string[];
  }> = [
    {
      id: 'PET_BOTTLES',
      titleEn: 'Plastic bottles',
      titleBn: 'প্লাস্টিকের বোতল (PET)',
      subtitleEn: 'Water, soft drinks, edible oil bottles',
      subtitleBn: 'খাবার পানি, জুস ও কোমল পানীয়ের পরিষ্কার বোতল',
      tag: 'Most common',
      tagBn: 'সবচেয়ে জনপ্রিয়',
      illustrationIcon: '🧴',
      acceptedList: ['Clear water bottles', 'Soft drink bottles', 'Mustard/edible oil containers'],
      acceptedListBn: ['স্বচ্ছ পানির বোতল', 'কোমল পানীয়ের বোতল', 'ভোজ্য তেলের বোতল'],
      rejectedList: ['Foil snack wrappers', 'Plastic grocery bags', 'Unwashed pesticide jugs'],
      rejectedListBn: ['চিপসের ফয়েল প্যাকেট', 'পাতলা পলিথিন ব্যাগ', 'কীটনাশকের জার']
    },
    {
      id: 'CARDBOARD_OCC',
      titleEn: 'Paper & cardboard',
      titleBn: 'কাগজ ও কার্টন (OCC)',
      subtitleEn: 'Delivery boxes, packaging cartons, newspapers',
      subtitleBn: 'ডেলিভারি পার্সেল বক্স, কার্টন ও পত্রিকা',
      tag: 'Easy to stack',
      tagBn: 'সহজে স্তূপযোগ্য',
      illustrationIcon: '📦',
      acceptedList: ['Brown shipping boxes', 'Cereal packaging', 'Clean white paper bundles'],
      acceptedListBn: ['শিপিং কার্টুন বক্স', 'খাবারের প্যাকেট বক্স', 'পরিষ্কার সাদা কাগজের বান্ডিল'],
      rejectedList: ['Wet paper', 'Pizza boxes with grease', 'Plastic-laminated paper'],
      rejectedListBn: ['ভেজা কাগজ', 'তেলযুক্ত পিৎজা বক্স', 'প্লাস্টিক ল্যামিনেটেড কাগজ']
    },
    {
      id: 'HDPE_RIGID',
      titleEn: 'Other packaging containers',
      titleBn: 'অন্যান্য পরিচ্ছন্ন পাত্র (HDPE/ক্যান)',
      subtitleEn: 'Shampoo bottles, detergent jugs, metal soda cans',
      subtitleBn: 'শ্যাম্পুর বোতল, ডিটারজেন্ট পাত্র ও ধাতব ক্যান',
      tag: 'Clean & dry only',
      tagBn: 'শুকনো ও পরিষ্কার',
      illustrationIcon: '🥫',
      acceptedList: ['Detergent jugs', 'Soda cans', 'Clean cosmetics tubs'],
      acceptedListBn: ['ডিটারজেন্ট কন্টেইনার', 'কোমল পানীয়ের অ্যালুমিনিয়াম ক্যান', 'পরিষ্কার প্রসাধন পাত্র'],
      rejectedList: ['Hazardous chemicals', 'Medical waste', 'Motor oil cans'],
      rejectedListBn: ['ঝুঁকিপূর্ণ রাসায়নিক পাত্র', 'মেডিকেল বর্জ্য', 'মবিল/লুব্রিকেন্ট ক্যান']
    }
  ];

  const handleToggleCat = (catId: MaterialCategory) => {
    if (selectedCats.includes(catId)) {
      if (selectedCats.length > 1) {
        setSelectedCats(selectedCats.filter((c) => c !== catId));
      }
    } else {
      setSelectedCats([...selectedCats, catId]);
    }
  };

  const getDayDisplay = () => {
    if (scheduledDay === 'today') {
      return {
        label: lang === 'en' ? 'Today (Tue, Oct 6)' : 'আজ (মঙ্গলবার, ৬ অক্টোবর)',
        date: '2026-10-06'
      };
    }
    if (scheduledDay === 'tomorrow') {
      return {
        label: lang === 'en' ? 'Tomorrow (Wed, Oct 7)' : 'আগামীকাল (বুধবার, ৭ অক্টোবর)',
        date: '2026-10-07'
      };
    }
    return {
      label: lang === 'en' ? 'Thursday (Oct 8)' : 'বৃহস্পতিবার (৮ অক্টোবর)',
      date: '2026-10-08'
    };
  };

  const getWindowDisplay = () => {
    if (scheduledWindow === 'morning') {
      return lang === 'en' ? 'Morning · 9 am–12 pm' : 'সকাল · ৯:০০ - ১২:০০';
    }
    return lang === 'en' ? 'Afternoon · 1 pm–4 pm' : 'দুপুর · ১:০০ - ৪:০০';
  };

  const handleVoice = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    let text = '';
    if (currentStep === 1) {
      text =
        lang === 'bn'
          ? 'কী কী বর্জ্য সংগ্রহ করাতে চান তা স্পর্শ করে নির্বাচন করুন। যেমন প্লাস্টিক বোতল বা কার্টন।'
          : 'Tap everything you want collected. Plastic bottles, paper and cardboard, or other containers.';
    } else if (currentStep === 2) {
      text =
        lang === 'bn'
          ? 'সংগ্রহের সুবিধাজনক সময় বেছে নিন। সকাল নয়টা থেকে বারোটা অথবা দুপুর একটা থেকে চারটা।'
          : 'Choose when our collector should come. Morning 9am to 12pm or Afternoon 1pm to 4pm.';
    } else if (currentStep === 3) {
      text =
        lang === 'bn'
          ? 'বুকিংয়ের তথ্য পর্যালোচনা করুন এবং নিশ্চিত করুন।'
          : 'Review where, when, and what we will collect. Then confirm your pickup.';
    }
    setIsSpeaking(true);
    speakInstruction(text, lang);
    setTimeout(() => setIsSpeaking(false), 6000);
  };

  const handleConfirm = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const bookingMaterials = selectedCats.map((cat) => ({
      category: cat,
      approximateBandKg: quantityBand === 'large' ? '15-30 kg' : '2-10 kg'
    }));

    const dateInfo = getDayDisplay();
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
          : 'Shadman Khalili',
      customerType:
        role === 'customer_apartment'
          ? 'apartment'
          : role === 'customer_business'
          ? 'business'
          : 'household',
      phone: '+880 1712 345678',
      address,
      zoneId: selectedZone,
      accessInstructions: accessNote,
      scheduledDate: dateInfo.date,
      scheduledTimeWindow: getWindowDisplay(),
      isRecurring: false,
      serviceType: role === 'customer_business' ? 'COMMERCIAL_BATCH' : 'DOORSTEP_RECOVERY',
      materials: bookingMaterials,
      serviceFeeBdt: role === 'customer_business' ? 150 : 0,
      notes: accessNote
    });

    setCreatedBookingId(newBooking.id);
    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep(4);
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[94vh] flex flex-col border border-[#EDE4D8] overflow-hidden text-[#202B38]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#EDE4D8] bg-[#FFF9F0] flex items-center justify-between shrink-0">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#53616D] font-mono">
              {currentStep === 1 && (lang === 'en' ? 'Step 1 of 3: Materials' : 'ধাপ ১/৩: উপকরণ')}
              {currentStep === 2 && (lang === 'en' ? 'Step 2 of 3: Time' : 'ধাপ ২/৩: সময়')}
              {currentStep === 3 && (lang === 'en' ? 'Step 3 of 3: Review' : 'ধাপ ৩/৩: পর্যালোচনা')}
              {currentStep === 4 && (lang === 'en' ? 'Booking Confirmed' : 'বুকিং সম্পন্ন')}
            </span>
            <h2 className="text-lg font-bold text-[#25345C] leading-tight">
              {currentStep === 1 && (lang === 'en' ? 'What do you have?' : 'কী কী উপকরণ আছে?')}
              {currentStep === 2 && (lang === 'en' ? 'When should we come?' : 'কখন আসবেন কালেক্টর?')}
              {currentStep === 3 && (lang === 'en' ? 'Your pickup receipt' : 'পিকআপ রসিদ')}
              {currentStep === 4 && (lang === 'en' ? "You're booked ✓" : 'আপনার বুকিং সম্পন্ন ✓')}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleVoice}
              className={`min-h-[40px] px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                isSpeaking ? 'bg-[#F5BF55] text-[#202B38]' : 'bg-white text-[#53616D] hover:bg-[#EDE4D8]'
              }`}
              title="Spoken audio instructions"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#25345C]" />}
            </button>

            <button
              onClick={onClose}
              type="button"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#53616D] hover:text-[#202B38] hover:bg-[#EDE4D8] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scroll Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs text-[#202B38]">
          {/* ===================================================================== */}
          {/* STEP 1: R03 MATERIAL CHOICE (Picture first, words second) */}
          {/* ===================================================================== */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-[#53616D]">
                {lang === 'en'
                  ? 'Tap everything you want collected.'
                  : 'সংগ্রহ করতে চান এমন সব উপকরণে চাপ দিন।'}
              </p>

              {/* Picture-led Material Cards */}
              <div className="space-y-3">
                {materialChoices.map((item) => {
                  const isSelected = selectedCats.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggleCat(item.id)}
                      className={`w-full p-4 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between min-h-[56px] ${
                        isSelected
                          ? 'border-[#25345C] bg-[#EDF1F9] ring-2 ring-[#25345C]/15 shadow-xs'
                          : 'border-[#EDE4D8] bg-white hover:bg-[#FFF9F0]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        {/* Bespoke clean-line SVG illustration */}
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-white shadow-2xs' : 'bg-[#FFF9F0]'
                          }`}
                        >
                          <MaterialIllustration category={item.id} size="md" />
                        </div>

                        <div>
                          <span className="text-sm font-bold text-[#202B38] block leading-snug">
                            {lang === 'en' ? item.titleEn : item.titleBn}
                          </span>
                          <span className="text-xs text-[#53616D] block mt-0.5">
                            {lang === 'en' ? item.subtitleEn : item.subtitleBn}
                          </span>
                          <span className="text-[10px] font-mono text-[#12613F] font-semibold mt-1 inline-block bg-[#C9F1DC] px-2 py-0.2 rounded-md">
                            {lang === 'en' ? item.tag : item.tagBn || item.tag}
                          </span>
                        </div>
                      </div>

                      {/* Selection Check Circle */}
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-[#25345C] bg-[#25345C] text-white'
                            : 'border-[#EDE4D8] bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* "Not sure what this is? See examples" sheet trigger */}
              <div className="pt-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowExamplesModal(true)}
                  className="text-xs font-bold text-[#25345C] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-[#25345C]" />
                  <span>{lang === 'en' ? 'Not sure what this is? See examples' : 'বুঝতে পারছেন না? উদাহরণ দেখুন'}</span>
                </button>

                {/* Power User: Add Exact Details */}
                <button
                  type="button"
                  onClick={() => setShowExactDetails(!showExactDetails)}
                  className="text-[11px] text-[#53616D] hover:text-[#202B38] cursor-pointer"
                >
                  {showExactDetails ? 'Hide details' : 'More options'}
                </button>
              </div>

              {/* Power User Exact Details (progressive disclosure) */}
              {showExactDetails && (
                <div className="p-3.5 bg-[#FFF9F0] rounded-2xl border border-[#EDE4D8] space-y-2 animate-fade-in text-xs">
                  <span className="font-bold text-[#202B38] block">Approximate Volume</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantityBand('normal')}
                      className={`p-2.5 rounded-xl border text-center font-semibold cursor-pointer ${
                        quantityBand === 'normal'
                          ? 'bg-[#25345C] text-white'
                          : 'bg-white text-[#53616D] border-[#EDE4D8]'
                      }`}
                    >
                      Standard (1–3 bags)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuantityBand('large')}
                      className={`p-2.5 rounded-xl border text-center font-semibold cursor-pointer ${
                        quantityBand === 'large'
                          ? 'bg-[#25345C] text-white'
                          : 'bg-white text-[#53616D] border-[#EDE4D8]'
                      }`}
                    >
                      Bulk / Large Sack
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* STEP 2: R04 TIME SELECTION (Appointment, not dispatch management) */}
          {/* ===================================================================== */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-[#53616D]">
                {lang === 'en'
                  ? 'Choose a convenient day and time for collection.'
                  : 'বর্জ্য সংগ্রহের সুবিধাজনক দিন ও সময় বেছে নিন।'}
              </p>

              {/* Day Selection (Today, Tomorrow, Another day) */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#202B38] uppercase tracking-wider font-mono block">
                  Select Day
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'today', labelEn: 'Today', labelBn: 'আজ', date: 'Tue, Oct 6' },
                    { id: 'tomorrow', labelEn: 'Tomorrow', labelBn: 'আগামীকাল', date: 'Wed, Oct 7' },
                    { id: 'thursday', labelEn: 'Thursday', labelBn: 'বৃহস্পতিবার', date: 'Thu, Oct 8' }
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setScheduledDay(d.id as any)}
                      className={`p-3 rounded-2xl border text-center cursor-pointer min-h-[52px] transition-all ${
                        scheduledDay === d.id
                          ? 'border-[#25345C] bg-[#EDF1F9] ring-2 ring-[#25345C]/15 font-bold text-[#25345C]'
                          : 'border-[#EDE4D8] bg-white text-[#53616D] hover:bg-[#FFF9F0]'
                      }`}
                    >
                      <span className="block text-xs font-bold">
                        {lang === 'en' ? d.labelEn : d.labelBn}
                      </span>
                      <span className="block text-[10px] text-[#53616D] font-mono mt-0.5">{d.date}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots (Morning 9 am–12 pm, Afternoon 1 pm–4 pm) */}
              <div className="space-y-1.5 pt-2">
                <span className="text-xs font-bold text-[#202B38] uppercase tracking-wider font-mono block">
                  Select Time Slot
                </span>
                <div className="space-y-2">
                  {[
                    {
                      id: 'morning',
                      titleEn: 'Morning · 9 am–12 pm',
                      titleBn: 'সকাল · ৯:০০ - ১২:০০',
                      descEn: 'Collector Tariq on primary morning sweep'
                    },
                    {
                      id: 'afternoon',
                      titleEn: 'Afternoon · 1 pm–4 pm',
                      titleBn: 'দুপুর · ১:০০ - ৪:০০',
                      descEn: 'Collector Kamrul on afternoon corridor run'
                    }
                  ].map((slot) => {
                    const isSelected = scheduledWindow === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setScheduledWindow(slot.id as any)}
                        className={`w-full p-4 rounded-2xl border text-left cursor-pointer min-h-[52px] flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-[#25345C] bg-[#EDF1F9] ring-2 ring-[#25345C]/15'
                            : 'border-[#EDE4D8] bg-white hover:bg-[#FFF9F0]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Clock
                            className={`w-4 h-4 ${isSelected ? 'text-[#25345C]' : 'text-[#8896A4]'}`}
                          />
                          <div>
                            <span className="font-bold text-xs sm:text-sm text-[#202B38] block">
                              {lang === 'en' ? slot.titleEn : slot.titleBn}
                            </span>
                            <span className="text-[11px] text-[#53616D]">{slot.descEn}</span>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-[#25345C] bg-[#25345C] text-white' : 'border-[#EDE4D8]'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Power-user Depth: More Pickup Options */}
              <div className="pt-2">
                {!showMoreOptions ? (
                  <button
                    type="button"
                    onClick={() => setShowMoreOptions(true)}
                    className="text-xs font-semibold text-[#25345C] hover:underline cursor-pointer"
                  >
                    + Add access note for collector
                  </button>
                ) : (
                  <div className="p-3.5 bg-[#FFF9F0] rounded-2xl border border-[#EDE4D8] space-y-1.5 animate-fade-in">
                    <label className="font-bold text-[#202B38] block text-xs">
                      Access Instructions (Gate intercom, security desk)
                    </label>
                    <textarea
                      rows={2}
                      value={accessNote}
                      onChange={(e) => setAccessNote(e.target.value)}
                      placeholder="e.g. Leave sacks with building reception guard..."
                      className="w-full bg-white border border-[#EDE4D8] rounded-xl p-2.5 text-xs text-[#202B38]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* STEP 3: R05 REVIEW (A receipt before commitment) */}
          {/* ===================================================================== */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-[#53616D]">
                {lang === 'en'
                  ? 'Here is your collection summary. You can change any item before booking.'
                  : 'আপনার সংগ্রহের বিবরণ। বুকিং নিশ্চিত করার আগে পরিবর্তন করতে পারবেন।'}
              </p>

              {/* WHERE */}
              <div className="p-4 bg-[#FFF9F0] rounded-2xl border border-[#EDE4D8] flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#53616D] font-mono block">
                    WHERE
                  </span>
                  <p className="font-bold text-[#202B38] text-xs sm:text-sm">{address}</p>
                  <p className="text-[11px] text-[#53616D]">{selectedZone} Clean Lane</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-2.5 py-1 text-xs font-bold text-[#25345C] hover:underline cursor-pointer shrink-0"
                >
                  Change
                </button>
              </div>

              {/* WHAT */}
              <div className="p-4 bg-[#FFF9F0] rounded-2xl border border-[#EDE4D8] flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#53616D] font-mono block">
                    WHAT
                  </span>
                  <p className="font-bold text-[#202B38] text-xs sm:text-sm">
                    {selectedCats
                      .map((c) => materialChoices.find((m) => m.id === c)?.titleEn)
                      .join(', ')}
                  </p>
                  <p className="text-[11px] text-[#53616D]">
                    {quantityBand === 'large' ? 'Bulk / Large volume' : 'Standard household bags'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-2.5 py-1 text-xs font-bold text-[#25345C] hover:underline cursor-pointer shrink-0"
                >
                  Change
                </button>
              </div>

              {/* WHEN */}
              <div className="p-4 bg-[#FFF9F0] rounded-2xl border border-[#EDE4D8] flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#53616D] font-mono block">
                    WHEN
                  </span>
                  <p className="font-bold text-[#202B38] text-xs sm:text-sm">
                    {getDayDisplay().label}
                  </p>
                  <p className="text-[11px] text-[#53616D]">{getWindowDisplay()}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-2.5 py-1 text-xs font-bold text-[#25345C] hover:underline cursor-pointer shrink-0"
                >
                  Change
                </button>
              </div>

              {/* Commercial & Points Terms */}
              <div className="p-4 bg-white rounded-2xl border border-[#EDE4D8] space-y-2 text-xs">
                <div className="flex justify-between items-center text-[#202B38]">
                  <span className="font-medium">You pay:</span>
                  <span className="font-bold text-[#12613F] font-mono">
                    {role === 'customer_business' ? '৳150 (Commercial Batch)' : 'No collection fee (Pilot Free)'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[#202B38] pt-2 border-t border-[#EDE4D8]">
                  <span className="font-medium">You may earn:</span>
                  <span className="font-bold text-[#7A4D00] font-mono">
                    Points after materials are checked
                  </span>
                </div>
                <p className="text-[11px] text-[#53616D] pt-1">
                  Final reward points and payouts unlock automatically after certified digital scale weighing at the receiving center.
                </p>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* STEP 4: R06 CONFIRMATION (Reassuring, not over-celebratory) */}
          {/* ===================================================================== */}
          {currentStep === 4 && (
            <div className="space-y-5 text-center py-2">
              {/* Reassuring Confirmation Header */}
              <div className="w-14 h-14 rounded-full bg-[#C9F1DC] text-[#12613F] flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-7 h-7 text-[#12613F]" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-[#25345C]">
                  {lang === 'en' ? "You're booked ✓" : 'আপনার বুকিং সম্পন্ন হয়েছে ✓'}
                </h3>
                <p className="text-sm font-semibold text-[#202B38] mt-1">
                  We'll come {getDayDisplay().label.split('(')[0]}, {getWindowDisplay().split('·')[1]}.
                </p>
                <p className="text-xs font-mono text-[#53616D] mt-1">
                  Reference: <strong className="text-[#25345C]">{createdBookingId || 'CL-BK-9281'}</strong>
                </p>
              </div>

              {/* 3-Part Brand Journey Sequence */}
              <div className="pt-1">
                <BrandJourneyDevice currentStep={2} size="standard" />
              </div>

              {/* Preparation Reminder */}
              <div className="p-4 bg-[#FFF9F0] rounded-2xl border border-[#EDE4D8] text-left text-xs space-y-1.5">
                <span className="font-bold text-[#25345C] uppercase tracking-wider text-[10px] font-mono block">
                  Before we arrive:
                </span>
                <p className="text-[#202B38] font-medium leading-relaxed">
                  Keep the selected materials clean, dry, and separate. Leave bags with reception or place them outside your door before {getWindowDisplay().split('–')[0].split('·')[1] || '9 am'}.
                </p>
              </div>

              {/* Primary Actions (R06) */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                {onOpenRewards && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenRewards();
                    }}
                    className="w-full min-h-[48px] px-5 py-3 rounded-2xl border border-[#EDE4D8] bg-white hover:bg-[#FFF9F0] text-[#25345C] text-xs font-bold cursor-pointer transition-all"
                  >
                    See rewards catalogue
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full min-h-[48px] px-6 py-3 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-2xl text-xs sm:text-sm font-bold cursor-pointer shadow-xs transition-all"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* STICKY BOTTOM ACTION BAR (Steps 1, 2, 3) */}
        {/* ========================================================================= */}
        {currentStep < 4 && (
          <div className="p-4 sm:p-5 border-t border-[#EDE4D8] bg-white flex items-center justify-between gap-3 shrink-0">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                className="min-h-[48px] px-4 py-2.5 rounded-2xl border border-[#EDE4D8] text-xs font-bold text-[#53616D] hover:bg-[#FFF9F0] flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep === 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full sm:w-auto min-h-[48px] px-7 py-3 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 text-[#C9F1DC]" />
              </button>
            )}

            {currentStep === 2 && (
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="w-full sm:w-auto min-h-[48px] px-7 py-3 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
              >
                <span>Choose this time</span>
                <ArrowRight className="w-4 h-4 text-[#C9F1DC]" />
              </button>
            )}

            {currentStep === 3 && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirm}
                className={`w-full sm:w-auto min-h-[48px] px-8 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all ${
                  isSubmitting
                    ? 'bg-[#53616D] text-white cursor-not-allowed'
                    : 'bg-[#25345C] hover:bg-[#1B2644] text-white'
                }`}
              >
                {isSubmitting ? (
                  <span>Booking pickup...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#C9F1DC]" />
                    <span>Confirm pickup</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* "Yes, these / No, not these" Visual Examples Modal */}
      {showExamplesModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-[#EDE4D8] space-y-4 text-xs text-[#202B38]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE4D8]">
              <h3 className="text-base font-bold text-[#25345C]">
                Accepted & Excluded Materials
              </h3>
              <button
                onClick={() => setShowExamplesModal(false)}
                className="p-1 rounded-xl hover:bg-[#FFF9F0] text-[#53616D]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* YES THESE */}
              <div className="p-3.5 bg-[#E8FAF1] rounded-2xl border border-[#C9F1DC] space-y-2">
                <span className="font-bold text-[#12613F] text-xs flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>YES, WE COLLECT THESE:</span>
                </span>
                <ul className="space-y-1 text-[#202B38] pl-5 list-disc">
                  <li>Clean plastic water, juice, and edible oil bottles</li>
                  <li>Dry delivery cartons, shipping boxes, packaging cardboard</li>
                  <li>Clean shampoo bottles, detergent jugs, and metal soda cans</li>
                </ul>
              </div>

              {/* NO NOT THESE */}
              <div className="p-3.5 bg-[#FFF0F0] rounded-2xl border border-[#FFD5D5] space-y-2">
                <span className="font-bold text-[#D32F2F] text-xs flex items-center gap-1.5">
                  <X className="w-4 h-4" />
                  <span>NO, WE CANNOT COLLECT:</span>
                </span>
                <ul className="space-y-1 text-[#202B38] pl-5 list-disc">
                  <li>Wet kitchen or food waste</li>
                  <li>Hazardous chemical or battery containers</li>
                  <li>Medical or biological waste</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowExamplesModal(false)}
              className="w-full min-h-[44px] bg-[#25345C] text-white font-bold rounded-2xl cursor-pointer"
            >
              Got it, return to booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
