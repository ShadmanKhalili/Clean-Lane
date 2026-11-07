import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerType } from '../../types';
import { Modal } from '../common/Modal';
import {
  MapPin,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Building,
  Home,
  Store,
  KeyRound,
  Check,
  Search,
  Volume2,
  VolumeX
} from 'lucide-react';
import { speakInstruction, stopSpeaking } from '../../utils/statusDictionary';

interface OnboardingFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToBooking: () => void;
}

/** Demo-only verification code (there is no SMS gateway in this prototype). */
const DEMO_OTP = '8492';
const DEMO_OTP_BN = '৮৪৯২';

/** Area keywords -> service zone ids defined in the shared seed data. */
const AREA_ZONES: { keyword: string; zoneId: string }[] = [
  { keyword: 'gulshan', zoneId: 'ZONE-GUL-02' },
  { keyword: 'banani', zoneId: 'ZONE-BAN-11' },
  { keyword: 'dhanmondi', zoneId: 'ZONE-DHA-9A' },
  { keyword: 'baridhara', zoneId: 'ZONE-BAR-EXP' }
];

type Step = 1 | 2 | 3 | 4 | 5;

const maskPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7) return phone;
  return `+${digits.slice(0, 3)} ${digits.slice(3, 5)}•• •••${digits.slice(-3)}`;
};

