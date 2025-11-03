import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import CreateProjectModal from '../../src/components/CreateProjectModal';
import { projectsAPI } from '../../src/api/projects';
import { classesAPI } from '../../src/api/classes';
import { cohortsAPI } from '../../src/api/cohorts';
import { membersAPI } from '../../src/api/members';
import { useAuth } from '../../src/context/AuthContext';

jest.mock('../../src/api/projects');
jest.mock('../../src/api/classes');
jest.mock('../../src/api/cohorts');
jest.mock('../../src/api/members');
jest.mock('../../src/context/AuthContext');
jest.mock('lucide-react', () => ({
    X: () => <div>X</div>,
    Plus: () => <div>Plus</div>,
    Trash2: () => <div>Trash</div>,
}));

describe('CreateProjectModal', () => {
    const mockClasses = [
        { id: 1, name: 'Class 1', track: 'Track A' },
        { id: 2, name: 'Class 2', track: 'Track B' },
    ];

    const mockCohorts = [
        { id: 1, name: 'Cohort 2024 Spring' },
        { id: 2, name: 'Cohort 2024 Fall' },
    ];

    const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
    };

    const mockOnClose = jest.fn();
    const mockOnSuccess = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue({ user: mockUser });
        classesAPI.getAll.mockResolvedValue(mockClasses);
        cohortsAPI.getAll.mockResolvedValue({ items: mockCohorts });
    });

    describe('Modal Rendering', () => {
        test('renders create mode correctly', async () => {
            render(<CreateProjectModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

            await waitFor(() => {
                expect(screen.getByText('Create new Project')).toBeInTheDocument();
            });

            expect(screen.getByLabelText(/Project Name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Project Description/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/GitHub Link/i)).toBeInTheDocument();
        });

        test('renders edit mode correctly', async () => {
            const mockProject = {
                id: 1,
                name: 'Existing Project',
                description: 'Test description',
                github_link: 'https://github.com/test/repo',
                class_id: 1,
                cohort_id: 1,
            };

            render(
                <CreateProjectModal
                    onClose={mockOnClose}
                    onSuccess={mockOnSuccess}
                    project={mockProject}
                />
            );

            await waitFor(() => {
                expect(screen.getByText('Edit Project')).toBeInTheDocument();
            });

            expect(screen.getByDisplayValue('Existing Project')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
        });

        test('displays user as project owner', async () => {
            render(<CreateProjectModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
            });
        });
    });

    describe('Form Fields', () => {
        test('loads classes and cohorts on mount', async () => {
            render(<CreateProjectModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

            await waitFor(() => {
                expect(classesAPI.getAll).toHaveBeenCalled();
                expect(cohortsAPI.getAll).toHaveBeenCalled();
            });
        });

        test('populates class dropdown with data', async () => {
            render(<CreateProjectModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

            await waitFor(() => {
                expect(screen.getByText('Class 1 - Track A')).toBeInTheDocument();
                expect(screen.getByText('Class 2 - Track B')).toBeInTheDocument();
            });
        });

        test('populates cohort dropdown with data', async () => {
            render(<CreateProjectModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

            await waitFor(() => {
                expect(screen.getByText('Cohort 2024 Spring')).toBeInTheDocument();
                expect(screen.getByText('Cohort 2024 Fall')).toBeInTheDocument();
            });
        });

        test('handles form input changes', async () => {
            const user = userEvent.setup();

            render(<CreateProjectModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

            const nameInput = screen.getByLabelText(/Project Name/i);
            await user.type(nameInput, 'My New Project');

            expect(nameInput.value).toBe('My New Project');
        });
    });

    describe('Member Management', () => {
        test('adds member when email is entered', async () => {
            const user = userEvent.setup();

            render(<CreateProjectModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Enter member email address')).toBeInTheDocument();
            });

            const emailInput = screen.getByPlaceholderText('Enter member email address');
            await user.type(emailInput, 'newmember@example.com');

            const addButton = screen.getByRole('button', { name: '' });
            fireEvent.click(addButton);

            await waitFor(() => {
                expect(screen.getByText('newmember@example.com')).toBeInTheDocument();
            });
        });

        test('validates email format before adding', async () => {
            const user = userEvent.setup();

            render(<CreateProjectModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Enter member email address')).toBeInTheDocument();
            });

            const emailInput = screen.getByPlaceholderText('Enter member email address');
            await user.type(emailInput, 'invalid-email');

            const addButton = screen.getByRole('button', { name: '' });
            fireEvent.click(addButton);

            await waitFor(() => {
                expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
            });
        });

        test('allows removing member from list', async () => {
            const user = userEvent.setup();

            render(<CreateProjectModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Enter member email address')).toBeInTheDocument();
            });

            const emailInput = screen.getByPlaceholderText('Enter member email address');
            await user.type(emailInput, 'member@example.com');

            const addButton = screen.getByRole('button', { name: '' });
            fireEvent.click(addButton);

            await waitFor(() => {
                expect(screen.getByText('member@example.com')).toBeInTheDocument();
            });

            const removeButtons = screen.getAllByRole('button');
            const trashButton = removeButtons.find(btn => btn.querySelector('[data-testid="trash-icon"]') || btn.textContent === 'Trash');
            if (trashButton) fireEvent.click(trashButton);

            await waitFor(() => {
                expect(screen.queryByText('member@example.com')).not.toBeInTheDocument();
            });
        });

        test('adds member on Enter key press', async () => {
            const user = userEvent.setup();

            render(<CreateProjectModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Enter member email address')).toBeInTheDocument();
            });

            const emailInput = screen.getByPlaceholderText('Enter member email address');
            await user.type(emailInput, 'enter@example.com{Enter}');

            await waitFor(() => {
                expect(screen.getByText('enter@example.com')).toBeInTheDocument();
            });
        });
    });

    describe('Form Submission - Create', () => {
        test('creates project successfully', async () => {
            const user = userEvent.setup();
            const mockCreatedProject = { id: 123, name: 'New Project' };
            projectsAPI.create.mockResolvedValue(mockCreatedProject);

            render(<CreateProjectModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

            await waitFor(() => {
                expect(screen.getByLabelText(/Project Name/i)).toBeInTheDocument();
            });

            await user.type(screen.getByLabelText(/Project Name/i), 'New Project');
            await user.selectOptions(screen.getByLabelText(/Class/i), '1');
            await user.selectOptions(screen.getByLabelText(/Cohort/i), '1');

            const submitButton = screen.getByRole('button', { name: /Create Project/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(projectsAPI.create).toHaveBeenCalledWith({
                    name: 'New Project',
                    description: '',
                    github_link: '',
                    class_id: 1,
                    cohort_id: 1,
                });
            });

            expect(mockOnSuccess).toHaveBeenCalled();
        });

        test('sends invitations to members after creating project', async () => {
            const user = userEvent.setup();
            const mockCreatedProject = { id: 123, name: 'New Project' };
            projectsAPI.create.mockResolvedValue(mockCreatedProject);
            membersAPI.invite.mockResolvedValue({});

            render(<CreateProjectModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

            await waitFor(() => {
                expect(screen.getByLabelText(/Project Name/i)).toBeInTheDocument();
            });

            await user.type(screen.getByLabelText(/Project Name/i), 'New Project');
            await user.selectOptions(screen.getByLabelText(/Class/i), '1');
            await user.selectOptions(screen.getByLabelText(/Cohort/i), '1');

            const emailInput = screen.getByPlaceholderText('Enter member email address');
            await user.type(emailInput, 'member1@example.com');
            const addButton = screen.getByRole('button', { name: '' });
            fireEvent.click(addButton);

            await waitFor(() => {
                expect(screen.getByText('member1@example.com')).toBeInTheDocument();
            });

            const submitButton = screen.getByRole('button', { name: /Create Project/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(membersAPI.invite).toHaveBeenCalledWith(123, 'member1@example.com', 'collaborator');
            });

            expect(mockOnSuccess).toHaveBeenCalled();
        });

        test('shows error when class is not selected', async () => {
            const user = userEvent.setup();

            render(<CreateProjectModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

            await waitFor(() => {
                expect(screen.getByLabelText(/Project Name/i)).toBeInTheDocument();
            });

            await user.type(screen.getByLabelText(/Project Name/i), 'New Project');

            const submitButton = screen.getByRole('button', { name: /Create Project/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('Please select a class')).toBeInTheDocument();
            });

            expect(projectsAPI.create).not.toHaveBeenCalled();
        });

        test('shows error when cohort is not selected', async () => {
            const user = userEvent.setup();

            render(<CreateProjectModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

            await waitFor(() => {
                expect(screen.getByLabelText(/Project Name/i)).toBeInTheDocument();
            });

            await user.type(screen.getByLabelText(/Project Name/i), 'New Project');
            await user.selectOptions(screen.getByLabelText(/Class/i), '1');

            const submitButton = screen.getByRole('button', { name: /Create Project/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('Please select a cohort')).toBeInTheDocument();
            });

            expect(projectsAPI.create).not.toHaveBeenCalled();
        });
    });

    describe('Form Submission - Edit', () => {
        test('updates project successfully', async () => {
            const user = userEvent.setup();
            const mockProject = {
                id: 1,
                name: 'Existing Project',
                description: 'Old description',
                github_link: 'https://github.com/test/repo',
                class_id: 1,
                cohort_id: 1,
            };
            projectsAPI.update.mockResolvedValue({});

            render(
                <CreateProjectModal
                    onClose={mockOnClose}
                    onSuccess={mockOnSuccess}
                    project={mockProject}
                />
            );

            await waitFor(() => {
                expect(screen.getByDisplayValue('Existing Project')).toBeInTheDocument();
            });

            const nameInput = screen.getByLabelText(/Project Name/i);
            await user.clear(nameInput);
            await user.type(nameInput, 'Updated Project');

            const submitButton = screen.getByRole('button', { name: /Update Project/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(projectsAPI.update).toHaveBeenCalledWith(1, {
                    name: 'Updated Project',
                    description: 'Old description',
                    github_link: 'https://github.com/test/repo',
                    class_id: 1,
                    cohort_id: 1,
                });
            });

            expect(mockOnSuccess).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        test('displays error when project creation fails', async () => {
            const user = userEvent.setup();
            projectsAPI.create.mockRejectedValue(new Error('Server error'));

            render(<CreateProjectModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

            await waitFor(() => {
                expect(screen.getByLabelText(/Project Name/i)).toBeInTheDocument();
            });

            await user.type(screen.getByLabelText(/Project Name/i), 'New Project');
            await user.selectOptions(screen.getByLabelText(/Class/i), '1');
            await user.selectOptions(screen.getByLabelText(/Cohort/i), '1');

            const submitButton = screen.getByRole('button', { name: /Create Project/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('Failed to save project')).toBeInTheDocument();
            });
        });

        test('handles error when loading classes and cohorts fails', async () => {
            const consoleError = jest.spyOn(console, 'error').mockImplementation(() => { });
            classesAPI.getAll.mockRejectedValue(new Error('Failed to load classes'));
            cohortsAPI.getAll.mockRejectedValue(new Error('Failed to load cohorts'));

            render(<CreateProjectModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

            await waitFor(() => {
                expect(classesAPI.getAll).toHaveBeenCalled();
            });

            consoleError.mockRestore();
        });
    });

    describe('Modal Actions', () => {
        test('calls onClose when close button is clicked', async () => {
            render(<CreateProjectModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

            await waitFor(() => {
                expect(screen.getByText('Create new Project')).toBeInTheDocument();
            });

            const closeButton = screen.getAllByRole('button')[0];
            fireEvent.click(closeButton);

            expect(mockOnClose).toHaveBeenCalled();
        });

        test('calls onClose when cancel button is clicked', async () => {
            render(<CreateProjectModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

            await waitFor(() => {
                expect(screen.getByText('Create new Project')).toBeInTheDocument();
            });

            const cancelButton = screen.getByRole('button', { name: /Cancel/i });
            fireEvent.click(cancelButton);

            expect(mockOnClose).toHaveBeenCalled();
        });

        test('shows loading state during submission', async () => {
            const user = userEvent.setup();
            projectsAPI.create.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

            render(<CreateProjectModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

            await waitFor(() => {
                expect(screen.getByLabelText(/Project Name/i)).toBeInTheDocument();
            });

            await user.type(screen.getByLabelText(/Project Name/i), 'New Project');
            await user.selectOptions(screen.getByLabelText(/Class/i), '1');
            await user.selectOptions(screen.getByLabelText(/Cohort/i), '1');

            const submitButton = screen.getByRole('button', { name: /Create Project/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('Saving...')).toBeInTheDocument();
            });
        });
    });
});
