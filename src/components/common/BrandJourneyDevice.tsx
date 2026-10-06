import React from 'react';
import { Package, Truck, Sparkles, Check, ArrowRight } from 'lucide-react';
import { TOKENS } from '../../theme/tokens';

interface BrandJourneyDeviceProps {
  currentStep?: 1 | 2 | 3;
  className?: string;
  size?: 'compact' | 'standard';
}

export const BrandJourneyDevice: React.FC<BrandJourneyDeviceProps> = ({
  currentStep = 1,
  className = '',
  size = 'standard'
}) => {
  const steps = [
    {
      id: 1,
      labelEn: 'Separate bags',
      labelBn: 'আলাদা ব্যাগ',
      icon: Package,
      badge: 'Material'
    },
    {
      id: 2,
      labelEn: 'Collector pickup',
      labelBn: 'কালেক্টর সংগ্রহ',
      icon: Truck,
      badge: 'Doorstep'
    },
    {
      id: 3,
      labelEn: 'Earn reward',
      labelBn: 'রিওয়ার্ড অর্জন',
      icon: Sparkles,
      badge: 'Points'
    }
  ];

  const isCompact = size === 'compact';

  return (
    <div
      className={`p-3 sm:p-4 rounded-3xl bg-[#FFF9F0] border border-[#EDE4D8] flex items-center justify-between gap-2 ${className}`}
    >
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isPast = currentStep > step.id;

        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              {/* Step Icon Badge */}
              <div
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                  isActive
                    ? step.id === 3
                      ? 'bg-[#F5BF55] text-[#202B38] shadow-sm ring-3 ring-[#F5BF55]/30'
                      : 'bg-[#25345C] text-white shadow-sm ring-3 ring-[#25345C]/15'
                    : isPast
                    ? 'bg-[#C9F1DC] text-[#12613F]'
                    : 'bg-white border border-[#EDE4D8] text-[#8896A4]'
                }`}
              >
                {isPast ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#12613F]" />
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

              {/* Step Text (Hidden on very compact view) */}
              {!isCompact && (
                <div className="min-w-0 hidden xs:block sm:block">
                  <span
                    className={`block text-[10px] sm:text-xs font-bold truncate leading-tight ${
                      isActive ? 'text-[#202B38]' : isPast ? 'text-[#12613F]' : 'text-[#8896A4]'
                    }`}
                  >
                    {step.labelEn}
                  </span>
                  <span className="block text-[9px] sm:text-[10px] text-[#53616D] font-mono">
                    Step {step.id}
                  </span>
                </div>
              )}
            </div>

            {/* Connecting Arrow */}
            {idx < steps.length - 1 && (
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#EDE4D8] shrink-0 mx-1" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
