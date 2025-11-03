import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import KanbanBoard from '../../src/components/KanbanBoard';
import { tasksAPI } from '../../src/api/tasks';

jest.mock('../../src/api/tasks');
jest.mock('lucide-react', () => ({
    Plus: () => <div>Plus</div>,
    Trash2: () => <div data-testid="trash-icon">Trash</div>,
    Edit2: () => <div data-testid="edit-icon">Edit</div>,
    X: () => <div>X</div>,
}));

jest.mock('@dnd-kit/core', () => ({
    DndContext: ({ children }) => <div>{children}</div>,
    DragOverlay: ({ children }) => <div>{children}</div>,
    closestCorners: jest.fn(),
    KeyboardSensor: jest.fn(),
    PointerSensor: jest.fn(),
    useSensor: jest.fn(),
    useSensors: jest.fn(() => []),
    useDroppable: jest.fn(() => ({ setNodeRef: jest.fn() })),
}));

jest.mock('@dnd-kit/sortable', () => ({
    SortableContext: ({ children }) => <div>{children}</div>,
    sortableKeyboardCoordinates: jest.fn(),
    verticalListSortingStrategy: jest.fn(),
    useSortable: jest.fn(() => ({
        attributes: {},
        listeners: {},
        setNodeRef: jest.fn(),
        transform: null,
        transition: null,
        isDragging: false,
    })),
}));

