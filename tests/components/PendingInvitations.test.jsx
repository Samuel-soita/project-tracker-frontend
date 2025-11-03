import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PendingInvitations from '../../src/components/PendingInvitations';
import { membersAPI } from '../../src/api/members';

jest.mock('../../src/api/members');

describe('PendingInvitations', () => {
    const mockInvitations = [
        {
            id: 1,
            project_id: 101,
            project_name: 'Test Project 1',
            project_description: 'Description for test project 1',
            owner_name: 'John Doe',
            role: 'collaborator',
        },
        {
            id: 2,
            project_id: 102,
            project_name: 'Test Project 2',
            project_description: null,
            owner_name: 'Jane Smith',
            role: 'viewer',
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Loading State', () => {
        test('displays loading message when fetching invitations', () => {
            membersAPI.getPending.mockImplementation(() => new Promise(() => {}));

            render(<PendingInvitations />);

            expect(screen.getByText('Loading invitations...')).toBeInTheDocument();
        });
    });

    describe('Empty State', () => {
        test('renders nothing when there are no invitations', async () => {
            membersAPI.getPending.mockResolvedValue({ data: [] });

            const { container } = render(<PendingInvitations />);

            await waitFor(() => {
                expect(membersAPI.getPending).toHaveBeenCalled();
            });

            expect(container.firstChild).toBeNull();
        });
    });

    describe('Display Invitations', () => {
        test('displays invitations correctly', async () => {
            membersAPI.getPending.mockResolvedValue({ data: mockInvitations });

            render(<PendingInvitations />);

            await waitFor(() => {
                expect(screen.getByText('Pending Invitations (2)')).toBeInTheDocument();
            });

            expect(screen.getByText('Test Project 1')).toBeInTheDocument();
            expect(screen.getByText('Description for test project 1')).toBeInTheDocument();
            expect(screen.getByText('Test Project 2')).toBeInTheDocument();
        });

        test('displays invitation metadata correctly', async () => {
            membersAPI.getPending.mockResolvedValue({ data: mockInvitations });

            render(<PendingInvitations />);

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
            });

            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            expect(screen.getByText(/collaborator/i)).toBeInTheDocument();
            expect(screen.getByText(/viewer/i)).toBeInTheDocument();
        });

        test('does not display description when it is null', async () => {
            membersAPI.getPending.mockResolvedValue({ data: [mockInvitations[1]] });

            render(<PendingInvitations />);

            await waitFor(() => {
                expect(screen.getByText('Test Project 2')).toBeInTheDocument();
            });

            expect(screen.queryByText('Description for test project 2')).not.toBeInTheDocument();
        });
    });

    describe('Accept Invitation', () => {
        test('calls API and removes invitation when accept is clicked', async () => {
            membersAPI.getPending.mockResolvedValue({ data: mockInvitations });
            membersAPI.respond.mockResolvedValue({});

            render(<PendingInvitations />);

            await waitFor(() => {
                expect(screen.getByText('Test Project 1')).toBeInTheDocument();
            });

            const acceptButtons = screen.getAllByText('Accept');
            fireEvent.click(acceptButtons[0]);

            await waitFor(() => {
                expect(membersAPI.respond).toHaveBeenCalledWith(101, 'accept');
            });

            await waitFor(() => {
                expect(screen.queryByText('Test Project 1')).not.toBeInTheDocument();
            });
        });

        test('shows processing state when accepting invitation', async () => {
            membersAPI.getPending.mockResolvedValue({ data: mockInvitations });
            membersAPI.respond.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

            render(<PendingInvitations />);

            await waitFor(() => {
                expect(screen.getByText('Test Project 1')).toBeInTheDocument();
            });

            const acceptButtons = screen.getAllByText('Accept');
            fireEvent.click(acceptButtons[0]);

            await waitFor(() => {
                expect(screen.getAllByText('Processing...')[0]).toBeInTheDocument();
            });
        });

        test('disables buttons during processing', async () => {
            membersAPI.getPending.mockResolvedValue({ data: mockInvitations });
            membersAPI.respond.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

            render(<PendingInvitations />);

            await waitFor(() => {
                expect(screen.getByText('Test Project 1')).toBeInTheDocument();
            });

            const acceptButtons = screen.getAllByText('Accept');
            fireEvent.click(acceptButtons[0]);

            await waitFor(() => {
                const processingButtons = screen.getAllByText('Processing...');
                processingButtons.forEach(button => {
                    expect(button).toBeDisabled();
                });
            });
        });
    });

    describe('Decline Invitation', () => {
        test('calls API and removes invitation when decline is clicked', async () => {
            membersAPI.getPending.mockResolvedValue({ data: mockInvitations });
            membersAPI.respond.mockResolvedValue({});

            render(<PendingInvitations />);

            await waitFor(() => {
                expect(screen.getByText('Test Project 2')).toBeInTheDocument();
            });

            const declineButtons = screen.getAllByText('Decline');
            fireEvent.click(declineButtons[1]);

            await waitFor(() => {
                expect(membersAPI.respond).toHaveBeenCalledWith(102, 'decline');
            });

            await waitFor(() => {
                expect(screen.queryByText('Test Project 2')).not.toBeInTheDocument();
            });
        });
    });

    describe('Error Handling', () => {
        test('displays error message when fetching invitations fails', async () => {
            const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
            membersAPI.getPending.mockRejectedValue(new Error('Network error'));

            render(<PendingInvitations />);

            await waitFor(() => {
                expect(screen.getByText('Failed to load invitations')).toBeInTheDocument();
            });

            consoleError.mockRestore();
        });

        test('displays error when responding to invitation fails', async () => {
            const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
            membersAPI.getPending.mockResolvedValue({ data: mockInvitations });
            membersAPI.respond.mockRejectedValue({
                response: { data: { message: 'Failed to process invitation' } }
            });

            render(<PendingInvitations />);

            await waitFor(() => {
                expect(screen.getByText('Test Project 1')).toBeInTheDocument();
            });

            const acceptButtons = screen.getAllByText('Accept');
            fireEvent.click(acceptButtons[0]);

            await waitFor(() => {
                expect(screen.getByText('Failed to process invitation')).toBeInTheDocument();
            });

            consoleError.mockRestore();
        });

        test('displays generic error message when API error has no message', async () => {
            const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
            membersAPI.getPending.mockResolvedValue({ data: mockInvitations });
            membersAPI.respond.mockRejectedValue(new Error('Unknown error'));

            render(<PendingInvitations />);

            await waitFor(() => {
                expect(screen.getByText('Test Project 1')).toBeInTheDocument();
            });

            const declineButtons = screen.getAllByText('Decline');
            fireEvent.click(declineButtons[0]);

            await waitFor(() => {
                expect(screen.getByText('Failed to respond to invitation')).toBeInTheDocument();
            });

            consoleError.mockRestore();
        });
    });
});