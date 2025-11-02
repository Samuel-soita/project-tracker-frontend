import { apiClient } from './client';

export const authAPI = {
    register: (userData) => apiClient.post('/auth/register', userData),
    login: (credentials) => apiClient.post('/auth/login', credentials),
    verify2FA: (userId, code) => apiClient.post('/auth/verify-2fa', { user_id: userId, code }),
    enable2FA: (userId) => apiClient.post('/auth/enable-2fa', { user_id: userId }),
    disable2FA: (userId) => apiClient.post('/auth/disable-2fa', { user_id: userId }),
};