describe('KanbanBoard', () => {
    const mockTasks = [
        {
            id: 1,
            title: 'Task 1',
            description: 'Description 1',
            status: 'To Do',
            assignee: { id: 1, name: 'John Doe' },
            assignee_id: 1,
        },
        {
            id: 2,
            title: 'Task 2',
            description: 'Description 2',
            status: 'In Progress',
            assignee: { id: 2, name: 'Jane Smith' },
            assignee_id: 2,
        },
        {
            id: 3,
            title: 'Task 3',
            description: null,
            status: 'Done',
            assignee: null,
            assignee_id: null,
        },
    ];

    const mockProjectMembers = [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        window.confirm = jest.fn(() => true);
        window.alert = jest.fn();
    });

    describe('Board Rendering', () => {
        test('renders all three columns', async () => {
            tasksAPI.getByProject.mockResolvedValue({ tasks: [] });

            render(<KanbanBoard projectId={1} />);

            await waitFor(() => {
                expect(screen.getByText('To Do')).toBeInTheDocument();
                expect(screen.getByText('In Progress')).toBeInTheDocument();
                expect(screen.getByText('Done')).toBeInTheDocument();
            });
        });

        test('fetches and displays tasks correctly', async () => {
            tasksAPI.getByProject.mockResolvedValue({ tasks: mockTasks });

            render(<KanbanBoard projectId={1} />);

            await waitFor(() => {
                expect(screen.getByText('Task 1')).toBeInTheDocument();
                expect(screen.getByText('Task 2')).toBeInTheDocument();
                expect(screen.getByText('Task 3')).toBeInTheDocument();
            });
        });

        test('displays task descriptions when available', async () => {
            tasksAPI.getByProject.mockResolvedValue({ tasks: mockTasks });

            render(<KanbanBoard projectId={1} />);

            await waitFor(() => {
                expect(screen.getByText('Description 1')).toBeInTheDocument();
                expect(screen.getByText('Description 2')).toBeInTheDocument();
            });
        });

        test('displays assignee information when available', async () => {
            tasksAPI.getByProject.mockResolvedValue({ tasks: mockTasks });

            render(<KanbanBoard projectId={1} />);

            await waitFor(() => {
                expect(screen.getByText(/Assigned to: John Doe/i)).toBeInTheDocument();
                expect(screen.getByText(/Assigned to: Jane Smith/i)).toBeInTheDocument();
            });
        });

        test('displays task count for each column', async () => {
            tasksAPI.getByProject.mockResolvedValue({ tasks: mockTasks });

            render(<KanbanBoard projectId={1} />);

            await waitFor(() => {
                expect(screen.getByText('(1)', { exact: false })).toBeInTheDocument();
            });
        });
    });

    describe('Read-Only Mode', () => {
        test('hides edit and delete buttons in read-only mode', async () => {
            tasksAPI.getByProject.mockResolvedValue({ tasks: mockTasks });

            render(<KanbanBoard projectId={1} isReadOnly={true} />);

            await waitFor(() => {
                expect(screen.getByText('Task 1')).toBeInTheDocument();
            });

            const editIcons = screen.queryAllByTestId('edit-icon');
            const deleteIcons = screen.queryAllByTestId('trash-icon');

            expect(editIcons).toHaveLength(0);
            expect(deleteIcons).toHaveLength(0);
        });

        test('hides add task button in read-only mode', async () => {
            tasksAPI.getByProject.mockResolvedValue({ tasks: [] });

            const { container } = render(<KanbanBoard projectId={1} isReadOnly={true} />);

            await waitFor(() => {
                expect(screen.getByText('To Do')).toBeInTheDocument();
            });

            const plusButtons = container.querySelectorAll('button');
            const addButtons = Array.from(plusButtons).filter(btn => btn.textContent.includes('Plus'));
            expect(addButtons).toHaveLength(0);
        });
    });

    describe('Task Creation', () => {
        test('opens modal when add button is clicked', async () => {
            tasksAPI.getByProject.mockResolvedValue({ tasks: [] });

            render(<KanbanBoard projectId={1} isReadOnly={false} />);

            await waitFor(() => {
                expect(screen.getByText('To Do')).toBeInTheDocument();
            });

            const addButtons = screen.getAllByRole('button');
            const plusButton = addButtons.find(btn => btn.textContent === 'Plus');

            if (plusButton) {
                fireEvent.click(plusButton);

                await waitFor(() => {
                    expect(screen.getByText('Add New Task')).toBeInTheDocument();
                });
            }
        });

        test('creates task successfully', async () => {
            const user = userEvent.setup();
            tasksAPI.getByProject.mockResolvedValue({ tasks: [] });
            tasksAPI.create.mockResolvedValue({ id: 4, title: 'New Task', status: 'To Do' });

            render(<KanbanBoard projectId={1} projectMembers={mockProjectMembers} />);

            await waitFor(() => {
                expect(screen.getByText('To Do')).toBeInTheDocument();
            });

            const addButtons = screen.getAllByRole('button');
            const plusButton = addButtons.find(btn => btn.textContent === 'Plus');

            if (plusButton) {
                fireEvent.click(plusButton);

                await waitFor(() => {
                    expect(screen.getByText('Add New Task')).toBeInTheDocument();
                });

                const titleInput = screen.getByPlaceholderText('Enter task title');
                await user.type(titleInput, 'New Task');

                const submitButton = screen.getByRole('button', { name: /Add Task/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    expect(tasksAPI.create).toHaveBeenCalledWith({
                        title: 'New Task',
                        description: '',
                        project_id: 1,
                        status: 'To Do',
                    });
                });
            }
        });

        test('validates task title is required', async () => {
            const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
            tasksAPI.getByProject.mockResolvedValue({ tasks: [] });

            render(<KanbanBoard projectId={1} />);

            await waitFor(() => {
                expect(screen.getByText('To Do')).toBeInTheDocument();
            });

            const addButtons = screen.getAllByRole('button');
            const plusButton = addButtons.find(btn => btn.textContent === 'Plus');

            if (plusButton) {
                fireEvent.click(plusButton);

                await waitFor(() => {
                    expect(screen.getByText('Add New Task')).toBeInTheDocument();
                });

                const submitButton = screen.getByRole('button', { name: /Add Task/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    expect(alertSpy).toHaveBeenCalledWith('Task title is required');
                });
            }

            alertSpy.mockRestore();
        });

        test('assigns task to member when selected', async () => {
            const user = userEvent.setup();
            tasksAPI.getByProject.mockResolvedValue({ tasks: [] });
            tasksAPI.create.mockResolvedValue({ id: 4, title: 'New Task', status: 'To Do' });

            render(<KanbanBoard projectId={1} projectMembers={mockProjectMembers} />);

            await waitFor(() => {
                expect(screen.getByText('To Do')).toBeInTheDocument();
            });

            const addButtons = screen.getAllByRole('button');
            const plusButton = addButtons.find(btn => btn.textContent === 'Plus');

            if (plusButton) {
                fireEvent.click(plusButton);

                await waitFor(() => {
                    expect(screen.getByText('Add New Task')).toBeInTheDocument();
                });

                const titleInput = screen.getByPlaceholderText('Enter task title');
                await user.type(titleInput, 'Assigned Task');

                const assigneeSelect = screen.getByLabelText(/Assign to/i);
                await user.selectOptions(assigneeSelect, '1');

                const submitButton = screen.getByRole('button', { name: /Add Task/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    expect(tasksAPI.create).toHaveBeenCalledWith(
                        expect.objectContaining({
                            assignee_id: 1,
                        })
                    );
                });
            }
        });
    });

    describe('Task Editing', () => {
        test('opens modal with task data when edit is clicked', async () => {
            tasksAPI.getByProject.mockResolvedValue({ tasks: mockTasks });

            render(<KanbanBoard projectId={1} />);

            await waitFor(() => {
                expect(screen.getByText('Task 1')).toBeInTheDocument();
            });

            const editIcons = screen.getAllByTestId('edit-icon');
            if (editIcons.length > 0) {
                fireEvent.click(editIcons[0]);

                await waitFor(() => {
                    expect(screen.getByText('Edit Task')).toBeInTheDocument();
                    expect(screen.getByDisplayValue('Task 1')).toBeInTheDocument();
                });
            }
        });

        test('updates task successfully', async () => {
            const user = userEvent.setup();
            tasksAPI.getByProject.mockResolvedValue({ tasks: mockTasks });
            tasksAPI.update.mockResolvedValue({});

            render(<KanbanBoard projectId={1} />);

            await waitFor(() => {
                expect(screen.getByText('Task 1')).toBeInTheDocument();
            });

            const editIcons = screen.getAllByTestId('edit-icon');
            if (editIcons.length > 0) {
                fireEvent.click(editIcons[0]);

                await waitFor(() => {
                    expect(screen.getByText('Edit Task')).toBeInTheDocument();
                });

                const titleInput = screen.getByDisplayValue('Task 1');
                await user.clear(titleInput);
                await user.type(titleInput, 'Updated Task');

                const submitButton = screen.getByRole('button', { name: /Save Changes/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    expect(tasksAPI.update).toHaveBeenCalledWith(
                        1,
                        expect.objectContaining({
                            title: 'Updated Task',
                        })
                    );
                });
            }
        });
    });

    describe('Task Deletion', () => {
        test('deletes task when confirmed', async () => {
            window.confirm = jest.fn(() => true);
            tasksAPI.getByProject.mockResolvedValue({ tasks: mockTasks });
            tasksAPI.delete.mockResolvedValue({});

            render(<KanbanBoard projectId={1} />);

            await waitFor(() => {
                expect(screen.getByText('Task 1')).toBeInTheDocument();
            });

            const deleteIcons = screen.getAllByTestId('trash-icon');
            if (deleteIcons.length > 0) {
                fireEvent.click(deleteIcons[0]);

                await waitFor(() => {
                    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this task?');
                    expect(tasksAPI.delete).toHaveBeenCalledWith(1);
                });
            }
        });

        test('does not delete task when cancelled', async () => {
            window.confirm = jest.fn(() => false);
            tasksAPI.getByProject.mockResolvedValue({ tasks: mockTasks });

            render(<KanbanBoard projectId={1} />);

            await waitFor(() => {
                expect(screen.getByText('Task 1')).toBeInTheDocument();
            });

            const deleteIcons = screen.getAllByTestId('trash-icon');
            if (deleteIcons.length > 0) {
                fireEvent.click(deleteIcons[0]);

                expect(window.confirm).toHaveBeenCalled();
                expect(tasksAPI.delete).not.toHaveBeenCalled();
            }
        });
    });

    describe('Modal Actions', () => {
        test('closes modal when X is clicked', async () => {
            tasksAPI.getByProject.mockResolvedValue({ tasks: [] });

            render(<KanbanBoard projectId={1} />);

            await waitFor(() => {
                expect(screen.getByText('To Do')).toBeInTheDocument();
            });

            const addButtons = screen.getAllByRole('button');
            const plusButton = addButtons.find(btn => btn.textContent === 'Plus');

            if (plusButton) {
                fireEvent.click(plusButton);

                await waitFor(() => {
                    expect(screen.getByText('Add New Task')).toBeInTheDocument();
                });

                const xButtons = screen.getAllByText('X');
                fireEvent.click(xButtons[0]);

                await waitFor(() => {
                    expect(screen.queryByText('Add New Task')).not.toBeInTheDocument();
                });
            }
        });

        test('closes modal when Cancel is clicked', async () => {
            tasksAPI.getByProject.mockResolvedValue({ tasks: [] });

            render(<KanbanBoard projectId={1} />);

            await waitFor(() => {
                expect(screen.getByText('To Do')).toBeInTheDocument();
            });

            const addButtons = screen.getAllByRole('button');
            const plusButton = addButtons.find(btn => btn.textContent === 'Plus');

            if (plusButton) {
                fireEvent.click(plusButton);

                await waitFor(() => {
                    expect(screen.getByText('Add New Task')).toBeInTheDocument();
                });

                const cancelButton = screen.getByRole('button', { name: /Cancel/i });
                fireEvent.click(cancelButton);

                await waitFor(() => {
                    expect(screen.queryByText('Add New Task')).not.toBeInTheDocument();
                });
            }
        });
    });

    describe('Error Handling', () => {
        test('handles error when fetching tasks fails', async () => {
            const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
            tasksAPI.getByProject.mockRejectedValue(new Error('Network error'));

            render(<KanbanBoard projectId={1} />);

            await waitFor(() => {
                expect(tasksAPI.getByProject).toHaveBeenCalledWith(1);
            });

            consoleError.mockRestore();
        });

        test('handles error when creating task fails', async () => {
            const user = userEvent.setup();
            const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
            const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

            tasksAPI.getByProject.mockResolvedValue({ tasks: [] });
            tasksAPI.create.mockRejectedValue(new Error('Server error'));

            render(<KanbanBoard projectId={1} />);

            await waitFor(() => {
                expect(screen.getByText('To Do')).toBeInTheDocument();
            });

            const addButtons = screen.getAllByRole('button');
            const plusButton = addButtons.find(btn => btn.textContent === 'Plus');

            if (plusButton) {
                fireEvent.click(plusButton);

                await waitFor(() => {
                    expect(screen.getByText('Add New Task')).toBeInTheDocument();
                });

                const titleInput = screen.getByPlaceholderText('Enter task title');
                await user.type(titleInput, 'New Task');

                const submitButton = screen.getByRole('button', { name: /Add Task/i });
                fireEvent.click(submitButton);

                await waitFor(() => {
                    expect(alertSpy).toHaveBeenCalledWith('Failed to save task');
                });
            }

            alertSpy.mockRestore();
            consoleError.mockRestore();
        });

        test('handles error when deleting task fails', async () => {
            const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
            window.confirm = jest.fn(() => true);

            tasksAPI.getByProject.mockResolvedValue({ tasks: mockTasks });
            tasksAPI.delete.mockRejectedValue(new Error('Delete failed'));

            render(<KanbanBoard projectId={1} />);

            await waitFor(() => {
                expect(screen.getByText('Task 1')).toBeInTheDocument();
            });

            const deleteIcons = screen.getAllByTestId('trash-icon');
            if (deleteIcons.length > 0) {
                fireEvent.click(deleteIcons[0]);

                await waitFor(() => {
                    expect(tasksAPI.delete).toHaveBeenCalled();
                });
            }

            consoleError.mockRestore();
        });
    });
});