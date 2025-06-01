'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { postsAPI } from '@/app/services/apiService';
import { Alert } from '@mui/material';

export default function CreatePost() {
    const [formData, setFormData] = useState({
        title: '',
        content: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const router = useRouter();

    // Check authentication status
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('auth_token');
            if (token) {
                setIsAuthenticated(true);
            } else {

            }
            setIsCheckingAuth(false);
        };

        checkAuth();
    }, []);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (error) {
            setError(null);
        }
    };

    // Validate form
    const validateForm = () => {
        const errors = {};

        if (!formData.title.trim()) {
            errors.title = 'Title is required';
        } else if (formData.title.trim().length < 3) {
            errors.title = 'Title must be at least 3 characters long';
        } else if (formData.title.trim().length > 100) {
            errors.title = 'Title must be less than 100 characters';
        }

        if (!formData.content.trim()) {
            errors.content = 'Content is required';
        } else if (formData.content.trim().length < 10) {
            errors.content = 'Content must be at least 10 characters long';
        }

        return errors;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setError(validationErrors);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const postData = {
                title: formData.title.trim(),
                content: formData.content.trim()
            };

            const response = await postsAPI.createPost(postData);
            console.log('Post created successfully:', response);

            // Redirect to the new post or home page
            if (response.id) {
                router.push(`/posts/${response.id}`);
            } else {
                router.push('/posts');
            }

        } catch (err) {
            console.error('Error creating post:', err);

            // Handle different error types
            if (err.message.includes('Authentication required')) {
                setError({ form: 'Your session has expired. Please log in again.' });
            } else if (err.message.includes('400')) {
                setError({ form: 'Invalid post data. Please check your input.' });
            } else if (err.message.includes('403')) {
                setError({ form: 'You do not have permission to create posts.' });
            } else {
                setError({ form: 'Failed to create post. Please try again.' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        if (formData.title.trim() || formData.content.trim()) {
            if (confirm('Are you sure you want to discard your post? All changes will be lost.')) {
                router.back();
            }
        } else {
            router.back();
        }
    };

    // Show loading while checking authentication
    if (isCheckingAuth) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Don't render if not authenticated (will redirect)
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-primary/30 bg-background/95 backdrop-blur-sm sticky top-16 z-40">
                <div className="container-custom py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Create New Post</h1>
                            <p className="text-gray-400 mt-2">Share your thoughts with the gaming community</p>
                        </div>
                        <button
                            onClick={handleCancel}
                            className="text-gray-400 hover:text-gray-300 transition-colors duration-200"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container-custom py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* General Error Message */}
                        {error?.form && (
                            <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-lg flex items-center">
                                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="font-medium">Error</p>
                                    <p className="text-sm text-red-200">{error.form}</p>
                                </div>
                            </div>
                        )}

                        {/* Title Field */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter a descriptive title for your post..."
                                className={`w-full bg-secondary/60 border rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all duration-200 ${error?.title ? 'border-red-500/50' : 'border-primary/40'
                                    }`}
                                disabled={isSubmitting}
                                maxLength={100}
                            />
                            <div className="flex justify-between items-center mt-1">
                                {error?.title && (
                                    <p className="text-red-400 text-sm">{error.title}</p>
                                )}
                                <p className="text-gray-500 text-sm ml-auto">
                                    {formData.title.length}/100
                                </p>
                            </div>
                        </div>

                        {/* Content Field */}
                        <div>
                            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
                                Content *
                            </label>
                            <textarea
                                id="content"
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                placeholder="Write your post content here. Share your thoughts, ask questions, or start a discussion..."
                                rows={12}
                                className={`w-full bg-secondary/60 border rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all duration-200 resize-vertical ${error?.content ? 'border-red-500/50' : 'border-primary/40'
                                    }`}
                                disabled={isSubmitting}
                            />
                            <div className="flex justify-between items-center mt-1">
                                {error?.content && (
                                    <p className="text-red-400 text-sm">{error.content}</p>
                                )}
                                <p className="text-gray-500 text-sm ml-auto">
                                    {formData.content.length} characters
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
                                className="flex-1 btn-primary bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-primary/30 transform hover:scale-105 font-medium transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center hover:cursor-pointer"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Post Topic
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                                className="flex-1 btn-secondary bg-secondary/50 hover:bg-secondary/80 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}