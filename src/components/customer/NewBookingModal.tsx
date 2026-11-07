import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MaterialCategory } from '../../types';
import { Check, CheckCircle2, ArrowRight, ArrowLeft, MapPin, Sparkles, ChevronDown, ChevronUp, Info, AlertCircle } from 'lucide-react';
import { pointsForWeight, RATES } from '../../domain/rules';
import { Modal } from '../common/Modal';
import { MaterialIllustration } from '../common/MaterialIllustrations';
import { AppointmentTicket } from '../common/AppointmentTicket';
import { useTranslation } from '../../utils/translations';
import { addDays, formatBookingDate, toIsoDate } from './dates';

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRecurring?: () => void;
  initialSelectedCats?: MaterialCategory[];
}

type DayId = 'today' | 'tomorrow' | 'day_after';
type WindowId = 'morning' | 'afternoon';

const DAYS: { id: DayId; offset: number; labelEn: string; labelBn: string }[] = [
  { id: 'today', offset: 0, labelEn: 'Today', labelBn: 'আজ' },
  { id: 'tomorrow', offset: 1, labelEn: 'Tomorrow', labelBn: 'আগামীকাল' },
  { id: 'day_after', offset: 2, labelEn: 'Day after', labelBn: 'পরশু' }
];

const WINDOWS: Record<WindowId, { label: string; startHour: number }> = {
  morning: { label: '09:00 AM – 11:30 AM', startHour: 9 },
  afternoon: { label: '02:00 PM – 04:30 PM', startHour: 14 }
};

const slotStart = (day: DayId, win: WindowId, now: Date): Date => {
  const d = addDays(now, DAYS.find((x) => x.id === day)!.offset);
  d.setHours(WINDOWS[win].startHour, 0, 0, 0);
  return d;
};

const MATERIAL_CHOICES: Array<{
  id: MaterialCategory;
  titleEn: string;
  titleBn: string;
  subtitleEn: string;
  subtitleBn: string;
  acceptedList: string[];
  acceptedListBn: string[];
  rejectedList: string[];
  rejectedListBn: string[];
}> = [
  {
    id: 'PET_BOTTLES',
    titleEn: 'Plastic bottles',
    titleBn: 'প্লাস্টিকের বোতল (PET)',
    subtitleEn: 'Water, juice & soft drink bottles',
    subtitleBn: 'খাবার পানি, জুস ও কোমল পানীয়ের পরিষ্কার বোতল',
    acceptedList: ['Clear water bottles', 'Soft drink bottles', 'Clean cooking oil bottles'],
    acceptedListBn: ['স্বচ্ছ পানির বোতল', 'কোমল পানীয়ের বোতল', 'ভোজ্য তেলের বোতল'],
    rejectedList: ['Foil snack packets', 'Thin grocery bags', 'Unwashed pesticide jugs'],
    rejectedListBn: ['চিপসের ফয়েল প্যাকেট', 'পাতলা পলিথিন ব্যাগ', 'কীটনাশকের জার']
  },
  {
    id: 'CARDBOARD_OCC',
    titleEn: 'Paper & cardboard',
    titleBn: 'কাগজ ও কার্টন (OCC)',
    subtitleEn: 'Delivery boxes, packaging cartons',
    subtitleBn: 'ডেলিভারি পার্সেল বক্স, কার্টন ও শক্ত কাগজ',
    acceptedList: ['Flattened delivery boxes', 'Clean packing cartons', 'Newspapers & books'],
    acceptedListBn: ['চ্যাপ্টা ডেলিভারি কার্টন', 'পরিষ্কার প্যাকিং বক্স', 'পত্রিকা ও খাতা'],
    rejectedList: ['Food-stained pizza boxes', 'Waxed juice cups', 'Wet moldy paper'],
    rejectedListBn: ['তেলযুক্ত পিজা বক্স', 'ওয়াক্সড কাগজের কাপ', 'ভেজা বা ছত্রাকযুক্ত কাগজ']
  },
  {
    id: 'ALUMINUM_CANS',
    titleEn: 'Cans & metal',
    titleBn: 'ক্যান ও ধাতব পাত্র',
    subtitleEn: 'Beverage cans, tin food containers',
    subtitleBn: 'কোমল পানীয়ের ক্যান ও ধাতব খাবারের পাত্র',
    acceptedList: ['Aluminum soda cans', 'Canned food tins', 'Clean aerosol cans'],
    acceptedListBn: ['অ্যালুমিনিয়াম সোডা ক্যান', 'খাবারের টিনের কৌটা', 'পরিষ্কার স্প্রে ক্যান'],
    rejectedList: ['Battery cells', 'Paint drums with residue', 'Sharp razor blades'],
    rejectedListBn: ['ব্যাটারি সেল', 'রংযুক্ত ড্রাম', 'ধারালো ব্লেড']
  },
  {
    id: 'HDPE_RIGID',
    titleEn: 'Rigid containers',
    titleBn: 'কঠিন প্লাস্টিক (HDPE)',
    subtitleEn: 'Shampoo, detergent & milk jugs',
    subtitleBn: 'শ্যাম্পু, ডিটারজেন্ট বোতল ও দুধের জার',
    acceptedList: ['Detergent jugs', 'Shampoo & conditioner bottles', 'Hard plastic buckets'],
    acceptedListBn: ['ডিটারজেন্ট জার', 'শ্যাম্পুর বোতল', 'কঠিন প্লাস্টিক বালতি'],
    rejectedList: ['Soft tubes', 'PVC plumbing pipes', 'Styrofoam foam'],
    rejectedListBn: ['টুথপেস্টের নরম টিউব', 'পিভিসি পাইপ', 'কর্কশীট ফোম']
  }
];


