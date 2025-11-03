import { apiClient } from './client';

export const classesAPI = {
    getAll: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiClient.get(`/classes/${queryString ? `?${queryString}` : ''}`);
    },

    getById: (id) => apiClient.get(`/classes/${id}`),

    create: (classData) => apiClient.post('/classes/', classData),

    update: (id, classData) => apiClient.put(`/classes/${id}`, classData),

    delete: (id) => apiClient.delete(`/classes/${id}`),

    getStudents: (id) => apiClient.get(`/classes/${id}/students`),
};