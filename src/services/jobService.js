import api from './api';

export const jobService = {
    // Public
    getAllJobs: async (type) => {
        const params = type ? { type } : {};
        const response = await api.get('/jobs', { params });
        return response.data;
    },

    getJobById: async (id) => {
        const response = await api.get(`/jobs/${id}`);
        return response.data;
    },

    // Admin
    getAllJobsForAdmin: async () => {
        const response = await api.get('/admin/jobs');
        return response.data;
    },

    createJob: async (jobData) => {
        const response = await api.post('/admin/jobs', jobData);
        return response.data;
    },

    updateJob: async (id, jobData) => {
        const response = await api.put(`/admin/jobs/${id}`, jobData);
        return response.data;
    },

    deleteJob: async (id) => {
        await api.delete(`/admin/jobs/${id}`);
    }
};
