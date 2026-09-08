import api from './client';

export const jobApi = {
  getJobs: async (params = {}) => {
    const res = await api.get('/jobs', { params });
    return res.data;
  },

  getJobById: async (id) => {
    const res = await api.get(`/jobs/${id}`);
    return res.data;
  },

  createJob: async (jobData) => {
    const res = await api.post('/jobs', jobData);
    return res.data;
  },

  updateJob: async (id, jobData) => {
    const res = await api.put(`/jobs/${id}`, jobData);
    return res.data;
  },

  deleteJob: async (id) => {
    const res = await api.delete(`/jobs/${id}`);
    return res.data;
  },

  getMyPostedJobs: async () => {
    const res = await api.get('/jobs/my-posts');
    return res.data;
  },

  saveJob: async (id) => {
    const res = await api.post(`/jobs/${id}/save`);
    return res.data;
  },

  unsaveJob: async (id) => {
    const res = await api.delete(`/jobs/${id}/save`);
    return res.data;
  },
};
