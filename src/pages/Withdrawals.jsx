import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowDownToLine,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building2,
  Calendar,
  Lock,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  Info,
  XCircle,
  FileText,
  Search,
  Check,
  Eye,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';
import walletService from '../services/walletService';
import { useAuth } from '../context/AuthContext';

export const Withdrawals = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Data states
  const [summary, setSummary] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [historyTab, setHistoryTab] = useState('ALL'); // 'ALL' | 'Pending' | 'Approved' | 'Rejected'
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Form states
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('UPI'); // 'UPI' | 'Bank Transfer'
  const [upiId, setUpiId] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: '',
    accountHolderName: '',
  });

  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [sumRes, histRes] = await Promise.allSettled([
        walletService.getSummary(),
        walletService.getMyWithdrawals(),
      ]);

      if (sumRes.status === 'fulfilled' && sumRes.value?.success) {
        setSummary(sumRes.value.data);
      }
      if (histRes.status === 'fulfilled' && histRes.value?.success) {
        setWithdrawals(histRes.value.data || []);
      }

      if (refreshUser) {
        refreshUser();
      }

      if (isManualRefresh) {
        toast.success('Wallet data refreshed successfully');
      }
    } catch (error) {
      console.error('Error fetching withdrawal data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalWallet = summary?.totalWalletBalance ?? (user?.walletBalance || 0);
  const withdrawable = summary?.withdrawableBalance ?? 0;
  const locked = summary?.lockedBalance ?? 0;
  const minAmount = summary?.minWithdrawalAmount ?? 500;
  const maturingList = summary?.maturingEarnings || [];

  const handleBankChange = (field, value) => {
    setBankDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const withdrawAmount = Number(amount);

    if (!withdrawAmount || isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (withdrawAmount < minAmount) {
      toast.error(`Minimum withdrawal amount is ₹${minAmount.toLocaleString()}`);
      return;
    }

    if (withdrawAmount > withdrawable) {
      toast.error(
        `Only ₹${withdrawable.toLocaleString()} is currently available for withdrawal. ₹${locked.toLocaleString()} is under the 7-day holding period.`
      );
      return;
    }

    if (method === 'UPI') {
      if (!upiId.trim()) {
        toast.error('Please enter your UPI ID');
        return;
      }
      if (!upiId.includes('@')) {
        toast.error('Please enter a valid UPI ID (e.g. yourname@upi)');
        return;
      }
    } else {
      if (!bankDetails.accountHolderName.trim()) {
        toast.error('Account holder name is required');
        return;
      }
      if (!bankDetails.accountNumber.trim()) {
        toast.error('Bank account number is required');
        return;
      }
      if (bankDetails.accountNumber !== bankDetails.confirmAccountNumber) {
        toast.error('Account numbers do not match');
        return;
      }
      if (!bankDetails.ifscCode.trim()) {
        toast.error('IFSC code is required');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        amount: withdrawAmount,
        method,
        upiId: method === 'UPI' ? upiId.trim() : undefined,
        bankDetails:
          method === 'Bank Transfer'
            ? {
                accountHolderName: bankDetails.accountHolderName.trim(),
                accountNumber: bankDetails.accountNumber.trim(),
                ifscCode: bankDetails.ifscCode.trim().toUpperCase(),
                bankName: bankDetails.bankName.trim(),
              }
            : undefined,
      };

      const res = await walletService.requestWithdrawal(payload);
      if (res.success) {
        toast.success(res.message || 'Withdrawal request submitted successfully!');
        setAmount('');
        // Re-fetch updated summary and history
        await fetchData(false);
      } else {
        toast.error(res.message || 'Failed to submit withdrawal request');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Error processing withdrawal request');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredWithdrawals = withdrawals.filter((item) => {
    if (historyTab === 'ALL') return true;
    return item.status?.toLowerCase() === historyTab.toLowerCase();
  });

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 lg:p-8 text-white shadow-lg relative overflow-hidden border border-slate-700/60">
        <div className="absolute right-0 top-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-semibold mb-2">
              <ShieldCheck size={14} />
              <span>Direct Bank & UPI Payouts</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
              Wallet & Withdrawals
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Manage your task earnings, request payouts to your UPI or Bank Account, and track the 7-day maturity status of your approved tasks.
            </p>
          </div>

          <button
            onClick={() => fetchData(true)}
            disabled={refreshing || loading}
            className="self-start md:self-center inline-flex items-center gap-2 px-4 py-2 bg-slate-800/90 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition shadow-xs active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Balance'}</span>
          </button>
        </div>
      </div>

      {/* 3 Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total Wallet Balance */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Wallet Balance
            </span>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
              <Wallet size={20} />
            </div>
          </div>
          <div className="mt-5">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                ₹{totalWallet.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-500" />
              <span>Total earnings across all approved tasks</span>
            </p>
          </div>
        </div>

        {/* Card 2: Available to Withdraw */}
        <div className="bg-white rounded-2xl p-6 border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/40 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Available to Withdraw
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <ArrowDownToLine size={20} />
            </div>
          </div>
          <div className="mt-5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-950 tracking-tight">
                ₹{withdrawable.toLocaleString()}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                  withdrawable >= minAmount
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {withdrawable >= minAmount ? 'Ready for Payout' : `Min. ₹${minAmount}`}
              </span>
            </div>
            <p className="text-xs text-emerald-700 mt-2 flex items-center gap-1.5 font-medium">
              <Check size={13} className="text-emerald-600" />
              <span>Task earnings matured past 7-day holding period</span>
            </p>
          </div>
        </div>

        {/* Card 3: 7-Day Holding (Locked) */}
        <div className="bg-white rounded-2xl p-6 border border-amber-200 bg-gradient-to-br from-white to-amber-50/40 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              7-Day Holding (Locked)
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
              <Lock size={20} />
            </div>
          </div>
          <div className="mt-5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-950 tracking-tight">
                ₹{locked.toLocaleString()}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                {maturingList.length} task{maturingList.length !== 1 ? 's' : ''} maturing
              </span>
            </div>
            <p className="text-xs text-amber-700 mt-2 flex items-center gap-1.5 font-medium">
              <Clock size={13} className="text-amber-600" />
              <span>Automatically unlocks 7 days after task approval</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Withdrawal Form & 7-Day Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Withdrawal Request Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 lg:p-7 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Request Withdrawal</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Withdraw your matured earnings directly to your bank account or UPI ID.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              Min. ₹{minAmount}
            </span>
          </div>

          {/* If withdrawable is less than minimum, display educational alert */}
          {withdrawable < minAmount ? (
            <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold">
                    {withdrawable === 0
                      ? 'Earnings are in the 7-day holding period'
                      : `Minimum withdrawal requirement not met (₹${minAmount})`}
                  </h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    {withdrawable === 0 ? (
                      <>
                        You currently have <strong>₹{locked.toLocaleString()}</strong> in task earnings.
                        According to company policy, task earnings remain in a 7-day safety holding period
                        after task approval. Your funds will automatically become withdrawable once this
                        period completes.
                      </>
                    ) : (
                      <>
                        You have <strong>₹{withdrawable.toLocaleString()}</strong> available, but the
                        minimum withdrawal request is <strong>₹{minAmount}</strong>. Complete more tasks or
                        wait for your locked earnings to mature to submit a payout request.
                      </>
                    )}
                  </p>
                  {maturingList.length > 0 && (
                    <p className="text-xs font-bold text-amber-900 mt-2">
                      💡 Earliest unlocking: {new Date(maturingList[0].maturesAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })} ({maturingList[0].daysRemaining} days left)
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-5">
            {/* Amount Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Withdrawal Amount (₹)
                </label>
                <span className="text-xs font-semibold text-emerald-700">
                  Available: ₹{withdrawable.toLocaleString()}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-lg">
                  ₹
                </span>
                <input
                  type="number"
                  min={minAmount}
                  max={withdrawable}
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Enter amount (min. ₹${minAmount})`}
                  disabled={withdrawable < minAmount}
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-base focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>

              {/* Quick Amount Buttons */}
              {withdrawable >= minAmount && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] font-semibold text-slate-400">Quick Select:</span>
                  {[500, 1000, 2000].map((quickVal) => {
                    if (quickVal <= withdrawable) {
                      return (
                        <button
                          key={quickVal}
                          type="button"
                          onClick={() => setAmount(quickVal.toString())}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        >
                          ₹{quickVal}
                        </button>
                      );
                    }
                    return null;
                  })}
                  <button
                    type="button"
                    onClick={() => setAmount(withdrawable.toString())}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition ml-auto"
                  >
                    Max (₹{withdrawable})
                  </button>
                </div>
              )}
            </div>

            {/* Payout Method Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Payout Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod('UPI')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-bold transition ${
                    method === 'UPI'
                      ? 'border-orange-500 bg-orange-50/80 text-orange-950 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard size={16} className={method === 'UPI' ? 'text-orange-600' : 'text-slate-400'} />
                  <span>UPI Transfer (Instant)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('Bank Transfer')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-bold transition ${
                    method === 'Bank Transfer'
                      ? 'border-orange-500 bg-orange-50/80 text-orange-950 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building2 size={16} className={method === 'Bank Transfer' ? 'text-orange-600' : 'text-slate-400'} />
                  <span>Direct Bank Account</span>
                </button>
              </div>
            </div>

            {/* UPI Details */}
            {method === 'UPI' ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Enter Your UPI ID (VPA) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. mobileNumber@upi or name@okaxis"
                  disabled={withdrawable < minAmount}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition disabled:opacity-50"
                  required
                />
                <p className="text-[11px] text-slate-400">
                  Ensure the UPI ID is active and linked to your bank account for instant transfer.
                </p>
              </div>
            ) : (
              /* Bank Account Details */
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Holder Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bankDetails.accountHolderName}
                    onChange={(e) => handleBankChange('accountHolderName', e.target.value)}
                    placeholder="Full name as printed on bank passbook"
                    disabled={withdrawable < minAmount}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-orange-500 transition disabled:opacity-50"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Account Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={bankDetails.accountNumber}
                      onChange={(e) => handleBankChange('accountNumber', e.target.value)}
                      placeholder="e.g. 012345678901"
                      disabled={withdrawable < minAmount}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-orange-500 transition disabled:opacity-50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Account Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={bankDetails.confirmAccountNumber}
                      onChange={(e) => handleBankChange('confirmAccountNumber', e.target.value)}
                      placeholder="Re-enter account number"
                      disabled={withdrawable < minAmount}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-orange-500 transition disabled:opacity-50"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      IFSC Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={bankDetails.ifscCode}
                      onChange={(e) => handleBankChange('ifscCode', e.target.value.toUpperCase())}
                      placeholder="e.g. SBIN0001234"
                      disabled={withdrawable < minAmount}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium uppercase focus:ring-2 focus:ring-orange-500 transition disabled:opacity-50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Bank Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={bankDetails.bankName}
                      onChange={(e) => handleBankChange('bankName', e.target.value)}
                      placeholder="e.g. State Bank of India"
                      disabled={withdrawable < minAmount}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-orange-500 transition disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Note about Super Admin Approval */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-start gap-2.5">
              <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <span>
                All withdrawal requests are sent directly to <strong>Super Admin</strong> for payout
                verification. Upon approval, funds are transferred via IMPS/UPI and the transaction reference
                (UTR) will be updated in your history. If rejected, the amount is automatically refunded back
                to your wallet.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={withdrawable < minAmount || submitting}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
            >
              {submitting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <ArrowDownToLine size={16} />
                  <span>
                    Submit Withdrawal Request {amount ? `(₹${Number(amount).toLocaleString()})` : ''}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: 7-Day Maturation Schedule (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 lg:p-7 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">7-Day Holding Schedule</h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                ₹{locked.toLocaleString()} locked
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Task earnings are released 7 days after approval. Below is the exact unlock timeline for each of your approved tasks:
            </p>

            {maturingList.length === 0 ? (
              <div className="text-center py-10 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-800">No Pending Holding Funds</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  All your task earnings have completed the 7-day maturity period and are 100% available for withdrawal!
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                {maturingList.map((item, idx) => {
                  const unlockDate = new Date(item.maturesAt);
                  const approvedDate = new Date(item.approvedAt);
                  const daysLeft = item.daysRemaining;

                  return (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-50/80 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                            {item.taskTitle || 'Task Earnings'}
                          </h4>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">
                            Approved: {approvedDate.toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <span className="text-xs font-black text-slate-900 shrink-0">
                          +₹{item.amount?.toLocaleString()}
                        </span>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 flex items-center gap-1 font-medium">
                          <Calendar size={12} className="text-amber-500" />
                          Unlocks: {unlockDate.toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md text-[10px]">
                          {daysLeft <= 0 ? 'Unlocks Today' : `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck size={14} className="text-slate-400 shrink-0" />
            <span>Automated 7-day maturation verification protects associates and client proof validity.</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Withdrawal Request History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Withdrawal Request History</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status and transaction records of all your withdrawal requests.
            </p>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {['ALL', 'Pending', 'Approved', 'Rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => setHistoryTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  historyTab === tab
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table / List */}
        {filteredWithdrawals.length === 0 ? (
          <div className="text-center py-12 px-4">
            <FileText size={36} className="text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No Withdrawal Requests Found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {historyTab === 'ALL'
                ? 'You have not submitted any withdrawal requests yet. Your requests will appear here once submitted.'
                : `No requests currently in '${historyTab}' status.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payout Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">UTR / Remarks</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWithdrawals.map((item) => {
                  const reqDate = new Date(item.createdAt);
                  const isApproved = item.status === 'Approved';
                  const isPending = item.status === 'Pending';
                  const isRejected = item.status === 'Rejected';

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {item.withdrawalId}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {reqDate.toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        <span className="text-[10px] text-slate-400">
                          {reqDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                        ₹{item.amount?.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {item.method === 'UPI' ? (
                            <CreditCard size={14} className="text-orange-500" />
                          ) : (
                            <Building2 size={14} className="text-blue-500" />
                          )}
                          <span className="font-semibold text-slate-800">{item.method}</span>
                          <span className="text-[10px] text-slate-400">
                            ({item.method === 'UPI' ? item.upiId : item.bankDetails?.bankName || 'Bank'})
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 size={12} />
                            <span>Paid</span>
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock size={12} />
                            <span>Under Review</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle size={12} />
                            <span>Rejected & Refunded</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {isApproved && item.transactionId ? (
                          <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            UTR: {item.transactionId}
                          </span>
                        ) : isRejected && item.rejectionReason ? (
                          <span className="text-rose-600 text-[11px] line-clamp-1" title={item.rejectionReason}>
                            Reason: {item.rejectionReason}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedReceipt(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition"
                          title="View Payout Receipt"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-orange-400" />
                <h3 className="font-bold text-sm">Payout Transaction Receipt</h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="text-center pb-4 border-b border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Withdrawal Amount
                </span>
                <h2 className="text-3xl font-black text-slate-900 mt-1">
                  ₹{selectedReceipt.amount?.toLocaleString()}
                </h2>
                <span
                  className={`inline-block mt-2 px-3 py-0.5 rounded-full font-bold text-[11px] ${
                    selectedReceipt.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : selectedReceipt.status === 'Pending'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}
                >
                  {selectedReceipt.status === 'Approved'
                    ? 'Paid / Transferred'
                    : selectedReceipt.status === 'Pending'
                    ? 'Pending Super Admin Review'
                    : 'Rejected & Refunded'}
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Request ID</span>
                  <span className="font-mono font-bold text-slate-800">{selectedReceipt.withdrawalId}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Requested On</span>
                  <span className="font-medium text-slate-800">
                    {new Date(selectedReceipt.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Payment Method</span>
                  <span className="font-bold text-slate-800">{selectedReceipt.method}</span>
                </div>

                {selectedReceipt.method === 'UPI' ? (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">UPI ID</span>
                    <span className="font-mono text-slate-800 font-semibold">{selectedReceipt.upiId}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Account Holder</span>
                      <span className="text-slate-800 font-semibold">
                        {selectedReceipt.bankDetails?.accountHolderName}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Account No.</span>
                      <span className="font-mono text-slate-800">
                        {selectedReceipt.bankDetails?.accountNumber}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">IFSC Code</span>
                      <span className="font-mono text-slate-800 uppercase">
                        {selectedReceipt.bankDetails?.ifscCode}
                      </span>
                    </div>
                  </>
                )}

                {selectedReceipt.status === 'Approved' && selectedReceipt.transactionId && (
                  <div className="flex justify-between py-1 border-b border-emerald-100 bg-emerald-50/60 px-2 rounded-lg">
                    <span className="text-emerald-800 font-bold">Bank UTR / Ref No.</span>
                    <span className="font-mono font-bold text-emerald-900">
                      {selectedReceipt.transactionId}
                    </span>
                  </div>
                )}

                {selectedReceipt.status === 'Rejected' && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 space-y-1">
                    <span className="font-bold block">Rejection Reason:</span>
                    <p className="text-rose-700">{selectedReceipt.rejectionReason || 'Not specified'}</p>
                    <span className="text-[10px] text-emerald-700 font-bold block pt-1">
                      ✓ Amount has been refunded back to your wallet balance.
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3">
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Withdrawals;
