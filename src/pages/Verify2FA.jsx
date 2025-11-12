import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { Shield, RefreshCw } from 'lucide-react';

const Verify2FA = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [resending, setResending] = useState(false);

    // Countdown for resend button
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendTimer]);

    const handleResendCode = async () => {
        setResending(true);
        setError('');

        try {
            const userId = localStorage.getItem('pending_2fa_user_id');
            const userEmail = localStorage.getItem('pending_2fa_email');
            const userPassword = localStorage.getItem('pending_2fa_password');

            if (!userId || !userEmail || !userPassword) {
                setError('Session expired. Please login again.');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            await authAPI.login({ email: userEmail, password: userPassword });

            setResendTimer(60);
            setCanResend(false);
            alert('A new verification code has been sent to your email.');
        } catch (err) {
            setError(err.message || 'Failed to resend code. Please try again.');
        } finally {
            setResending(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userId = localStorage.getItem('pending_2fa_user_id');
            if (!userId) {
                setError('Session expired. Please login again.');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            const data = await authAPI.verify2FA(userId, code);

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);

            localStorage.removeItem('pending_2fa_user_id');
            localStorage.removeItem('pending_2fa_email');
            localStorage.removeItem('pending_2fa_password');

            navigate(data.user.role === 'Admin' ? '/admin/dashboard' : '/dashboard');
        } catch (err) {
            setError(err.message || 'Invalid 2FA code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-10 w-full max-w-md border border-gray-200">
                <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    Two-Factor Authentication
                </h2>
                <p className="text-gray-600 text-center mb-8">
                    Enter the 6-digit code sent to your email
                </p>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Verification Code
                        </label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            maxLength={6}
                            required
                            autoFocus
                            className="w-full py-3 px-4 text-center text-2xl font-mono border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || code.length !== 6}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium text-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <button
                        onClick={handleResendCode}
                        disabled={!canResend || resending}
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        <RefreshCw size={16} className="inline-block" />
                        {resending
                            ? 'Sending...'
                            : canResend
                                ? 'Resend Code'
                                : `Resend Code (${resendTimer}s)`}
                    </button>
                </div>

                <div className="text-center mt-6">
                    <button
                        onClick={() => {
                            localStorage.removeItem('pending_2fa_user_id');
                            localStorage.removeItem('pending_2fa_email');
                            localStorage.removeItem('pending_2fa_password');
                            navigate('/login');
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Verify2FA;
