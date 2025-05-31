'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { postsAPI } from '@/app/services/apiService';

// Reply Component
const Reply = ({ reply, onReply, formatRelativeTime, level = 0 }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [replyError, setReplyError] = useState('');
    const [upvotes, setUpvotes] = useState(reply.upvotes || 0);
    const [hasUpvoted, setHasUpvoted] = useState(reply.user_has_upvoted || false);
    const [isUpvoting, setIsUpvoting] = useState(false);

    const handleReplySubmit = async (e) => {
        e.preventDefault();

        if (!replyContent.trim()) {
            setReplyError('Reply content cannot be empty');
            return;
        }

        // Check if user is logged in
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setReplyError('Please log in to reply');
            return;
        }

        setIsReplying(true);
        setReplyError('');

        try {
            await onReply(reply.id, replyContent.trim());
            setReplyContent('');
            setShowReplyForm(false);
        } catch (error) {
            if (error.message.includes('Authentication') || error.message.includes('401')) {
                setReplyError('Please log in to reply');
            } else {
                setReplyError('Failed to post reply. Please try again.');
            }
        } finally {
            setIsReplying(false);
        }
    };

    const handleUpvote = async () => {
        if (isUpvoting) return;

        // Check if user is logged in
        const token = localStorage.getItem('auth_token');
        if (!token) {
            alert('Please log in to upvote replies');
            return;
        }

        setIsUpvoting(true);

        try {
            const response = await postsAPI.upvoteReply(reply.id);
            setHasUpvoted(response.upvoted);
            setUpvotes(response.upvotes);
        } catch (error) {
            console.error('Error upvoting reply:', error);
            if (error.message.includes('Authentication') || error.message.includes('401')) {
                alert('Please log in to upvote replies');
            } else {
                alert('Failed to update upvote. Please try again.');
            }
        } finally {
            setIsUpvoting(false);
        }
    };

    const indentationClass = level > 0 ? `ml-${Math.min(level * 4, 16)} border-l-2 border-primary/20 pl-4` : '';

    return (
        <div className={`bg-secondary/50 rounded-lg p-4 ${indentationClass}`}>
            {/* Reply Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <img
                        src={reply.author.avatar}
                        alt="Author Avatar"
                        className="w-8 h-8 rounded-full ring-2 ring-primary/20"
                    />
                    <span className="text-white text-sm font-medium">{reply.author}</span>
                    <span className="text-gray-400 text-xs">
                        {formatRelativeTime(reply.created_at)}
                    </span>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleUpvote}
                        disabled={isUpvoting}
                        className={`flex items-center space-x-1 text-xs px-2 py-1 rounded transition-colors ${hasUpvoted
                            ? 'bg-primary/20 text-primary'
                            : 'text-gray-400 hover:text-primary hover:bg-primary/10'
                            } ${isUpvoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        <span>{upvotes}</span>
                    </button>
                    <button
                        onClick={() => setShowReplyForm(!showReplyForm)}
                        className="text-primary hover:text-primary/80 text-xs font-medium"
                    >
                        Reply
                    </button>
                </div>
            </div>

            {/* Parent Reply Context (if this is a reply to another reply) */}
            {reply.parent && (
                <div className="bg-background/30 rounded p-2 mb-3 border-l-2 border-gray-500">
                    <div className="text-xs text-gray-400 mb-1">Replying to {reply.parent_author}:</div>
                    <div className="text-sm text-gray-300 italic">
                        {reply.parent_content.length > 100
                            ? `${reply.parent_content.substring(0, 100)}...`
                            : reply.parent_content}
                    </div>
                </div>
            )}

            {/* Reply Content */}
            <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mb-3">
                {reply.content}
            </div>

            {/* Reply Form */}
            {showReplyForm && (
                <form onSubmit={handleReplySubmit} className="mt-4 p-3 bg-background/30 rounded-lg">
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Reply to {reply.author}
                        </label>
                        <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write your reply..."
                            rows={3}
                            className="w-full bg-secondary border border-primary/30 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/60 text-sm resize-vertical"
                            disabled={isReplying}
                        />
                        {replyError && (
                            <p className="text-red-400 text-xs mt-1">{replyError}</p>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            type="submit"
                            disabled={isReplying || !replyContent.trim()}
                            className="btn-primary text-xs py-1 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isReplying ? 'Posting...' : 'Post Reply'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowReplyForm(false);
                                setReplyContent('');
                                setReplyError('');
                            }}
                            className="btn-secondary text-xs py-1 px-3"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

// Main Reply Modal Component
const ReplyModal = ({ isOpen, onClose, onSubmit, isSubmitting, targetType, targetAuthor }) => {
    const [content, setContent] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!content.trim()) {
            setError('Reply content cannot be empty');
            return;
        }

        try {
            await onSubmit(content.trim());
            setContent('');
            setError('');
            onClose();
        } catch (error) {
            setError('Failed to post reply. Please try again.');
        }
    };

    const handleClose = () => {
        setContent('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-secondary rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">
                        {targetType === 'post' ? 'Reply to Post' : `Reply to ${targetAuthor}`}
                    </h3>
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
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Your Reply
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your reply here..."
                            rows={6}
                            className="w-full bg-background border border-primary/30 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/60 resize-vertical"
                            disabled={isSubmitting}
                            autoFocus
                        />
                        {error && (
                            <p className="text-red-400 text-sm mt-1">{error}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-end space-x-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="btn-secondary"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !content.trim()}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Posting...
                                </>
                            ) : (
                                'Post Reply'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function PostDetailPage() {
    const params = useParams();
    const postId = params.id;

    const [post, setPost] = useState(null);
    const [replies, setReplies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingReplies, setIsLoadingReplies] = useState(false);
    const [error, setError] = useState(null);
    const [hasUpvoted, setHasUpvoted] = useState(false);
    const [isUpvoting, setIsUpvoting] = useState(false);

    // Reply modal state
    const [replyModal, setReplyModal] = useState({
        isOpen: false,
        targetType: null, // 'post' or 'reply'
        targetId: null,
        targetAuthor: null
    });
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    // Fetch post details
    const fetchPost = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await postsAPI.getPost(postId);
            setPost(response);
            // Set initial upvote state if user data is available
            setHasUpvoted(response.user_has_upvoted || false);
        } catch (err) {
            console.error('Error fetching post:', err);
            setError('Failed to load post. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch replies
    const fetchReplies = async () => {
        setIsLoadingReplies(true);
        try {
            const response = await postsAPI.getReplies(postId);
            setReplies(response.results || []);
        } catch (err) {
            console.error('Error fetching replies:', err);
            // Don't set error state for replies, just log it
        } finally {
            setIsLoadingReplies(false);
        }
    };

    // Handle upvote/downvote
    const handleUpvote = async () => {
        if (isUpvoting) return;

        // Check if user is logged in
        const token = localStorage.getItem('auth_token');
        if (!token) {
            alert('Please log in to upvote posts');
            return;
        }

        setIsUpvoting(true);

        try {
            const response = await postsAPI.upvotePost(postId);
            setHasUpvoted(response.upvoted);

            // Update post upvotes count
            setPost(prev => ({
                ...prev,
                upvotes: response.upvotes
            }));

        } catch (err) {
            console.error('Error updating upvote:', err);
            if (err.message.includes('Authentication') || err.message.includes('401')) {
                alert('Please log in to upvote posts');
            } else {
                alert('Failed to update upvote. Please try again.');
            }
        } finally {
            setIsUpvoting(false);
        }
    };

    // Open reply modal
    const openReplyModal = (targetType, targetId = null, targetAuthor = null) => {
        setReplyModal({
            isOpen: true,
            targetType,
            targetId,
            targetAuthor
        });
    };

    // Close reply modal
    const closeReplyModal = () => {
        setReplyModal({
            isOpen: false,
            targetType: null,
            targetId: null,
            targetAuthor: null
        });
    };

    // Handle reply submission
    const handleReplySubmit = async (content) => {
        // Check if user is logged in
        const token = localStorage.getItem('auth_token');
        if (!token) {
            throw new Error('Please log in to reply');
        }

        setIsSubmittingReply(true);

        try {
            if (replyModal.targetType === 'post') {
                // Reply to post
                await postsAPI.createPostReply({
                    content,
                    postId: parseInt(postId)
                });
            } else {
                // Reply to reply
                await postsAPI.createReplyReply({
                    content,
                    postId: parseInt(postId),
                    replyId: replyModal.targetId
                });
            }

            // Refresh replies after successful submission
            await fetchReplies();
        } catch (error) {
            console.error('Error submitting reply:', error);
            throw error; // Re-throw to be handled by the modal
        } finally {
            setIsSubmittingReply(false);
        }
    };

    // Handle inline reply to reply
    const handleInlineReply = async (replyId, content) => {
        // Check if user is logged in
        const token = localStorage.getItem('auth_token');
        if (!token) {
            throw new Error('Please log in to reply');
        }

        try {
            await postsAPI.createReplyReply({
                content,
                postId: parseInt(postId),
                replyId
            });

            // Refresh replies after successful submission
            await fetchReplies();
        } catch (error) {
            console.error('Error submitting inline reply:', error);
            throw error;
        }
    };

    // Organize replies in a tree structure
    const organizeReplies = (replies) => {
        const replyMap = new Map();
        const rootReplies = [];

        // First pass: create map of all replies
        replies.forEach(reply => {
            replyMap.set(reply.id, { ...reply, children: [] });
        });

        // Second pass: organize into tree structure
        replies.forEach(reply => {
            if (reply.parent) {
                const parent = replyMap.get(reply.parent);
                if (parent) {
                    parent.children.push(replyMap.get(reply.id));
                }
            } else {
                rootReplies.push(replyMap.get(reply.id));
            }
        });

        return rootReplies;
    };

    // Render reply tree recursively
    const renderReplyTree = (replies, level = 0) => {
        return replies.map(reply => (
            <div key={reply.id} className="mb-4">
                <Reply
                    reply={reply}
                    onReply={handleInlineReply}
                    formatRelativeTime={formatRelativeTime}
                    level={level}
                />
                {reply.children && reply.children.length > 0 && (
                    <div className="mt-2">
                        {renderReplyTree(reply.children, level + 1)}
                    </div>
                )}
            </div>
        ));
    };

    useEffect(() => {
        if (postId) {
            fetchPost();
            fetchReplies();
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

    const organizedReplies = organizeReplies(replies);

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
                                    <img
                                        src={post.author.avatar}
                                        alt="Author Avatar"
                                        className="w-8 h-8 rounded-full ring-2 ring-primary/20"
                                    />
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
                                        <span>{post.upvotes_count || 0} upvotes</span>
                                    </div>

                                    <div className="flex items-center space-x-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <span>{replies.length} replies</span>
                                    </div>
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

                                <button
                                    onClick={() => openReplyModal('post')}
                                    className="btn-secondary text-sm"
                                >
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

                {/* Replies Section */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white">
                            Replies ({replies.length})
                        </h3>
                        <button
                            onClick={() => openReplyModal('post')}
                            className="btn-primary text-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Reply
                        </button>
                    </div>

                    {isLoadingReplies ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-gray-300">Loading replies...</p>
                        </div>
                    ) : replies.length === 0 ? (
                        <div className="bg-secondary rounded-lg p-6 text-center text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className="text-lg mb-2">No replies yet</p>
                            <p className="text-sm mb-4">Be the first to reply to this post!</p>
                            <button
                                onClick={() => openReplyModal('post')}
                                className="btn-primary"
                            >
                                Write a Reply
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {renderReplyTree(organizedReplies)}
                        </div>
                    )}
                </div>

                {/* Post Navigation */}
                <div className="mt-8 flex justify-between items-center">
                    <Link href="/posts" className="btn-secondary">
                        ← All Posts
                    </Link>
                </div>
            </div>

            {/* Reply Modal */}
            <ReplyModal
                isOpen={replyModal.isOpen}
                onClose={closeReplyModal}
                onSubmit={handleReplySubmit}
                isSubmitting={isSubmittingReply}
                targetType={replyModal.targetType}
                targetAuthor={replyModal.targetAuthor}
            />
        </div>
    );
}