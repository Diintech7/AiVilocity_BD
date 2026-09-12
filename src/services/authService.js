import api from './api';

export const authService = {
  // Step 1: Signup with Email
  signup: async (email, password) => {
    return await api.post('/bds/auth/signup', { email, password });
  },

  // Step 2: Verify Email OTP
  verifyEmailOtp: async (email, otp) => {
    return await api.post('/bds/auth/verify-email-otp', { email, otp });
  },

  // Step 3: Trigger Mobile WhatsApp OTP
  sendMobileOtp: async (phone) => {
    return await api.post('/bds/auth/send-mobile-otp', { phone });
  },

  // Step 4: Verify Mobile OTP
  verifyMobileOtp: async (otp) => {
    return await api.post('/bds/auth/verify-mobile-otp', { otp });
  },

  // Regular Email/Password Login
  login: async (email, password) => {
    return await api.post('/bds/auth/login', { email, password });
  },

  // Google OAuth Login
  googleLogin: async (googleToken) => {
    return await api.post('/bds/auth/google-login', { token: googleToken });
  },

  // Complete Profile with Photo & Location (FormData)
  completeProfile: async (formData) => {
    return await api.post('/bds/auth/complete-profile', formData);
  },

  // Get current BA profile & balance
  getProfile: async () => {
    return await api.get('/bds/auth/profile');
  },

  // Update BA profile (FormData)
  updateProfile: async (formData) => {
    return await api.put('/bds/auth/profile', formData);
  },
};

export default authService;
