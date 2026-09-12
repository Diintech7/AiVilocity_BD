import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Calendar,
  IndianRupee,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Camera,
  MapPin,
  FileCheck,
  ChevronRight,
  ListChecks
} from 'lucide-react';
import { toast } from 'react-toastify';
import taskService from '../services/taskService';
import TaskSubmitModal from '../components/TaskSubmitModal';
import TaskDetailModal from '../components/TaskDetailModal';
import { getFileUrl } from '../services/api';

export const Tasks = () => {
  const [activeTab, setActiveTab] = useState('available'); // 'available' or 'accepted'
  const [availableTasks, setAvailableTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);

  // Modal States
  const [selectedTaskToSubmit, setSelectedTaskToSubmit] = useState(null);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState(null);

  const fetchTasksData = async () => {
    setLoading(true);
    try {
      const [availRes, myRes] = await Promise.allSettled([
        taskService.getTasks(),
        taskService.getMyTasks(),
      ]);

      if (availRes.status === 'fulfilled') {
        const val = availRes.value;
        if (Array.isArray(val)) {
          setAvailableTasks(val);
        } else if (val && Array.isArray(val.data)) {
          setAvailableTasks(val.data);
        }
      }
      if (myRes.status === 'fulfilled') {
        const myVal = myRes.value;
        if (Array.isArray(myVal)) {
          setMyTasks(myVal);
        } else if (myVal && Array.isArray(myVal.data)) {
          setMyTasks(myVal.data);
        }
      }
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksData();
  }, []);

  const handleAcceptTask = async (taskId) => {
    setAcceptingId(taskId);
    try {
      const res = await taskService.acceptTask(taskId);
      toast.success(res.message || 'Task accepted! Complete and submit proof to earn reward.');
      fetchTasksData();
      setActiveTab('accepted');
    } catch (error) {
      toast.error(error.message || 'Failed to accept task');
    } finally {
      setAcceptingId(null);
    }
  };

  // Determine if a task is already accepted and get its acceptance record
  const getAcceptanceForTask = (taskId) => {
    return myTasks.find((t) => (t.taskId?._id === taskId || t.taskId === taskId));
  };

  const isAccepted = (taskId) => {
    return !!getAcceptanceForTask(taskId);
  };

  const statusBadges = {
    Accepted: { bg: 'bg-amber-100 text-amber-900 border-amber-200', label: 'Accepted (Pending Proof)' },
    Completed: { bg: 'bg-blue-100 text-blue-900 border-blue-200', label: 'Proof Submitted' },
    'Pending Verification': { bg: 'bg-purple-100 text-purple-900 border-purple-200', label: 'Under Verification' },
    Approved: { bg: 'bg-emerald-100 text-emerald-900 border-emerald-200', label: 'Approved & Paid' },
    Rejected: { bg: 'bg-rose-100 text-rose-900 border-rose-200', label: 'Submission Rejected' },
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Field Tasks & Execution</h1>
          <p className="text-sm text-slate-500">
            Accept tasks for your registered campaigns, execute on ground, and upload GPS verified proof
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 w-fit">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'available' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Available ({availableTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('accepted')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'accepted' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Accepted Tasks ({myTasks.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activeTab === 'available' ? (
        /* ────────────── TAB 1: AVAILABLE TASKS ────────────── */
        availableTasks.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-xs">
            <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No tasks available yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Tasks are shown for campaigns you have registered in. Go to Campaigns tab to register for open campaigns first!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 w-full">
            {availableTasks.map((task) => {
              const campaign = task.campaignId || {};
              const acc = getAcceptanceForTask(task._id);
              const alreadyAccepted = !!acc;
              const status = acc?.status;
              const startDate = task.startDate ? new Date(task.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';
              const endDate = task.endDate ? new Date(task.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';

              return (
                <div
                  key={task._id}
                  onClick={() => setSelectedTaskDetail(task)}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-orange-300 hover:shadow-md transition-all p-4 sm:p-5 flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    {/* Campaign tag & Reward */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200/80 text-[10px] font-semibold text-orange-700 uppercase tracking-wider truncate">
                        {campaign.title || 'Brand Campaign'}
                      </span>
                      <span className="text-sm font-black text-emerald-600">
                        ₹{(task.price || 0).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-orange-600 transition-colors">
                      {task.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-3">{task.description}</p>

                    {/* What to do list */}
                    {task.whatToDo && task.whatToDo.length > 0 && (
                      <div className="mt-3.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200/70 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                          <ListChecks size={12} className="text-orange-500" /> Execution Checklist
                        </span>
                        {task.whatToDo.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                            <span className="text-orange-500 font-bold">•</span>
                            <span className="line-clamp-1">{item}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Dates & Click Hint */}
                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        <span>{startDate} — {endDate}</span>
                      </div>
                      <span className="text-orange-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        Details <ChevronRight size={11} />
                      </span>
                    </div>
                  </div>

                  {/* Accept Action & Live Status */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-500 font-medium">Earn ₹{task.price}</span>
                    {alreadyAccepted ? (
                      <div className="flex items-center gap-1.5">
                        {status === 'Completed' ? (
                          <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold rounded-lg flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-blue-600" /> Proof Submitted
                          </span>
                        ) : status === 'Approved' ? (
                          <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold rounded-lg flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-emerald-600" /> Approved & Paid
                          </span>
                        ) : status === 'Rejected' ? (
                          <span className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold rounded-lg flex items-center gap-1">
                            <AlertCircle size={12} className="text-rose-600" /> Rejected
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold rounded-lg flex items-center gap-1">
                            <Clock size={12} className="text-amber-600" /> Accepted (In Progress)
                          </span>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptTask(task._id);
                        }}
                        disabled={acceptingId === task._id}
                        className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs disabled:opacity-50 transition cursor-pointer"
                      >
                        {acceptingId === task._id ? 'Accepting...' : 'Accept Task'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* ────────────── TAB 2: MY ACCEPTED TASKS ────────────── */
        myTasks.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-xs">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No accepted tasks</h3>
            <p className="text-xs text-slate-500 mt-1">
              Switch to "Available" tab to browse and accept field tasks.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {myTasks.map((t) => {
              const task = t.taskId || {};
              const campaign = task.campaignId || {};
              const status = t.status || 'Accepted';
              const cfg = statusBadges[status] || statusBadges['Accepted'];
              const proofUrl = t.proofImage ? getFileUrl(t.proofImage) : '';

              return (
                <div
                  key={t._id}
                  onClick={() => setSelectedTaskDetail(t)}
                  className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-orange-300 hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${cfg.bg}`}>
                        {cfg.label}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        Campaign: {campaign.title || 'General'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                      {task.name || 'Ground Execution Task'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">{task.description}</p>

                    {/* Proof Details if submitted */}
                    {t.location && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-mono text-[11px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                          <MapPin size={12} className="text-rose-500" />
                          {t.location.latitude}, {t.location.longitude}
                        </span>
                        {t.interestLevel && (
                          <span className="font-medium text-slate-700">
                            Interest: <span className="text-orange-600 font-semibold">{t.interestLevel}</span>
                          </span>
                        )}
                        {t.feedback && <span className="italic text-slate-500">"{t.feedback}"</span>}
                      </div>
                    )}
                  </div>

                  {/* Right Side: Proof Thumbnail / Status Badges / Action */}
                  <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-end shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Reward</span>
                      <span className="text-base font-black text-emerald-600">₹{(task.price || 0).toLocaleString()}</span>
                    </div>

                    {proofUrl && (
                      <a
                        href={proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="View Submitted Proof"
                      >
                        <img
                          src={proofUrl}
                          alt="Proof"
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-xs hover:opacity-80 transition"
                        />
                      </a>
                    )}

                    {status === 'Accepted' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTaskToSubmit(t);
                        }}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Camera size={14} />
                        <span>Submit Proof</span>
                      </button>
                    ) : (
                      <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${cfg.bg}`}>
                        <CheckCircle2 size={13} />
                        <span>{cfg.label}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Task Proof Submission Modal */}
      {selectedTaskToSubmit && (
        <TaskSubmitModal
          task={selectedTaskToSubmit}
          onClose={() => setSelectedTaskToSubmit(null)}
          onSuccess={() => {
            fetchTasksData();
            setSelectedTaskDetail(null);
            setActiveTab('accepted');
          }}
        />
      )}

      {/* Full Task Detail Modal */}
      {selectedTaskDetail && (
        <TaskDetailModal
          task={selectedTaskDetail}
          acceptance={getAcceptanceForTask(selectedTaskDetail._id || selectedTaskDetail.taskId?._id)}
          onClose={() => setSelectedTaskDetail(null)}
          onAccept={(tId) => {
            handleAcceptTask(tId);
            setSelectedTaskDetail(null);
          }}
          onSubmitProof={(item) => {
            setSelectedTaskDetail(null);
            setSelectedTaskToSubmit(item);
          }}
          isAccepting={acceptingId === (selectedTaskDetail._id || selectedTaskDetail.taskId?._id)}
        />
      )}
    </div>
  );
};

export default Tasks;
