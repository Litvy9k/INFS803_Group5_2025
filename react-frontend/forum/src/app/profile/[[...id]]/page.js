'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { postsAPI, userAPI } from '@/app/services/apiService';

// Post Item Component for displaying user's posts
const PostItem = ({ post, isOwner, onEdit, onDelete, formatRelativeTime }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        try {
            await onDelete(post.id);
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="bg-secondary/50 rounded-lg p-4 border border-primary/20 hover:border-primary/40 transition-colors">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <Link
                        href={`/posts/${post.id}`}
                        className="text-white hover:text-primary font-medium text-lg transition-colors"
                    >
                        {post.title}
                    </Link>
                    <p className="text-gray-400 text-sm mt-1">
                        {formatRelativeTime(post.created_at)}
                    </p>
                </div>

                {isOwner && (
                    <div className="flex items-center space-x-2 ml-4">
                        <button
                            onClick={() => onEdit(post)}
                            className="text-primary hover:border-[#1b9f67] border-transparent border-2 text-sm font-medium px-2 py-1 rounded hover:cursor-pointer"
                        >
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="text-red-400 hover:border-red-400 border-transparent border-2 hover:text-red-300 text-sm font-medium px-2 py-1 rounded disabled:opacity-50 hover:cursor-pointer"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                )}
            </div>

            <div className="text-gray-300 text-sm leading-relaxed mb-3">
                {post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
            </div>

            <div className="flex items-center space-x-4 text-xs text-gray-400">
                <div className="flex items-center space-x-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    <span>{post.upvotes || post.upvotes_count || 0} upvotes</span>
                </div>
                <div className="flex items-center space-x-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{post.reply_count || 0} replies</span>
                </div>
            </div>
        </div>
    );
};

// Edit Profile Modal Component
const EditProfileModal = ({ isOpen, user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        nickname: '',
        email: '',
        first_name: '',
        last_name: '',
        avatar: null, // Changed to handle file
    });
    const [avatarPreview, setAvatarPreview] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user && isOpen) {
            setFormData({
                nickname: user.nickname || '',
                email: user.email || '',
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                avatar: null
            });
            // Set current avatar as preview
            setAvatarPreview(user.avatar || '');
            setErrors({});
        }
    }, [user, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear field error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({
                    ...prev,
                    avatar: 'Please select an image file'
                }));
                return;
            }

            // Validate file size (e.g., max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({
                    ...prev,
                    avatar: 'Image size must be less than 5MB'
                }));
                return;
            }

            // Clear any previous error
            setErrors(prev => ({
                ...prev,
                avatar: ''
            }));

            // Set file in form data
            setFormData(prev => ({
                ...prev,
                avatar: file
            }));

            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
        }
    };

    const removeAvatar = () => {
        setFormData(prev => ({
            ...prev,
            avatar: null
        }));
        setAvatarPreview(user?.avatar || ''); // Reset to original avatar

        // Clear file input
        const fileInput = document.getElementById('avatar-upload');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.nickname.trim()) {
            newErrors.nickname = 'Nickname is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSaving(true);
        try {
            // Create FormData for multipart form submission
            const submitData = new FormData();
            submitData.append('nickname', formData.nickname.trim());
            submitData.append('email', formData.email.trim());
            submitData.append('first_name', formData.first_name.trim());
            submitData.append('last_name', formData.last_name.trim());

            // Only append avatar if a new file was selected
            if (formData.avatar) {
                submitData.append('avatar', formData.avatar);
            }

            const updatedUser = await onSave(submitData);
            onClose();
        } catch (error) {
            console.error('Error updating profile:', error);
            setErrors({ form: 'Failed to update profile. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setFormData({
            nickname: user?.nickname || '',
            email: user?.email || '',
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            avatar: null
        });
        setAvatarPreview(user?.avatar || '');
        setErrors({});

        // Clear file input
        const fileInput = document.getElementById('avatar-upload');
        if (fileInput) {
            fileInput.value = '';
        }

        onClose();
    };

    // Cleanup preview URL on unmount
    useEffect(() => {
        return () => {
            if (avatarPreview && avatarPreview.startsWith('blob:')) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1f1e33] border-2 border-[#1b9f67] rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Edit Profile</h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-300 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {errors.form && (
                        <div className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-lg mb-4">
                            {errors.form}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                value={user?.username || ''}
                                disabled
                                className="w-full bg-background/50 border border-gray-600 rounded-lg py-2 px-3 text-gray-400 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Nickname *
                            </label>
                            <input
                                type="text"
                                name="nickname"
                                value={formData.nickname}
                                onChange={handleChange}
                                className={`w-full bg-background border rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/60 ${errors.nickname ? 'border-red-500' : 'border-primary/40'}`}
                                placeholder="Your display name"
                                disabled={isSaving}
                            />
                            {errors.nickname && (
                                <p className="text-red-400 text-sm mt-1">{errors.nickname}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full bg-background border rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/60 ${errors.email ? 'border-red-500' : 'border-primary/40'}`}
                                placeholder="your.email@example.com"
                                disabled={isSaving}
                            />
                            {errors.email && (
                                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                First Name
                            </label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                className="w-full bg-background border border-primary/40 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/60"
                                placeholder="Your first name"
                                disabled={isSaving}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Last Name
                            </label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                className="w-full bg-background border border-primary/40 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/60"
                                placeholder="Your last name"
                                disabled={isSaving}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Profile Picture
                            </label>

                            {/* Current/Preview Avatar */}
                            <div className="flex items-center space-x-4 mb-4">
                                {avatarPreview && (
                                    <img
                                        src={avatarPreview}
                                        alt="Avatar preview"
                                        className="w-20 h-20 rounded-full object-cover border-2 border-primary/30"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                )}
                                <div className="flex-1">
                                    <p className="text-sm text-gray-400 mb-2">
                                        {formData.avatar ? 'New image selected' : 'Current profile picture'}
                                    </p>
                                    {formData.avatar && (
                                        <button
                                            type="button"
                                            onClick={removeAvatar}
                                            className="text-red-400 hover:text-red-300 text-sm"
                                        >
                                            Remove new image
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* File Upload */}
                            <div className="relative">
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    disabled={isSaving}
                                />
                                <label
                                    htmlFor="avatar-upload"
                                    className={`w-full bg-background border border-primary/40 rounded-lg py-3 px-4 text-gray-400 cursor-pointer hover:border-primary/60 transition-colors flex items-center justify-center space-x-2 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span>
                                        {formData.avatar ? formData.avatar.name : 'Choose new profile picture'}
                                    </span>
                                </label>
                            </div>

                            <p className="text-xs text-gray-500 mt-1">
                                Supported formats: JPG, PNG, GIF. Max size: 5MB
                            </p>

                            {errors.avatar && (
                                <p className="text-red-400 text-sm mt-1">{errors.avatar}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="btn-secondary"
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Edit Post Modal Component
const EditPostModal = ({ isOpen, post, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (post && isOpen) {
            setFormData({
                title: post.title || '',
                content: post.content || ''
            });
            setErrors({});
        }
    }, [post, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.trim().length < 3) {
            newErrors.title = 'Title must be at least 3 characters long';
        }

        if (!formData.content.trim()) {
            newErrors.content = 'Content is required';
        } else if (formData.content.trim().length < 10) {
            newErrors.content = 'Content must be at least 10 characters long';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSaving(true);
        try {
            await onSave(post.id, formData);
            onClose();
        } catch (error) {
            console.error('Error updating post:', error);
            setErrors({ form: 'Failed to update post. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setFormData({
            title: post?.title || '',
            content: post?.content || ''
        });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1f1e33] border-2 border-[#1b9f67] rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Edit Post</h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-300 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {errors.form && (
                        <div className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-lg mb-4">
                            {errors.form}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={`w-full bg-background border rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/60 ${errors.title ? 'border-red-500' : 'border-primary/40'}`}
                                placeholder="Post title"
                                disabled={isSaving}
                            />
                            {errors.title && (
                                <p className="text-red-400 text-sm mt-1">{errors.title}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Content *
                            </label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                rows={10}
                                className={`w-full bg-background border rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/60 resize-vertical ${errors.content ? 'border-red-500' : 'border-primary/40'}`}
                                placeholder="Post content"
                                disabled={isSaving}
                            />
                            {errors.content && (
                                <p className="text-red-400 text-sm mt-1">{errors.content}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="btn-secondary"
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                'Update Post'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Main Profile Page Component
export default function ProfilePage() {
    const params = useParams();
    const router = useRouter();
    const userId = params?.id; // If viewing another user's profile

    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('posts');

    // Modal states
    const [editProfileModal, setEditProfileModal] = useState(false);
    const [editPostModal, setEditPostModal] = useState({ isOpen: false, post: null });

    const isOwnProfile = !userId || (currentUser && user && currentUser.id === user.id);

    // Fetch user profile
    const fetchUserProfile = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Get current user for permission checks
            const currentUserData = await userAPI.getProfile();
            setCurrentUser(currentUserData);

            // Get target user profile
            let targetUser;
            if (userId) {
                targetUser = await userAPI.checkProfile(userId);
            } else {
                targetUser = currentUserData;
            }
            setUser(targetUser);

        } catch (err) {
            console.error('Error fetching user profile:', err);
            if (err.message.includes('404')) {
                setError('User not found');
            } else if (err.message.includes('Authentication')) {
                setError('Please log in to view profiles');
            } else {
                setError('Failed to load profile');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch user posts
    const fetchUserPosts = async () => {
        if (!user) return;

        setIsLoadingPosts(true);
        try {
            let response;
            if (isOwnProfile) {
                response = await postsAPI.getCurrentUserPosts();
            } else {
                response = await postsAPI.getUserPosts(userId);
            }
            setPosts(response.results || []);
        } catch (err) {
            console.error('Error fetching user posts:', err);
            // Don't set error for posts, just log it
        } finally {
            setIsLoadingPosts(false);
        }
    };

    // Handle profile update
    const handleProfileUpdate = async (profileData) => {
        try {
            let updatedUser;

            // Check if profileData is FormData (has file upload)
            if (profileData instanceof FormData) {
                console.log('Handling FormData profile update');
                updatedUser = await userAPI.updateProfileWithFile(profileData);
            } else {
                console.log('Handling JSON profile update');
                updatedUser = await userAPI.updateProfile(profileData);
            }

            console.log('Updated user data from API:', updatedUser);

            // Preserve username and other immutable fields from original user
            const userWithPreservedFields = {
                ...updatedUser,
                username: user.username,
                id: user.id,
                date_joined: user.date_joined,
            };

            setUser(userWithPreservedFields);
            setCurrentUser(userWithPreservedFields);

            return userWithPreservedFields;
        } catch (error) {
            console.error('Profile update error:', error);
            throw error;
        }
    };

    // Handle post edit
    const handlePostEdit = (post) => {
        setEditPostModal({ isOpen: true, post });
    };

    // Handle post update
    const handlePostUpdate = async (postId, postData) => {
        await postsAPI.updatePost(postId, postData);
        // Refresh posts
        await fetchUserPosts();
    };

    // Handle post delete
    const handlePostDelete = async (postId) => {
        try {
            await postsAPI.deletePost(postId);
            await fetchUserPosts();

        } catch (error) {
            throw error; // Re-throw so the PostItem component can show error
        }
    };

    // Format relative time
    const formatRelativeTime = (dateString) => {
        if (!dateString) return 'Never';

        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
        return `${Math.floor(diffInSeconds / 31536000)}y ago`;
    };

    // Format join date
    const formatJoinDate = (dateString) => {
        if (!dateString) return 'Unknown';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
        });
    };

    useEffect(() => {
        fetchUserProfile();
    }, [userId]);

    useEffect(() => {
        if (user) {
            fetchUserPosts();
        }
    }, [user, isOwnProfile]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container-custom py-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-300">Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container-custom py-8">
                    <div className="text-center">
                        <div className="text-red-500 mb-4">
                            <svg className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Profile Error</h2>
                        <p className="text-red-500 mb-4">{error}</p>
                        <Link href="/" className="btn-primary">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container-custom py-8">
                {/* Profile Header */}
                <div className="bg-secondary rounded-lg p-6 mb-8">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-6">
                            {/* Avatar */}
                            <img
                                src={user.avatar}
                                alt="Avatar"
                                className="w-20 h-20 rounded-full ring-2 ring-primary/20"
                            />

                            {/* User Info */}
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    {user?.nickname || user?.username || 'Unknown User'}
                                </h1>
                                <p className="text-gray-400 mb-1">@{user?.username}</p>
                                {(user?.first_name || user?.last_name) && (
                                    <p className="text-gray-300 mb-1">
                                        {[user?.first_name, user?.last_name].filter(Boolean).join(' ')}
                                    </p>
                                )}
                                <p className="text-gray-400 text-sm">
                                    Joined {formatJoinDate(user?.date_joined)}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        {isOwnProfile && (
                            <button
                                onClick={() => setEditProfileModal(true)}
                                className="btn-primary flex items-center hover:cursor-pointer"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-8 mt-6 pt-6 border-t border-primary/20">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">{posts.length}</div>
                            <div className="text-gray-400 text-sm">Posts</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">
                                {posts.reduce((total, post) => total + (post.upvotes || post.upvotes_count || 0), 0)}
                            </div>
                            <div className="text-gray-400 text-sm">Total Upvotes Received</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">
                                {posts.reduce((total, post) => total + (post.reply_count || 0), 0)}
                            </div>
                            <div className="text-gray-400 text-sm">Total Replies Received</div>
                        </div>
                    </div>
                </div>

                {/* Content Tabs */}
                <div className="bg-secondary rounded-lg">
                    {/* Tab Headers */}
                    <div className="border-b border-primary/20">
                        <nav className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('posts')}
                                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'posts'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-400 hover:text-gray-300'
                                    }`}
                            >
                                Posts ({posts.length})
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'posts' && (
                            <div>
                                {isLoadingPosts ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                                        <p className="text-gray-300">Loading posts...</p>
                                    </div>
                                ) : posts.length === 0 ? (
                                    <div className="text-center py-12">
                                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                        </svg>
                                        <h3 className="text-xl font-medium text-gray-300 mb-2">
                                            {isOwnProfile ? "You haven't posted anything yet" : `${user?.nickname || user?.username} hasn't posted anything yet`}
                                        </h3>
                                        <p className="text-gray-400 mb-4">
                                            {isOwnProfile ? "Share your thoughts with the community!" : "Check back later for new posts."}
                                        </p>
                                        {isOwnProfile && (
                                            <Link href="/posts/create" className="btn-primary">
                                                Create Your First Post
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {posts.map((post) => (
                                            <PostItem
                                                key={post.id}
                                                post={post}
                                                isOwner={isOwnProfile}
                                                onEdit={handlePostEdit}
                                                onDelete={handlePostDelete}
                                                formatRelativeTime={formatRelativeTime}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <EditProfileModal
                isOpen={editProfileModal}
                user={user}
                onClose={() => setEditProfileModal(false)}
                onSave={handleProfileUpdate}
            />

            {/* Edit Post Modal */}
            <EditPostModal
                isOpen={editPostModal.isOpen}
                post={editPostModal.post}
                onClose={() => setEditPostModal({ isOpen: false, post: null })}
                onSave={handlePostUpdate}
            />
        </div>
    );
}