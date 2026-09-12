import api from './api';

export const campaignService = {
  // Get all active campaigns available for BA
  getCampaigns: async () => {
    return await api.get('/campaigns');
  },

  // Register for a campaign
  registerCampaign: async (campaignId) => {
    return await api.post(`/campaigns/${campaignId}/register`);
  },

  // Get campaigns registered by the current BA
  getMyCampaigns: async () => {
    return await api.get('/campaigns/my-campaigns');
  },
};

export default campaignService;
