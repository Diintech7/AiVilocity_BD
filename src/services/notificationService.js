import api from './api';

export const notificationService = {
  // Get notifications for current BA
  getNotifications: async () => {
    return await api.get('/notifications');
  },
};

export default notificationService;
