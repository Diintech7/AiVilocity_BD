import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Lock,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  User,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp,
  Award,
  ChevronLeft,
  Check,
  CheckCircle,
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
  const [loading, setLoading] = useState(false);

  // Password Visibility toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // --- Login State ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // --- Multi-Step Signup State ---
  // Steps: 1: Email/Pass, 2: Verify Email OTP, 3: Send Phone OTP, 4: Verify Phone OTP, 5: Complete Profile
  const [signupStep, setSignupStep] = useState(1);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [phone, setPhone] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');

  // Profile fields
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [place, setPlace] = useState('');
  const [pincode, setPincode] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  // ─── 0. Google Login Handler ───────────────────────────────────────
  const handleGoogleCredentialResponse = async (response) => {
    if (!response?.credential) {
      toast.error('Google Sign-In credential not received');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.googleLogin(response.credential);
      const token = res.token || res.data?.token;

      if (res && res.success && token) {
        if (res.isProfileComplete === false) {
          localStorage.setItem('ba_token', token);
          toast.info('Google login successful! Please complete your BA profile.');

          if (res.data?.name) setName(res.data.name);
          if (res.data?.email) setSignupEmail(res.data.email);

          setActiveTab('signup');
          setSignupStep(res.isPhoneVerified ? 5 : 3);
        } else {
          login(token, res.data);
          toast.success(`Welcome back, ${res.data?.name || 'Associate'}!`);
          navigate('/');
        }
      } else {
        throw new Error(res?.message || 'Google authentication failed');
      }
    } catch (error) {
      console.error('Google Auth Error:', error);
      toast.error(error.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Google Identity Services (GIS) Initializer
  useEffect(() => {
    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      '485907691397-bhenpjqa3gdmnaceql2ruveb5rrbb667.apps.googleusercontent.com';

    const renderGoogleBtn = () => {
      if (!window.google?.accounts?.id) return false;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
        });

        const targetId = activeTab === 'login' ? 'googleSignInBtn' : 'googleSignUpBtn';
        const targetEl = document.getElementById(targetId);

        if (targetEl) {
          targetEl.innerHTML = '';
          window.google.accounts.id.renderButton(targetEl, {
            theme: 'filled_black',
            size: 'large',
            width: 320,
            text: activeTab === 'login' ? 'signin_with' : 'signup_with',
            shape: 'pill',
            logo_alignment: 'left',
          });
          return true;
        }
      } catch (err) {
        console.error('GIS render error:', err);
      }
      return false;
    };

    if (!renderGoogleBtn()) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (renderGoogleBtn() || attempts > 20) {
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [activeTab, signupStep]);

  // ─── 1. Login Handler ──────────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Please provide email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login(loginEmail, loginPassword);
      const token = res.token || res.data?.token;
      if (res && res.success && token) {
        login(token, res.data);
        toast.success(`Welcome back, ${res.data?.name || 'Associate'}!`);
        navigate('/');
      } else {
        throw new Error(res?.message || 'Login failed');
      }
    } catch (error) {
      toast.error(error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // ─── 2. Signup Step 1: Send Email OTP ─────────────────────────────
  const handleSendEmailOtp = async (e) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword) {
      toast.error('Email and password are required');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.signup(signupEmail, signupPassword);
      toast.success(res.message || 'OTP sent to your email!');
      setSignupStep(2);
    } catch (error) {
      toast.error(error.message || 'Failed to start registration');
    } finally {
      setLoading(false);
    }
  };

  // ─── 3. Signup Step 2: Verify Email OTP ───────────────────────────
  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    if (!emailOtp) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.verifyEmailOtp(signupEmail, emailOtp);
      const token = res.token || res.data?.token;
      if (token) {
        localStorage.setItem('ba_token', token);
        toast.success('Email verified! Now verify your WhatsApp mobile.');
        setSignupStep(3);
      }
    } catch (error) {
      toast.error(error.message || 'Invalid Email OTP');
    } finally {
      setLoading(false);
    }
  };

  // ─── 4. Signup Step 3: Send WhatsApp Mobile OTP ───────────────────
  const handleSendMobileOtp = async (e) => {
    e.preventDefault();
    if (!phone) {
      toast.error('Please enter your WhatsApp mobile number');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.sendMobileOtp(phone);
      toast.success(res.message || 'OTP sent to your WhatsApp!');
      setSignupStep(4);
    } catch (error) {
      toast.error(error.message || 'Failed to send WhatsApp OTP');
    } finally {
      setLoading(false);
    }
  };

  // ─── 5. Signup Step 4: Verify Mobile OTP ──────────────────────────
  const handleVerifyMobileOtp = async (e) => {
    e.preventDefault();
    if (!mobileOtp) {
      toast.error('Please enter the OTP received on WhatsApp');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.verifyMobileOtp(mobileOtp);
      toast.success('Phone verified! Please complete your BA Profile.');
      setSignupStep(5);
    } catch (error) {
      toast.error(error.message || 'Invalid Mobile OTP');
    } finally {
      setLoading(false);
    }
  };

  // ─── 6. Signup Step 5: Complete Profile ───────────────────────────
  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    if (!name || !place || !pincode) {
      toast.error('Name, place, and pincode are required');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('dob', dob);
    formData.append('place', place);
    formData.append('pincode', pincode);
    formData.append('education', education);
    formData.append('experience', experience);
    if (photo) {
      formData.append('photo', photo);
    }

    setLoading(true);
    try {
      const res = await authService.completeProfile(formData);
      const token = res.token || res.data?.token || localStorage.getItem('ba_token');
      if (res && res.success && res.data) {
        login(token, res.data);
        toast.success('BA Profile Completed! Welcome to Ailocity.');
        navigate('/');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const stepLabels = [
    { num: 1, title: 'Account' },
    { num: 2, title: 'Email OTP' },
    { num: 3, title: 'WhatsApp' },
    { num: 4, title: 'Verify' },
    { num: 5, title: 'Profile' }
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-center relative overflow-hidden font-sans select-none">
      {/* Background Animated Gradient Mesh */}
      <div className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] bg-gradient-to-br from-orange-600/15 via-amber-600/10 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[55vw] h-[55vw] bg-gradient-to-tl from-orange-500/15 via-amber-500/10 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] bg-slate-900/30 rounded-full blur-[160px] pointer-events-none" />

      {/* Decorative Grid Lines */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ────────────── LEFT HERO SHOWCASE (DESKTOP) ────────────── */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-8 pr-4">
            
            {/* Brand Logo & Chip */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-500/30 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                <span className="text-[11px] font-bold text-orange-400 uppercase tracking-widest">
                  India's Premier Fieldwork Network
                </span>
              </div>

              <div className="flex items-center gap-3.5 pt-2">
                <div className="w-12 h-12 rounded-xl bg-black border border-slate-700/80 p-1 flex items-center justify-center shadow-lg shadow-orange-500/10 overflow-hidden shrink-0">
                  <img
                    src="/logo.png"
                    alt="Ailocity Logo"
                    className="w-full h-full object-contain rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <span className="hidden text-white font-black text-2xl tracking-tight">A</span>
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
                    AILOCITY
                    <span className="text-xs px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold uppercase">
                      BA Portal
                    </span>
                  </h1>
                  <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase mt-0.5">
                    Business Associate & Field Execution Network
                  </p>
                </div>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h2 className="text-4xl font-extrabold text-white tracking-tight leading-[1.15]">
                Turn Ground Presence into <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">
                  Guaranteed Daily Earnings
                </span>
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                Join verified field professionals executing high-value corporate campaigns, geo-tagged verifications, and market drives with automated wallet payouts.
              </p>
            </div>

            {/* Feature Cards Showcase */}
            <div className="space-y-3.5 pt-1">
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md hover:border-orange-500/40 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-all">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-200">Instant Wallet Credits</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                    Complete tasks with GPS and photo proof; get paid directly into your wallet upon approval.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md hover:border-orange-500/40 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <Award size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-200">Certified Training & Tests</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                    Interactive video modules, quizzes, and verifiable PDF completion certificates.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md hover:border-orange-500/40 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-200">Verified WhatsApp Security</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                    Dual-channel verification with Official Meta Cloud OTP for field authenticity.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
                <p className="text-lg font-black text-white">50,000+</p>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">Active BAs</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
                <p className="text-lg font-black text-amber-400">₹2.4 Cr+</p>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">Paid Out</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
                <p className="text-lg font-black text-emerald-400">99.4%</p>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">Task Accuracy</p>
              </div>
            </div>

          </div>

          {/* ────────────── RIGHT AUTH CARD ────────────── */}
          <div className="w-full lg:col-span-6 max-w-md mx-auto">
            
            {/* Mobile Header (Shown on Small Screens) */}
            <div className="lg:hidden flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-black border border-slate-700 p-1 flex items-center justify-center shadow-lg shadow-orange-500/10 mb-2.5 overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Ailocity Logo"
                  className="w-full h-full object-contain rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="hidden text-white font-black text-xl">A</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Ailocity BA Portal</h2>
              <p className="text-xs text-slate-400 mt-0.5">Business Associate & Fieldwork Network</p>
            </div>

            {/* Glassmorphic Card Container */}
            <div className="bg-slate-900/85 border border-slate-800/90 rounded-xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl ring-1 ring-white/5 relative">
              
              {/* Subtle Ambient Highlight */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>

              {/* Segmented Tab Switcher */}
              <div className="relative p-1 bg-slate-950/80 border border-slate-800 rounded-lg grid grid-cols-2 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setSignupStep(1);
                  }}
                  className={`py-2.5 text-xs font-extrabold rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    activeTab === 'login'
                      ? 'bg-gradient-to-r from-[#ff5a1f] to-amber-500 text-white shadow-lg shadow-orange-500/25 ring-1 ring-orange-400/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Lock size={13} />
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className={`py-2.5 text-xs font-extrabold rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    activeTab === 'signup'
                      ? 'bg-gradient-to-r from-[#ff5a1f] to-amber-500 text-white shadow-lg shadow-orange-500/25 ring-1 ring-orange-400/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles size={13} />
                  New Registration
                </button>
              </div>

              {/* ─────────────────── TAB 1: LOGIN ─────────────────── */}
              {activeTab === 'login' && (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white tracking-tight">Sign in to your account</h3>
                    <p className="text-xs text-slate-400">Enter your credentials to access your field dashboard</p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    {/* Email Input */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Registered Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="associate@gmail.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-700/80 text-white placeholder-slate-500 text-xs rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                          Password
                        </label>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-700/80 text-white placeholder-slate-500 text-xs rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-2 py-3 bg-gradient-to-r from-[#ff5a1f] to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Authenticating...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In to Dashboard</span>
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>

                    {/* Or Divider */}
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-800"></div>
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                        <span className="bg-slate-900 px-3 text-slate-400">Or continue with</span>
                      </div>
                    </div>

                    {/* Google Sign In Container */}
                    <div className="w-full flex justify-center min-h-[44px] py-1">
                      <div id="googleSignInBtn" className="flex justify-center w-full"></div>
                    </div>
                  </form>
                </div>
              )}

              {/* ─────────────────── TAB 2: SIGNUP / ONBOARDING ─────────────────── */}
              {activeTab === 'signup' && (
                <div className="space-y-5">
                  
                  {/* Step Progress Tracker */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      {stepLabels.map((s) => {
                        const isCompleted = signupStep > s.num;
                        const isCurrent = signupStep === s.num;
                        return (
                          <div key={s.num} className="flex flex-col items-center">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${
                                isCurrent
                                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white ring-4 ring-orange-500/20 shadow-md shadow-orange-500/30'
                                  : isCompleted
                                  ? 'bg-emerald-500 text-white shadow-xs'
                                  : 'bg-slate-800 text-slate-500 border border-slate-700/60'
                              }`}
                            >
                              {isCompleted ? <Check size={13} /> : s.num}
                            </div>
                            <span className={`text-[9px] font-bold mt-1 tracking-tight ${isCurrent ? 'text-orange-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
                              {s.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {/* Progress Track Line */}
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-amber-500 h-full transition-all duration-300"
                        style={{ width: `${((signupStep - 1) / 4) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* ─── Step 1: Email & Password ─── */}
                  {signupStep === 1 && (
                    <form onSubmit={handleSendEmailOtp} className="space-y-4 pt-1">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-white">Create Account</h4>
                        <p className="text-[11px] text-slate-400">Step 1: Enter your email to receive verification OTP</p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            placeholder="your.email@gmail.com"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-700/80 text-white placeholder-slate-500 text-xs rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                          Create Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type={showSignupPassword ? 'text' : 'password'}
                            required
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            placeholder="Min. 6 characters"
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-700/80 text-white placeholder-slate-500 text-xs rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignupPassword(!showSignupPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-1 py-3 bg-gradient-to-r from-[#ff5a1f] to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? 'Sending Verification OTP...' : 'Continue & Send Email OTP'}
                        <ArrowRight size={15} />
                      </button>

                      {/* Divider */}
                      <div className="relative my-3">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-slate-800"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                          <span className="bg-slate-900 px-3 text-slate-400">Or sign up with</span>
                        </div>
                      </div>

                      {/* Google Sign Up Container */}
                      <div className="w-full flex justify-center min-h-[44px]">
                        <div id="googleSignUpBtn" className="flex justify-center w-full"></div>
                      </div>
                    </form>
                  )}

                  {/* ─── Step 2: Verify Email OTP ─── */}
                  {signupStep === 2 && (
                    <form onSubmit={handleVerifyEmailOtp} className="space-y-4 pt-1">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-bold text-white">Email Verification</h4>
                          <p className="text-[11px] text-slate-400">
                            Enter the 6-digit code sent to <strong className="text-orange-400">{signupEmail}</strong>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSignupStep(1)}
                          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-xs flex items-center gap-1"
                        >
                          <ChevronLeft size={14} /> Back
                        </button>
                      </div>

                      <div>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={emailOtp}
                          onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="1 2 3 4 5 6"
                          className="w-full text-center tracking-[0.4em] text-2xl font-black py-3 bg-slate-950/80 border border-slate-700/80 text-orange-400 rounded-xl focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? 'Verifying...' : 'Verify Email Code'}
                        <ArrowRight size={15} />
                      </button>
                    </form>
                  )}

                  {/* ─── Step 3: Enter WhatsApp Number ─── */}
                  {signupStep === 3 && (
                    <form onSubmit={handleSendMobileOtp} className="space-y-4 pt-1">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-white">WhatsApp Verification</h4>
                        <p className="text-[11px] text-slate-400">
                          Enter your WhatsApp mobile number to receive official field notifications
                        </p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                          WhatsApp Mobile Number
                        </label>
                        <div className="relative flex items-center">
                          <div className="absolute left-3 flex items-center gap-1.5 text-slate-400 border-r border-slate-700 pr-2">
                            <span className="text-xs">🇮🇳</span>
                            <span className="text-xs font-bold text-slate-300">+91</span>
                          </div>
                          <input
                            type="tel"
                            maxLength={10}
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="9876543210"
                            className="w-full pl-20 pr-4 py-2.5 bg-slate-950/60 border border-slate-700/80 text-white placeholder-slate-500 text-xs rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-mono"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? 'Sending WhatsApp OTP...' : 'Send WhatsApp OTP'}
                        <Phone size={14} />
                      </button>
                    </form>
                  )}

                  {/* ─── Step 4: Verify Mobile OTP ─── */}
                  {signupStep === 4 && (
                    <form onSubmit={handleVerifyMobileOtp} className="space-y-4 pt-1">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-bold text-white">Verify WhatsApp OTP</h4>
                          <p className="text-[11px] text-slate-400">
                            Enter the 6-digit code received on WhatsApp <strong className="text-emerald-400">(+91 {phone})</strong>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSignupStep(3)}
                          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-xs flex items-center gap-1"
                        >
                          <ChevronLeft size={14} /> Change
                        </button>
                      </div>

                      <div>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={mobileOtp}
                          onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="1 2 3 4 5 6"
                          className="w-full text-center tracking-[0.4em] text-2xl font-black py-3 bg-slate-950/80 border border-slate-700/80 text-emerald-400 rounded-xl focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? 'Verifying...' : 'Verify WhatsApp Code'}
                        <CheckCircle size={15} />
                      </button>
                    </form>
                  )}

                  {/* ─── Step 5: Complete BA Profile ─── */}
                  {signupStep === 5 && (
                    <form onSubmit={handleCompleteProfile} className="space-y-3.5 pt-1">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-white">Complete BA Profile</h4>
                        <p className="text-[11px] text-slate-400">Fill your profile details to unlock live field tasks</p>
                      </div>

                      {/* Photo Upload with Preview */}
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                        <div className="relative w-14 h-14 rounded-full bg-slate-800 border border-orange-500 overflow-hidden shrink-0 flex items-center justify-center">
                          {photoPreview ? (
                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-7 h-7 text-slate-500" />
                          )}
                          <label className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                            <Camera size={18} className="text-white" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                            Profile Picture
                          </label>
                          <label className="inline-block mt-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-lg cursor-pointer border border-slate-700 transition-colors">
                            {photoPreview ? 'Change Photo' : 'Upload Passport Photo'}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Full Name */}
                      <div>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Full Name as on Aadhar *"
                          className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 text-white placeholder-slate-500 text-xs rounded-xl focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      {/* DOB and City */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Date of Birth</label>
                          <input
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-950/60 border border-slate-700/80 text-white text-xs rounded-xl focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">City / Region *</label>
                          <input
                            type="text"
                            required
                            value={place}
                            onChange={(e) => setPlace(e.target.value)}
                            placeholder="e.g. Lucknow, UP"
                            className="w-full px-3 py-2 bg-slate-950/60 border border-slate-700/80 text-white placeholder-slate-500 text-xs rounded-xl focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Pincode and Education */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                          placeholder="Postal Pincode *"
                          className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 text-white placeholder-slate-500 text-xs rounded-xl focus:border-orange-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={education}
                          onChange={(e) => setEducation(e.target.value)}
                          placeholder="Education (e.g. Graduate)"
                          className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 text-white placeholder-slate-500 text-xs rounded-xl focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      {/* Experience */}
                      <input
                        type="text"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="Work Experience (e.g. 1 Year Field Marketing)"
                        className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 text-white placeholder-slate-500 text-xs rounded-xl focus:border-orange-500 focus:outline-none"
                      />

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loading ? 'Completing Registration...' : 'Complete Profile & Start Working'}
                        <ArrowRight size={15} />
                      </button>
                    </form>
                  )}

                </div>
              )}

              {/* Bottom Security Assurance */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-slate-500 text-[11px]">
                <ShieldCheck size={14} className="text-orange-500" />
                <span>256-bit Encrypted Session • Authorized Field Gateway</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
