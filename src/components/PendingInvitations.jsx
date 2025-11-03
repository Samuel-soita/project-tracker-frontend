import { useState, useEffect } from 'react';
import { membersAPI } from '../api/members';

const PendingInvitations = () => {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchInvitations();
    }, []);

    const fetchInvitations = async () => {
        try {
            setLoading(true);
            const response = await membersAPI.getPending();
            setInvitations(response.data || []);
            setError('');
        } catch (err) {
            console.error('Failed to fetch invitations:', err);
            setError('Failed to load invitations');
            setInvitations([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (projectId, action) => {
        try {
            setProcessingId(projectId);
            setError('');
            await membersAPI.respond(projectId, action);

            // Remove the invitation from the list
            setInvitations(invitations.filter(inv => inv.project_id !== projectId));

            // Show success message
            const message = action === 'accept'
                ? 'Invitation accepted! The project is now in your projects list.'
                : 'Invitation declined.';

            // You could add a toast notification here
            console.log(message);
        } catch (err) {
            console.error('Failed to respond to invitation:', err);
            setError(err.response?.data?.message || 'Failed to respond to invitation');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Pending Invitations</h2>
                <p className="text-gray-500">Loading invitations...</p>
            </div>
        );
    }

    if (invitations.length === 0) {
        return null; // Don't show the section if there are no invitations
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-indigo-600">
                Pending Invitations ({invitations.length})
            </h2>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {invitations.map((invitation) => (
                    <div
                        key={invitation.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg text-gray-900">
                                    {invitation.project_name}
                                </h3>
                                {invitation.project_description && (
                                    <p className="text-gray-600 text-sm mt-1">
                                        {invitation.project_description}
                                    </p>
                                )}
                                <p className="text-sm text-gray-500 mt-2">
                                    Invited by: <span className="font-medium">{invitation.owner_name}</span>
                                </p>
                                <p className="text-sm text-gray-500">
                                    Role: <span className="font-medium capitalize">{invitation.role}</span>
                                </p>
                            </div>

                            <div className="flex gap-2 ml-4">
                                <button
                                    onClick={() => handleRespond(invitation.project_id, 'accept')}
                                    disabled={processingId === invitation.project_id}
                                    className={`px-4 py-2 rounded font-medium transition ${processingId === invitation.project_id
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                        }`}
                                >
                                    {processingId === invitation.project_id ? 'Processing...' : 'Accept'}
                                </button>
                                <button
                                    onClick={() => handleRespond(invitation.project_id, 'decline')}
                                    disabled={processingId === invitation.project_id}
                                    className={`px-4 py-2 rounded font-medium transition ${processingId === invitation.project_id
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                        }`}
                                >
                                    {processingId === invitation.project_id ? 'Processing...' : 'Decline'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PendingInvitations;
