import React from 'react';
import { Package, Truck, Scale, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface BrandJourneyDeviceProps {
  currentStep?: 1 | 2 | 3;
  className?: string;
  size?: 'compact' | 'standard';
}

/**
 * Clean Lane Signature Motif Device
 * Connects three recognisable moments: Materials ready -> Collected -> Checked
 * Aligned with Visual Design Brief Section 3
 */
export const BrandJourneyDevice: React.FC<BrandJourneyDeviceProps> = ({
  currentStep = 1,
  className = '',
  size = 'standard'
}) => {
  const { lang } = useApp();

  const steps = [
    {
      id: 1,
      labelEn: 'Materials ready',
      labelBn: 'উপাদান প্রস্তুত',
      subEn: 'Segregated & clean',
      subBn: 'পরিচ্ছন্ন ও পৃথকীকৃত',
      icon: Package
    },
    {
      id: 2,
      labelEn: 'Collected',
      labelBn: 'সংগৃহীত',
      subEn: 'Doorstep pickup',
      subBn: 'ডোরস্টেপ সংগ্রহ',
      icon: Truck
    },
    {
      id: 3,
      labelEn: 'Checked',
      labelBn: 'যাচাইকৃত',
      subEn: 'Hub scale verified',
      subBn: 'ওজন ও মান যাচাই',
      icon: Scale
    }
  ];

  const isCompact = size === 'compact';

  return (
    <div
      className={`relative p-3.5 sm:p-5 rounded-3xl bg-[#FFF9F0] border border-[#EDE4D8] overflow-hidden ${className}`}
    >
      {/* Background Gentle Curved Path Motif SVG */}
      <div className="absolute inset-x-8 top-8 sm:top-10 h-6 pointer-events-none hidden xs:block">
        <svg
          viewBox="0 0 360 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M 10 12 C 90 2, 130 22, 180 12 C 230 2, 270 22, 350 12"
            stroke="#EDE4D8"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {currentStep >= 2 && (
            <path
              d={
                currentStep === 2
                  ? 'M 10 12 C 90 2, 130 22, 180 12'
                  : 'M 10 12 C 90 2, 130 22, 180 12 C 230 2, 270 22, 350 12'
              }
              stroke="#25345C"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          )}
        </svg>
      </div>

      <div className="relative z-10 flex items-center justify-between gap-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isPast = currentStep > step.id;

          return (
            <div key={step.id} className="flex-1 flex flex-col items-center text-center">
              {/* Step Icon Badge */}
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                  isActive
                    ? step.id === 3
                      ? 'bg-[#F5BF55] text-[#202B38] shadow-sm ring-4 ring-[#F5BF55]/25 scale-105'
                      : 'bg-[#25345C] text-white shadow-sm ring-4 ring-[#25345C]/15 scale-105'
                    : isPast
                    ? 'bg-[#C9F1DC] text-[#12613F]'
                    : 'bg-white border border-[#EDE4D8] text-[#8896A4]'
                }`}
              >
                {isPast ? (
                  <Check className="w-5 h-5 text-[#12613F]" />
                ) : (
                  <Icon
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      isActive && step.id === 3
                        ? 'text-[#202B38]'
                        : isActive
                        ? 'text-[#C9F1DC]'
                        : 'text-[#53616D]'
                    }`}
                  />
                )}
              </div>

              {/* Step Text */}
              {!isCompact && (
                <div className="mt-2 min-w-0">
                  <span
                    className={`block text-[11px] sm:text-xs font-bold truncate leading-tight ${
                      isActive ? 'text-[#25345C]' : isPast ? 'text-[#12613F]' : 'text-[#8896A4]'
                    }`}
                  >
                    {lang === 'en' ? step.labelEn : step.labelBn}
                  </span>
                  <span className="hidden sm:block text-[10px] text-[#53616D] mt-0.5">
                    {lang === 'en' ? step.subEn : step.subBn}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

