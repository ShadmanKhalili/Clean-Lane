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
  Info,
  Camera,
  RefreshCw
} from 'lucide-react';
import { speakInstruction, stopSpeaking } from '../../utils/statusDictionary';
import { BrandJourneyDevice } from '../common/BrandJourneyDevice';
import { MaterialIllustration } from '../common/MaterialIllustrations';
import { useTranslation } from '../../utils/translations';

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRewards?: () => void;
  onOpenHelp?: (bookingId: string) => void;
  onOpenRecurring?: () => void;
  initialSelectedCats?: MaterialCategory[];
}

export const NewBookingModal: React.FC<NewBookingModalProps> = ({
  isOpen,
  onClose,
  onOpenRewards,
  onOpenHelp,
  onOpenRecurring,
  initialSelectedCats
}) => {
  const { lang, savedLocations, selectedLocationId, createBooking, showToast } = useApp();
  const t = useTranslation(lang);

  // 3 Core Steps + Post-confirmation screen
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Address State
  const currentLocation =
    savedLocations.find((l) => l.id === selectedLocationId) || savedLocations[0];
  const [address, setAddress] = useState(currentLocation?.address || 'House 14, Road 52, Gulshan-2, Dhaka');
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Step 1: Materials
  const [selectedCats, setSelectedCats] = useState<MaterialCategory[]>(
    initialSelectedCats && initialSelectedCats.length > 0 ? initialSelectedCats : ['PET_BOTTLES', 'CARDBOARD_OCC']
  );

  React.useEffect(() => {
    if (initialSelectedCats && initialSelectedCats.length > 0) {
      setSelectedCats(initialSelectedCats);
    }
  }, [initialSelectedCats]);
  const [approxQuantity, setApproxQuantity] = useState<'small' | 'standard' | 'large' | 'not_sure'>('standard');
  const [showAddDetails, setShowAddDetails] = useState(false);
  const [exactWeightEstimate, setExactWeightEstimate] = useState<string>('');
  const [materialNotes, setMaterialNotes] = useState<string>('');
  const [showExamplesModal, setShowExamplesModal] = useState(false);
  const [selectedExampleCat, setSelectedExampleCat] = useState<MaterialCategory | null>(null);

  // Step 2: Schedule & Access
  const [scheduledDay, setScheduledDay] = useState<'today' | 'tomorrow' | 'day_after'>('tomorrow');
  const [scheduledWindow, setScheduledWindow] = useState<'morning' | 'afternoon'>('morning');
  const [showAddNote, setShowAddNote] = useState(false);
  const [accessNote, setAccessNote] = useState('');

  // Step 3 & 4 Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Material Choices with large illustrations and examples
  const materialChoices: Array<{
    id: MaterialCategory;
    titleEn: string;
    titleBn: string;
    subtitleEn: string;
    subtitleBn: string;
    rateEn: string;
    rateBn: string;
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
      rateEn: '50 pts / kg',
      rateBn: '৫০ পয়েন্ট / কেজি',
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
      rateEn: '25 pts / kg',
      rateBn: '২৫ পয়েন্ট / কেজি',
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
      rateEn: '100 pts / kg',
      rateBn: '১০০ পয়েন্ট / কেজি',
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
      rateEn: '45 pts / kg',
      rateBn: '৪৫ পয়েন্ট / কেজি',
      acceptedList: ['Detergent jugs', 'Shampoo & conditioner bottles', 'Hard plastic buckets'],
      acceptedListBn: ['ডিটারজেন্ট জার', 'শ্যাম্পুর বোতল', 'কঠিন প্লাস্টিক বালতি'],
      rejectedList: ['Soft tubes', 'PVC plumbing pipes', 'Styrofoam foam'],
      rejectedListBn: ['টুথপেস্টের নরম টিউব', 'পিভিসি পাইপ', 'কর্কশীট ফোম']
    }
  ];

  const toggleMaterial = (cat: MaterialCategory) => {
    if (selectedCats.includes(cat)) {
      if (selectedCats.length > 1) {
        setSelectedCats(selectedCats.filter((c) => c !== cat));
      }
    } else {
      setSelectedCats([...selectedCats, cat]);
    }
  };

  const handleConfirmBooking = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const scheduledDateStr =
        scheduledDay === 'today'
          ? 'Today'
          : scheduledDay === 'tomorrow'
          ? 'Tomorrow'
          : 'Day After Tomorrow';

      const windowStr =
        scheduledWindow === 'morning' ? '09:00 AM – 11:30 AM' : '02:00 PM – 04:30 PM';

      const newB = createBooking({
        customerId: 'CL-CUST-8841',
        customerName: 'Nasreen Akhter',
        phone: '+880 1712-345678',
        customerType: 'household',
        zoneId: currentLocation.zoneId || 'ZONE-DHAN-01',
        address: address,
        scheduledDate: scheduledDateStr,
        scheduledTimeWindow: windowStr,
        isRecurring: false,
        serviceType: 'DOORSTEP_RECOVERY',
        materials: selectedCats.map((cat) => ({
          category: cat,
          approximateBandKg: approxQuantity === 'small' ? '1-3 kg' : approxQuantity === 'large' ? '10+ kg' : '3-8 kg'
        })),
        accessInstructions: accessNote,
        serviceFeeBdt: 0
      });

      setCreatedBookingId(newB.id);
      setIsSubmitting(false);
      setCurrentStep(4);
      showToast(
        lang === 'en'
          ? 'Pickup confirmed! Preparation reminder is ready.'
          : 'পিকআপ নিশ্চিত হয়েছে! প্রস্তুতি নির্দেশিকা সক্রিয় করা হয়েছে।'
      );
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[94vh] flex flex-col border border-[#EDE4D8] overflow-hidden text-[#202B38]">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-[#EDE4D8] bg-[#FFF9F0] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {currentStep > 1 && currentStep < 4 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                className="w-8 h-8 rounded-xl bg-white border border-[#EDE4D8] flex items-center justify-center text-[#53616D] hover:bg-[#FAF5EC] cursor-pointer mr-1"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <span className="text-[10px] font-mono text-[#53616D] uppercase block">
                {currentStep < 4
                  ? `${lang === 'en' ? 'Step' : 'ধাপ'} ${currentStep} of 3`
                  : lang === 'en' ? 'Confirmed' : 'নিশ্চিত'}
              </span>
              <h3 className="text-base font-bold text-[#25345C]">
                {currentStep === 1
                  ? t.step1Heading
                  : currentStep === 2
                  ? t.step2Heading
                  : currentStep === 3
                  ? t.step3Heading
                  : t.step4Heading}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white border border-[#EDE4D8] flex items-center justify-center text-[#53616D] hover:bg-[#FAF5EC] cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#202B38] flex-1">
          {/* ========================================================================= */}
          {/* STEP 1: WHAT DO YOU HAVE? */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-1">
                <p className="text-xs text-[#53616D]">
                  {t.selectMaterialsPrompt}
                </p>
              </div>

              {/* Material Cards with Large Picture & Short Labels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {materialChoices.map((item) => {
                  const isSelected = selectedCats.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleMaterial(item.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex items-start gap-3.5 ${
                        isSelected
                          ? 'bg-[#FAF5EC] border-[#25345C] shadow-xs'
                          : 'bg-white border-[#EDE4D8] hover:border-[#25345C]/30'
                      }`}
                    >
                      <MaterialIllustration category={item.id} size="md" className="shrink-0 mt-0.5" />
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-[#202B38] truncate">
                            {lang === 'en' ? item.titleEn : item.titleBn}
                          </span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#12613F] text-white flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#53616D] leading-tight">
                          {lang === 'en' ? item.subtitleEn : item.subtitleBn}
                        </p>
                        <span className="text-[10px] font-mono font-bold text-[#12613F] block pt-1">
                          {lang === 'en' ? item.rateEn : item.rateBn}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* See Examples Link */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowExamplesModal(true)}
                  className="text-xs font-bold text-[#25345C] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5 text-[#12613F]" />
                  <span>{t.seeExamples} (Accepted & Excluded items)</span>
                </button>
              </div>

              {/* Approximate Quantity */}
              <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#EDE4D8] space-y-2.5">
                <span className="font-bold text-xs text-[#202B38] block">
                  {lang === 'en' ? 'Approximate quantity' : 'আনুমানিক পরিমাণ'}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'small', labelEn: 'Small (~2 kg)', labelBn: 'ছোট ব্যাগ (~২ কেজি)' },
                    { id: 'standard', labelEn: 'Standard (~6 kg)', labelBn: 'মাঝারি (~৬ কেজি)' },
                    { id: 'large', labelEn: 'Large (10+ kg)', labelBn: 'বড় বস্তা (১০+ কেজি)' },
                    { id: 'not_sure', labelEn: 'Not sure', labelBn: 'নিশ্চিত নই' }
                  ].map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setApproxQuantity(q.id as any)}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        approxQuantity === q.id
                          ? 'bg-[#25345C] text-white border-[#25345C] shadow-2xs'
                          : 'bg-white text-[#53616D] border-[#EDE4D8]'
                      }`}
                    >
                      {lang === 'en' ? q.labelEn : q.labelBn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Collapsible "Add details" */}
              <div className="border-t border-[#FAF5EC] pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDetails(!showAddDetails)}
                  className="text-xs font-bold text-[#53616D] hover:text-[#202B38] flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{t.addDetails} (Photos, exact weights & notes)</span>
                  {showAddDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showAddDetails && (
                  <div className="mt-3 p-4 bg-white rounded-2xl border border-[#EDE4D8] space-y-3 animate-fade-in">
                    <div>
                      <label className="font-semibold text-[11px] text-[#53616D] block mb-1">
                        {lang === 'en' ? 'Exact weight estimate (optional kg)' : 'সুনির্দিষ্ট আনুমানিক কেজি (ঐচ্ছিক)'}
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 5.5"
                        value={exactWeightEstimate}
                        onChange={(e) => setExactWeightEstimate(e.target.value)}
                        className="w-full bg-[#FAF5EC] border border-[#EDE4D8] rounded-xl p-2 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-[11px] text-[#53616D] block mb-1">
                        {lang === 'en' ? 'Special material note' : 'উপাদান সংক্রান্ত বিশেষ মন্তব্য'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Cardboard boxes are flattened and tied with string"
                        value={materialNotes}
                        onChange={(e) => setMaterialNotes(e.target.value)}
                        className="w-full bg-[#FAF5EC] border border-[#EDE4D8] rounded-xl p-2 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Single Primary Action */}
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full min-h-[48px] bg-[#25345C] hover:bg-[#1B2644] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span>{t.next}</span>
                <ArrowRight className="w-4 h-4 text-[#C9F1DC]" />
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: WHEN SHOULD WE COME? */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fade-in">
              {/* Saved Address with "Change" Button */}
              <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#EDE4D8] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#202B38]">
                    <MapPin className="w-3.5 h-3.5 text-[#12613F]" />
                    <span>{t.serviceAddress}</span>
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
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white border border-[#25345C] rounded-xl p-2.5 text-xs font-medium"
                  />
                ) : (
                  <p className="text-xs text-[#53616D] font-medium">{address}</p>
                )}
              </div>

              {/* Available Dates */}
              <div className="space-y-2">
                <span className="font-bold text-xs text-[#202B38] block">
                  {t.chooseDay}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'today', labelEn: 'Today', labelBn: 'আজ' },
                    { id: 'tomorrow', labelEn: 'Tomorrow', labelBn: 'আগামীকাল' },
                    { id: 'day_after', labelEn: 'Day After', labelBn: 'পরশু' }
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setScheduledDay(d.id as any)}
                      className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        scheduledDay === d.id
                          ? 'bg-[#25345C] text-white border-[#25345C] shadow-2xs'
                          : 'bg-white text-[#53616D] border-[#EDE4D8] hover:bg-[#FAF5EC]'
                      }`}
                    >
                      {lang === 'en' ? d.labelEn : d.labelBn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Windows */}
              <div className="space-y-2">
                <span className="font-bold text-xs text-[#202B38] block">
                  {t.assignedTimeWindow}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setScheduledWindow('morning')}
                    className={`p-3.5 rounded-2xl border text-left font-bold text-xs transition-all cursor-pointer ${
                      scheduledWindow === 'morning'
                        ? 'bg-[#FAF5EC] border-[#25345C] text-[#25345C]'
                        : 'bg-white border-[#EDE4D8] text-[#53616D]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{t.morningSlot}</span>
                      {scheduledWindow === 'morning' && <Check className="w-4 h-4 text-[#12613F]" />}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScheduledWindow('afternoon')}
                    className={`p-3.5 rounded-2xl border text-left font-bold text-xs transition-all cursor-pointer ${
                      scheduledWindow === 'afternoon'
                        ? 'bg-[#FAF5EC] border-[#25345C] text-[#25345C]'
                        : 'bg-white border-[#EDE4D8] text-[#53616D]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{t.afternoonSlot}</span>
                      {scheduledWindow === 'afternoon' && <Check className="w-4 h-4 text-[#12613F]" />}
                    </div>
                  </button>
                </div>
              </div>

              {/* Collapsible "Add a note" for gate/building access */}
              <div className="border-t border-[#FAF5EC] pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddNote(!showAddNote)}
                  className="text-xs font-bold text-[#53616D] hover:text-[#202B38] flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{t.addANote} (Gate or building instructions)</span>
                  {showAddNote ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showAddNote && (
                  <div className="mt-2 animate-fade-in">
                    <textarea
                      rows={2}
                      value={accessNote}
                      onChange={(e) => setAccessNote(e.target.value)}
                      placeholder={t.accessPlaceholder}
                      className="w-full bg-[#FAF5EC] border border-[#EDE4D8] rounded-xl p-2.5 text-xs text-[#202B38]"
                    />
                  </div>
                )}
              </div>

              {/* Arrange Regular Collection Link */}
              {onOpenRecurring && (
                <div className="p-3 bg-[#FAF5EC] rounded-2xl border border-[#EDE4D8] flex items-center justify-between text-xs">
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
                    {lang === 'en' ? 'Setup' : 'সেটআপ'}
                  </button>
                </div>
              )}

              {/* Single Primary Action */}
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="w-full min-h-[48px] bg-[#25345C] hover:bg-[#1B2644] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span>{t.reviewPickup}</span>
                <ArrowRight className="w-4 h-4 text-[#C9F1DC]" />
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: CHECK AND CONFIRM (ONLY ESSENTIALS) */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-5 bg-[#FAF9F5] rounded-3xl border border-[#EDE4D8] space-y-4 shadow-2xs">
                {/* 1. Address */}
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-[#53616D] uppercase tracking-wider block">
                    {t.addressLabel}
                  </span>
                  <p className="text-xs font-bold text-[#202B38]">{address}</p>
                </div>

                {/* 2. Materials */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[#53616D] uppercase tracking-wider block">
                    {lang === 'en' ? 'Selected Materials' : 'নির্বাচিত উপাদানসমূহ'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCats.map((cat) => (
                      <span
                        key={cat}
                        className="px-2.5 py-1 bg-white border border-[#EDE4D8] rounded-xl text-xs font-bold text-[#202B38]"
                      >
                        {cat.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 3. Date & Time Window */}
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-[#53616D] uppercase tracking-wider block">
                    {t.assignedTimeWindow}
                  </span>
                  <p className="text-sm font-black text-[#25345C]">
                    {scheduledDay === 'today'
                      ? 'Today'
                      : scheduledDay === 'tomorrow'
                      ? 'Tomorrow'
                      : 'Day After Tomorrow'}{' '}
                    · {scheduledWindow === 'morning' ? t.morningSlot : t.afternoonSlot}
                  </p>
                </div>

                {/* 4. Applicable Service Fee */}
                <div className="flex justify-between items-center pt-2 border-t border-[#EDE4D8]">
                  <span className="font-semibold text-xs text-[#53616D]">{t.serviceFee}:</span>
                  <span className="font-bold text-xs text-[#12613F]">{t.freeDoorstepCollection}</span>
                </div>

                {/* 5. Provisional Material Payment / Reward Basis */}
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#53616D]">{t.provisionalPaymentBasis}:</span>
                  <span className="font-mono font-bold text-[#25345C]">~50 pts / kg verified</span>
                </div>

                {/* 6. Short Reward Condition */}
                <div className="p-3 bg-white rounded-xl border border-[#EDE4D8] text-[11px] text-[#53616D]">
                  <span className="font-bold text-[#202B38] block">{t.rewardCondition}:</span>
                  <span>{t.conditionSummary}</span>
                </div>
              </div>

              {/* Single Primary Action: Confirm Pickup */}
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="w-full min-h-[50px] bg-[#25345C] hover:bg-[#1B2644] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>{lang === 'en' ? 'Confirming pickup...' : 'নিশ্চিত করা হচ্ছে...'}</span>
                ) : (
                  <>
                    <span>{t.confirm}</span>
                    <Check className="w-4 h-4 text-[#C9F1DC]" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: CONFIRMATION & APPOINTMENT TICKET */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-fade-in text-center">
              <div className="w-14 h-14 rounded-full bg-[#C9F1DC] text-[#12613F] flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-black text-[#202B38]">
                  {t.step4Heading}
                </h4>
                <p className="text-xs text-[#53616D] font-mono">
                  {lang === 'en' ? `Booking Reference: #${createdBookingId || 'CL-BK-9182'}` : `বুকিং কোড: #${createdBookingId || 'CL-BK-9182'}`}
                </p>
              </div>

              {/* Preparation Reminder Card */}
              <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#EDE4D8] text-left space-y-2 text-xs">
                <span className="font-bold text-[#202B38] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#12613F]" />
                  <span>{t.prepReminderActive}</span>
                </span>
                <p className="text-[#53616D] leading-relaxed">
                  {t.prepReminderDesc}
                </p>
              </div>

              {/* Single Primary Action */}
              <button
                type="button"
                onClick={onClose}
                className="w-full min-h-[48px] bg-[#25345C] hover:bg-[#1B2644] text-white rounded-2xl font-bold text-sm shadow-xs transition-colors cursor-pointer"
              >
                {lang === 'en' ? 'Done' : 'সম্পন্ন'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Examples Modal (Accepted vs Excluded items) */}
      {showExamplesModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-[#EDE4D8] p-6 shadow-2xl max-w-md w-full space-y-4 max-h-[85vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-[#EDE4D8] pb-3">
              <h4 className="text-base font-bold text-[#202B38]">{t.sortingGuide}</h4>
              <button
                type="button"
                onClick={() => setShowExamplesModal(false)}
                className="w-8 h-8 rounded-xl bg-[#FAF5EC] flex items-center justify-center text-[#53616D]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {materialChoices.map((item) => (
                <div key={item.id} className="p-3.5 bg-[#FAF9F5] rounded-2xl border border-[#EDE4D8] space-y-2">
                  <span className="font-bold text-xs text-[#202B38] block">
                    {lang === 'en' ? item.titleEn : item.titleBn}
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="space-y-1">
                      <span className="font-bold text-[#12613F] block">✓ {t.acceptedItems}:</span>
                      {(lang === 'en' ? item.acceptedList : item.acceptedListBn).map((acc, i) => (
                        <div key={i} className="text-[#53616D] leading-tight">• {acc}</div>
                      ))}
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-rose-700 block">✗ {t.rejectedItems}:</span>
                      {(lang === 'en' ? item.rejectedList : item.rejectedListBn).map((rej, i) => (
                        <div key={i} className="text-[#53616D] leading-tight">• {rej}</div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowExamplesModal(false)}
              className="w-full py-2.5 bg-[#25345C] text-white rounded-xl font-bold text-xs"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
