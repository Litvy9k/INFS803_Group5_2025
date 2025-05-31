'use client';

import Link from 'next/link';
import { useState } from 'react';
import { postsAPI } from '@/app/services/apiService';

/**
 * PostCard Component
 * 
 * Displays a post card with title, content preview, upvotes, replies count, and author information.
 * Optimized for the home page to show emerging/popular posts.
 * 
 * @param {Object} props - Component props
 * @param {number} props.id - Post ID
 * @param {string} props.title - The title of the post
 * @param {string} props.content - Post content (will be truncated)
 * @param {number} props.upvotes - Number of upvotes (using upvotes_count from backend)
 * @param {number} props.reply_count - Number of replies
 * @param {Object} props.author - Author information
 * @param {string} props.author.username - Username of the author
 * @param {string} props.author.nickname - Display name of the author
 * @param {string} props.created_at - ISO timestamp when post was created
 * @param {string} props.latest_reply_time - ISO timestamp of latest reply (optional)
 * @param {boolean} props.user_has_upvoted - Whether current user has upvoted (optional)
 */
const PostCard = ({
    id,
    title,
    content,
    upvotes = 0,
    reply_count = 0,
    author,
    created_at,
    latest_reply_time,
    user_has_upvoted = false
}) => {
    const [currentUpvotes, setCurrentUpvotes] = useState(upvotes);
    const [hasUpvoted, setHasUpvoted] = useState(user_has_upvoted);
    const [isUpvoting, setIsUpvoting] = useState(false);

    // Format relative time
    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return 'Recently';

        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;

        return time.toLocaleDateString();
    };

    // Truncate content to a reasonable length
    const truncateContent = (text, maxLength = 200) => {
        if (!text) return 'No content available';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    };

    // Handle upvote click
    const handleUpvote = async (e) => {
        e.preventDefault(); // Prevent navigation to post detail
        e.stopPropagation();

        if (isUpvoting) return;

        setIsUpvoting(true);
        try {
            const response = await postsAPI.upvotePost(id);
            setCurrentUpvotes(response.upvotes);
            setHasUpvoted(response.upvoted);
        } catch (error) {
            console.error('Failed to upvote post:', error);
            // Optionally show error message to user
        } finally {
            setIsUpvoting(false);
        }
    };

    return (
        <div className="card bg-secondary hover:shadow-xl transition-all duration-300 hover:border-primary/40 group">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3 flex-1">
                    <img
                        src={author.avatar}
                        alt="Author Avatar"
                        className="w-8 h-8 rounded-full ring-2 ring-primary/20"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary truncate">
                            {author.nickname || author.username || 'Anonymous'}
                        </p>
                        <p className="text-xs text-gray-400">
                            {formatTimeAgo(created_at)}
                        </p>
                    </div>
                </div>

                {/* Upvote Button */}
                <button
                    onClick={handleUpvote}
                    disabled={isUpvoting}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${hasUpvoted
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-primary/10 hover:text-primary border border-gray-600/50'
                        } ${isUpvoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    <svg
                        className={`w-4 h-4 transition-transform duration-200 ${hasUpvoted ? 'scale-110' : 'group-hover:scale-105'}`}
                        fill={hasUpvoted ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={hasUpvoted ? 0 : 2}
                            d="M5 15l7-7 7 7"
                        />
                    </svg>
                    <span>{currentUpvotes}</span>
                </button>
            </div>

            {/* Post Content */}
            <Link href={`/posts/${id}`} className="block">
                <h3 className="text-lg font-semibold text-white hover:text-primary transition-colors mb-3 line-clamp-2 group-hover:text-primary">
                    {title}
                </h3>

                <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {truncateContent(content)}
                </p>
            </Link>

            {/* Post Footer */}
            <div className="border-t border-primary/10 pt-4 mt-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                        {/* Replies Count */}
                        <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>{reply_count} {reply_count === 1 ? 'reply' : 'replies'}</span>
                        </div>

                        {/* Latest Reply Time */}
                        {latest_reply_time && (
                            <>
                                <span>•</span>
                                <span>Last reply {formatTimeAgo(latest_reply_time)}</span>
                            </>
                        )}
                    </div>

                    <Link
                        href={`/post/${id}`}
                        className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                        Join topic →
                    </Link>
                </div>
            </div>
        </div>
    );
};

/**
 * PostCardSkeleton Component
 * 
 * Loading skeleton for PostCard while data is being fetched
 */
export const PostCardSkeleton = () => {
    return (
        <div className="card bg-secondary animate-pulse">
            {/* Header Skeleton */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-gray-600"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-gray-600 rounded w-24 mb-1"></div>
                        <div className="h-3 bg-gray-700 rounded w-16"></div>
                    </div>
                </div>
                <div className="h-8 bg-gray-600 rounded-full w-16"></div>
            </div>

            {/* Content Skeleton */}
            <div className="mb-4">
                <div className="h-6 bg-gray-600 rounded w-3/4 mb-3"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                </div>
            </div>

            {/* Footer Skeleton */}
            <div className="border-t border-primary/10 pt-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="h-3 bg-gray-700 rounded w-16"></div>
                        <div className="h-3 bg-gray-700 rounded w-20"></div>
                    </div>
                    <div className="h-3 bg-gray-700 rounded w-16"></div>
                </div>
            </div>
        </div>
    );
};

export default PostCard;