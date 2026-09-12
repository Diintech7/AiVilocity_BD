import React from 'react';
import {
  GraduationCap,
  X,
  ArrowRight,
  BookOpen,
  Award,
  Lock,
  Megaphone,
  Check,
  Coins,
  AlertCircle
} from 'lucide-react';

export const TrainingPromptModal = ({ isOpen, onClose, campaign, onStartTraining }) => {
  if (!isOpen || !campaign) return null;

  const trainingObj = campaign.training;
  const trainingName =
    typeof trainingObj === 'object' && trainingObj?.name
      ? trainingObj.name
      : 'Mandatory Certification Training';

  const trainingId =
    typeof trainingObj === 'object' && trainingObj?._id
      ? trainingObj._id
      : typeof trainingObj === 'string'
      ? trainingObj
      : '';

  const handleStart = () => {
    if (onStartTraining) {
      onStartTraining(trainingId, trainingName);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative w-full max-w-[520px] bg-white rounded-xl p-6 sm:p-7 shadow-2xl border border-slate-200 z-10 animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">
        
        {/* Close Button at Top Right */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer z-20"
          title="Close"
        >
          <X size={15} />
        </button>

        {/* ── Top Header Section (Badge + Title + Subtitle + 3D Image) ── */}
        <div className="flex items-start justify-between gap-3 sm:gap-4 mb-5">
          <div className="flex-1 pt-1 pr-2">
            {/* Pill: Training Required */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-orange-50 text-orange-600 border border-orange-100 text-[11px] font-bold uppercase tracking-wider mb-2.5">
              <GraduationCap size={13} />
              <span>Training Required</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-1.5">
              Complete Training<br />for This Campaign
            </h2>

            {/* Description */}
            <p className="text-xs text-slate-500 leading-relaxed max-w-[280px]">
              Before registering for this campaign, you need to complete the required training module and pass the quiz.
            </p>
          </div>

          {/* 3D Illustration on Top Right */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center -mt-2 -mr-1">
            <div className="absolute w-24 h-24 sm:w-32 sm:h-32 bg-orange-100/50 rounded-full blur-md pointer-events-none" />
            <img
              src="/image.png"
              alt="Training Illustration"
              className="w-full h-full object-contain relative z-10 drop-shadow-sm select-none"
            />
          </div>
        </div>

        {/* ── Middle: Required Course Card ── */}
        <div className="bg-orange-50/40 border border-orange-200/80 rounded-xl p-4 mb-3.5">
          {/* Top Label & Mandatory Tag */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 tracking-wider uppercase">
              <BookOpen size={15} />
              <span>Required Course</span>
            </div>
            <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
              Mandatory
            </span>
          </div>

          {/* Course Name */}
          <h3 className="text-base font-black text-slate-900 mt-2 leading-snug">
            {trainingName}
          </h3>

          {/* Subtext */}
          <p className="text-xs text-slate-500 leading-relaxed mt-1">
            Learn campaign guidelines, verification steps, and task instructions to maximize your earnings.
          </p>

          {/* Divider */}
          <div className="border-t border-orange-100 my-3" />

          {/* Perks */}
          <div className="flex items-center gap-3 text-xs font-bold">
            <div className="flex items-center gap-1.5 text-emerald-700">
              <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                <Check size={10} strokeWidth={3} />
              </div>
              <span>Free Certificate</span>
            </div>

            <span className="text-slate-300 font-light">|</span>

            <div className="flex items-center gap-1.5 text-slate-700">
              <Award size={15} className="text-orange-600" />
              <span>Instant Eligibility</span>
            </div>
          </div>
        </div>

        {/* ── Lower: Unlocks Campaign & Reward Pool Box ── */}
        <div className="bg-blue-50/40 border border-blue-200/80 rounded-xl p-3.5 sm:p-4 mb-3.5 flex items-center justify-between gap-3">
          {/* Left: Unlocks Campaign */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Megaphone size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block leading-tight">
                Unlocks Campaign
              </span>
              <h4 className="text-sm font-black text-slate-900 leading-tight mt-0.5 truncate">
                {campaign.title}
              </h4>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5 truncate">
                <Lock size={11} className="text-slate-400 shrink-0" />
                <span className="truncate">{campaign.company || 'Enterprise Client'}</span>
              </div>
            </div>
          </div>

          {/* Middle Divider */}
          <div className="w-px h-8 bg-slate-200 shrink-0" />

          {/* Right: Reward Pool */}
          <div className="flex items-center gap-2.5 shrink-0 pl-1">
            <div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block leading-tight text-left">
                Reward Pool
              </span>
              <span className="text-base font-black text-emerald-600 leading-tight mt-0.5 block">
                ₹{(campaign.reward || 0).toLocaleString()}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Coins size={18} />
            </div>
          </div>
        </div>

        {/* ── Info Hint Box ── */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 flex items-center gap-2.5 mb-5">
          <div className="w-4 h-4 rounded-full border border-orange-500 flex items-center justify-center text-orange-600 font-bold text-[10px] shrink-0 leading-none">
            i
          </div>
          <p className="text-xs text-slate-700 font-medium leading-snug">
            Once you pass the quiz, this campaign registration will unlock automatically!
          </p>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex items-center justify-center sm:justify-end gap-3 pt-1">
          {/* Skip for Now */}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer text-center"
          >
            Skip for Now
          </button>

          {/* Start Training Button */}
          <button
            type="button"
            onClick={handleStart}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Start Training</span>
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default TrainingPromptModal;
