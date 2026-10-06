import React from 'react';
import { TOKENS } from '../../theme/tokens';
import { Check, Clock, Sparkles, Scale, Truck, Gift, ShieldCheck } from 'lucide-react';

interface ContinuousLoopLineProps {
  currentStage: 1 | 2 | 3 | 4 | 5; // 1: Booked, 2: Collected, 3: Quantity Checked, 4: Points Earned, 5: Recovery
  interactive?: boolean;
  onSelectStage?: (stage: 1 | 2 | 3 | 4 | 5) => void;
  className?: string;
}

export const ContinuousLoopLine: React.FC<ContinuousLoopLineProps> = ({
  currentStage,
  interactive = false,
  onSelectStage,
  className = ''
}) => {
  const stages = [
    {
      id: 1,
      titleEn: 'Booked',
      titleBn: 'বুকিং সম্পন্ন',
      subEn: 'Pickup requested',
      icon: Clock
    },
    {
      id: 2,
      titleEn: 'Collected',
      titleBn: 'সংগৃহীত',
      subEn: 'Doorstep pickup',
      icon: Truck
    },
    {
      id: 3,
      titleEn: 'Scale Checked',
      titleBn: 'স্কেলে যাচাইকৃত',
      subEn: 'Quantity confirmed',
      icon: Scale
    },
    {
      id: 4,
      titleEn: 'Points Unlocked',
      titleBn: 'পয়েন্ট অর্জিত',
      subEn: 'Available balance',
      icon: Gift
    },
    {
      id: 5,
      titleEn: 'Traceable Mill',
      titleBn: 'কারখানায় রূপান্তর',
      subEn: 'Outcome confirmed',
      icon: ShieldCheck
    }
  ];

  return (
    <div className={`w-full py-3 ${className}`}>
      {/* Continuous Loop SVG Curve with Path */}
      <div className="relative">
        <svg
          viewBox="0 0 600 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-10 overflow-visible"
        >
          {/* Base loop line */}
          <path
            d="M 20 25 C 100 25, 120 10, 200 10 C 280 10, 320 40, 400 40 C 480 40, 520 25, 580 25"
            stroke="#E8E5DA"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Active progress loop line */}
          <path
            d="M 20 25 C 100 25, 120 10, 200 10 C 280 10, 320 40, 400 40 C 480 40, 520 25, 580 25"
            stroke={TOKENS.brand.primary}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="600"
            strokeDashoffset={600 - (currentStage / 5) * 600}
            className="transition-all duration-700 ease-out"
          />

          {/* Accent glow line on active segment */}
          <path
            d="M 20 25 C 100 25, 120 10, 200 10 C 280 10, 320 40, 400 40 C 480 40, 520 25, 580 25"
            stroke={TOKENS.brand.accent}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="60"
            strokeDashoffset={-(currentStage - 1) * 120}
            className="opacity-80 animate-pulse"
          />
        </svg>

        {/* Milestone Nodes */}
        <div className="grid grid-cols-5 gap-1 -mt-10 relative z-10">
          {stages.map((stage) => {
            const isCompleted = currentStage >= stage.id;
            const isCurrent = currentStage === stage.id;
            const Icon = stage.icon;

            return (
              <button
                key={stage.id}
                type="button"
                disabled={!interactive}
                onClick={() => onSelectStage && onSelectStage(stage.id as any)}
                className={`flex flex-col items-center text-center group ${
                  interactive ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                {/* Node Pill / Circle */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center transition-all duration-300 border-2 ${
                    isCurrent
                      ? 'bg-[#124B3A] border-[#CBEA70] text-white shadow-md scale-105 ring-4 ring-[#CBEA70]/20'
                      : isCompleted
                      ? 'bg-[#124B3A] border-[#124B3A] text-white'
                      : 'bg-[#FFFFFF] border-[#E8E5DA] text-[#879690]'
                  }`}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="w-4 h-4 text-[#CBEA70]" />
                  ) : (
                    <Icon className={`w-4 h-4 ${isCurrent ? 'text-[#CBEA70]' : ''}`} />
                  )}
                </div>

                {/* Node Labels */}
                <div className="mt-2 space-y-0.5">
                  <span
                    className={`block text-[11px] sm:text-xs font-bold leading-tight ${
                      isCurrent
                        ? 'text-[#124B3A]'
                        : isCompleted
                        ? 'text-[#172521]'
                        : 'text-[#879690]'
                    }`}
                  >
                    {stage.titleEn}
                  </span>
                  <span className="hidden sm:block text-[10px] text-[#53625C] leading-snug">
                    {stage.subEn}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
