import React from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  IndianRupee,
  Building2,
  Camera,
  CheckSquare,
  ListChecks,
  AlertCircle,
  ShieldCheck,
  ExternalLink,
  MessageSquare,
  ThumbsUp
} from 'lucide-react';
import { getFileUrl } from '../services/api';

export const TaskDetailModal = ({
  task,
  acceptance,
  onClose,
  onAccept,
  onSubmitProof,
  isAccepting = false
}) => {
  if (!task) return null;

  // Extract task details whether passed as raw Task or as TaskAcceptance
  const taskObj = task.taskId && typeof task.taskId === 'object' ? task.taskId : task;
  const campaign = taskObj.campaignId && typeof taskObj.campaignId === 'object' ? taskObj.campaignId : {};
  const taskId = taskObj._id;

  // Acceptance details
  const acc = acceptance || (task.status ? task : null);
  const status = acc?.status || null; // 'Accepted' | 'Completed' | 'Pending Verification' | 'Approved' | 'Rejected' | null
  const proofUrl = acc?.proofImage ? getFileUrl(acc.proofImage) : '';

  const startDate = taskObj.startDate ? new Date(taskObj.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const endDate = taskObj.endDate ? new Date(taskObj.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  const statusConfig = {
    Accepted: {
      label: 'Accepted (Pending Proof)',
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: <Clock size={15} className="text-amber-600 shrink-0" />,
      description: 'You have accepted this task. Execute on the ground and submit your proof with GPS coordinates to earn the reward.'
    },
    Completed: {
      label: 'Proof Submitted (Under Review)',
      bg: 'bg-blue-50 text-blue-800 border-blue-200',
      icon: <CheckCircle2 size={15} className="text-blue-600 shrink-0" />,
      description: 'Your proof photo and GPS data have been submitted successfully. Ailocity HQ will verify and credit your wallet.'
    },
    'Pending Verification': {
      label: 'Under Verification',
      bg: 'bg-purple-50 text-purple-800 border-purple-200',
      icon: <ShieldCheck size={15} className="text-purple-600 shrink-0" />,
      description: 'Task proof is currently in the verification queue with the campaign auditor.'
    },
    Approved: {
      label: 'Approved & Credited',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />,
      description: 'Task verified and approved! The reward has been credited to your Ailocity wallet.'
    },
    Rejected: {
      label: 'Submission Rejected',
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      icon: <AlertCircle size={15} className="text-rose-600 shrink-0" />,
      description: 'The auditor found discrepancies with the submission. Check feedback notes.'
    }
  };

  const currentStatusCfg = status ? (statusConfig[status] || statusConfig['Accepted']) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-xl border border-slate-200 max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="min-w-0 pr-3">
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block mb-0.5">
              Field Execution Task
            </span>
            <h3 className="text-base font-black truncate">{taskObj.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Top Meta Bar (Campaign & Reward) */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Campaign
              </span>
              <h4 className="text-xs font-bold text-slate-800 truncate flex items-center gap-1.5 mt-0.5">
                <Building2 size={13} className="text-orange-500 shrink-0" />
                <span>{campaign.title || 'Brand Partner Campaign'}</span>
              </h4>
              {campaign.company && (
                <span className="text-[11px] text-slate-500 block truncate">
                  by {campaign.company}
                </span>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Earn Payout
              </span>
              <span className="text-lg font-black text-emerald-600 block leading-tight mt-0.5">
                ₹{(taskObj.price || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* ── Status Banner (If Accepted or Submitted) ── */}
          {currentStatusCfg ? (
            <div className={`p-3.5 rounded-xl border ${currentStatusCfg.bg} space-y-1.5`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-xs">
                  {currentStatusCfg.icon}
                  <span>{currentStatusCfg.label}</span>
                </div>
                {acc?.updatedAt && (
                  <span className="text-[10px] text-slate-500 font-medium">
                    Updated: {new Date(acc.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              <p className="text-[11px] leading-relaxed text-slate-700">
                {currentStatusCfg.description}
              </p>
            </div>
          ) : (
            <div className="p-3 bg-orange-50/60 border border-orange-100 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-orange-950 font-medium">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                <span>Open for Execution</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-orange-200 text-orange-700">
                Ready to Accept
              </span>
            </div>
          )}

          {/* ── Submitted Proof Details (If Proof Submitted) ── */}
          {acc && acc.status !== 'Accepted' && (
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-600" />
                Submitted Proof Information
              </span>

              <div className="flex items-start gap-3.5">
                {proofUrl ? (
                  <a
                    href={proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative group shrink-0"
                    title="Click to view high-resolution photo"
                  >
                    <img
                      src={proofUrl}
                      alt="Submitted Proof"
                      className="w-20 h-20 rounded-lg object-cover border border-slate-200 shadow-xs group-hover:opacity-90 transition"
                    />
                    <div className="absolute inset-0 bg-black/30 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                      <ExternalLink size={14} />
                    </div>
                  </a>
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-slate-200/70 border border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                    <Camera size={20} />
                  </div>
                )}

                <div className="flex-1 space-y-1.5 text-xs">
                  {acc.location && (
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <MapPin size={13} className="text-rose-500 shrink-0" />
                      <span className="font-mono text-[11px] bg-white border border-slate-200 px-1.5 py-0.5 rounded-md">
                        {acc.location.latitude}, {acc.location.longitude}
                      </span>
                    </div>
                  )}

                  {acc.interestLevel && (
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <ThumbsUp size={12} className="text-orange-500 shrink-0" />
                      <span className="text-[11px]">
                        Interest: <strong className="text-slate-900">{acc.interestLevel}</strong>
                      </span>
                    </div>
                  )}

                  {acc.feedback && (
                    <div className="flex items-start gap-1.5 text-slate-600 pt-0.5">
                      <MessageSquare size={12} className="text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] italic leading-normal text-slate-700">
                        "{acc.feedback}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Task Brief & Overview
            </span>
            <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200/80">
              {taskObj.description || 'Complete this task following the brand instructions to earn your verified reward.'}
            </p>
          </div>

          {/* Execution Checklist */}
          {taskObj.whatToDo && taskObj.whatToDo.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-1.5">
                <ListChecks size={13} className="text-orange-500" />
                Execution Checklist & Steps
              </span>
              <div className="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80">
                {taskObj.whatToDo.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <div className="w-4 h-4 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                      {idx + 1}
                    </div>
                    <span className="leading-snug">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline / Dates */}
          {(startDate || endDate) && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/70">
              <Calendar size={13} className="text-slate-400 shrink-0" />
              <span>Execution Window: <strong>{startDate}</strong> — <strong>{endDate}</strong></span>
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
            {!status && (
              <button
                type="button"
                onClick={() => onAccept && onAccept(taskId)}
                disabled={isAccepting}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5"
              >
                {isAccepting ? 'Accepting...' : 'Accept Task Now'}
              </button>
            )}

            {status === 'Accepted' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onSubmitProof) onSubmitProof(acc || taskObj);
                }}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg shadow-sm transition cursor-pointer flex items-center gap-1.5"
              >
                <Camera size={14} />
                <span>Submit Proof</span>
              </button>
            )}

            {status && status !== 'Accepted' && (
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${currentStatusCfg?.bg || ''}`}>
                {currentStatusCfg?.icon}
                <span>Status: {currentStatusCfg?.label || status}</span>
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TaskDetailModal;
