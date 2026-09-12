import api from './api';

export const taskService = {
  // Get all tasks belonging to registered campaigns
  getTasks: async () => {
    return await api.get('/tasks');
  },

  // Accept a task
  acceptTask: async (taskId) => {
    return await api.post(`/tasks/${taskId}/accept`);
  },

  // Get current BA's accepted and submitted tasks
  getMyTasks: async () => {
    return await api.get('/tasks/my-tasks');
  },

  // Submit task with proof (photo, latitude, longitude, interestLevel, feedback)
  submitTaskProof: async (taskId, formData) => {
    return await api.post(`/tasks/${taskId}/submit`, formData);
  },
};

export default taskService;
