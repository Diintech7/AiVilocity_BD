import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  Megaphone,
  CheckSquare,
  Award,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ChevronRight,
  ArrowDownToLine
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import campaignService from '../services/campaignService';
import taskService from '../services/taskService';
import WithdrawModal from '../components/WithdrawModal';

export const Dashboard = () => {
  const { user, refreshUser } = useAuth();

  const [myCampaigns, setMyCampaigns] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        await refreshUser();
        const [cRes, tRes] = await Promise.allSettled([
          campaignService.getMyCampaigns(),
          taskService.getMyTasks(),
        ]);

        if (cRes.status === 'fulfilled' && cRes.value?.data) {
          setMyCampaigns(cRes.value.data);
        }
        if (tRes.status === 'fulfilled' && Array.isArray(tRes.value)) {
          setMyTasks(tRes.value);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const approvedTasks = myTasks.filter((t) => t.status === 'Approved');
  const completedTasks = myTasks.filter((t) => t.status === 'Completed' || t.status === 'Approved');
  const pendingTasks = myTasks.filter((t) => t.status === 'Accepted');

  const walletBalance = user?.walletBalance !== undefined ? user.walletBalance : 0;
  const calculatedTaskEarnings = approvedTasks.reduce((sum, t) => {
    const taskReward = Number(t.taskId?.payout || t.taskId?.reward || 0);
    return sum + (isNaN(taskReward) ? 0 : taskReward);
  }, 0);
  const totalEarned = (user?.totalEarned && user.totalEarned > 0)
    ? user.totalEarned
    : (calculatedTaskEarnings > 0 ? calculatedTaskEarnings : walletBalance);

  const completionRate = myTasks.length > 0 ? Math.round((completedTasks.length / myTasks.length) * 100) : 0;

  const stats = [
    {
      title: 'Current Wallet',
      value: `₹${walletBalance.toLocaleString()}`,
      icon: Wallet,
      badge: 'Available',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      gradient: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50 text-emerald-600',
      desc: 'Ready for payout / withdrawal',
    },
    {
      title: 'Total Earnings',
      value: `₹${totalEarned.toLocaleString()}`,
      icon: TrendingUp,
      badge: 'Verified',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      gradient: 'from-purple-500 to-indigo-600',
      bgLight: 'bg-purple-50 text-purple-600',
      desc: 'Lifetime verified rewards',
    },
    {
      title: 'My Campaigns',
      value: myCampaigns.length,
      icon: Megaphone,
      badge: `${myCampaigns.length} Active`,
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
      gradient: 'from-orange-500 to-amber-600',
      bgLight: 'bg-orange-50 text-orange-600',
      desc: 'Active registered campaign slots',
    },
    {
      title: 'Tasks Finished',
      value: `${completedTasks.length} / ${myTasks.length}`,
      icon: CheckSquare,
      badge: myTasks.length > 0 ? `${completionRate}% Done` : '0 Active',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      gradient: 'from-blue-500 to-cyan-600',
      bgLight: 'bg-blue-50 text-blue-600',
      desc: pendingTasks.length > 0 ? `${pendingTasks.length} pending execution` : 'No pending tasks',
    },
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Welcome Banner */}
      <div className="bg-slate-900 rounded-xl p-6 lg:p-7 text-white shadow-xs relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase">
                BA Field Operative
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live & Ready
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Hello, {user?.name || 'Associate'}! 👋
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Execute ground campaigns, verify field tasks with GPS proof, and earn guaranteed instant rewards directly to your wallet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/tasks"
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>Submit Task Proof</span>
              <ArrowUpRight size={15} />
            </Link>
            <Link
              to="/campaigns"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              Explore Campaigns
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid - Full Width & Modern */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5 w-full">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{s.title}</span>
                <div className={`w-9 h-9 rounded-lg ${s.bgLight} flex items-center justify-center font-bold`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-2xl font-bold text-slate-900 tracking-tight">{s.value}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${s.badgeColor}`}>
                    {s.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-medium">{s.desc}</p>
                {s.title === 'Current Wallet' && (
                  <button
                    type="button"
                    onClick={() => setWithdrawModalOpen(true)}
                    className="mt-3 w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowDownToLine size={13} />
                    <span>Withdraw Funds</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section: Recent Tasks & Registered Campaigns */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full">
        {/* Left: My Active Tasks */}
        <div className="xl:col-span-8 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Pending Tasks Execution</h2>
              <p className="text-xs text-slate-500">Tasks accepted by you awaiting ground submission</p>
            </div>
            <Link to="/tasks" className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : myTasks.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
              <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No accepted tasks yet</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">Explore your registered campaigns and accept new tasks.</p>
              <Link
                to="/tasks"
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
              >
                Browse Tasks
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {myTasks.slice(0, 4).map((t) => {
                const task = t.taskId || {};
                const campaign = task.campaignId || {};
                const status = t.status || 'Accepted';

                const statusColors = {
                  Accepted: 'bg-amber-50 text-amber-800 border-amber-200',
                  Completed: 'bg-blue-50 text-blue-800 border-blue-200',
                  'Pending Verification': 'bg-purple-50 text-purple-800 border-purple-200',
                  Approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                  Rejected: 'bg-rose-50 text-rose-800 border-rose-200',
                };

                return (
                  <div
                    key={t._id}
                    className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900">{task.name || 'Field Task'}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                            statusColors[status] || 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Campaign: {campaign.title || 'General'}</p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <span className="text-sm font-bold text-emerald-600">
                        ₹{(task.price || 0).toLocaleString()}
                      </span>
                      {status === 'Accepted' && (
                        <Link
                          to="/tasks"
                          className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg shadow-xs transition"
                        >
                          Submit Proof
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Quick Links & My Campaigns */}
        <div className="xl:col-span-4 space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-slate-900 rounded-xl p-5 sm:p-6 text-white border border-slate-800">
            <h3 className="text-sm font-bold mb-1">Associate Actions</h3>
            <p className="text-xs text-slate-400 mb-4">Quick access to mandatory operations</p>
            <div className="space-y-2">
              <Link
                to="/trainings"
                className="w-full flex items-center justify-between p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-lg text-xs font-semibold border border-slate-700/60 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Award size={16} className="text-orange-400" />
                  <span>Certifications & Quizzes</span>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </Link>
              <Link
                to="/profile"
                className="w-full flex items-center justify-between p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-lg text-xs font-semibold border border-slate-700/60 transition"
              >
                <div className="flex items-center gap-2.5">
                  <MapPin size={16} className="text-orange-400" />
                  <span>Update Location / KYC</span>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Registered Campaigns Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">My Campaigns</h3>
              <Link to="/campaigns" className="text-xs font-semibold text-orange-600 hover:text-orange-700">
                View
              </Link>
            </div>

            {myCampaigns.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No campaign registrations yet.</p>
            ) : (
              <div className="space-y-2">
                {myCampaigns.slice(0, 3).map((c) => (
                  <div key={c._id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex justify-between items-center">
                    <div className="truncate max-w-[170px]">
                      <p className="text-xs font-semibold text-slate-800 truncate">{c.title}</p>
                      <span className="text-[10px] text-slate-500">{c.category || 'Marketing'}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">₹{c.reward}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        onBalanceUpdated={() => {
          if (refreshUser) refreshUser();
        }}
      />
    </div>
  );
};

export default Dashboard;
