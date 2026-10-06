import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerType } from '../../types';
import {
  X,
  MapPin,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Building,
  Home,
  Store,
  Phone,
  KeyRound,
  Check,
  Search,
  Volume2,
  VolumeX,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { speakInstruction, stopSpeaking } from '../../utils/statusDictionary';

interface OnboardingFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToBooking: () => void;
}

export const OnboardingFlowModal: React.FC<OnboardingFlowModalProps> = ({
  isOpen,
  onClose,
  onProceedToBooking
}) => {
  const { lang, setLang, serviceZones, addSavedLocation, setRole } = useApp();

  // Screen Stages:
  // 1: C01 Welcome & Availability check
  // 2: C02 Sign-in & Contact verification
  // 3: C03 Account type selection
  // 4: C04 Add location & Service confirmation
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // C01 State
  const [areaInput, setAreaInput] = useState('Gulshan-2, Dhaka');
  const [availabilityResult, setAvailabilityResult] = useState<
    'idle' | 'available' | 'limited' | 'unavailable'
  >('idle');

  // C02 State
  const [phoneNumber, setPhoneNumber] = useState('+880 1712 998877');
  const [maskedPhone, setMaskedPhone] = useState('+880 17•• •••877');
  const [otpCode, setOtpCode] = useState('8492');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // C03 State
  const [accountType, setAccountType] = useState<CustomerType>('household');
  const [isJoiningExistingBuilding, setIsJoiningExistingBuilding] = useState(false);
  const [buildingCode, setBuildingCode] = useState('APT-BANANI-402');

  // C04 State
  const [streetAddress, setStreetAddress] = useState('House 48, Road 58, Gulshan-2, Dhaka');
  const [landmark, setLandmark] = useState('Near Gulshan Central Park Gate 3');
  const [accessDetail, setAccessDetail] = useState('Ground reception desk or gate intercom 2A');
  const [selectedZone, setSelectedZone] = useState('ZONE-GUL-02');

  // Audio Guidance
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!isOpen) return null;

  const currentZoneObj = serviceZones.find((z) => z.id === selectedZone);
  const isAvailable = currentZoneObj?.status === 'active_clean_lane';

  const handleToggleVoice = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    let text = '';
    if (step === 1) {
      text =
        lang === 'bn'
          ? 'স্বাগতম ক্লিন লেনে। আপনার এলাকা বা ঠিকানা লিখে চেক করুন ক্লিন লেনের বর্জ্য সংগ্রহ সেবা চালু আছে কিনা।'
          : 'Welcome to Clean Lane. Check if our waste pickup and rewards service is available in your neighborhood.';
    } else if (step === 2) {
      text =
        lang === 'bn'
          ? 'মোবাইল নম্বর লিখুন। আপনার সংগ্রহের হিসাব এবং রসিদ পাঠানোর জন্য নম্বরটি ব্যবহৃত হবে।'
          : 'Enter your mobile number. We need your contact solely to coordinate collection and send scale receipts.';
    } else if (step === 3) {
      text =
        lang === 'bn'
          ? 'আপনার পছন্দের মডেল বেছে নিন: ব্যক্তিগত বাড়ি, অ্যাপার্টমেন্ট বিল্ডিং, নাকি ব্যবসা প্রতিষ্ঠান।'
          : 'Choose your account type: my home, my apartment building, or my business.';
    } else if (step === 4) {
      text =
        lang === 'bn'
          ? 'ঠিকানা নিশ্চিত করুন এবং আপনার লেনের সেবাগুলো যাচাই করুন।'
          : 'Confirm your service address and check active clean lane services.';
    }

    setIsSpeaking(true);
    speakInstruction(text, lang);
    setTimeout(() => setIsSpeaking(false), 7000);
  };

  // C01 Check Area Action
  const handleCheckArea = () => {
    const query = areaInput.toLowerCase();
    if (query.includes('gulshan') || query.includes('banani')) {
      setAvailabilityResult('available');
      setSelectedZone(query.includes('banani') ? 'ZONE-BAN-11' : 'ZONE-GUL-02');
    } else if (query.includes('dhanmondi')) {
      setAvailabilityResult('limited');
      setSelectedZone('ZONE-DHAN-07');
    } else {
      setAvailabilityResult('unavailable');
    }
  };

  // C02 Verify Code Action
  const handleVerifyOtp = () => {
    if (otpCode !== '8492' && otpCode.length < 4) {
      setOtpError(lang === 'en' ? 'Incorrect verification code. Use 8492 or tap Resend.' : 'ভুল কোড। ৮৪৯২ লিখুন অথবা পুনরায় পাঠান চাপুন।');
      return;
    }
    setOtpError(null);
    setStep(3); // Advance to Account Type
  };

  const handleResendOtp = () => {
    setResendCooldown(30);
    setOtpCode('8492');
    setOtpError(null);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // C04 Final Save Location & Advance
  const handleSaveLocation = () => {
    addSavedLocation({
      label: accountType === 'household' ? 'Home' : accountType === 'apartment' ? 'Building Bay' : 'Store Dock',
      address: streetAddress,
      zoneId: selectedZone,
      isDefault: true,
      accessInstructions: `${landmark} · ${accessDetail}`,
      status: availabilityResult === 'available' ? 'available' : availabilityResult === 'limited' ? 'limited' : 'unavailable'
    });

    onClose();
    if (availabilityResult === 'available' || availabilityResult === 'limited') {
      onProceedToBooking();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[94vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              CL
            </span>
            <div>
              <span className="font-bold text-slate-900 text-sm block">
                {step === 1 && (lang === 'en' ? 'Check Area Availability' : 'এলাকা যাচাই করুন')}
                {step === 2 && (lang === 'en' ? 'Contact Verification' : 'মোবাইল নম্বর যাচাই')}
                {step === 3 && (lang === 'en' ? 'Account Type' : 'অ্যাকাউন্টের ধরন')}
                {step === 4 && (lang === 'en' ? 'Service Address' : 'সেবার ঠিকানা')}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                C0{step} · {lang === 'en' ? `Step ${step} of 4` : `ধাপ ${step} / ৪`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`min-h-[40px] px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                isSpeaking ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-700" />}
            </button>

            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 px-2 py-1 rounded-lg bg-slate-100"
            >
              {lang === 'en' ? 'বাংলা' : 'EN'}
            </button>

            <button
              onClick={onClose}
              type="button"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BODY CONTENT */}
        {/* ========================================================================= */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-700 flex-1">
          {/* ===================================================================== */}
          {/* STEP 1: C01 WELCOME & AVAILABILITY CHECK */}
          {/* ===================================================================== */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {lang === 'en'
                    ? 'Arrange waste pickup and earn rewards for eligible materials.'
                    : 'পরিমিত বর্জ্য সংগ্রহ বুক করুন এবং যোগ্য উপকরণের জন্য পুরস্কার জিতুন।'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'en'
                    ? 'Check if your neighborhood has an active Clean Lane pilot corridor without creating an account.'
                    : 'অ্যাকাউন্ট তৈরি না করেই আপনার পাড়ায় সেবা চালু আছে কিনা যাচাই করুন।'}
                </p>
              </div>

              {/* Area entry with familiar location illustration (Low-literacy treatment) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  {lang === 'en' ? 'Enter your area or street landmark' : 'আপনার এলাকা বা রাস্তার নাম লিখুন'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-emerald-700" />
                  <input
                    type="text"
                    value={areaInput}
                    onChange={(e) => {
                      setAreaInput(e.target.value);
                      setAvailabilityResult('idle');
                    }}
                    placeholder={lang === 'en' ? 'e.g. Gulshan-2, Banani Road 11, Dhanmondi' : 'যেমন: গুলশান-২, বনানী'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-500">
                  <span>{lang === 'en' ? 'Quick examples:' : 'উদাহরণ:'}</span>
                  {['Gulshan-2', 'Banani Road 11', 'Dhanmondi', 'Uttara'].map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => {
                        setAreaInput(ex);
                        setAvailabilityResult('idle');
                      }}
                      className="text-emerald-800 underline hover:text-emerald-950 cursor-pointer"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              {/* Check result display */}
              {availabilityResult === 'available' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1.5 animate-fade-in">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      {lang === 'en' ? 'Service Available in your clean lane!' : 'আপনার এলাকায় সেবা চালু আছে!'}
                    </span>
                  </div>
                  <p className="text-emerald-800 text-[11px] leading-relaxed">
                    {lang === 'en'
                      ? 'Doorstep recovery and local certified aggregation are fully operational in your corridor.'
                      : 'আপনার লেনে বাসা থেকে সংগ্রহ এবং পরিমাপ কেন্দ্র সম্পূর্ণ সক্রিয়।'}
                  </p>
                </div>
              )}

              {availabilityResult === 'limited' && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-1.5 animate-fade-in">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      {lang === 'en' ? 'Some services available' : 'কিছু সেবা চালু আছে'}
                    </span>
                  </div>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    {lang === 'en'
                      ? 'Drop-off center is active nearby. Doorstep collections operate on selective weekly windows.'
                      : 'নিকটস্থ ড্রপ-অফ পয়েন্ট চালু আছে। বাসা থেকে সংগ্রহ নির্দিষ্ট দিনে হয়।'}
                  </p>
                </div>
              )}

              {availabilityResult === 'unavailable' && (
                <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl text-xs space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>
                      {lang === 'en' ? 'Not currently in active pilot zone' : 'বর্তমানে সেবা চালু নেই'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    {lang === 'en'
                      ? 'Clean Lane operates only in verified pilot areas. You can register interest or visit an approved regional drop-off point.'
                      : 'অনুমোদিত ড্রপ-অফ পয়েন্টে জমা দিতে পারেন অথবা আগ্রহ নিবন্ধন করতে পারেন।'}
                  </p>
                </div>
              )}

              {/* Assisted Phone Hotline */}
              <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100">
                <span>{lang === 'en' ? 'Need assisted phone booking?' : 'ফোনে বুকিং করতে চান?'}</span>
                <a href="tel:09612253265" className="font-bold text-emerald-800 hover:underline">
                  09612-253265
                </a>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* STEP 2: C02 SIGN-IN & CONTACT VERIFICATION */}
          {/* ===================================================================== */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {lang === 'en' ? 'Verify your contact number' : 'মোবাইল নম্বর যাচাই করুন'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'en'
                    ? 'We need your phone number exclusively for pickup coordination and SMS scale receipts. No marketing spam.'
                    : 'কেবলমাত্র সংগ্রহের সমন্বয় ও ওজনের রসিদ পাঠানোর জন্য নম্বর প্রয়োজন।'}
                </p>
              </div>

              {/* Masked Contact Display */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {lang === 'en' ? 'Mobile Number' : 'মোবাইল নম্বর'}
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 text-sm">{maskedPhone}</span>
                  <span className="text-[11px] text-emerald-800 font-semibold">{lang === 'en' ? 'SMS sent' : 'এসএমএস পাঠানো হয়েছে'}</span>
                </div>
              </div>

              {/* OTP Input with Paste / Autofill support */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  {lang === 'en' ? 'Enter 4-digit verification code' : '৪-সংখ্যার ভেরিফিকেশন কোড লিখুন'}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    maxLength={4}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-10 pr-4 py-3 text-lg font-mono font-bold tracking-widest text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    {lang === 'en' ? 'Demo test code: 8492' : 'ডেমো কোড: ৮৪৯২'}
                  </span>
                  <button
                    type="button"
                    disabled={resendCooldown > 0}
                    onClick={handleResendOtp}
                    className="text-emerald-800 hover:text-emerald-950 font-semibold cursor-pointer disabled:text-slate-400"
                  >
                    {resendCooldown > 0
                      ? `${lang === 'en' ? 'Resend in' : 'পুনরায় পাঠান'} ${resendCooldown}s`
                      : lang === 'en' ? 'Resend code' : 'পুনরায় পাঠান'}
                  </button>
                </div>
              </div>

              {otpError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* STEP 3: C03 ACCOUNT TYPE SELECTION */}
          {/* ===================================================================== */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {lang === 'en' ? 'How will you use Clean Lane?' : 'আপনি কোন উদ্দেশ্যে ব্যবহার করবেন?'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'en'
                    ? 'Select your household or organisation type.'
                    : 'আপনার জন্য প্রযোজ্য ধরনটি বেছে নিন।'}
                </p>
              </div>

              {/* 3 Large Choice Cards (C03 specification) */}
              <div className="space-y-3">
                {[
                  {
                    id: 'household' as CustomerType,
                    titleEn: 'My home',
                    titleBn: 'আমার বাসা / বাড়ি',
                    descEn: 'For doorstep collections from your house or unit',
                    descBn: 'বাসা থেকে ব্যক্তিগত বর্জ্য সংগ্রহের জন্য',
                    exampleEn: 'e.g. 1–2 bags of bottles, paper boxes',
                    icon: Home
                  },
                  {
                    id: 'apartment' as CustomerType,
                    titleEn: 'My apartment building',
                    titleBn: 'অ্যাপার্টমেন্ট বা আবাসিক ভবন',
                    descEn: 'For building committee shared basement bin service',
                    descBn: 'ভবনের সার্বিক বর্জ্য ব্যবস্থাপনার জন্য',
                    exampleEn: 'e.g. Multi-family segregated basement cage',
                    icon: Building
                  },
                  {
                    id: 'business' as CustomerType,
                    titleEn: 'My business or organisation',
                    titleBn: 'ব্যবসা প্রতিষ্ঠান বা অফিস',
                    descEn: 'For cafés, retail stores, offices, and commercial sites',
                    descBn: 'দোকান, ক্যাফে বা অফিস প্রাঙ্গণের জন্য',
                    exampleEn: 'e.g. Scheduled bulk batches with company invoice',
                    icon: Store
                  }
                ].map((card) => {
                  const Icon = card.icon;
                  const isSelected = accountType === card.id;

                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setAccountType(card.id)}
                      className={`w-full p-4 rounded-2xl border text-left cursor-pointer min-h-[56px] transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-slate-900 text-sm block">
                          {lang === 'en' ? card.titleEn : card.titleBn}
                        </span>
                        <span className="text-xs text-slate-600 block mt-0.5">
                          {lang === 'en' ? card.descEn : card.descBn}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-1">
                          {card.exampleEn}
                        </span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                          isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Secondary Path: Join Existing Building (C03) */}
              <div className="pt-2 border-t border-slate-100">
                {!isJoiningExistingBuilding ? (
                  <button
                    type="button"
                    onClick={() => setIsJoiningExistingBuilding(true)}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 cursor-pointer"
                  >
                    + {lang === 'en' ? 'Join an existing apartment complex code' : 'বিদ্যমান আবাসিক কমপ্লেক্স কোড যুক্ত করুন'}
                  </button>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      {lang === 'en' ? 'Building Invitation Code' : 'বিল্ডিং ইনভাইটেশন কোড'}
                    </label>
                    <input
                      type="text"
                      value={buildingCode}
                      onChange={(e) => setBuildingCode(e.target.value)}
                      placeholder="e.g. APT-BANANI-402"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                    />
                    <span className="text-[11px] text-slate-500 block">
                      {lang === 'en'
                        ? 'Resident points will be credited to building management circular ledger.'
                        : 'পয়েন্টগুলো ভবনের যৌথ অ্যাকাউন্টে জমা হবে।'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* STEP 4: C04 ADD LOCATION */}
          {/* ===================================================================== */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {lang === 'en' ? 'Add service location' : 'সেবার ঠিকানা যুক্ত করুন'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'en'
                    ? 'Collector needs exact street landmarks for navigation.'
                    : 'কালেক্টরের সহজে পৌঁছানোর জন্য ঠিকানা নিশ্চিত করুন।'}
                </p>
              </div>

              {/* Address Fields */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'en' ? 'Street Address' : 'রাস্তা ও বাড়ির ঠিকানা'}
                  </label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'en' ? 'Landmark / Sector' : 'নিকটবর্তী ল্যান্ডমার্ক'}
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'en' ? 'Building Access / Intercom' : 'ভবনে প্রবেশের নিয়ম'}
                  </label>
                  <input
                    type="text"
                    value={accessDetail}
                    onChange={(e) => setAccessDetail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Verified Lane Status Review */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-950 block">
                    {selectedZone} · Gulshan North
                  </span>
                  <span className="text-[11px] text-emerald-800">
                    {lang === 'en' ? 'Approved Clean Lane Pilot Corridor' : 'অনুমোদিত পাইলট লেন'}
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-white text-emerald-800 rounded-lg font-mono font-bold text-[11px] border border-emerald-200">
                  {lang === 'en' ? 'Active' : 'সক্রিয়'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM ACTION BAR (Touch target >= 48px, verb-led labels) */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex items-center justify-between gap-3 shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev - 1) as any)}
              className="min-h-[48px] px-4 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'en' ? 'Back' : 'পেছনে'}</span>
            </button>
          ) : (
            <div />
          )}

          {step === 1 && (
            <div className="flex items-center gap-2">
              {availabilityResult === 'idle' ? (
                <button
                  type="button"
                  onClick={handleCheckArea}
                  className="min-h-[48px] px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Search className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'en' ? 'Check my area' : 'এলাকা যাচাই করুন'}</span>
                </button>
              ) : availabilityResult === 'available' || availabilityResult === 'limited' ? (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="min-h-[48px] px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>{lang === 'en' ? 'Continue to Sign in' : 'এগিয়ে যান'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCheckArea}
                  className="min-h-[48px] px-5 py-2.5 bg-slate-200 text-slate-700 rounded-2xl text-xs font-semibold cursor-pointer"
                >
                  {lang === 'en' ? 'Try another area' : 'অন্য এলাকা লিখুন'}
                </button>
              )}
            </div>
          )}

          {step === 2 && (
            <button
              type="button"
              onClick={handleVerifyOtp}
              className="min-h-[48px] px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>{lang === 'en' ? 'Continue' : 'এগিয়ে যান'}</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={() => {
                if (accountType === 'apartment') setRole('customer_apartment');
                else if (accountType === 'business') setRole('customer_business');
                else setRole('customer_household');
                setStep(4);
              }}
              className="min-h-[48px] px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>{lang === 'en' ? 'Continue' : 'এগিয়ে যান'}</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          )}

          {step === 4 && (
            <button
              type="button"
              onClick={handleSaveLocation}
              className="min-h-[48px] px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>{lang === 'en' ? 'Check services here' : 'সেবা নিশ্চিত করুন'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
