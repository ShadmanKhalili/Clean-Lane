import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Droplets,
  Maximize2,
  Layers,
  DoorOpen,
  Volume2,
  Clock,
  MapPin,
  FileCheck2,
  ExternalLink
} from 'lucide-react';
import { AppNotification, Booking, MaterialCategory } from '../../types';
import { MATERIAL_TAXONOMY } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

interface PreparationGuidanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification?: AppNotification | null;
  booking?: Booking | null;
}

export const PreparationGuidanceModal: React.FC<PreparationGuidanceModalProps> = ({
  isOpen,
  onClose,
  notification,
  booking
}) => {
  const { lang } = useApp();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [speaking, setSpeaking] = useState(false);

  if (!isOpen) return null;

  // Derive guidance from notification or booking
  const prep = notification?.preparationInstructions || {
    steps: [
      {
        stepNumber: 1,
        title: 'Empty & Rinse Residue',
        titleBn: 'খালি করে ধুয়ে ফেলুন',
        detail:
          'Pour out leftover liquids or oils from bottles and containers. A quick water rinse prevents odors.',
        detailBn: 'বোতল ও পাত্রের ভেতরের তরল বা তেল ফেলে হালকা ধুয়ে নিন।',
        icon: 'droplets'
      },
      {
        stepNumber: 2,
        title: 'Flatten & Compress',
        titleBn: 'চাপ দিয়ে সংকুচিত করুন',
        detail:
          'Crush plastic bottles, break down cardboard boxes flat, and step on beverage cans to maximize space.',
        detailBn: 'কার্টুন বক্স চ্যাপ্টা করুন এবং বোতল চেপে সংকুচিত করুন।',
        icon: 'maximize-2'
      },
      {
        stepNumber: 3,
        title: 'Separate by Material Stream',
        titleBn: 'উপাদান অনুযায়ী আলাদা রাখুন',
        detail:
          'Keep dry recyclables in separate bags for instant digital scale verification by the collector.',
        detailBn: 'ডিজিটাল স্কেলে দ্রুত ওজনের জন্য বিভিন্ন বর্জ্য আলাদা ব্যাগে রাখুন।',
        icon: 'layers'
      },
      {
        stepNumber: 4,
        title: 'Doorstep / Gate Placement',
        titleBn: 'দরজা বা গেইটে প্রস্তুত রাখুন',
        detail:
          'Place bags at your pickup location 15 minutes before the arrival window.',
        detailBn: 'সংগ্রহের সময়ের ১৫ মিনিট আগে নির্ধারিত স্থানে ব্যাগগুলো প্রস্তুত রাখুন।',
        icon: 'door-open'
      }
    ],
    materialSpecific: (booking?.materials || []).map((m) => ({
      category: m.category,
      name: MATERIAL_TAXONOMY[m.category]?.name || m.category,
      nameBn: MATERIAL_TAXONOMY[m.category]?.nameBn || m.category,
      instructions:
        MATERIAL_TAXONOMY[m.category]?.prepInstructions ||
        'Keep dry, clean, and segregated.',
      instructionsBn:
        MATERIAL_TAXONOMY[m.category]?.prepInstructionsBn ||
        'পরিষ্কার ও শুকনো রাখুন।',
      doNotInclude:
        MATERIAL_TAXONOMY[m.category]?.excludedContaminants || [
          'Wet kitchen waste'
        ]
    })),
    gatePlacementNote:
      'Collector arrives within your scheduled window. If in an apartment, leave at ground lobby or inform gate guard.',
    gatePlacementNoteBn:
      'কালেক্টর নির্ধারিত সময়ে পৌঁছাবেন। অ্যাপার্টমেন্টে থাকলে গ্রাউন্ড লবিতে রাখুন বা গার্ডকে বলুন।',
    contaminationWarning:
      'Warning: Contaminated, wet food, or unrinsed items will be rejected during digital scale inspection.',
    contaminationWarningBn:
      'সতর্কতা: ভেজা, অপরিস্কার বা খাদ্যকণাযুক্ত বর্জ্য স্কেল পরিদর্শনে বাতিল হবে।'
  };

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNumber)
        ? prev.filter((s) => s !== stepNumber)
        : [...prev, stepNumber]
    );
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const textToSpeak =
      lang === 'bn'
        ? `বর্জ্য সংগ্রহের প্রস্তুতি নির্দেশিকা। এক: বোতল ও পাত্র খালি করে হালকা ধুয়ে নিন। দুই: কার্টুন বক্স এবং বোতল চ্যাপ্টা করুন। তিন: প্লাস্টিক এবং কাগজ আলাদা ব্যাগে রাখুন। চার: নির্ধারিত সময়ের ১৫ মিনিট আগে ব্যাগগুলো প্রস্তুত রাখুন।`
        : `Collection preparation guide. Step 1: Empty and rinse residue from bottles. Step 2: Flatten cardboard boxes and crush bottles. Step 3: Separate plastics, cardboard, and cans into separate bags. Step 4: Place sorted bags at your doorstep 15 minutes before pickup window.`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case 'droplets':
        return <Droplets className="w-5 h-5 text-sky-600" />;
      case 'maximize-2':
        return <Maximize2 className="w-5 h-5 text-indigo-600" />;
      case 'layers':
        return <Layers className="w-5 h-5 text-emerald-600" />;
      case 'door-open':
      default:
        return <DoorOpen className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#FFF9F0] border border-[#EDE4D8] rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-5 bg-[#25345C] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C9F1DC] text-[#12613F] flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C9F1DC]">
                {lang === 'en' ? 'Automated 24h Guide' : 'স্বয়ংক্রিয় ২৪ ঘণ্টার নির্দেশিকা'}
              </span>
              <h2 className="text-lg font-bold">
                {lang === 'en'
                  ? 'Collection Preparation Instructions'
                  : 'বর্জ্য সংগ্রহের প্রস্তুতি নির্দেশিকা'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-header Banner */}
        <div className="bg-[#FAF5EC] border-b border-[#EDE4D8] px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-[#53616D]">
            {(notification?.scheduledCollectionDate || booking?.scheduledDate) && (
              <span className="flex items-center gap-1.5 font-semibold text-[#202B38]">
                <Clock className="w-3.5 h-3.5 text-[#25345C]" />
                {notification?.scheduledCollectionDate || booking?.scheduledDate} (
                {notification?.scheduledTimeWindow || booking?.scheduledTimeWindow})
              </span>
            )}
            {(notification?.address || booking?.address) && (
              <span className="hidden sm:flex items-center gap-1.5 text-[#53616D]">
                <MapPin className="w-3.5 h-3.5 text-[#25345C]" />
                {(notification?.address || booking?.address || '').split(',')[0]}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSpeak}
            className="px-3 py-1.5 bg-white border border-[#EDE4D8] rounded-xl text-xs font-bold text-[#25345C] hover:bg-[#EDF1F9] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Volume2
              className={`w-3.5 h-3.5 ${
                speaking ? 'text-rose-600 animate-pulse' : 'text-[#25345C]'
              }`}
            />
            <span>
              {speaking
                ? lang === 'en'
                  ? 'Stop Audio'
                  : 'অডিও থামান'
                : lang === 'en'
                ? 'Listen to Instructions'
                : 'নির্দেশনা শুনুন'}
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Progress / Step checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#53616D]">
                {lang === 'en' ? 'Preparation Checklist' : 'প্রস্তুতির চেকলিস্ট'}
              </h3>
              <span className="text-xs font-bold text-[#12613F] bg-[#C9F1DC]/60 px-2 py-0.5 rounded-full">
                {completedSteps.length} of {prep.steps.length}{' '}
                {lang === 'en' ? 'ready' : 'প্রস্তুত'}
              </span>
            </div>

            <div className="space-y-2.5">
              {prep.steps.map((step) => {
                const isDone = completedSteps.includes(step.stepNumber);
                return (
                  <div
                    key={step.stepNumber}
                    onClick={() => toggleStep(step.stepNumber)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isDone
                        ? 'bg-[#E8FAF1] border-[#C9F1DC]'
                        : 'bg-white border-[#EDE4D8] hover:border-[#25345C]/30'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isDone
                          ? 'bg-[#12613F] text-white'
                          : 'bg-[#FAF5EC] border border-[#EDE4D8]'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        getStepIcon(step.icon)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#53616D]">
                          Step {step.stepNumber}
                        </span>
                        <h4
                          className={`text-sm font-bold ${
                            isDone ? 'text-[#12613F] line-through' : 'text-[#202B38]'
                          }`}
                        >
                          {lang === 'en' ? step.title : step.titleBn}
                        </h4>
                      </div>
                      <p className="text-xs text-[#53616D] mt-0.5 leading-relaxed">
                        {lang === 'en' ? step.detail : step.detailBn}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Booked Material Specific Guidance */}
          {prep.materialSpecific && prep.materialSpecific.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#53616D]">
                {lang === 'en'
                  ? 'Specific Rules for Your Scheduled Materials'
                  : 'আপনার নির্ধারিত বর্জ্যের নির্দিষ্ট নিয়ম'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {prep.materialSpecific.map((mat) => (
                  <div
                    key={mat.category}
                    className="p-3.5 rounded-2xl bg-white border border-[#EDE4D8] space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between border-b border-[#FAF5EC] pb-2">
                      <span className="font-bold text-xs text-[#25345C]">
                        {lang === 'en' ? mat.name : mat.nameBn}
                      </span>
                      <span className="text-[10px] font-mono text-[#12613F] bg-[#C9F1DC]/50 px-2 py-0.5 rounded-md font-semibold">
                        Clean Stream
                      </span>
                    </div>

                    <p className="text-xs text-[#202B38] leading-relaxed">
                      {lang === 'en' ? mat.instructions : mat.instructionsBn}
                    </p>

                    {mat.doNotInclude && mat.doNotInclude.length > 0 && (
                      <div className="pt-1.5 border-t border-[#FAF5EC] text-[11px] text-rose-700 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>
                          <strong>{lang === 'en' ? 'Do not include:' : 'দেবেন না:'}</strong>{' '}
                          {mat.doNotInclude.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contamination Notice */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-bold text-amber-950 block">
                {lang === 'en'
                  ? 'Quality & Purity Guarantee'
                  : 'মান ও বিশুদ্ধতা নিশ্চিতকরণ'}
              </span>
              <p className="text-amber-900 leading-relaxed">
                {lang === 'en'
                  ? prep.contaminationWarning
                  : prep.contaminationWarningBn}
              </p>
            </div>
          </div>

          {/* Gate Placement Note */}
          <div className="p-3.5 bg-[#EDF1F9] border border-[#25345C]/15 rounded-2xl flex items-center gap-3 text-xs text-[#25345C]">
            <DoorOpen className="w-4 h-4 shrink-0 text-[#25345C]" />
            <span className="font-medium">
              {lang === 'en' ? prep.gatePlacementNote : prep.gatePlacementNoteBn}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FAF5EC] border-t border-[#EDE4D8] flex items-center justify-between">
          <span className="text-xs text-[#53616D]">
            {completedSteps.length === prep.steps.length
              ? lang === 'en'
                ? 'All steps completed! You are ready for pickup.'
                : 'সব প্রস্তুতি সম্পন্ন! আপনি সংগ্রহের জন্য প্রস্তুত।'
              : lang === 'en'
              ? 'Complete the checklist before collector arrival.'
              : 'কালেক্টর আসার আগেই প্রস্তুতি শেষ করুন।'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            {lang === 'en' ? 'Got It, I am Ready' : 'বুঝেছি, প্রস্তুত'}
          </button>
        </div>
      </div>
    </div>
  );
};
