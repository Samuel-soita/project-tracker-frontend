import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsAPI } from '../api/projects';
import { cohortsAPI } from '../api/cohorts';
import { classesAPI } from '../api/classes';
import { authAPI } from '../api/auth';
import { Plus, Edit, Trash2, Eye, Shield, Search } from 'lucide-react';
import CreateProjectModal from '../components/CreateProjectModal';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('projects');
    const [projects, setProjects] = useState([]);
    const [cohorts, setCohorts] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showCohortModal, setShowCohortModal] = useState(false);
    const [showClassModal, setShowClassModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.two_factor_enabled || false);
    const [classFilter, setClassFilter] = useState('');
    const [cohortFilter, setCohortFilter] = useState('');

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'projects') {
                const response = await projectsAPI.getAll();
                setProjects(response.items || []);
            } else if (activeTab === 'cohorts') {
                const response = await cohortsAPI.getAll();
                setCohorts(response.items || []);
            } else if (activeTab === 'classes') {
                const response = await classesAPI.getAll();
                setClasses(Array.isArray(response) ? response : []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProject = async (id) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;
        try {
            await projectsAPI.delete(id);
            fetchData();
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

    const handleDeleteCohort = async (id) => {
        if (!window.confirm('Are you sure you want to delete this cohort?')) return;
        try {
            await cohortsAPI.delete(id);
            fetchData();
        } catch (error) {
            console.error('Error deleting cohort:', error);
        }
    };

    const handleDeleteClass = async (id) => {
        if (!window.confirm('Are you sure you want to delete this class?')) return;
        try {
            await classesAPI.delete(id);
            fetchData();
        } catch (error) {
            console.error('Error deleting class:', error);
        }
    };

    const handleToggle2FA = async () => {
        try {
            if (twoFactorEnabled) {
                // Disable 2FA
                await authAPI.disable2FA(user.id);
                setTwoFactorEnabled(false);
                alert('2FA has been disabled successfully');
            } else {
                // Enable 2FA
                await authAPI.enable2FA(user.id);
                setTwoFactorEnabled(true);
                alert('2FA enabled! You will receive a verification code via email when logging in.');
            }
        } catch (error) {
            console.error('Error toggling 2FA:', error);
            alert('Failed to toggle 2FA. Please try again.');
        }
    };

    // Filter projects based on class and cohort filters
    const filterProjects = () => {
        return projects.filter((project) => {
            const className = project.class?.name?.toLowerCase() || '';
            const cohortName = project.cohort?.name?.toLowerCase() || '';

            const matchesClass = !classFilter || className.includes(classFilter.toLowerCase());
            const matchesCohort = !cohortFilter || cohortName.includes(cohortFilter.toLowerCase());
            return matchesClass && matchesCohort;
        });
    };

    const filteredProjects = filterProjects();

    const ProjectsTab = () => (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                    Total Projects
                    <span className="ml-3 text-2xl">{filteredProjects.length}</span>
                </h2>
                <button
                    onClick={() => setShowProjectModal(true)}
                    className="flex items-center gap-2 btn-primary"
                >
                    <Plus size={20} />
                    New Project
                </button>
            </div>

            {/* Search Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Filter by class name..."
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm text-gray-900 placeholder-gray-500"
                    />
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Filter by cohort name..."
                        value={cohortFilter}
                        onChange={(e) => setCohortFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm text-gray-900 placeholder-gray-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => (
                    <div key={project.id} className="bg-white rounded-lg shadow-sm p-4 border relative">
                        {/* Class Name - Top Right */}
                        {project.class && (
                            <div className="absolute top-3 right-3">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    {project.class.name}
                                </span>
                            </div>
                        )}

                        <h3 className="font-semibold mb-2 pr-20">{project.name}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {project.description}
                        </p>

                        {/* Members */}
                        {project.members && project.members.length > 0 && (
                            <div className="mb-3">
                                <p className="text-xs text-gray-500 mb-1">Members:</p>
                                <div className="flex flex-wrap gap-1">
                                    {project.members.slice(0, 3).map((member, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                                        >
                                            {member.name}
                                        </span>
                                    ))}
                                    {project.members.length > 3 && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                                            +{project.members.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate(`/projects/${project.id}`)}
                                className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                            >
                                <Eye size={14} />
                                View
                            </button>
                            <button
                                onClick={() => {
                                    setEditingItem(project);
                                    setShowProjectModal(true);
                                }}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm"
                            >
                                <Edit size={14} />
                            </button>
                            <button
                                onClick={() => handleDeleteProject(project.id)}
                                className="flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const CohortsTab = () => (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                    Total Cohorts
                    <span className="ml-3 text-2xl">{cohorts.length}</span>
                </h2>
                <button
                    onClick={() => setShowCohortModal(true)}
                    className="flex items-center gap-2 btn-primary"
                >
                    <Plus size={20} />
                    New Cohort
                </button>
            </div>

            <div className="space-y-4">
                {cohorts.map((cohort) => (
                    <div key={cohort.id} className="bg-white rounded-lg shadow-sm p-4 border">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className="font-semibold mb-2">{cohort.name}</h3>
                                <div className="flex gap-4 text-sm text-gray-600">
                                    {cohort.start_date && (
                                        <p>
                                            <span className="font-medium">Start:</span> {new Date(cohort.start_date).toLocaleDateString()}
                                        </p>
                                    )}
                                    {cohort.end_date && (
                                        <p>
                                            <span className="font-medium">End:</span> {new Date(cohort.end_date).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditingItem(cohort);
                                        setShowCohortModal(true);
                                    }}
                                    className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteCohort(cohort.id)}
                                    className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const ClassesTab = () => (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                    Total Classes
                    <span className="ml-3 text-2xl">{classes.length}</span>
                </h2>
                <button
                    onClick={() => setShowClassModal(true)}
                    className="flex items-center gap-2 btn-primary"
                >
                    <Plus size={20} />
                    New Class
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map((classItem) => (
                    <div key={classItem.id} className="bg-white rounded-lg shadow-sm p-4 border">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                                <h3 className="font-semibold mb-1">{classItem.name}</h3>
                                <p className="text-sm text-gray-600">{classItem.description}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={() => {
                                    setEditingItem(classItem);
                                    setShowClassModal(true);
                                }}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm"
                            >
                                <Edit size={14} />
                            </button>
                            <button
                                onClick={() => handleDeleteClass(classItem.id)}
                                className="flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-red-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                Admin Dashboard
                            </h1>
                            <p className="text-gray-600 mt-1 text-sm">Manage your platform</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleToggle2FA}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${twoFactorEnabled
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md hover:shadow-lg hover:scale-105'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                    }`}
                            >
                                <Shield size={18} />
                                <span className="text-sm">{twoFactorEnabled ? '2FA Enabled' : 'Enable 2FA'}</span>
                            </button>
                            <button
                                onClick={logout}
                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 font-medium text-sm"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Tabs */}
                <div className="flex gap-2 mb-10 bg-white rounded-xl p-2 shadow-md border border-gray-200">
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${activeTab === 'projects'
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Projects
                    </button>
                    <button
                        onClick={() => setActiveTab('cohorts')}
                        className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${activeTab === 'cohorts'
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Cohorts
                    </button>
                    <button
                        onClick={() => setActiveTab('classes')}
                        className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${activeTab === 'classes'
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Classes
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-lg font-medium text-gray-700">Loading...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'projects' && <ProjectsTab />}
                        {activeTab === 'cohorts' && <CohortsTab />}
                        {activeTab === 'classes' && <ClassesTab />}
                    </>
                )}
            </main>

            {/* Modals */}
            {showProjectModal && (
                <CreateProjectModal
                    project={editingItem}
                    onClose={() => {
                        setShowProjectModal(false);
                        setEditingItem(null);
                    }}
                    onSuccess={() => {
                        setShowProjectModal(false);
                        setEditingItem(null);
                        fetchData();
                    }}
                />
            )}

            {showCohortModal && (
                <CohortModal
                    cohort={editingItem}
                    onClose={() => {
                        setShowCohortModal(false);
                        setEditingItem(null);
                    }}
                    onSuccess={() => {
                        setShowCohortModal(false);
                        setEditingItem(null);
                        fetchData();
                    }}
                />
            )}

            {showClassModal && (
                <ClassModal
                    classItem={editingItem}
                    onClose={() => {
                        setShowClassModal(false);
                        setEditingItem(null);
                    }}
                    onSuccess={() => {
                        setShowClassModal(false);
                        setEditingItem(null);
                        fetchData();
                    }}
                />
            )}
        </div>
    );
};

// Cohort Modal Component
const CohortModal = ({ cohort, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: cohort?.name || '',
        start_date: cohort?.start_date || '',
        end_date: cohort?.end_date || '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (cohort) {
                await cohortsAPI.update(cohort.id, formData);
            } else {
                await cohortsAPI.create(formData);
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving cohort:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6">
                        {cohort ? 'Edit Cohort' : 'Create New Cohort'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cohort Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) =>
                                    setFormData({ ...formData, start_date: e.target.value })
                                }
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) =>
                                    setFormData({ ...formData, end_date: e.target.value })
                                }
                                className="input-field"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 btn-primary disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : cohort ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Class Modal Component
const ClassModal = ({ classItem, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: classItem?.name || '',
        description: classItem?.description || '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (classItem) {
                await classesAPI.update(classItem.id, formData);
            } else {
                await classesAPI.create(formData);
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving class:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6">
                        {classItem ? 'Edit Class' : 'Create New Class'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Class Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="input-field"
                                placeholder="e.g., SE-06, SE-07, DS-04"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                rows={4}
                                className="input-field resize-none"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 btn-primary disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : classItem ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;