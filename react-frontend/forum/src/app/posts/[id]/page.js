'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { postsAPI } from '@/app/services/apiService';

export default function PostDetailPage() {
    const params = useParams();
    const postId = params.id;

    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasUpvoted, setHasUpvoted] = useState(false);
    const [isUpvoting, setIsUpvoting] = useState(false);

    // Fetch post details
    const fetchPost = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await postsAPI.getPost(postId);
            setPost(response);
        } catch (err) {
            console.error('Error fetching post:', err);
            setError('Failed to load post. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle upvote/downvote
    const handleUpvote = async () => {
        if (isUpvoting) return;

        setIsUpvoting(true);

        try {
            let response;
            if (hasUpvoted) {
                response = await postsAPI.removeUpvote(postId);
                setHasUpvoted(false);
            } else {
                response = await postsAPI.upvotePost(postId);
                setHasUpvoted(true);
            }

            // Update post upvotes count
            setPost(prev => ({
                ...prev,
                upvotes: response.upvotes
            }));

        } catch (err) {
            console.error('Error updating upvote:', err);
            // Revert the optimistic update
            setHasUpvoted(!hasUpvoted);
        } finally {
            setIsUpvoting(false);
        }
    };

    useEffect(() => {
        if (postId) {
            fetchPost();
        }
    }, [postId]);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        return new Date(dateString).toLocaleString();
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

    // Get author display name
    const getAuthorDisplayName = (author) => {
        if (typeof author === 'object') {
            return author.nickname || author.username || 'Anonymous';
        }
        return author || 'Anonymous';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container-custom py-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-300">Loading post...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container-custom py-8">
                    <div className="text-center">
                        <div className="text-red-500 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Post Not Found</h2>
                        <p className="text-red-500 mb-4">{error || 'The post you are looking for does not exist.'}</p>
                        <Link href="/posts" className="btn-primary">
                            ← Back to Posts
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container-custom py-8">
                {/* Navigation */}
                <div className="mb-6">
                    <Link href="/posts" className="text-primary hover:text-white transition-colors text-sm">
                        ← Back to Posts
                    </Link>
                </div>

                {/* Post Content */}
                <div className="bg-secondary rounded-lg p-6">
                    {/* Post Header */}
                    <div className="border-b border-primary/20 pb-4 mb-6">
                        <h1 className="text-2xl font-bold text-white mb-4">{post.title}</h1>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                {/* Author Info */}
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                        <span className="text-sm font-bold text-primary">
                                            {getAuthorDisplayName(post.author).charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-medium">
                                            {getAuthorDisplayName(post.author)}
                                        </p>
                                        <p className="text-gray-400 text-xs">
                                            {formatRelativeTime(post.created_at)}
                                        </p>
                                    </div>
                                </div>

                                {/* Post Stats */}
                                <div className="flex items-center space-x-4 text-sm text-gray-300">
                                    <div className="flex items-center space-x-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                        <span>{post.upvotes || 0} upvotes</span>
                                    </div>

                                    {post.last_replied_at && (
                                        <div>
                                            <span>Last reply: {formatRelativeTime(post.last_replied_at)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleUpvote}
                                    disabled={isUpvoting}
                                    className={`flex items-center space-x-1 text-sm py-2 px-3 rounded-md transition-colors ${hasUpvoted
                                        ? 'bg-primary text-white'
                                        : 'bg-transparent border border-primary/30 text-primary hover:bg-primary hover:text-white'
                                        } ${isUpvoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isUpvoting ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                    )}
                                    <span>{hasUpvoted ? 'Upvoted' : 'Upvote'}</span>
                                </button>

                                <button className="btn-secondary text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    Reply
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Post Content */}
                    <div className="prose prose-invert max-w-none">
                        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {post.content}
                        </div>
                    </div>
                </div>

                {/* Replies Section - Placeholder */}
                <div className="mt-8">
                    <h3 className="text-xl font-bold text-white mb-4">Replies</h3>
                    <div className="bg-secondary rounded-lg p-6 text-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-lg mb-2">No replies yet</p>
                        <p className="text-sm">Be the first to reply to this post!</p>
                        <button className="btn-primary mt-4">
                            Write a Reply
                        </button>
                    </div>
                </div>

                {/* Post Navigation */}
                <div className="mt-8 flex justify-between items-center">
                    <Link href="/posts" className="btn-secondary">
                        ← All Posts
                    </Link>

                    <div className="flex space-x-2">
                        <button className="btn-secondary text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Previous Post
                        </button>
                        <button className="btn-secondary text-sm">
                            Next Post
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}