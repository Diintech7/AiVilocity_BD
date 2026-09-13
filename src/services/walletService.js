import api from './api';

export const walletService = {
  // Get wallet summary with 7-day maturity breakdown
  getSummary: async () => {
    return await api.get('/withdrawals/summary');
  },

  // Submit withdrawal request
  requestWithdrawal: async (data) => {
    return await api.post('/withdrawals/request', data);
  },

  // Get my withdrawal history
  getMyWithdrawals: async () => {
    return await api.get('/withdrawals/my');
  },
};

export default walletService;
