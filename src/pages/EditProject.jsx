import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsAPI } from '../api/projects';
import { classesAPI } from '../api/classes';
import { cohortsAPI } from '../api/cohorts';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

const EditProject = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        github_link: '',
        class_id: '',
        cohort_id: '',
    });
    const [classes, setClasses] = useState([]);
    const [cohorts, setCohorts] = useState([]);
    const [ownerName, setOwnerName] = useState('');
    const [members, setMembers] = useState([]);
    const [memberName, setMemberName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProject();
        fetchClassesAndCohorts();
    }, [id]);

    const fetchClassesAndCohorts = async () => {
        try {
            const [classesResponse, cohortsResponse] = await Promise.all([
                classesAPI.getAll(),
                cohortsAPI.getAll(),
            ]);
            setClasses(Array.isArray(classesResponse) ? classesResponse : []);
            setCohorts(cohortsResponse.items || []);
        } catch (err) {
            console.error('Error fetching classes and cohorts:', err);
        }
    };

    const fetchProject = async () => {
        try {
            setLoading(true);
            const response = await projectsAPI.getById(id);
            const project = response.project;

            // Check if user has permission to edit
            if (!isAdmin() && project.owner_id !== user?.id) {
                alert('You do not have permission to edit this project');
                navigate(`/projects/${id}`);
                return;
            }

            setFormData({
                name: project.name || '',
                description: project.description || '',
                github_link: project.github_link || '',
                class_id: project.class_id || '',
                cohort_id: project.cohort_id || '',
            });

            // Set owner name
            if (project.owner) {
                setOwnerName(project.owner.name || project.owner.email);
            }
        } catch (error) {
            console.error('Error fetching project:', error);
            alert('Failed to load project');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = () => {
        if (!memberName.trim()) return;

        const newMember = {
            name: memberName.trim(),
        };

        setMembers([...members, newMember]);
        setMemberName('');
        setError('');
    };

    const handleRemoveMember = (index) => {
        setMembers(members.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert('Project name is required');
            return;
        }

        try {
            await projectsAPI.update(id, {
                name: formData.name,
                description: formData.description,
                github_link: formData.github_link,
                class_id: formData.class_id ? parseInt(formData.class_id) : null,
                cohort_id: formData.cohort_id ? parseInt(formData.cohort_id) : null,
                members: members, // Just pass member names as part of project data
            });

            alert('Project updated successfully');
            navigate(`/projects/${id}`);
        } catch (error) {
            console.error('Error updating project:', error);
            alert('Failed to update project');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading project...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate(`/projects/${id}`)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft size={20} />
                        Back to Project
                    </button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h1 className="text-2xl font-bold mb-6">Edit Project</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Project Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Project Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter project name"
                                required
                            />
                        </div>

                        {/* Project Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Project Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Describe your project"
                                rows="4"
                            />
                        </div>

                        {/* Project Owner (readonly) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Project Owner
                            </label>
                            <input
                                type="text"
                                value={ownerName}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                            />
                        </div>

                        {/* GitHub Link */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                GitHub Link
                            </label>
                            <input
                                type="url"
                                value={formData.github_link}
                                onChange={(e) => setFormData({ ...formData, github_link: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://github.com/username/repository"
                            />
                        </div>

                        {/* Class Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Class
                            </label>
                            <select
                                value={formData.class_id}
                                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select a class (optional)</option>
                                {classes.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name} {cls.track ? `- ${cls.track}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Cohort Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cohort
                            </label>
                            <select
                                value={formData.cohort_id}
                                onChange={(e) => setFormData({ ...formData, cohort_id: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select a cohort (optional)</option>
                                {cohorts.map((cohort) => (
                                    <option key={cohort.id} value={cohort.id}>
                                        {cohort.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Members */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Members
                            </label>
                            {error && (
                                <div className="mb-2 text-red-500 text-sm">{error}</div>
                            )}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={memberName}
                                    onChange={(e) => setMemberName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddMember();
                                        }
                                    }}
                                    placeholder="Enter member name"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddMember}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <Plus size={20} />
                                    Add
                                </button>
                            </div>

                            {/* Member List */}
                            {members.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {members.map((member, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {member.name}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMember(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate(`/projects/${id}`)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default EditProject;
