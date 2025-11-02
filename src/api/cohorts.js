import { apiClient } from './client';

export const cohortsAPI = {
    getAll: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiClient.get(`/cohorts/${queryString ? `?${queryString}` : ''}`);
    },

    create: (cohortData) => apiClient.post('/cohorts/', cohortData),

    update: (id, cohortData) => apiClient.put(`/cohorts/${id}`, cohortData),

    delete: (id) => apiClient.delete(`/cohorts/${id}`),

    join: (id) => apiClient.post(`/cohorts/${id}/join`),
};