const BookingFlow: React.FC<{
  onClose: () => void;
  onOpenRecurring?: () => void;
  initialSelectedCats?: MaterialCategory[];
  step: 1 | 2 | 3 | 4;
  setStep: (s: 1 | 2 | 3 | 4) => void;
}> = ({ onClose, onOpenRecurring, initialSelectedCats, step: currentStep, setStep: setCurrentStep }) => {
  const { lang, savedLocations, selectedLocationId, serviceZones, createBooking, currentCustomer } = useApp();
  const t = useTranslation(lang);

  const currentLocation = savedLocations.find((l) => l.id === selectedLocationId) || savedLocations[0];
  const zone = serviceZones.find((z) => z.id === currentLocation?.zoneId);
  const leadHours = zone?.leadTimeHours ?? 12;
  const locationUnavailable = currentLocation?.status === 'unavailable';

  // Address follows the selected saved location until the customer types over it.
  const [addressOverride, setAddressOverride] = useState<string | null>(null);
  const address = addressOverride ?? currentLocation?.address ?? '';
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Step 1
  const [selectedCats, setSelectedCats] = useState<MaterialCategory[]>(
    initialSelectedCats && initialSelectedCats.length > 0 ? initialSelectedCats : ['PET_BOTTLES', 'CARDBOARD_OCC']
  );
  const [approxQuantity, setApproxQuantity] = useState<'small' | 'standard' | 'large' | 'not_sure'>('standard');
  const [showAddDetails, setShowAddDetails] = useState(false);
  const [exactWeightEstimate, setExactWeightEstimate] = useState('');
  const [materialNotes, setMaterialNotes] = useState('');
  const [showExamples, setShowExamples] = useState(false);

  // Step 2: only offer slots that respect the zone's lead time.
  const now = new Date();
  const earliest = now.getTime() + leadHours * 3_600_000;
  const slotOk = (day: DayId, win: WindowId) => slotStart(day, win, now).getTime() >= earliest;
  const firstOk = (() => {
    for (const d of DAYS) for (const w of ['morning', 'afternoon'] as WindowId[]) if (slotOk(d.id, w)) return { day: d.id, win: w };
    return { day: 'day_after' as DayId, win: 'morning' as WindowId };
  })();
  const [scheduledDay, setScheduledDay] = useState<DayId>(firstOk.day);
  const [scheduledWindow, setScheduledWindow] = useState<WindowId>(firstOk.win);
  const [showAddNote, setShowAddNote] = useState(false);
  const [accessNote, setAccessNote] = useState(currentLocation?.accessInstructions ?? '');

  const [createdBooking, setCreatedBooking] = useState<ReturnType<typeof createBooking> | null>(null);

  const chooseDay = (day: DayId) => {
    setScheduledDay(day);
    if (!slotOk(day, scheduledWindow)) {
      const other: WindowId = scheduledWindow === 'morning' ? 'afternoon' : 'morning';
      if (slotOk(day, other)) setScheduledWindow(other);
    }
  };

  const toggleMaterial = (cat: MaterialCategory) => {
    if (selectedCats.includes(cat)) {
      if (selectedCats.length > 1) setSelectedCats(selectedCats.filter((c) => c !== cat));
    } else {
      setSelectedCats([...selectedCats, cat]);
    }
  };

  const dayDate = (day: DayId) => addDays(now, DAYS.find((x) => x.id === day)!.offset);
  const scheduledIso = toIsoDate(dayDate(scheduledDay));
  const exactKg = parseFloat(exactWeightEstimate);
  const hasExact = Number.isFinite(exactKg) && exactKg > 0;

  const handleConfirmBooking = () => {
    if (!currentLocation || createdBooking) return;
    const noteParts: string[] = [];
    if (hasExact) noteParts.push(`Customer weight estimate: ${exactKg} kg`);
    if (materialNotes.trim()) noteParts.push(`Material note: ${materialNotes.trim()}`);

    const band =
      approxQuantity === 'small' ? '1-3 kg' : approxQuantity === 'large' ? '10+ kg' : approxQuantity === 'standard' ? '3-8 kg' : 'Not sure';

    const created = createBooking({
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      phone: currentCustomer.phone,
      customerType: currentCustomer.customerType,
      zoneId: currentLocation.zoneId,
      address,
      scheduledDate: scheduledIso,
      scheduledTimeWindow: WINDOWS[scheduledWindow].label,
      isRecurring: false,
      serviceType: currentCustomer.customerType === 'business' ? 'COMMERCIAL_BATCH' : 'DOORSTEP_RECOVERY',
      materials: selectedCats.map((cat) => ({ category: cat, approximateBandKg: band })),
      accessInstructions: accessNote.trim() || undefined,
      notes: noteParts.length > 0 ? noteParts.join('. ') : undefined,
      serviceFeeBdt: 0
    });
    setCreatedBooking(created);
    setCurrentStep(4);
  };

  const primaryBtn =
    'w-full min-h-[48px] bg-[#25345C] hover:bg-[#1B2644] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="space-y-5 text-xs text-[#202B38]">
      {currentStep > 1 && currentStep < 4 && (
        <button
          type="button"
          onClick={() => setCurrentStep((currentStep - 1) as 1 | 2 | 3)}
          className="flex items-center gap-1.5 text-xs font-bold text-[#53616D] hover:text-[#202B38] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>{lang === 'en' ? 'Back' : 'পিছনে'}</span>
        </button>
      )}

      {/* STEP 1 */}
      {currentStep === 1 && (
        <div className="space-y-5 animate-fade-in">
          <p className="text-xs text-[#53616D]">{t.selectMaterialsPrompt}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MATERIAL_CHOICES.map((item) => {
              const isSelected = selectedCats.includes(item.id);
              return (
                <button
                  type="button"
                  key={item.id}
                  aria-pressed={isSelected}
                  onClick={() => toggleMaterial(item.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative flex items-start gap-3.5 ${
                    isSelected ? 'bg-[#FAF5EC] border-[#25345C] shadow-xs' : 'bg-white border-[#EDE4D8] hover:border-[#25345C]/30'
                  }`}
                >
                  <MaterialIllustration category={item.id} size="md" className="shrink-0 mt-0.5" />
                  <span className="space-y-0.5 min-w-0 flex-1 block">
                    <span className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs text-[#202B38] truncate">{lang === 'en' ? item.titleEn : item.titleBn}</span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-[#12613F] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" aria-hidden="true" />
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-[#53616D] leading-tight block">{lang === 'en' ? item.subtitleEn : item.subtitleBn}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] font-mono font-bold text-[#12613F] bg-[#C9F1DC]/60 rounded-xl px-3 py-2">
            {lang === 'en'
              ? `Doorstep pickups earn ${RATES.doorstepPointsPerKg} points per verified kg, for every material.`
              : `ডোরস্টেপ পিকআপে প্রতি যাচাইকৃত কেজিতে ${RATES.doorstepPointsPerKg} পয়েন্ট, সব ধরনের উপাদানের জন্য।`}
          </p>

          <button
            type="button"
            onClick={() => setShowExamples(true)}
            className="text-xs font-bold text-[#25345C] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-[#12613F]" aria-hidden="true" />
            <span>
              {t.seeExamples} ({lang === 'en' ? 'accepted & excluded items' : 'গৃহীত ও অগ্রহণযোগ্য'})
            </span>
          </button>

          <fieldset className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#EDE4D8] space-y-2.5">
            <legend className="font-bold text-xs text-[#202B38] px-1">{lang === 'en' ? 'Approximate quantity' : 'আনুমানিক পরিমাণ'}</legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { id: 'small', labelEn: 'Small (~2 kg)', labelBn: 'ছোট ব্যাগ (~২ কেজি)' },
                  { id: 'standard', labelEn: 'Standard (~6 kg)', labelBn: 'মাঝারি (~৬ কেজি)' },
                  { id: 'large', labelEn: 'Large (10+ kg)', labelBn: 'বড় বস্তা (১০+ কেজি)' },
                  { id: 'not_sure', labelEn: 'Not sure', labelBn: 'নিশ্চিত নই' }
                ] as const
              ).map((q) => (
                <button
                  key={q.id}
                  type="button"
                  aria-pressed={approxQuantity === q.id}
                  onClick={() => setApproxQuantity(q.id)}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                    approxQuantity === q.id ? 'bg-[#25345C] text-white border-[#25345C] shadow-2xs' : 'bg-white text-[#53616D] border-[#EDE4D8]'
                  }`}
                >
                  {lang === 'en' ? q.labelEn : q.labelBn}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="border-t border-[#FAF5EC] pt-2">
            <button
              type="button"
              aria-expanded={showAddDetails}
              onClick={() => setShowAddDetails(!showAddDetails)}
              className="text-xs font-bold text-[#53616D] hover:text-[#202B38] flex items-center gap-1.5 cursor-pointer"
            >
              <span>
                {t.addDetails} ({lang === 'en' ? 'exact weight & notes' : 'সঠিক ওজন ও মন্তব্য'})
              </span>
              {showAddDetails ? <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" /> : <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />}
            </button>

            {showAddDetails && (
              <div className="mt-3 p-4 bg-white rounded-2xl border border-[#EDE4D8] space-y-3 animate-fade-in">
                <div>
                  <label htmlFor="bk-weight" className="font-semibold text-[11px] text-[#53616D] block mb-1">
                    {lang === 'en' ? 'Exact weight estimate (optional, kg)' : 'সুনির্দিষ্ট আনুমানিক কেজি (ঐচ্ছিক)'}
                  </label>
                  <input
                    id="bk-weight"
                    type="number"
                    min="0"
                    step="0.1"
                    inputMode="decimal"
                    placeholder="e.g. 5.5"
                    value={exactWeightEstimate}
                    onChange={(e) => setExactWeightEstimate(e.target.value)}
                    className="w-full bg-[#FAF5EC] border border-[#EDE4D8] rounded-xl p-2 text-xs font-mono"
                  />
                  {hasExact && (
                    <p className="text-[11px] text-[#53616D] mt-1">
                      {lang === 'en'
                        ? `About ${pointsForWeight(exactKg)} points once verified at the hub scale.`
                        : `হাব স্কেলে যাচাইয়ের পর প্রায় ${pointsForWeight(exactKg)} পয়েন্ট।`}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="bk-material-note" className="font-semibold text-[11px] text-[#53616D] block mb-1">
                    {lang === 'en' ? 'Special material note' : 'উপাদান সংক্রান্ত বিশেষ মন্তব্য'}
                  </label>
                  <input
                    id="bk-material-note"
                    type="text"
                    placeholder={lang === 'en' ? 'e.g. Cardboard boxes are flattened and tied with string' : 'যেমন: কার্টনগুলো চ্যাপ্টা করে দড়ি দিয়ে বাঁধা'}
                    value={materialNotes}
                    onChange={(e) => setMaterialNotes(e.target.value)}
                    className="w-full bg-[#FAF5EC] border border-[#EDE4D8] rounded-xl p-2 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          <button type="button" onClick={() => setCurrentStep(2)} className={primaryBtn}>
            <span>{t.next}</span>
            <ArrowRight className="w-4 h-4 text-[#C9F1DC]" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* STEP 2 */}
      {currentStep === 2 && (
        <div className="space-y-5 animate-fade-in">
          <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#EDE4D8] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#202B38]">
                <MapPin className="w-3.5 h-3.5 text-[#12613F]" aria-hidden="true" />
                <span>{currentLocation?.label ?? t.serviceAddress}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingAddress(!isEditingAddress)}
                className="text-xs font-bold text-[#25345C] hover:underline cursor-pointer"
              >
                {isEditingAddress ? (lang === 'en' ? 'Done' : 'ঠিক আছে') : t.changeAddress}
              </button>
            </div>

            {isEditingAddress ? (
              <>
                <label htmlFor="bk-address" className="sr-only">
                  {t.serviceAddress}
                </label>
                <input
                  id="bk-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddressOverride(e.target.value)}
                  className="w-full bg-white border border-[#25345C] rounded-xl p-2.5 text-xs font-medium"
                />
              </>
            ) : (
              <p className="text-xs text-[#53616D] font-medium">{address}</p>
            )}
          </div>

          {locationUnavailable && (
            <div role="alert" className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-amber-950">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="leading-relaxed">
                {lang === 'en'
                  ? 'Doorstep pickup is not available at this address yet. Choose another saved address from your Account, or use a drop-off point.'
                  : 'এই ঠিকানায় এখনো ডোরস্টেপ পিকআপ চালু হয়নি। অ্যাকাউন্ট থেকে অন্য ঠিকানা বেছে নিন, অথবা ড্রপ-অফ পয়েন্ট ব্যবহার করুন।'}
              </p>
            </div>
          )}

          <fieldset className="space-y-2">
            <legend className="font-bold text-xs text-[#202B38] mb-2">{t.chooseDay}</legend>
            <div className="grid grid-cols-3 gap-2">
              {DAYS.map((d) => {
                const enabled = slotOk(d.id, 'morning') || slotOk(d.id, 'afternoon');
                return (
                  <button
                    key={d.id}
                    type="button"
                    disabled={!enabled}
                    aria-pressed={scheduledDay === d.id}
                    onClick={() => chooseDay(d.id)}
                    className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      scheduledDay === d.id ? 'bg-[#25345C] text-white border-[#25345C] shadow-2xs' : 'bg-white text-[#53616D] border-[#EDE4D8] hover:bg-[#FAF5EC]'
                    }`}
                  >
                    <span className="block">{lang === 'en' ? d.labelEn : d.labelBn}</span>
                    <span className="block text-[10px] font-medium opacity-80">{formatBookingDate(toIsoDate(dayDate(d.id)), lang)}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-[#53616D]">
              {lang === 'en'
                ? `This area needs ${leadHours} hours' notice, so earlier slots are unavailable.`
                : `এই এলাকায় অন্তত ${leadHours} ঘণ্টা আগে জানাতে হয়, তাই কিছু সময় বন্ধ আছে।`}
            </p>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="font-bold text-xs text-[#202B38] mb-2">{t.assignedTimeWindow}</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(['morning', 'afternoon'] as WindowId[]).map((w) => (
                <button
                  key={w}
                  type="button"
                  disabled={!slotOk(scheduledDay, w)}
                  aria-pressed={scheduledWindow === w}
                  onClick={() => setScheduledWindow(w)}
                  className={`p-3.5 rounded-2xl border text-left font-bold text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    scheduledWindow === w ? 'bg-[#FAF5EC] border-[#25345C] text-[#25345C]' : 'bg-white border-[#EDE4D8] text-[#53616D]'
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span>{w === 'morning' ? t.morningSlot : t.afternoonSlot}</span>
                    {scheduledWindow === w && <Check className="w-4 h-4 text-[#12613F]" aria-hidden="true" />}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="border-t border-[#FAF5EC] pt-2">
            <button
              type="button"
              aria-expanded={showAddNote}
              onClick={() => setShowAddNote(!showAddNote)}
              className="text-xs font-bold text-[#53616D] hover:text-[#202B38] flex items-center gap-1.5 cursor-pointer"
            >
              <span>
                {t.addANote} ({lang === 'en' ? 'gate or building instructions' : 'গেট বা ভবনের নির্দেশনা'})
              </span>
              {showAddNote ? <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" /> : <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />}
            </button>

            {showAddNote && (
              <div className="mt-2 animate-fade-in">
                <label htmlFor="bk-access" className="sr-only">
                  {t.addANote}
                </label>
                <textarea
                  id="bk-access"
                  rows={2}
                  value={accessNote}
                  onChange={(e) => setAccessNote(e.target.value)}
                  placeholder={t.accessPlaceholder}
                  className="w-full bg-[#FAF5EC] border border-[#EDE4D8] rounded-xl p-2.5 text-xs text-[#202B38]"
                />
              </div>
            )}
          </div>

          {onOpenRecurring && (
            <div className="p-3 bg-[#FAF5EC] rounded-2xl border border-[#EDE4D8] flex items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-[#202B38] block">{t.arrangeRegularCollection}</span>
                <span className="text-[11px] text-[#53616D]">{t.regularCollectionSub}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRecurring();
                }}
                className="px-3 py-1.5 bg-white border border-[#EDE4D8] text-[#25345C] rounded-xl font-bold text-xs hover:bg-[#EDE4D8] cursor-pointer"
              >
                {lang === 'en' ? 'Set up' : 'সেটআপ'}
              </button>
            </div>
          )}

          <button type="button" disabled={locationUnavailable || !slotOk(scheduledDay, scheduledWindow)} onClick={() => setCurrentStep(3)} className={primaryBtn}>
            <span>{t.reviewPickup}</span>
            <ArrowRight className="w-4 h-4 text-[#C9F1DC]" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* STEP 3 */}
      {currentStep === 3 && (
        <div className="space-y-5 animate-fade-in">
          <div className="p-5 bg-[#FAF9F5] rounded-3xl border border-[#EDE4D8] space-y-4 shadow-2xs">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-[#53616D] uppercase tracking-wider block">{t.addressLabel}</span>
              <p className="text-xs font-bold text-[#202B38]">{address}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#53616D] uppercase tracking-wider block">
                {lang === 'en' ? 'Selected materials' : 'নির্বাচিত উপাদানসমূহ'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedCats.map((cat) => {
                  const info = MATERIAL_CHOICES.find((m) => m.id === cat);
                  return (
                    <span key={cat} className="px-2.5 py-1 bg-white border border-[#EDE4D8] rounded-xl text-xs font-bold text-[#202B38]">
                      {info ? (lang === 'en' ? info.titleEn : info.titleBn) : cat.replace(/_/g, ' ')}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-[#53616D] uppercase tracking-wider block">{t.assignedTimeWindow}</span>
              <p className="text-sm font-black text-[#25345C]">
                {formatBookingDate(scheduledIso, lang)} · {scheduledWindow === 'morning' ? t.morningSlot : t.afternoonSlot}
              </p>
            </div>

            {(hasExact || materialNotes.trim()) && (
              <div className="space-y-0.5 text-[#53616D]">
                {hasExact && (
                  <p>
                    {lang === 'en' ? 'Your estimate' : 'আপনার অনুমান'}: <strong className="text-[#202B38]">{exactKg} kg</strong>
                  </p>
                )}
                {materialNotes.trim() && <p>{materialNotes.trim()}</p>}
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-[#EDE4D8]">
              <span className="font-semibold text-xs text-[#53616D]">{t.serviceFee}:</span>
              <span className="font-bold text-xs text-[#12613F]">{t.freeDoorstepCollection}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#53616D]">{t.provisionalPaymentBasis}:</span>
              <span className="font-mono font-bold text-[#25345C]">
                {RATES.doorstepPointsPerKg} pts / kg {lang === 'en' ? 'verified' : 'যাচাইকৃত'}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#EDE4D8] text-[11px] text-[#53616D]">
              <span className="font-bold text-[#202B38] block">{t.rewardCondition}:</span>
              <span>{t.conditionSummary}</span>
            </div>
          </div>

          <button type="button" onClick={handleConfirmBooking} className={primaryBtn}>
            <span>{t.confirm}</span>
            <Check className="w-4 h-4 text-[#C9F1DC]" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* STEP 4 */}
      {currentStep === 4 && createdBooking && (
        <div className="space-y-5 animate-fade-in text-center">
          <div className="w-14 h-14 rounded-full bg-[#C9F1DC] text-[#12613F] flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <h4 className="text-xl font-black text-[#202B38]">{t.step4Heading}</h4>
            <p className="text-xs text-[#53616D] font-mono">
              {lang === 'en' ? `Booking reference: #${createdBooking.id}` : `বুকিং কোড: #${createdBooking.id}`}
            </p>
          </div>

          <div className="text-left">
            <AppointmentTicket booking={createdBooking} isConfirmationView />
          </div>

          <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#EDE4D8] text-left space-y-2 text-xs">
            <span className="font-bold text-[#202B38] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#12613F]" aria-hidden="true" />
              <span>{t.prepReminderActive}</span>
            </span>
            <p className="text-[#53616D] leading-relaxed">{t.prepReminderDesc}</p>
          </div>

          <button type="button" onClick={onClose} className={primaryBtn}>
            {lang === 'en' ? 'Done' : 'সম্পন্ন'}
          </button>
        </div>
      )}

      {/* Examples (nested dialog) */}
      <Modal
        open={showExamples}
        onClose={() => setShowExamples(false)}
        size="md"
        title={t.sortingGuide}
        closeLabel={t.close}
        footer={
          <button type="button" onClick={() => setShowExamples(false)} className="w-full py-2.5 bg-[#25345C] text-white rounded-xl font-bold text-xs cursor-pointer">
            {t.close}
          </button>
        }
      >
        <div className="space-y-4 text-xs">
          {MATERIAL_CHOICES.map((item) => (
            <div key={item.id} className="p-3.5 bg-[#FAF9F5] rounded-2xl border border-[#EDE4D8] space-y-2">
              <span className="font-bold text-xs text-[#202B38] block">{lang === 'en' ? item.titleEn : item.titleBn}</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="space-y-1">
                  <span className="font-bold text-[#12613F] block">✓ {t.acceptedItems}:</span>
                  {(lang === 'en' ? item.acceptedList : item.acceptedListBn).map((acc, i) => (
                    <div key={i} className="text-[#53616D] leading-tight">
                      • {acc}
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-rose-700 block">✗ {t.rejectedItems}:</span>
                  {(lang === 'en' ? item.rejectedList : item.rejectedListBn).map((rej, i) => (
                    <div key={i} className="text-[#53616D] leading-tight">
                      • {rej}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export const NewBookingModal: React.FC<NewBookingModalProps> = ({ isOpen, onClose, onOpenRecurring, initialSelectedCats }) => {
  const { lang } = useApp();
  const t = useTranslation(lang);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  const heading = step === 1 ? t.step1Heading : step === 2 ? t.step2Heading : step === 3 ? t.step3Heading : t.step4Heading;

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      dismissible={step === 1 || step === 4}
      title={
        <span className="block">
          <span className="text-[10px] font-mono text-[#53616D] uppercase block font-normal">
            {step < 4 ? `${lang === 'en' ? 'Step' : 'ধাপ'} ${step} ${lang === 'en' ? 'of' : '/'} 3` : lang === 'en' ? 'Confirmed' : 'নিশ্চিত'}
          </span>
          {heading}
        </span>
      }
      closeLabel={lang === 'en' ? 'Close' : 'বন্ধ করুন'}
    >
      <BookingFlow onClose={handleClose} onOpenRecurring={onOpenRecurring} initialSelectedCats={initialSelectedCats} step={step} setStep={setStep} />
    </Modal>
  );
};
