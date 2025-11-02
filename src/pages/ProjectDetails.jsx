import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsAPI } from '../api/projects';
import { membersAPI } from '../api/members';
import { ArrowLeft, Edit, Trash2, X } from 'lucide-react';
import KanbanBoard from '../components/KanbanBoard';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProject();
    }, [id]);

    const fetchProject = async () => {
        try {
            setLoading(true);
            const response = await projectsAPI.getById(id);
            setProject(response.project);
        } catch (error) {
            console.error('Error fetching project:', error);
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;

        try {
            await projectsAPI.delete(id);
            navigate('/dashboard');
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Failed to delete project');
        }
    };

    const handleRemoveMember = async (userId, memberName) => {
        if (!window.confirm(`Are you sure you want to remove ${memberName} from this project?`)) return;

        try {
            await membersAPI.remove(id, userId);
            // Refresh project data
            fetchProject();
        } catch (error) {
            console.error('Error removing member:', error);
            alert('Failed to remove member');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg font-medium text-gray-700">Loading project...</p>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-medium text-gray-700">Project not found</p>
                </div>
            </div>
        );
    }

    const isOwner = project.owner_id === user?.id;
    const canEdit = isOwner || isAdmin();

    // Check if user is an accepted member
    const isAcceptedMember = project.members?.some(
        (member) => member.id === user?.id && member.status === 'accepted'
    );

    // Collaborators can drag tasks but cannot edit/delete
    const canDrag = isOwner || isAdmin() || isAcceptedMember;
    const isReadOnly = !canEdit;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
                        >
                            <ArrowLeft size={20} />
                            Back to Dashboard
                        </button>

                        {canEdit && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => navigate(`/projects/${id}/edit`)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 font-medium"
                                >
                                    <Edit size={18} />
                                    Edit
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 font-medium"
                                >
                                    <Trash2 size={18} />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Project Info Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8 relative overflow-hidden">
                    {/* Gradient accent */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>

                    <div className="flex items-start justify-between mb-8">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {project.name}
                            </h1>
                            <p className="text-gray-600 text-lg leading-relaxed">{project.description}</p>
                        </div>

                        {project.cover_image && (
                            <img
                                src={project.cover_image}
                                alt={project.name}
                                className="w-40 h-40 object-cover rounded-xl shadow-md ml-6 border-2 border-gray-200"
                            />
                        )}
                    </div>

                    {/* Project Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-200">
                        {/* Owner */}
                        {project.owner && (
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
                                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wide">Project Owner</h3>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                                        {project.owner.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{project.owner.name}</p>
                                        <p className="text-sm text-gray-600">{project.owner.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* GitHub Link */}
                        {project.github_link && (
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wide">GitHub Repository</h3>
                                <a
                                    href={project.github_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                    View Repository
                                </a>
                            </div>
                        )}

                        {/* Class */}
                        {project.class && (
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wide">Class</h3>
                                <p className="text-lg font-bold text-purple-800">{project.class.name}</p>
                            </div>
                        )}

                        {/* Cohort */}
                        {project.cohort && (
                            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-200">
                                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wide">Cohort</h3>
                                <p className="text-lg font-bold text-orange-800">{project.cohort.name}</p>
                            </div>
                        )}
                    </div>

                    {/* Team Members */}
                    {project.members && project.members.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wide">Team Members ({project.members.length})</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {project.members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="group flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                                    >
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                                            {member.name?.charAt(0).toUpperCase() || 'M'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold truncate text-gray-900">{member.name}</p>
                                                {member.status === 'pending' && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
                                                        Pending
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-600 truncate">{member.email}</p>
                                        </div>
                                        {canEdit && (
                                            <button
                                                onClick={() => handleRemoveMember(member.id, member.name)}
                                                className="p-1.5 hover:bg-red-100 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                                                title="Remove member"
                                            >
                                                <X size={16} className="text-red-600" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Kanban Board */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Project Progress
                        </h2>
                        <p className="text-gray-600 mt-2">Track and manage your project tasks</p>
                    </div>
                    <KanbanBoard
                        projectId={id}
                        isReadOnly={isReadOnly}
                        canDrag={canDrag}
                        projectMembers={project.members || []}
                    />
                </div>
            </main>
        </div>
    );
};

export default ProjectDetails;
