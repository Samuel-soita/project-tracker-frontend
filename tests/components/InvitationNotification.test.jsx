import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InvitationNotification from '../../src/components/InvitationNotification';
import { membersAPI } from '../../src/api/members';

jest.mock('../../src/api/members');
jest.mock('lucide-react', () => ({
    Bell: () => <div data-testid="bell-icon">Bell</div>,
}));

describe('InvitationNotification', () => {
    const mockInvitations = [
        {
            id: 1,
            project_id: 101,
            project_name: 'Project Alpha',
            project_description: 'Alpha description',
            owner_name: 'Alice',
            role: 'collaborator',
        },
        {
            id: 2,
            project_id: 102,
            project_name: 'Project Beta',
            project_description: 'Beta description',
            owner_name: 'Bob',
            role: 'viewer',
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Bell Icon and Badge', () => {
        test('renders bell icon', async () => {
            membersAPI.getPending.mockResolvedValue([]);

            render(<InvitationNotification />);

            await waitFor(() => {
                expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
            });
        });

        test('shows badge with invitation count when there are invitations', async () => {
            membersAPI.getPending.mockResolvedValue(mockInvitations);

            render(<InvitationNotification />);

            await waitFor(() => {
                expect(screen.getByText('2')).toBeInTheDocument();
            });
        });

        test('does not show badge when there are no invitations', async () => {
            membersAPI.getPending.mockResolvedValue([]);

            const { container } = render(<InvitationNotification />);

            await waitFor(() => {
                expect(membersAPI.getPending).toHaveBeenCalled();
            });

            const badge = container.querySelector('.bg-red-600');
            expect(badge).not.toBeInTheDocument();
        });
    });

    describe('Dropdown Toggle', () => {
        test('toggles dropdown when bell icon is clicked', async () => {
            membersAPI.getPending.mockResolvedValue(mockInvitations);

            render(<InvitationNotification />);

            await waitFor(() => {
                expect(membersAPI.getPending).toHaveBeenCalled();
            });

            const bellButton = screen.getByRole('button');
            fireEvent.click(bellButton);

            await waitFor(() => {
                expect(screen.getByText('Pending Invitations (2)')).toBeInTheDocument();
            });

            fireEvent.click(bellButton);

            await waitFor(() => {
                expect(screen.queryByText('Pending Invitations (2)')).not.toBeInTheDocument();
            });
        });

        test('closes dropdown when clicking outside', async () => {
            membersAPI.getPending.mockResolvedValue(mockInvitations);

            render(<InvitationNotification />);

            await waitFor(() => {
                expect(membersAPI.getPending).toHaveBeenCalled();
            });

            const bellButton = screen.getByRole('button');
            fireEvent.click(bellButton);

            await waitFor(() => {
                expect(screen.getByText('Pending Invitations (2)')).toBeInTheDocument();
            });

            fireEvent.mouseDown(document.body);

            await waitFor(() => {
                expect(screen.queryByText('Pending Invitations (2)')).not.toBeInTheDocument();
            });
        });
    });

    describe('Dropdown Content', () => {
        test('shows loading state in dropdown', async () => {
            membersAPI.getPending.mockImplementation(() => new Promise(() => { }));

            render(<InvitationNotification />);

            const bellButton = screen.getByRole('button');
            fireEvent.click(bellButton);

            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });

        test('shows empty state when no invitations', async () => {
            membersAPI.getPending.mockResolvedValue([]);

            render(<InvitationNotification />);

            await waitFor(() => {
                expect(membersAPI.getPending).toHaveBeenCalled();
            });

            const bellButton = screen.getByRole('button');
            fireEvent.click(bellButton);

            await waitFor(() => {
                expect(screen.getByText('No pending invitations')).toBeInTheDocument();
            });
        });

        test('displays invitations in dropdown', async () => {
            membersAPI.getPending.mockResolvedValue(mockInvitations);

            render(<InvitationNotification />);

            await waitFor(() => {
                expect(membersAPI.getPending).toHaveBeenCalled();
            });

            const bellButton = screen.getByRole('button');
            fireEvent.click(bellButton);

            await waitFor(() => {
                expect(screen.getByText('Project Alpha')).toBeInTheDocument();
                expect(screen.getByText('Project Beta')).toBeInTheDocument();
                expect(screen.getByText('Alpha description')).toBeInTheDocument();
                expect(screen.getByText('Beta description')).toBeInTheDocument();
            });
        });

        test('displays invited by information', async () => {
            membersAPI.getPending.mockResolvedValue(mockInvitations);

            render(<InvitationNotification />);

            await waitFor(() => {
                expect(membersAPI.getPending).toHaveBeenCalled();
            });

            const bellButton = screen.getByRole('button');
            fireEvent.click(bellButton);

            await waitFor(() => {
                expect(screen.getByText('Alice')).toBeInTheDocument();
                expect(screen.getByText('Bob')).toBeInTheDocument();
            });
        });
    });

    describe('Accept Invitation', () => {
        test('accepts invitation and removes it from list', async () => {
            membersAPI.getPending.mockResolvedValue(mockInvitations);
            membersAPI.respond.mockResolvedValue({});

            render(<InvitationNotification />);

            await waitFor(() => {
                expect(membersAPI.getPending).toHaveBeenCalled();
            });

            const bellButton = screen.getByRole('button');
            fireEvent.click(bellButton);

            await waitFor(() => {
                expect(screen.getByText('Project Alpha')).toBeInTheDocument();
            });

            const acceptButtons = screen.getAllByText('Accept');
            fireEvent.click(acceptButtons[0]);

            await waitFor(() => {
                expect(membersAPI.respond).toHaveBeenCalledWith(101, 'accept');
            });

            await waitFor(() => {
                expect(screen.queryByText('Project Alpha')).not.toBeInTheDocument();
            });
        });

        test('shows processing state when accepting', async () => {
            membersAPI.getPending.mockResolvedValue(mockInvitations);
            membersAPI.respond.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

            render(<InvitationNotification />);

            await waitFor(() => {
                expect(membersAPI.getPending).toHaveBeenCalled();
            });

            const bellButton = screen.getByRole('button');
            fireEvent.click(bellButton);

            await waitFor(() => {
                expect(screen.getByText('Project Alpha')).toBeInTheDocument();
            });

            const acceptButtons = screen.getAllByText('Accept');
            fireEvent.click(acceptButtons[0]);

            await waitFor(() => {
                expect(screen.getAllByText('Processing...').length).toBeGreaterThan(0);
            });
        });

        test('closes dropdown when last invitation is accepted', async () => {
            membersAPI.getPending.mockResolvedValue([mockInvitations[0]]);
            membersAPI.respond.mockResolvedValue({});

            render(<InvitationNotification />);

            await waitFor(() => {
                expect(membersAPI.getPending).toHaveBeenCalled();
            });

            const bellButton = screen.getByRole('button');
            fireEvent.click(bellButton);

            await waitFor(() => {
                expect(screen.getByText('Project Alpha')).toBeInTheDocument();
            });

            const acceptButton = screen.getByText('Accept');
            fireEvent.click(acceptButton);

            await waitFor(() => {
                expect(screen.queryByText('Pending Invitations (1)')).not.toBeInTheDocument();
            });
        });
    });

    describe('Decline Invitation', () => {
        test('declines invitation and removes it from list', async () => {
            membersAPI.getPending.mockResolvedValue(mockInvitations);
            membersAPI.respond.mockResolvedValue({});

            render(<InvitationNotification />);

            await waitFor(() => {
                expect(membersAPI.getPending).toHaveBeenCalled();
            });

            const bellButton = screen.getByRole('button');
            fireEvent.click(bellButton);

            await waitFor(() => {
                expect(screen.getByText('Project Beta')).toBeInTheDocument();
            });

            const declineButtons = screen.getAllByText('Decline');
            fireEvent.click(declineButtons[1]);

            await waitFor(() => {
                expect(membersAPI.respond).toHaveBeenCalledWith(102, 'decline');
            });

            await waitFor(() => {
                expect(screen.queryByText('Project Beta')).not.toBeInTheDocument();
            });
        });
    });

    describe('Error Handling', () => {
        test('handles fetch error gracefully', async () => {
            const consoleError = jest.spyOn(console, 'error').mockImplementation(() => { });
            membersAPI.getPending.mockRejectedValue(new Error('Network error'));

            render(<InvitationNotification />);

            await waitFor(() => {
                expect(membersAPI.getPending).toHaveBeenCalled();
            });

            const bellButton = screen.getByRole('button');
            fireEvent.click(bellButton);

            await waitFor(() => {
                expect(screen.getByText('No pending invitations')).toBeInTheDocument();
            });

            consoleError.mockRestore();
        });

        test('shows alert when responding to invitation fails', async () => {
            const consoleError = jest.spyOn(console, 'error').mockImplementation(() => { });
            const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => { });

            membersAPI.getPending.mockResolvedValue(mockInvitations);
            membersAPI.respond.mockRejectedValue({
                response: { data: { message: 'Server error' } }
            });

            render(<InvitationNotification />);

            await waitFor(() => {
                expect(membersAPI.getPending).toHaveBeenCalled();
            });

            const bellButton = screen.getByRole('button');
            fireEvent.click(bellButton);

            await waitFor(() => {
                expect(screen.getByText('Project Alpha')).toBeInTheDocument();
            });

            const acceptButton = screen.getAllByText('Accept')[0];
            fireEvent.click(acceptButton);

            await waitFor(() => {
                expect(alertSpy).toHaveBeenCalledWith('Server error');
            });

            alertSpy.mockRestore();
            consoleError.mockRestore();
        });
    });

    describe('Array Handling', () => {
        test('handles non-array response from API', async () => {
            membersAPI.getPending.mockResolvedValue({ data: 'not an array' });

            render(<InvitationNotification />);

            await waitFor(() => {
                expect(membersAPI.getPending).toHaveBeenCalled();
            });

            const bellButton = screen.getByRole('button');
            fireEvent.click(bellButton);

            await waitFor(() => {
                expect(screen.getByText('No pending invitations')).toBeInTheDocument();
            });
        });
    });
});
