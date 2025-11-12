import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsAPI } from '../api/projects';
import { authAPI } from '../api/auth';
import { Trash2, Edit, Eye, Plus, Shield, Search } from 'lucide-react';
import CreateProjectModal from '../components/CreateProjectModal';
import InvitationNotification from '../components/InvitationNotification';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [ownedProjects, setOwnedProjects] = useState([]);
    const [otherProjects, setOtherProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.two_factor_enabled || false);
    const [classFilter, setClassFilter] = useState('');
    const [cohortFilter, setCohortFilter] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await projectsAPI.getAll();
            const allProjects = response.items || [];

            const owned = allProjects.filter((project) => project.owner_id === user.id);

            const acceptedMemberProjects = allProjects.filter((project) => {
                if (project.owner_id === user.id) return false;
                return project.members?.some(
                    (member) => member.id === user.id && member.status === 'accepted'
                );
            });

            const myProjects = [...owned, ...acceptedMemberProjects];

            const others = allProjects.filter((project) => {
                if (project.owner_id === user.id) return false;
                const isAcceptedMember = project.members?.some(
                    (member) => member.id === user.id && member.status === 'accepted'
                );
                return !isAcceptedMember;
            });

            setOwnedProjects(myProjects);
            setOtherProjects(others);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;

        try {
            await projectsAPI.delete(projectId);
            fetchProjects();
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Failed to delete project');
        }
    };

    const handleViewProject = (projectId) => navigate(`/projects/${projectId}`);
    const handleEditProject = (projectId) => navigate(`/projects/${projectId}/edit`);

    const handleToggle2FA = async () => {
        try {
            if (twoFactorEnabled) {
                await authAPI.disable2FA(user.id);
                setTwoFactorEnabled(false);
                alert('2FA has been disabled successfully');
            } else {
                await authAPI.enable2FA(user.id);
                setTwoFactorEnabled(true);
                alert('2FA enabled! You will receive a verification code via email when logging in.');
            }
        } catch (error) {
            console.error('Error toggling 2FA:', error);
            alert('Failed to toggle 2FA. Please try again.');
        }
    };

    const filterProjects = (projects) => {
        return projects.filter((project) => {
            const className = project.class?.name?.toLowerCase() || '';
            const cohortName = project.cohort?.name?.toLowerCase() || '';

            const matchesClass = !classFilter || className.includes(classFilter.toLowerCase());
            const matchesCohort = !cohortFilter || cohortName.includes(cohortFilter.toLowerCase());
            return matchesClass && matchesCohort;
        });
    };

    const filteredOwnedProjects = filterProjects(ownedProjects);
    const filteredOtherProjects = filterProjects(otherProjects);

    const ProjectCard = ({ project, canEdit = false }) => (
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-200 hover:border-indigo-300 relative overflow-hidden hover:-translate-y-1.5">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

            {project.class && (
                <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 shadow-sm">
                        {project.class.name}
                    </span>
                </div>
            )}

            {project.cover_image && (
                <img
                    src={project.cover_image}
                    alt={project.name}
                    className="w-full h-36 object-cover rounded-xl mb-4 group-hover:scale-105 transition-transform duration-300"
                />
            )}

            <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-indigo-600 transition-colors">{project.name}</h3>
            {project.owner_id !== user.id && project.owner_name && (
                <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                    <span className="font-medium text-gray-700">Owner:</span> {project.owner_name}
                </p>
            )}
            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{project.description}</p>

            {project.members && project.members.length > 0 && (
                <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Team Members</p>
                    <div className="flex flex-wrap gap-2">
                        {project.members.slice(0, 3).map((member, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200"
                            >
                                {member.name}
                            </span>
                        ))}
                        {project.members.length > 3 && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-300">
                                +{project.members.length - 3} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {project.github_link && (
                <a
                    href={project.github_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 text-sm hover:text-indigo-700 font-medium hover:underline block mb-4 flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    View Repository
                </a>
            )}

            <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100">
                <button
                    onClick={() => handleViewProject(project.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 rounded-xl text-sm font-medium transition-all duration-200 border border-indigo-200 hover:border-indigo-300"
                >
                    <Eye size={16} />
                    Track Progress
                </button>

                {canEdit && (
                    <>
                        <button
                            onClick={() => handleEditProject(project.id)}
                            className="flex items-center justify-center gap-1 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-md"
                            title="Edit Project"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="flex items-center justify-center gap-1 px-3 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-md"
                            title="Delete Project"
                        >
                            <Trash2 size={16} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg font-medium text-gray-700">Loading projects...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Moringa Project Planner
                        </h1>
                        <p className="text-gray-600 mt-1 text-sm">
                            Welcome back, <span className="font-semibold">{user?.name}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <InvitationNotification />
                        <button
                            onClick={handleToggle2FA}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${twoFactorEnabled
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md hover:shadow-lg hover:scale-105'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                }`}
                        >
                            <Shield size={18} />
                            <span className="text-sm">{twoFactorEnabled ? '2FA Enabled' : 'Enable 2FA'}</span>
                        </button>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 font-medium text-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Search Filters */}
                <div className="mb-8 max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[{ value: classFilter, set: setClassFilter, placeholder: 'Filter by class name...' },
                      { value: cohortFilter, set: setCohortFilter, placeholder: 'Filter by cohort name...' }].map((filter, idx) => (
                        <div key={idx} className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search size={20} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder={filter.placeholder}
                                value={filter.value}
                                onChange={(e) => filter.set(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm text-gray-900 placeholder-gray-400"
                            />
                        </div>
                    ))}
                </div>

                {/* My Projects */}
                <div className="mb-16">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">My Projects</h2>
                            <p className="text-gray-600 mt-1">Projects you own and collaborate on</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all duration-200 hover:scale-105 font-medium"
                        >
                            <Plus size={20} />
                            New Project
                        </button>
                    </div>

                    {filteredOwnedProjects.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-md border border-gray-200 text-center py-16 px-6">
                            {ownedProjects.length === 0 ? (
                                <>
                                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                        <Plus size={36} className="text-indigo-600" />
                                    </div>
                                    <p className="text-gray-600 mb-6 text-lg">You haven't created any projects yet.</p>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 font-medium"
                                    >
                                        Create Your First Project
                                    </button>
                                </>
                            ) : (
                                <p className="text-gray-500 text-lg">No projects match your search.</p>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredOwnedProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    canEdit={project.owner_id === user.id}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Other Projects */}
                <div>
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Other Students' Projects</h2>
                        <p className="text-gray-600 mt-1">Explore projects from your peers</p>
                    </div>

                    {filteredOtherProjects.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-md border border-gray-200 text-center py-16 px-6">
                            <p className="text-gray-500 text-lg">
                                {otherProjects.length === 0 ? 'No other projects to display.' : 'No projects match your search.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredOtherProjects.map((project) => (
                                <ProjectCard key={project.id} project={project} canEdit={false} />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {showCreateModal && (
                <CreateProjectModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchProjects();
                    }}
                />
            )}
        </div>
    );
};

export default StudentDashboard;
