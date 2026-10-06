import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerType } from '../../types';
import {
  X,
  MapPin,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building,
  Home,
  Store,
  Phone,
  KeyRound,
  Check
} from 'lucide-react';

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

  // Steps: 1: Welcome (C01), 2: Contact verification (C02), 3: Account type (C03), 4: Location & Availability (C04)
  const [step, setStep] = useState<number>(1);

  // Form State
  const [phoneNumber, setPhoneNumber] = useState('+880 1712 998877');
  const [verificationCode, setVerificationCode] = useState('8492');
  const [accountType, setAccountType] = useState<CustomerType>('household');
  const [address, setAddress] = useState('House 48, Road 58, Gulshan-2, Dhaka');
  const [selectedZone, setSelectedZone] = useState('ZONE-GUL-02');
  const [accessInstructions, setAccessInstructions] = useState('Gate 3, security intercom buzz 2A.');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const currentZoneObj = serviceZones.find((z) => z.id === selectedZone);
  const isAvailable = currentZoneObj?.status === 'active_clean_lane';

  const handleNext = () => {
    if (step === 2) {
      setIsVerifying(true);
      setTimeout(() => {
        setIsVerifying(false);
        setStep(3);
      }, 500);
    } else if (step === 3) {
      if (accountType === 'apartment') setRole('customer_apartment');
      else if (accountType === 'business') setRole('customer_business');
      else setRole('customer_household');
      setStep(4);
    } else if (step === 4) {
      // Save location
      addSavedLocation({
        label: accountType === 'household' ? 'Home' : accountType === 'apartment' ? 'Building Bay' : 'Store Dock',
        address,
        zoneId: selectedZone,
        isDefault: true,
        accessInstructions,
        status: isAvailable ? 'available' : 'unavailable'
      });
      onClose();
      if (isAvailable) {
        onProceedToBooking();
      }
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              CL
            </span>
            <span className="font-bold text-slate-900 text-sm">
              Clean Lane {lang === 'en' ? 'Pilot Onboarding' : 'অনবোর্ডিং'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900"
            >
              {lang === 'en' ? 'বাংলা' : 'English'}
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Flow A · Step {step} of 4</span>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === step ? 'bg-emerald-600' : i < step ? 'bg-emerald-300' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600">
          {/* Step 1: C01 Welcome & Entry */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Waste collection that works. Rewards for responsible participation.
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Operated in bounded urban clean lanes where materials are tracked from doorstep collection to verified recovery mills.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block text-xs">How it works:</span>
                <ol className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-bold text-emerald-800">1.</span>
                    <span>Separate clean, dry eligible materials (PET, Cardboard, HDPE).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-bold text-emerald-800">2.</span>
                    <span>Book a scheduled doorstep collection or drop off at an approved station.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-bold text-emerald-800">3.</span>
                    <span>Track certified scale quantities and earn circular rewards.</span>
                  </li>
                </ol>
              </div>

              <div className="text-[11px] text-slate-400">
                Pilot restricted to designated active service zones in Dhaka North.
              </div>
            </div>
          )}

          {/* Step 2: C02 Contact Verification */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900">Verify your mobile contact</h2>
                <p className="text-xs text-slate-500">
                  Required exclusively for physical service coordination and scale transaction receipts.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Mobile Number (Bangladeshi Telco)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    SMS Verification Code (Simulated OTP)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-900 font-mono tracking-widest font-bold"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Use code 8492 or tap verify to proceed.
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600">
                PRD C02: Explaining why contact is needed prevents privacy friction. No spam or commercial telemarketing.
              </div>
            </div>
          )}

          {/* Step 3: C03 Account-Type Selection */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900">How will you use the service?</h2>
                <p className="text-xs text-slate-500">
                  Select your primary clean lane participation model.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    id: 'household',
                    title: 'Individual Household',
                    desc: 'For collections from your home or personal apartment unit.',
                    icon: Home
                  },
                  {
                    id: 'apartment',
                    title: 'Apartment / Residential Complex',
                    desc: 'For a shared building committee or central basement bay service.',
                    icon: Building
                  },
                  {
                    id: 'business',
                    title: 'Business / Commercial Site',
                    desc: 'For cafés, corporate offices, institutions, or retail sites.',
                    icon: Store
                  }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = accountType === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setAccountType(item.id as CustomerType)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`} />
                          <span className="font-bold text-slate-900">{item.title}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 pl-7">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: C04 Add Location & Check Availability */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900">Check service availability</h2>
                <p className="text-xs text-slate-500">
                  Collections are only offered where a verified route and recovery partner exist.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Select Pilot Zone
                  </label>
                  <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-900"
                  >
                    {serviceZones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} ({z.status === 'active_clean_lane' ? 'Active Lane' : 'Expansion Waitlist'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Street Address & Floor / Building
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Access / Security Instructions
                  </label>
                  <input
                    type="text"
                    value={accessInstructions}
                    onChange={(e) => setAccessInstructions(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
                  />
                </div>
              </div>

              {/* Availability Outcome (PRD C04) */}
              <div
                className={`p-3.5 rounded-xl border ${
                  isAvailable
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  {isAvailable ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-700" />
                      <span>Available: Clean Lane Active</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-700" />
                      <span>Limited / Expansion Phase</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed">
                  {isAvailable
                    ? 'Doorstep recovery pickups and drop-off stations are fully operational in this sector.'
                    : 'This zone is currently in waitlist phase. You can register your interest or use approved drop-off points.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-medium"
            >
              Back
            </button>
          ) : (
            <span className="text-[11px] text-slate-400">Step 1 of 4</span>
          )}

          <button
            onClick={handleNext}
            disabled={isVerifying}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span>
              {step === 1
                ? 'Check availability'
                : step === 2
                ? isVerifying
                  ? 'Verifying...'
                  : 'Verify code'
                : step === 3
                ? 'Continue'
                : isAvailable
                ? 'Save & Book First Collection'
                : 'Save Location'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
