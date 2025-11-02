import { apiClient } from './client';

export const membersAPI = {
    invite: (projectId, email, role = 'collaborator') =>
        apiClient.post(`/members/projects/${projectId}/invite`, { email, role }),

    remove: (projectId, userId) =>
        apiClient.post(`/members/projects/${projectId}/remove`, { user_id: userId }),

    respond: (projectId, action) =>
        apiClient.post(`/members/projects/${projectId}/respond`, { action }),

    getPending: () =>
        apiClient.get('/members/invitations/pending'),
};