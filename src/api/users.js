import { apiClient } from './client';

export const usersAPI = {
    getAll: () => apiClient.get('/users/'),

    getById: (id) => apiClient.get(`/users/${id}`),

    create: (userData) => apiClient.post('/users/', userData),

    update: (id, userData) => apiClient.put(`/users/${id}`, userData),

    delete: (id) => apiClient.delete(`/users/${id}`),
};