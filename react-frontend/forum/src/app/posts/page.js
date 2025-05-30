'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PostRow from '@/components/PostRow';
import { postsAPI } from '@/app/services/apiService';

export default function PostsListPage() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalPosts, setTotalPosts] = useState(0);
    const [sortBy, setSortBy] = useState('recent'); // 'recent', 'upvotes'
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

    const postsPerPage = 20;

    // Fetch posts from API
    const fetchPosts = async (page = 1, sort = sortBy, order = sortOrder) => {
        setIsLoading(true);
        setError(null);

        try {
            const params = {
                page: page,
                page_size: postsPerPage,
                ordering: order === 'desc' ? `-${sort === 'recent' ? 'last_reply_time' : 'upvotes'}` :
                    `${sort === 'recent' ? 'last_reply_time' : 'upvotes'}`
            };

            const response = await postsAPI.getPosts(params);

            setPosts(response.results || []);
            setTotalPosts(response.count || 0);
            setTotalPages(Math.ceil((response.count || 0) / postsPerPage));
            setCurrentPage(page);

        } catch (err) {
            console.error('Error fetching posts:', err);
            setError('Failed to load posts. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle sort change
    const handleSortChange = (newSort, newOrder) => {
        setSortBy(newSort);
        setSortOrder(newOrder);
        setCurrentPage(1);
        fetchPosts(1, newSort, newOrder);
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchPosts(newPage, sortBy, sortOrder);
        }
    };

    // Load posts on component mount
    useEffect(() => {
        fetchPosts();
    }, []);

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

    return (
        <div className="min-h-screen bg-background">
            <div className="container-custom py-8">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Forum Posts</h1>
                        <p className="text-gray-300">
                            {totalPosts > 0 ? `${totalPosts} posts total` : 'Loading posts...'}
                        </p>
                    </div>

                    {/* Create Post Button */}
                    {localStorage.getItem('auth_token') ? <Link href="/posts/create" className="btn-primary flex">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Post
                    </Link> :
                        <div className="text-[#2dde94]">Sign in to post a new topic!</div>}
                </div>

                {/* Sort Controls */}
                <div className="flex items-center justify-between mb-6 p-4 bg-secondary rounded-lg">
                    <div className="text-gray-300 text-sm">
                        Showing {posts.length > 0 ? ((currentPage - 1) * postsPerPage) + 1 : 0} - {Math.min(currentPage * postsPerPage, totalPosts)} of {totalPosts} posts
                    </div>

                    <div className="flex items-center space-x-4">
                        <span className="text-gray-300 text-sm">Sort by:</span>

                        {/* Sort Type Dropdown */}
                        <select
                            value={sortBy}
                            onChange={(e) => handleSortChange(e.target.value, sortOrder)}
                            className="bg-background border border-primary/30 rounded-md py-1 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="recent">Last Reply</option>
                            <option value="upvotes">Upvotes</option>
                        </select>

                        {/* Sort Order Toggle */}
                        <button
                            onClick={() => handleSortChange(sortBy, sortOrder === 'desc' ? 'asc' : 'desc')}
                            className="flex items-center space-x-1 text-primary hover:text-white transition-colors text-sm"
                        >
                            <span>{sortOrder === 'desc' ? 'High to Low' : 'Low to High'}</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-4 w-4 transform transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Posts List */}
                <div className="bg-secondary rounded-lg overflow-hidden">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-4 p-4 bg-primary/20 text-white font-medium text-sm border-b border-primary/30">
                        <div className="col-span-6">Title</div>
                        <div className="col-span-2 text-center">Author</div>
                        <div className="col-span-1 text-center">Upvotes</div>
                        <div className="col-span-2 text-center">Last Reply</div>
                        <div className="col-span-1 text-center">Created</div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-gray-300">Loading posts...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="p-8 text-center">
                            <div className="text-red-500 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-red-500 mb-4">{error}</p>
                            <button
                                onClick={() => fetchPosts(currentPage, sortBy, sortOrder)}
                                className="btn-secondary"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Posts List */}
                    {!isLoading && !error && (
                        <>
                            {posts.length === 0 ? (
                                <div className="p-8 text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                    <h3 className="text-lg font-medium text-white mb-2">No posts yet</h3>
                                    <p className="text-gray-400 mb-4">Be the first to start a discussion!</p>
                                    <Link href="/posts/create" className="btn-primary">
                                        Create First Post
                                    </Link>
                                </div>
                            ) : (
                                <div>
                                    {posts.map((post) => (
                                        <PostRow
                                            key={post.id}
                                            post={post}
                                            upvotes={post.upvotes_count || post.upvotes || 0}
                                            latest_reply_time={post.latest_reply_time}
                                            formatRelativeTime={formatRelativeTime}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-2 mt-8">
                        {/* Previous Button */}
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-2 rounded-md text-sm ${currentPage === 1
                                ? 'bg-secondary text-gray-500 cursor-not-allowed'
                                : 'bg-secondary text-white hover:bg-primary'
                                }`}
                        >
                            ← Previous
                        </button>

                        {/* Page Numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`px-3 py-2 rounded-md text-sm ${currentPage === pageNum
                                        ? 'bg-primary text-white'
                                        : 'bg-secondary text-white hover:bg-primary'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        {/* Next Button */}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-2 rounded-md text-sm ${currentPage === totalPages
                                ? 'bg-secondary text-gray-500 cursor-not-allowed'
                                : 'bg-secondary text-white hover:bg-primary'
                                }`}
                        >
                            Next →
                        </button>
                    </div>
                )}

                {/* Page Info */}
                <div className="text-center text-gray-400 text-sm mt-4">
                    Page {currentPage} of {totalPages}
                </div>
            </div>
        </div>
    );
} 