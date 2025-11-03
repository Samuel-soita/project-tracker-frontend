import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { membersAPI } from '../api/members';
import { useAuth } from '../context/AuthContext';

const InvitationResponse = () => {
    const { projectId, action } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const handleInvitation = async () => {
            // Check if user is logged in
            if (!user) {
                setError('Please log in to respond to this invitation');
                setLoading(false);
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            try {
                setLoading(true);
                const response = await membersAPI.respond(projectId, action);

                if (action === 'accept') {
                    setMessage(`You have successfully joined the project!`);
                } else {
                    setMessage(`You have declined the invitation.`);
                }

                // Redirect to dashboard after 2 seconds
                setTimeout(() => navigate('/dashboard'), 2000);
            } catch (err) {
                setError(err.message || 'Failed to process invitation');
            } finally {
                setLoading(false);
            }
        };

        handleInvitation();
    }, [projectId, action, user, navigate]);

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
                {loading && (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Processing your response...</p>
                    </>
                )}

                {!loading && message && (
                    <>
                        <div className="mb-4">
                            {action === 'accept' ? (
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold mb-2">
                            {action === 'accept' ? 'Invitation Accepted!' : 'Invitation Declined'}
                        </h2>
                        <p className="text-gray-600 mb-4">{message}</p>
                        <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
                    </>
                )}

                {!loading && error && (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Go to Login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default InvitationResponse;
