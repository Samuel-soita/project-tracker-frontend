import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { projectsAPI } from '../api/projects';
import { classesAPI } from '../api/classes';
import { cohortsAPI } from '../api/cohorts';
import { membersAPI } from '../api/members';
import { useAuth } from '../context/AuthContext';

const CreateProjectModal = ({ onClose, onSuccess, project = null }) => {
    const isEdit = !!project;
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        name: project?.name || '',
        description: project?.description || '',
        github_link: project?.github_link || '',
        class_id: project?.class_id || '',
        cohort_id: project?.cohort_id || '',
    });

    const [members, setMembers] = useState([]);
    const [memberEmail, setMemberEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [classes, setClasses] = useState([]);
    const [cohorts, setCohorts] = useState([]);

    useEffect(() => {
        fetchClassesAndCohorts();
        // Load existing members when editing
        if (isEdit && project?.members) {
            const existingMembers = project.members.map(member => ({
                email: member.email,
                name: member.name,
                status: member.status
            }));
            setMembers(existingMembers);
        }
    }, []);

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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleAddMember = () => {
        if (!memberEmail.trim()) return;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(memberEmail.trim())) {
            setError('Please enter a valid email address');
            return;
        }

        const newMember = {
            email: memberEmail.trim(),
        };

        setMembers([...members, newMember]);
        setMemberEmail('');
        setError('');
    };

    const handleRemoveMember = (index) => {
        setMembers(members.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate required fields
        if (!formData.class_id) {
            setError('Please select a class');
            return;
        }
        if (!formData.cohort_id) {
            setError('Please select a cohort');
            return;
        }

        setLoading(true);

        try {
            const projectData = {
                ...formData,
                class_id: parseInt(formData.class_id),
                cohort_id: parseInt(formData.cohort_id),
            };

            let createdProject;
            if (isEdit) {
                await projectsAPI.update(project.id, projectData);
                createdProject = project;
            } else {
                // Create the project first
                createdProject = await projectsAPI.create(projectData);

                // Then send email invitations to members
                if (members.length > 0) {
                    const invitationPromises = members.map((member) =>
                        membersAPI.invite(createdProject.id, member.email, 'collaborator')
                    );

                    // Send all invitations in parallel
                    await Promise.allSettled(invitationPromises);
                }
            }

            onSuccess();
        } catch (err) {
            setError(err.message || 'Failed to save project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">
                        {isEdit ? 'Edit Project' : 'Create new Project'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {/* Project Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter project name"
                        />
                    </div>

                    {/* Project Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe your project"
                        />
                    </div>

                    {/* Project Owner (readonly) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Owner
                        </label>
                        <input
                            type="text"
                            value={user?.name || user?.email || 'You'}
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
                            name="github_link"
                            value={formData.github_link}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://github.com/username/repo"
                        />
                    </div>

                    {/* Class Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Class
                        </label>
                        <select
                            name="class_id"
                            value={formData.class_id}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a class</option>
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
                            name="cohort_id"
                            value={formData.cohort_id}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a cohort</option>
                            {cohorts.map((cohort) => (
                                <option key={cohort.id} value={cohort.id}>
                                    {cohort.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Members Email Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {isEdit ? 'Project Members' : 'Invite Members'}
                        </label>

                        {!isEdit && (
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="email"
                                    value={memberEmail}
                                    onChange={(e) => setMemberEmail(e.target.value)}
                                    placeholder="Enter member email address"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddMember();
                                        }
                                    }}
                                />

                                <button
                                    type="button"
                                    onClick={handleAddMember}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        )}

                        {members.length > 0 && (
                            <div className="space-y-2">
                                {members.map((member, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-sm">{member.name || member.email}</p>
                                                {member.status && (
                                                    <span className={`text-xs px-2 py-0.5 rounded ${member.status === 'accepted'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {member.status}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {isEdit
                                                    ? member.email
                                                    : 'Invitation will be sent via email'}
                                            </p>
                                        </div>
                                        {!isEdit && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMember(index)}
                                                className="text-red-600 hover:text-red-700 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectModal;