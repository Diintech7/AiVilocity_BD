import React, { useState, useEffect } from 'react';
import {
  X,
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowDownToLine,
  CreditCard,
  Building2,
  Lock,
  Calendar,
  Sparkles,
  Info,
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import walletService from '../services/walletService';

export const WithdrawModal = ({ isOpen, onClose, onBalanceUpdated }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('withdraw'); // 'withdraw' | 'history'
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Summary data from backend
  const [summary, setSummary] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);

  // Form inputs
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

  const fetchSummaryAndHistory = async () => {
    setLoading(true);
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
    } catch (error) {
      toast.error('Failed to load wallet information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaryAndHistory();
  }, []);

  const totalWallet = summary?.totalWalletBalance ?? 0;
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
        `Only ₹${withdrawable.toLocaleString()} is currently available for withdrawal. ₹${locked.toLocaleString()} is under the 7-day maturity period.`
      );
      return;
    }

    if (method === 'UPI') {
      if (!upiId || !upiId.trim() || !upiId.includes('@')) {
        toast.error('Please enter a valid UPI ID (e.g. username@okhdfcbank)');
        return;
      }
    }

    if (method === 'Bank Transfer') {
      if (!bankDetails.accountNumber.trim()) {
        toast.error('Account number is required');
        return;
      }
      if (bankDetails.accountNumber !== bankDetails.confirmAccountNumber) {
        toast.error('Bank account numbers do not match');
        return;
      }
      if (!bankDetails.ifscCode.trim() || bankDetails.ifscCode.trim().length < 4) {
        toast.error('Please enter a valid IFSC code');
        return;
      }
      if (!bankDetails.accountHolderName.trim()) {
        toast.error('Account holder name is required');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        amount: withdrawAmount,
        method,
        upiId: method === 'UPI' ? upiId.trim() : undefined,
        bankDetails: method === 'Bank Transfer' ? bankDetails : undefined,
      };

      const res = await walletService.requestWithdrawal(payload);
      toast.success(res.message || 'Withdrawal request submitted to Super Admin!');

      // Reset form
      setAmount('');
      setUpiId('');
      setBankDetails({
        accountNumber: '',
        confirmAccountNumber: '',
        ifscCode: '',
        bankName: '',
        accountHolderName: '',
      });

      // Refresh data
      await fetchSummaryAndHistory();
      if (onBalanceUpdated) onBalanceUpdated(res.newWalletBalance);
      setActiveTab('history');
    } catch (error) {
      toast.error(error.message || 'Failed to submit withdrawal request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Banner */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 shrink-0 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
              <Wallet size={22} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block">
                BA Wallet & Payouts
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">Withdraw Earnings</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('withdraw')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'withdraw'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Withdraw Funds
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>Payout History</span>
            {withdrawals.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-orange-500 text-white">
                {withdrawals.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-400 font-medium">Checking wallet balances...</span>
            </div>
          ) : activeTab === 'withdraw' ? (
            <>
              {/* 3-Card Balance Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Total Wallet */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Total Wallet
                  </span>
                  <span className="text-lg font-black text-slate-900 block mt-0.5">
                    ₹{totalWallet.toLocaleString()}
                  </span>
                </div>

                {/* Withdrawable Balance (Matured) */}
                <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                      Available to Withdraw
                    </span>
                    <CheckCircle2 size={13} className="text-emerald-600" />
                  </div>
                  <span className="text-lg font-black text-emerald-700 block mt-0.5">
                    ₹{withdrawable.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    {withdrawable >= minAmount ? 'Ready for withdrawal' : 'Min ₹500 required'}
                  </span>
                </div>

                {/* 7-Day Holding (Locked) */}
                <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                      7-Day Holding
                    </span>
                    <Lock size={13} className="text-amber-600" />
                  </div>
                  <span className="text-lg font-black text-amber-800 block mt-0.5">
                    ₹{locked.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-amber-700 font-medium">
                    Matures 7 days post task
                  </span>
                </div>
              </div>

              {/* 7-Day Maturity Policy Alert & Maturing Schedule */}
              {locked > 0 && (
                <div className="p-4 bg-amber-50/70 border border-amber-200/90 rounded-xl space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-950">
                        7-Day Security Holding Policy
                      </h4>
                      <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                        As per standard corporate compliance, task reward earnings are held for 7 days before becoming available for withdrawal.
                      </p>
                    </div>
                  </div>

                  {/* Schedule of unlocking tasks */}
                  {maturingList.length > 0 && (
                    <div className="space-y-1.5 pt-1 border-t border-amber-200/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                        Upcoming Unlock Dates:
                      </span>
                      {maturingList.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs bg-white/80 p-2 rounded-lg border border-amber-200/50"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="font-bold text-slate-800 block truncate">
                              {item.taskName}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Approved on {new Date(item.approvedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-extrabold text-orange-600 block">
                              +₹{item.amount.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-semibold text-amber-700">
                              Unlocks: {new Date(item.unlockDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ({item.daysRemaining}d left)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Form: Amount and Payout Method */}
              <form onSubmit={handleFormSubmit} className="space-y-4 pt-1">
                {/* Amount Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Withdrawal Amount (₹)</label>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Min: <strong>₹{minAmount}</strong> • Max: <strong>₹{withdrawable.toLocaleString()}</strong>
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={`Enter amount (min ₹${minAmount})`}
                      min={minAmount}
                      max={withdrawable}
                      className="w-full pl-8 pr-24 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500"
                    />
                    {withdrawable >= minAmount && (
                      <button
                        type="button"
                        onClick={() => setAmount(String(withdrawable))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-md transition cursor-pointer"
                      >
                        Max All
                      </button>
                    )}
                  </div>
                </div>

                {/* Payout Method Tabs */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Select Payout Method
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setMethod('UPI')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        method === 'UPI'
                          ? 'border-orange-500 bg-orange-50/70 text-orange-950 font-bold shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <Sparkles size={16} className={method === 'UPI' ? 'text-orange-600' : 'text-slate-400'} />
                      <div>
                        <span className="text-xs block font-bold">UPI Transfer</span>
                        <span className="text-[10px] text-slate-500 font-normal">GPay, PhonePe, Paytm VPA</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMethod('Bank Transfer')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        method === 'Bank Transfer'
                          ? 'border-orange-500 bg-orange-50/70 text-orange-950 font-bold shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <Building2 size={16} className={method === 'Bank Transfer' ? 'text-orange-600' : 'text-slate-400'} />
                      <div>
                        <span className="text-xs block font-bold">Bank Account</span>
                        <span className="text-[10px] text-slate-500 font-normal">IMPS / NEFT Direct</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Method Specific Inputs */}
                {method === 'UPI' ? (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      UPI ID (VPA)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. mobile@upi, yourname@okhdfcbank"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Payout will be transferred directly to this UPI address upon Super Admin approval.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Account Holder Name
                        </label>
                        <input
                          type="text"
                          value={bankDetails.accountHolderName}
                          onChange={(e) => handleBankChange('accountHolderName', e.target.value)}
                          placeholder="Name as in bank account"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          value={bankDetails.bankName}
                          onChange={(e) => handleBankChange('bankName', e.target.value)}
                          placeholder="e.g. State Bank of India"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Bank Account Number
                        </label>
                        <input
                          type="password"
                          value={bankDetails.accountNumber}
                          onChange={(e) => handleBankChange('accountNumber', e.target.value)}
                          placeholder="Enter account number"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Confirm Account Number
                        </label>
                        <input
                          type="text"
                          value={bankDetails.confirmAccountNumber}
                          onChange={(e) => handleBankChange('confirmAccountNumber', e.target.value)}
                          placeholder="Re-enter account number"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          IFSC Code
                        </label>
                        <input
                          type="text"
                          value={bankDetails.ifscCode}
                          onChange={(e) => handleBankChange('ifscCode', e.target.value.toUpperCase())}
                          placeholder="e.g. SBIN0001234"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 uppercase focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Notice */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-xs text-slate-600">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  <span>Withdrawal requests are reviewed and disbursed securely by Super Admin.</span>
                </div>

                {/* Action Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting || withdrawable < minAmount}
                    className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting to Super Admin...</span>
                      </>
                    ) : withdrawable < minAmount ? (
                      <span>Need Min ₹{minAmount} Available to Withdraw</span>
                    ) : (
                      <>
                        <ArrowDownToLine size={15} />
                        <span>Submit Withdrawal Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* History Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Your Withdrawal Requests ({withdrawals.length})
                </span>
                <button
                  type="button"
                  onClick={fetchSummaryAndHistory}
                  className="text-xs text-orange-600 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                >
                  <RefreshCw size={11} /> Refresh
                </button>
              </div>

              {withdrawals.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-xs">
                  No withdrawal requests made yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {withdrawals.map((w) => (
                    <div
                      key={w._id}
                      className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            {w.withdrawalId}
                          </span>
                          <span className="text-sm font-black text-slate-900">
                            ₹{w.amount.toLocaleString()}
                          </span>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                            w.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : w.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {w.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">
                        <span>
                          Method: <strong>{w.method}</strong> ({w.method === 'UPI' ? w.upiId : w.bankDetails?.accountNumber})
                        </span>
                        <span>
                          {new Date(w.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* Transaction ID if Approved */}
                      {w.status === 'Approved' && w.transactionId && (
                        <div className="p-2 bg-emerald-50 rounded-lg text-[11px] text-emerald-900 font-medium">
                          Ref/UTR: <span className="font-bold">{w.transactionId}</span>
                        </div>
                      )}

                      {/* Rejection Reason if Rejected */}
                      {w.status === 'Rejected' && w.rejectionReason && (
                        <div className="p-2 bg-rose-50 rounded-lg text-[11px] text-rose-900 font-medium">
                          Reason: <span className="font-bold">{w.rejectionReason}</span> (Amount refunded to wallet)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            7-day holding period applies to all task earnings.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200/70 rounded-lg transition cursor-pointer ml-auto"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default WithdrawModal;