const OnboardingFlow: React.FC<{
  step: Step;
  setStep: (s: Step) => void;
  onClose: () => void;
  onProceed: () => void;
}> = ({ step, setStep, onClose, onProceed }) => {
  const { lang, setLang, serviceZones, savedLocations, addSavedLocation, setSelectedLocationId, setRole } = useApp();

  // C01 State
  const [areaInput, setAreaInput] = useState('Gulshan-2, Dhaka');
  const [availabilityResult, setAvailabilityResult] = useState<'idle' | 'available' | 'limited' | 'unavailable'>('idle');

  // C02 State
  const [phoneNumber, setPhoneNumber] = useState('+880 1712 998877');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const maskedPhone = maskPhone(phoneNumber);

  // C03 State
  const [accountType, setAccountType] = useState<CustomerType>('household');
  const [isJoiningExistingBuilding, setIsJoiningExistingBuilding] = useState(false);
  const [buildingCode, setBuildingCode] = useState('');

  // C04 State
  const [streetAddress, setStreetAddress] = useState('House 48, Road 58, Gulshan-2, Dhaka');
  const [landmark, setLandmark] = useState('Near Gulshan Central Park Gate 3');
  const [accessDetail, setAccessDetail] = useState('Ground reception desk or gate intercom 2A');
  const [selectedZone, setSelectedZone] = useState('ZONE-GUL-02');

  // Audio Guidance
  const [isSpeaking, setIsSpeaking] = useState(false);
  useEffect(() => () => stopSpeaking(), []);

  // Select the newly saved address once the context has stored it.
  const knownIdsRef = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!knownIdsRef.current) return;
    const created = savedLocations.find((l) => !knownIdsRef.current!.has(l.id));
    if (created) {
      setSelectedLocationId(created.id);
      knownIdsRef.current = null;
    }
  }, [savedLocations, setSelectedLocationId]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [resendCooldown]);

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
          ? 'আপনার পছন্দের মডেল বেছে নিন: ব্যক্তিগত বাড়ি, অ্যাপার্টমেন্ট বিল্ডিং, নাকি ব্যবসা প্রতিষ্ঠান।'
          : 'Choose your account type: my home, my apartment building, or my business.';
    } else {
      text =
        lang === 'bn'
          ? 'ঠিকানা নিশ্চিত করুন এবং আপনার লেনের সেবাগুলো যাচাই করুন।'
          : 'Confirm your service address and check active clean lane services.';
    }

    setIsSpeaking(true);
    speakInstruction(text, lang, () => setIsSpeaking(false));
  };

  // C01 Check Area Action: resolve the area to a real service zone and use its status.
  const handleCheckArea = () => {
    const query = areaInput.toLowerCase();
    const match = AREA_ZONES.find((a) => query.includes(a.keyword));
    const zone = match ? serviceZones.find((z) => z.id === match.zoneId) : undefined;
    if (!zone || zone.status === 'inactive') {
      setAvailabilityResult('unavailable');
      return;
    }
    setSelectedZone(zone.id);
    setAvailabilityResult(zone.status === 'active_clean_lane' ? 'available' : 'limited');
  };

  // C02 Verify Code Action
  const handleVerifyOtp = () => {
    if (otpCode !== DEMO_OTP) {
      setOtpError(
        lang === 'en'
          ? `Incorrect verification code. Enter the demo code ${DEMO_OTP} or tap Resend.`
          : `ভুল কোড। ডেমো কোড ${DEMO_OTP_BN} লিখুন অথবা পুনরায় পাঠান চাপুন।`
      );
      return;
    }
    setOtpError(null);
    setStep(3);
  };

  const handleResendOtp = () => {
    setResendCooldown(30);
    setOtpCode('');
    setOtpError(null);
  };

  // C04 Final Save Location & Advance
  const handleSaveLocation = () => {
    knownIdsRef.current = new Set(savedLocations.map((l) => l.id));
    const zoneStatus = currentZoneObj?.status;
    addSavedLocation({
      label: accountType === 'household' ? 'Home' : accountType === 'apartment' ? 'Building Bay' : 'Store Dock',
      address: streetAddress,
      zoneId: selectedZone,
      // The context cannot clear other defaults, so only claim default when none exists.
      isDefault: !savedLocations.some((l) => l.isDefault),
      accessInstructions: `${landmark} · ${accessDetail}`,
      status: zoneStatus === 'active_clean_lane' ? 'available' : zoneStatus === 'pilot_expansion' ? 'limited' : 'unavailable'
    });

    if (accountType === 'apartment') setRole('customer_apartment');
    else if (accountType === 'business') setRole('customer_business');
    else setRole('customer_household');
    setStep(5);
  };

  return (
    <div className="space-y-5 text-slate-700">
      <div className="flex items-center justify-end gap-2 -mt-1">
        <button
          type="button"
          onClick={handleToggleVoice}
          aria-pressed={isSpeaking}
          aria-label={lang === 'en' ? 'Read this step aloud' : 'এই ধাপটি পড়ে শোনান'}
          className={`min-h-[40px] px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer ${
            isSpeaking ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {isSpeaking ? <VolumeX className="w-3.5 h-3.5" aria-hidden="true" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />}
        </button>
        <button
          type="button"
          onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
          className="text-xs font-bold text-slate-700 hover:text-slate-900 px-2 py-2 rounded-lg bg-slate-100 cursor-pointer"
          aria-label={lang === 'en' ? 'Switch to Bangla' : 'Switch to English'}
        >
          {lang === 'en' ? 'বাংলা' : 'EN'}
        </button>
      </div>

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
          <label htmlFor="ob-area" className="text-xs font-bold text-slate-800 block">
            {lang === 'en' ? 'Enter your area or street landmark' : 'আপনার এলাকা বা রাস্তার নাম লিখুন'}
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-emerald-700" aria-hidden="true" />
            <input
              id="ob-area"
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
            {['Gulshan-2', 'Banani Road 11', 'Dhanmondi', 'Baridhara', 'Uttara'].map((ex) => (
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

        <div className="space-y-1.5">
          <label htmlFor="ob-phone" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            {lang === 'en' ? 'Mobile Number' : 'মোবাইল নম্বর'}
          </label>
          <input
            id="ob-phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
          />
          <p className="text-[11px] text-slate-500">
            {lang === 'en' ? 'Code sent (demo) to ' : 'কোড পাঠানো হয়েছে (ডেমো): '}
            <span className="font-mono font-semibold text-slate-700">{maskedPhone}</span>
          </p>
        </div>

        {/* OTP Input with Paste / Autofill support */}
        <div className="space-y-2">
          <label htmlFor="ob-otp" className="text-xs font-bold text-slate-800 block">
            {lang === 'en' ? 'Enter 4-digit verification code' : '৪-সংখ্যার ভেরিফিকেশন কোড লিখুন'}
          </label>
          <div className="relative">
            <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              id="ob-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={4}
              value={otpCode}
              onChange={(e) => {
                setOtpCode(e.target.value.replace(/\D/g, ''));
                setOtpError(null);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-10 pr-4 py-3 text-lg font-mono font-bold tracking-widest text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">
              {lang === 'en' ? `Demo code: ${DEMO_OTP}` : `ডেমো কোড: ${DEMO_OTP_BN}`}
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
          <div role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
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
                aria-pressed={isSelected}
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
              <label htmlFor="ob-building" className="text-xs font-bold text-slate-700 block">
                {lang === 'en' ? 'Building Invitation Code' : 'বিল্ডিং ইনভাইটেশন কোড'}
              </label>
              <input
                id="ob-building"
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
            <label htmlFor="ob-street" className="font-bold text-slate-700 block mb-1">
              {lang === 'en' ? 'Street Address' : 'রাস্তা ও বাড়ির ঠিকানা'}
            </label>
            <input
              id="ob-street"
              type="text"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="ob-landmark" className="font-bold text-slate-700 block mb-1">
              {lang === 'en' ? 'Landmark / Sector' : 'নিকটবর্তী ল্যান্ডমার্ক'}
            </label>
            <input
              id="ob-landmark"
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="ob-access" className="font-bold text-slate-700 block mb-1">
              {lang === 'en' ? 'Building Access / Intercom' : 'ভবনে প্রবেশের নিয়ম'}
            </label>
            <input
              id="ob-access"
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
              {currentZoneObj ? currentZoneObj.name : selectedZone}
            </span>
            <span className="text-[11px] text-emerald-800">
              {isAvailable
                ? lang === 'en' ? 'Approved Clean Lane pilot corridor' : 'অনুমোদিত পাইলট লেন'
                : lang === 'en' ? 'Pilot expansion area: drop-off only for now' : 'সম্প্রসারণ এলাকা: আপাতত শুধু ড্রপ-অফ'}
            </span>
          </div>
          <span className="px-2.5 py-1 bg-white text-emerald-800 rounded-lg font-mono font-bold text-[11px] border border-emerald-200">
            {isAvailable ? (lang === 'en' ? 'Active' : 'সক্রিয়') : lang === 'en' ? 'Waitlist' : 'অপেক্ষমাণ'}
          </span>
        </div>
      </div>
    )}

    {/* ===================================================================== */}
    {/* STEP 5: SAVED */}
    {/* ===================================================================== */}
    {step === 5 && (
      <div className="space-y-4 text-center py-2">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
          <CheckCircle className="w-6 h-6" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">{lang === 'en' ? 'Address saved' : 'ঠিকানা সংরক্ষিত হয়েছে'}</h3>
        <p className="text-xs text-slate-600">
          {isAvailable
            ? lang === 'en'
              ? 'It is now your selected pickup address.'
              : 'এটি এখন আপনার নির্বাচিত পিকআপ ঠিকানা।'
            : lang === 'en'
            ? 'Doorstep pickup is not open here yet, but you can use a drop-off point nearby.'
            : 'এখানে এখনো ডোরস্টেপ পিকআপ চালু হয়নি, তবে কাছের ড্রপ-অফ পয়েন্ট ব্যবহার করতে পারবেন।'}
        </p>
      </div>
    )}

  <div className="sticky -bottom-4 -mx-5 -mb-4 mt-5 px-5 py-3 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
    {step > 1 && step < 5 ? (
      <button
        type="button"
        onClick={() => setStep((step - 1) as 1 | 2 | 3 | 4)}
        className="min-h-[48px] px-4 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
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
        onClick={() => setStep(4)}
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
        <span>{lang === 'en' ? 'Save address' : 'ঠিকানা সংরক্ষণ করুন'}</span>
      </button>
    )}

    {step === 5 && (
      <button
        type="button"
        onClick={isAvailable || availabilityResult === 'limited' ? onProceed : onClose}
        className="ml-auto min-h-[48px] px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-xs"
      >
        <span>{isAvailable || availabilityResult === 'limited' ? (lang === 'en' ? 'Go to home' : 'হোমে যান') : lang === 'en' ? 'Done' : 'সম্পন্ন'}</span>
      </button>
    )}
  </div>
    </div>
  );
};

export const OnboardingFlowModal: React.FC<OnboardingFlowModalProps> = ({ isOpen, onClose, onProceedToBooking }) => {
  const { lang } = useApp();
  const [step, setStep] = useState<Step>(1);

  const handleClose = () => {
    setStep(1);
    onClose();
  };
  const handleProceed = () => {
    setStep(1);
    onClose();
    onProceedToBooking();
  };

  const titles: Record<Step, { en: string; bn: string }> = {
    1: { en: 'Check Area Availability', bn: 'এলাকা যাচাই করুন' },
    2: { en: 'Contact Verification', bn: 'মোবাইল নম্বর যাচাই' },
    3: { en: 'Account Type', bn: 'অ্যাকাউন্টের ধরন' },
    4: { en: 'Service Address', bn: 'সেবার ঠিকানা' },
    5: { en: 'All set', bn: 'সম্পন্ন' }
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      dismissible={step === 1 || step === 5}
      title={
        <span className="block">
          <span className="text-[11px] font-mono text-slate-400 block font-normal">
            {step < 5 ? (lang === 'en' ? `Step ${step} of 4` : `ধাপ ${step} / ৪`) : lang === 'en' ? 'Done' : 'শেষ'}
          </span>
          {titles[step][lang]}
        </span>
      }
      closeLabel={lang === 'en' ? 'Close' : 'বন্ধ করুন'}
    >
      <OnboardingFlow step={step} setStep={setStep} onClose={handleClose} onProceed={handleProceed} />
    </Modal>
  );
};
