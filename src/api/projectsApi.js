import { apiClient } from './client';

export const projectsAPI = {
    getAll: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiClient.get(`/projects${queryString ? `?${queryString}` : ''}`);
    },

    getById: (id) => apiClient.get(`/projects/${id}`),

    create: (projectData) => apiClient.post('/projects', projectData),

    update: (id, projectData) => apiClient.put(`/projects/${id}`, projectData),

    delete: (id) => apiClient.delete(`/projects/${id}`),

    updateStatus: (id, status) => apiClient.patch(`/projects/${id}/status`, { status }),

    // Member management
    inviteMember: (projectId, memberData) =>
        apiClient.post(`/members/projects/${projectId}/invite`, memberData),

    removeMember: (projectId, userId) =>
        apiClient.post(`/members/projects/${projectId}/remove`, { user_id: userId }),

    respondToInvitation: (projectId, response) =>
        apiClient.post(`/members/projects/${projectId}/respond`, response),
};