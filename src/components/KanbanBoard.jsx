import { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import { tasksAPI } from '../api/tasks';

// Sortable Task Card Component
const SortableTaskCard = ({ task, onEdit, onDelete, isReadOnly, canDrag = true }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({
            id: task.id,
            disabled: !canDrag,
        });

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0) scale(1)` : undefined,
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-3 hover:shadow-md transition-shadow"
        >
            <div className="flex justify-between items-start mb-2">
                <div
                    {...attributes}
                    {...listeners}
                    className="flex-1 cursor-move"
                >
                    <h4 className="font-medium text-sm">{task.title}</h4>
                </div>
                {!isReadOnly && (
                    <div className="flex gap-1 ml-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(task);
                            }}
                            className="text-blue-600 hover:text-blue-700 p-1 cursor-pointer"
                            type="button"
                        >
                            <Edit2 size={14} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(task.id);
                            }}
                            className="text-red-600 hover:text-red-700 p-1 cursor-pointer"
                            type="button"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                )}
            </div>
            {task.description && (
                <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
            )}
            {task.assignee && (
                <p className="text-xs text-gray-500 mt-2">Assigned to: {task.assignee.name}</p>
            )}
        </div>
    );
};

// Kanban Column Component
const KanbanColumn = ({ title, tasks, columnId, onAddTask, onEditTask, onDeleteTask, isReadOnly, canDrag = true, showAddButton }) => {
    const taskIds = tasks.map((task) => task.id);
    const { setNodeRef } = useDroppable({ id: columnId });

    return (
        <div className="bg-gray-100 rounded-lg p-4 w-80 flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700">
                    {title}
                    <span className="ml-2 text-sm text-gray-500">({tasks.length})</span>
                </h3>
                {!isReadOnly && showAddButton && (
                    <button
                        onClick={() => onAddTask(columnId)}
                        className="text-blue-600 hover:text-blue-700"
                    >
                        <Plus size={20} />
                    </button>
                )}
            </div>

            <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                <div
                    ref={setNodeRef}
                    className="space-y-2 min-h-[200px]"
                    data-column-id={columnId}
                >
                    {tasks.map((task) => (
                        <SortableTaskCard
                            key={task.id}
                            task={task}
                            onEdit={onEditTask}
                            onDelete={onDeleteTask}
                            isReadOnly={isReadOnly}
                            canDrag={canDrag}
                        />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
};

// Main Kanban Board Component
const KanbanBoard = ({ projectId, isReadOnly = false, canDrag = true, projectMembers = [] }) => {
    const [tasks, setTasks] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [taskForm, setTaskForm] = useState({
        title: '',
        assignee_id: '',
        description: '',
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const columns = {
        'To Do': 'To Do',
        'In Progress': 'In Progress',
        Done: 'Done',
    };

    useEffect(() => {
        fetchTasks();
    }, [projectId]);

    const fetchTasks = async () => {
        try {
            const response = await tasksAPI.getByProject(projectId);
            setTasks(response.tasks || []);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const getTasksByStatus = (status) => {
        return tasks.filter((task) => task.status === status);
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragOver = (event) => {
        const { active, over } = event;

        if (!over) return;

        const activeTask = tasks.find((task) => task.id === active.id);
        if (!activeTask) return;

        // Check if we're over a task or a column
        const overTask = tasks.find((task) => task.id === over.id);

        let newStatus = activeTask.status;

        if (overTask) {
            // Dropped on another task - use that task's status
            newStatus = overTask.status;
        } else if (Object.keys(columns).includes(over.id)) {
            // Dropped directly on a column
            newStatus = over.id;
        }

        if (activeTask.status !== newStatus) {
            setTasks((tasks) =>
                tasks.map((task) =>
                    task.id === activeTask.id ? { ...task, status: newStatus } : task
                )
            );
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        setActiveId(null);

        if (!over) return;

        const activeTask = tasks.find((task) => task.id === active.id);
        if (!activeTask) return;

        // Update task status in backend
        try {
            await tasksAPI.update(activeTask.id, {
                status: activeTask.status,
            });
        } catch (error) {
            console.error('Error updating task:', error);
            fetchTasks(); // Revert on error
        }
    };

    const handleAddTask = () => {
        setEditingTask(null);
        setTaskForm({
            title: '',
            assignee_id: '',
            description: '',
        });
        setShowTaskModal(true);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setTaskForm({
            title: task.title,
            assignee_id: task.assignee_id || '',
            description: task.description || '',
        });
        setShowTaskModal(true);
    };

    const handleCloseModal = () => {
        setShowTaskModal(false);
        setEditingTask(null);
        setTaskForm({
            title: '',
            assignee_id: '',
            description: '',
        });
    };

    const handleSubmitTask = async (e) => {
        e.preventDefault();

        if (!taskForm.title.trim()) {
            alert('Task title is required');
            return;
        }

        try {
            const taskData = {
                title: taskForm.title,
                description: taskForm.description,
            };

            if (taskForm.assignee_id) {
                taskData.assignee_id = parseInt(taskForm.assignee_id);
            }

            if (editingTask) {
                // Update existing task
                await tasksAPI.update(editingTask.id, taskData);
            } else {
                // Create new task
                taskData.project_id = projectId;
                taskData.status = 'To Do';
                await tasksAPI.create(taskData);
            }

            handleCloseModal();
            fetchTasks();
        } catch (error) {
            console.error('Error saving task:', error);
            alert('Failed to save task');
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;

        try {
            await tasksAPI.delete(taskId);
            fetchTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    return (
        <div className="w-full">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {Object.entries(columns).map(([key, title]) => (
                        <KanbanColumn
                            key={key}
                            title={title}
                            tasks={getTasksByStatus(key)}
                            columnId={key}
                            onAddTask={handleAddTask}
                            onEditTask={handleEditTask}
                            onDeleteTask={handleDeleteTask}
                            isReadOnly={isReadOnly}
                            canDrag={canDrag}
                            showAddButton={key === 'To Do'}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeId ? (
                        <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-blue-500">
                            <p className="font-medium">
                                {tasks.find((task) => task.id === activeId)?.title}
                            </p>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Task Creation/Edit Modal */}
            {showTaskModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                {editingTask ? 'Edit Task' : 'Add New Task'}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitTask}>
                            <div className="space-y-4">
                                {/* Task Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Task <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={taskForm.title}
                                        onChange={(e) =>
                                            setTaskForm({ ...taskForm, title: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter task title"
                                        required
                                    />
                                </div>

                                {/* Assign To */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Assign to
                                    </label>
                                    <select
                                        value={taskForm.assignee_id}
                                        onChange={(e) =>
                                            setTaskForm({ ...taskForm, assignee_id: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Unassigned</option>
                                        {projectMembers.map((member) => (
                                            <option key={member.id} value={member.id}>
                                                {member.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Due Date / Note */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Note
                                    </label>
                                    <textarea
                                        value={taskForm.description}
                                        onChange={(e) =>
                                            setTaskForm({ ...taskForm, description: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Add notes or description"
                                        rows="3"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    {editingTask ? 'Save Changes' : 'Add Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KanbanBoard;
