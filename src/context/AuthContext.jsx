import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser && storedUser !== 'undefined') {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }

        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            const data = await authAPI.login(credentials);

            if (data.two_factor_enabled) {
                // Store user_id and credentials temporarily for 2FA verification and resend
                localStorage.setItem('pending_2fa_user_id', data.user_id);
                localStorage.setItem('pending_2fa_email', credentials.email);
                localStorage.setItem('pending_2fa_password', credentials.password);
                return { requires2FA: true, userId: data.user_id };
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);

            return { success: true };
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const data = await authAPI.register(userData);
            return { success: true, message: data.message };
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    const isAdmin = () => user?.role === 'Admin';
    const isStudent = () => user?.role === 'Student';

    const value = {
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        isAdmin,
        isStudent,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
