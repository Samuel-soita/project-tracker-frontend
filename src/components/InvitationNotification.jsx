import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { membersAPI } from '../api/members';

const InvitationNotification = () => {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchInvitations();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchInvitations = async () => {
        try {
            setLoading(true);
            const response = await membersAPI.getPending();
            // apiClient returns data directly, not { data: data }
            setInvitations(Array.isArray(response) ? response : []);
        } catch (err) {
            console.error('Failed to fetch invitations:', err);
            setInvitations([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (projectId, action) => {
        try {
            setProcessingId(projectId);
            await membersAPI.respond(projectId, action);

            // Remove the invitation from the list
            setInvitations(invitations.filter(inv => inv.project_id !== projectId));

            // If no more invitations, close dropdown
            if (invitations.length <= 1) {
                setShowDropdown(false);
            }
        } catch (err) {
            console.error('Failed to respond to invitation:', err);
            alert(err.response?.data?.message || 'Failed to respond to invitation');
        } finally {
            setProcessingId(null);
        }
    };

    const invitationCount = invitations.length;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon with Badge */}
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
            >
                <Bell size={24} />
                {invitationCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {invitationCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">
                            Pending Invitations ({invitationCount})
                        </h3>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">Loading...</div>
                        ) : invitationCount === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Bell size={48} className="mx-auto mb-2 text-gray-300" />
                                <p>No pending invitations</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {invitations.map((invitation) => (
                                    <div key={invitation.id} className="p-4 hover:bg-gray-50">
                                        <div className="mb-2">
                                            <h4 className="font-semibold text-gray-900">
                                                {invitation.project_name}
                                            </h4>
                                            {invitation.project_description && (
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                    {invitation.project_description}
                                                </p>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mb-3">
                                            Invited by: <span className="font-medium">{invitation.owner_name}</span>
                                        </p>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleRespond(invitation.project_id, 'accept')}
                                                disabled={processingId === invitation.project_id}
                                                className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition ${processingId === invitation.project_id
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-green-500 hover:bg-green-600 text-white'
                                                    }`}
                                            >
                                                {processingId === invitation.project_id ? 'Processing...' : 'Accept'}
                                            </button>
                                            <button
                                                onClick={() => handleRespond(invitation.project_id, 'decline')}
                                                disabled={processingId === invitation.project_id}
                                                className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition ${processingId === invitation.project_id
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-red-500 hover:bg-red-600 text-white'
                                                    }`}
                                            >
                                                {processingId === invitation.project_id ? 'Processing...' : 'Decline'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvitationNotification;
