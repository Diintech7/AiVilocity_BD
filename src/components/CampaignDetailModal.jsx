import React from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Building2,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  GraduationCap,
  Sparkles,
  Megaphone,
  CheckSquare,
  ShieldCheck,
  Target,
  ArrowRight,
  Info
} from 'lucide-react';
import { getFileUrl } from '../services/api';

export const CampaignDetailModal = ({
  campaign,
  isRegistered,
  onClose,
  onRegister,
  onOpenTraining,
  isRegistering = false
}) => {
  if (!campaign) return null;

  const total = campaign.totalSlots || 0;
  const filled = campaign.filledSlots || 0;
  const percentFilled = total > 0 ? Math.min(Math.round((filled / total) * 100), 100) : 0;
  const slotsFull = filled >= total;

  const imageUrl = campaign.image ? getFileUrl(campaign.image) : '';
  const startDate = campaign.startDate ? new Date(campaign.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const deadlineDate = campaign.deadline ? new Date(campaign.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Open';

  const trainingObj = campaign.training;
  const hasTraining = Boolean(trainingObj);
  const trainingName = typeof trainingObj === 'object' && trainingObj?.name ? trainingObj.name : 'Mandatory Training Module';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-xl border border-slate-200 max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Banner with Close Button */}
        <div className="relative h-44 bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 shrink-0 overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={campaign.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/30">
              <Megaphone size={56} />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Badges on Banner */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-slate-900/90 text-white text-[10px] font-bold rounded-md backdrop-blur-xs uppercase tracking-wider">
              {campaign.category || 'Campaign'}
            </span>
            {campaign.featured && (
              <span className="px-2 py-0.5 bg-amber-400 text-amber-950 text-[10px] font-black rounded-md shadow-xs flex items-center gap-1">
                <Sparkles size={11} /> Featured
              </span>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>

          {/* Title & Client on Bottom of Banner */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <span className="text-xs text-orange-200 font-semibold flex items-center gap-1.5 mb-0.5">
              <Building2 size={13} className="text-orange-300" />
              <span>{campaign.company || 'Enterprise Partner'}</span>
            </span>
            <h2 className="text-lg font-black tracking-tight leading-snug line-clamp-2">
              {campaign.title}
            </h2>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Top Metric Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Reward Pool
              </span>
              <span className="text-lg font-black text-emerald-600 block mt-0.5 leading-tight">
                ₹{(campaign.reward || 0).toLocaleString()}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Slots Progress
              </span>
              <span className="text-xs font-bold text-slate-800 block mt-1">
                {filled} / {total} <span className="text-slate-400 font-medium">({percentFilled}%)</span>
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Deadline
              </span>
              <span className="text-xs font-bold text-slate-800 block mt-1 flex items-center gap-1">
                <Clock size={12} className="text-slate-400" /> {deadlineDate}
              </span>
            </div>
          </div>

          {/* Slots Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                slotsFull ? 'bg-rose-500' : percentFilled > 80 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${percentFilled}%` }}
            />
          </div>

          {/* Registration Status Notice */}
          {isRegistered ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                <span>You are officially registered in this campaign!</span>
              </div>
              <Link
                to="/tasks"
                onClick={onClose}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-xs shrink-0 flex items-center gap-1"
              >
                <span>View Tasks</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="p-3 bg-orange-50/60 border border-orange-100 rounded-xl flex items-center gap-2 text-xs text-orange-950">
              <Info size={15} className="text-orange-600 shrink-0" />
              <span>Register for this campaign to unlock ground field tasks and start earning.</span>
            </div>
          )}

          {/* Campaign Goal (if available) */}
          {campaign.goal && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1">
                <Target size={13} className="text-orange-500" />
                Campaign Objective
              </span>
              <p className="text-xs text-slate-700 font-medium bg-slate-50 p-3 rounded-lg border border-slate-200/70 leading-relaxed">
                {campaign.goal}
              </p>
            </div>
          )}

          {/* Description / About */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              About Campaign & Ground Scope
            </span>
            <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200/80">
              {campaign.about || campaign.description}
            </p>
          </div>

          {/* Conditions & Guidelines */}
          {campaign.conditions && campaign.conditions.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5 flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-600" />
                Participation Conditions & Rules
              </span>
              <div className="space-y-1.5 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80">
                {campaign.conditions.map((cond, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="text-orange-500 font-bold">•</span>
                    <span className="leading-snug">{cond}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attached Training Requirement */}
          {hasTraining && (
            <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <GraduationCap size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-900 block leading-tight">
                    Mandatory Certification
                  </span>
                  <h5 className="text-xs font-bold text-slate-900 truncate">
                    {trainingName}
                  </h5>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenTraining) onOpenTraining(campaign);
                }}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg transition shrink-0 cursor-pointer"
              >
                View Training
              </button>
            </div>
          )}

          {/* Timeline Dates */}
          {(startDate || campaign.deadline) && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/70">
              <Calendar size={13} className="text-slate-400 shrink-0" />
              <span>Drive Active: <strong>{startDate || 'Active'}</strong> — <strong>{deadlineDate}</strong></span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-lg transition cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {isRegistered ? (
              <Link
                to="/tasks"
                onClick={onClose}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5"
              >
                <CheckSquare size={14} />
                <span>Go to Tasks</span>
              </Link>
            ) : slotsFull ? (
              <button
                disabled
                className="px-5 py-2 bg-slate-200 text-slate-500 text-xs font-bold rounded-lg cursor-not-allowed"
              >
                Slots Full
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onRegister && onRegister(campaign)}
                disabled={isRegistering}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5"
              >
                {isRegistering ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <span>Apply for Campaign</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CampaignDetailModal;
