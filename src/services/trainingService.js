import api from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const trainingService = {
  // Get all trainings (answers are stripped safely by backend)
  getTrainings: async () => {
    return await api.get('/trainings');
  },

  // Submit quiz answers for a module (answers: [{ questionIndex, selectedOption }])
  submitQuiz: async (trainingId, moduleIdx, answers) => {
    return await api.post(`/trainings/${trainingId}/module/${moduleIdx}/submit`, { answers });
  },

  // Get current BA's progress on a training
  getProgress: async (trainingId) => {
    return await api.get(`/trainings/${trainingId}/progress`);
  },

  // Download PDF certificate
  downloadCertificate: async (trainingId, trainingTitle = 'Certificate') => {
    const token = localStorage.getItem('ba_token');
    const response = await fetch(`${API_BASE_URL}/trainings/${trainingId}/certificate`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to download certificate');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${trainingTitle.replace(/\s+/g, '_')}_Certificate.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};

export default trainingService;
