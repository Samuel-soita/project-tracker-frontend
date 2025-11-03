import { apiClient } from './client';

export const tasksAPI = {
    getAll: () => apiClient.get('/tasks/'),

    getById: (id) => apiClient.get(`/tasks/${id}`),

    getByProject: (projectId) => apiClient.get(`/tasks/project/${projectId}`),

    create: (taskData) => apiClient.post('/tasks/', taskData),

    update: (id, taskData) => apiClient.put(`/tasks/${id}`, taskData),

    delete: (id) => apiClient.delete(`/tasks/${id}`),
};