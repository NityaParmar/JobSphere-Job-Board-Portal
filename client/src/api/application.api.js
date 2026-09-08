import api from './client';

export const applicationApi = {
  applyToJob: async (formData) => {
    // FormData requires 'Content-Type': 'multipart/form-data'
    const res = await api.post('/applications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getMyApplications: async () => {
    const res = await api.get('/applications/my');
    return res.data;
  },

  getApplicantsForJob: async (jobId) => {
    const res = await api.get(`/applications/job/${jobId}`);
    return res.data;
  },

  updateStatus: async (applicationId, status, employerNotes = '') => {
    const res = await api.patch(`/applications/${applicationId}/status`, {
      status,
      employerNotes,
    });
    return res.data;
  },

  getResumeUrl: async (applicationId) => {
    const res = await api.get(`/applications/${applicationId}/resume`);
    return res.data;
  },
};
