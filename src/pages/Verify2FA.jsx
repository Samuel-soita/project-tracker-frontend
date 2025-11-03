import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const Verify2FA = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(10);
    const [canResend, setCanResend] = useState(false);
    const [resending, setResending] = useState(false);

    // Timer for resend button
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

            if (!userId) {
                setError('Session expired. Please login again.');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            // Call the login endpoint again to regenerate and send a new code
            // We need to get the user's email first - store it during login
            const userEmail = localStorage.getItem('pending_2fa_email');
            const userPassword = localStorage.getItem('pending_2fa_password');

            if (!userEmail || !userPassword) {
                setError('Session expired. Please login again.');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            // Re-login to get a new code
            await authAPI.login({ email: userEmail, password: userPassword });

            // Reset timer
            setResendTimer(60); // 60 seconds cooldown after resend
            setCanResend(false);
            setError('');
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

            // Store token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Update AuthContext state
            setUser(data.user);

            // Clear pending 2FA data
            localStorage.removeItem('pending_2fa_user_id');
            localStorage.removeItem('pending_2fa_email');
            localStorage.removeItem('pending_2fa_password');

            // Redirect to dashboard based on role
            if (data.user.role === 'Admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message || 'Invalid 2FA code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
                <h2 className="text-3xl font-bold text-center mb-4">Two-Factor Authentication</h2>
                <p className="text-gray-600 text-center mb-8">
                    Enter the 6-digit code sent to your email
                </p>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">
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
                            required
                            maxLength="6"
                            className="input-field text-center text-2xl tracking-widest"
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || code.length !== 6}
                        className="w-full btn-primary disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <button
                        onClick={handleResendCode}
                        disabled={!canResend || resending}
                        className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed mb-4"
                    >
                        {resending
                            ? 'Sending...'
                            : canResend
                                ? 'Resend Code'
                                : `Resend Code (${resendTimer}s)`}
                    </button>
                </div>

                <div className="text-center">
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
