'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PostCard, { PostCardSkeleton } from '@/components/Card';
import { postsAPI } from '@/app/services/apiService';

export default function SearchResults() {
    const [searchQuery, setSearchQuery] = useState('');
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [totalResults, setTotalResults] = useState(0);

    const router = useRouter();
    const searchParams = useSearchParams();

    // Perform search API call
    const performSearch = async (query) => {
        if (!query || query.trim().length === 0) {
            return;
        }

        setIsLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const data = await postsAPI.getSearch({ search: query.trim() });
            // Handle different response structures
            let postsArray = [];
            let count = 0;

            console.log(data)
            postsArray = data.results;
            count = data.count || data.results.length;

            setPosts(postsArray);
            setTotalResults(count);
        } catch (err) {
            setError('You are not logged in.');
            setPosts([]);
            setTotalResults(0);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle search form submission
    const handleSearch = (e) => {
        e.preventDefault();
        setPosts(performSearch(searchQuery.trim()))

    };

    // Handle input change
    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Clear search
    const clearSearch = () => {
        setSearchQuery('');
        setPosts([]);
        setError(null);
        setHasSearched(false);
        setTotalResults(0);
        router.push('/posts/search');
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="border-b border-primary/30 bg-background/95 backdrop-blur-sm z-40">
                <div className="container-custom py-6">
                    <h1 className="text-3xl font-bold text-white mb-6">Search Posts</h1>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="relative max-w-4xl">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleInputChange}
                                placeholder="Search for posts, discussions, topics..."
                                className="w-full bg-secondary/60 border border-primary/40 rounded-full py-4 px-6 pl-14 pr-20 text-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-all duration-200 shadow-lg"
                                autoFocus
                            />

                            {/* Search Icon */}
                            <svg
                                className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>

                            {/* Clear Button */}
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-32 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 hover:text-gray-300 transition-colors duration-200"
                                >
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}

                            {/* Search Button */}
                            <button
                                type="submit"
                                disabled={!searchQuery.trim() || isLoading}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-[#1b9f67] px-6 py-2 rounded-full font-medium transition-all duration-200 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    'Search'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Main Content */}
            <div className="container-custom py-8">
                {/* Search Results Header */}
                {hasSearched && (
                    <div className="mb-8">
                        {isLoading ? (
                            <div className="flex items-center space-x-2 text-gray-400">
                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Searching...</span>
                            </div>
                        ) : error ? (
                            <div className="text-red-400">
                                <span>Search failed</span>
                            </div>
                        ) : (
                            <div className="text-gray-300">
                                {totalResults === 0 ? (
                                    <></>
                                ) : (
                                    <span>
                                        Found {totalResults} {totalResults === 1 ? 'result' : 'results'}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-lg mb-8 flex items-center">
                        <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="font-medium">Search Error</p>
                            <p className="text-sm text-red-200">{error}</p>
                        </div>
                    </div>
                )}

                {/* Search Results */}
                <div className="max-w-7xl mx-auto">
                    {!hasSearched ? (
                        /* Initial State - No Search Yet */
                        <div className="text-center py-20">
                            <svg className="w-24 h-24 mx-auto text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <h2 className="text-2xl font-semibold text-gray-300 mb-4">Search for Posts</h2>
                            <p className="text-gray-400 max-w-md mx-auto">
                                Enter keywords above to search through all forum posts and discussions.
                            </p>
                        </div>
                    ) : isLoading ? (
                        /* Loading State */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }, (_, index) => (
                                <PostCardSkeleton key={index} />
                            ))}
                        </div>
                    ) : posts.length === 0 ? (
                        /* No Results State */
                        <div className="text-center py-20">
                            <svg className="w-24 h-24 mx-auto text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 12M6 20.291A7.962 7.962 0 016 12m0 8.291A7.962 7.962 0 016 12m0 8.291A7.962 7.962 0 016 12" />
                            </svg>
                            <h2 className="text-2xl font-semibold text-gray-300 mb-4">No Results Found</h2>
                            <p className="text-gray-400 max-w-md mx-auto mb-6">
                                We couldn't find any posts matching "{searchParams.get('q')}". Try different keywords or check your spelling.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={clearSearch}
                                    className="btn-secondary px-6 py-3"
                                >
                                    Clear Search
                                </button>
                                <button
                                    onClick={() => router.push('/')}
                                    className="btn-primary px-6 py-3"
                                >
                                    Browse All Posts
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Results Grid */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    id={post.id}
                                    title={post.title}
                                    content={post.content}
                                    upvotes={post.upvotes_count || 0}
                                    reply_count={post.reply_count || 0}
                                    author={post.author || { username: 'Anonymous', nickname: 'Anonymous' }}
                                    created_at={post.created_at}
                                    latest_reply_time={post.latest_reply_time}
                                    user_has_upvoted={post.user_has_upvoted || false}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Search Tips */}
                {!hasSearched && (
                    <div className="mt-16 max-w-4xl mx-auto">
                        <h3 className="text-xl font-semibold text-white mb-6">Search Tips</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-secondary/30 p-6 rounded-lg">
                                <h4 className="font-medium text-primary mb-3">Keywords</h4>
                                <p className="text-gray-300 text-sm">
                                    Use specific keywords related to games, strategies, or topics you're looking for.
                                </p>
                            </div>
                            <div className="bg-secondary/30 p-6 rounded-lg">
                                <h4 className="font-medium text-primary mb-3">Multiple Terms</h4>
                                <p className="text-gray-300 text-sm">
                                    Try combining multiple words to narrow down your search results.
                                </p>
                            </div>
                            <div className="bg-secondary/30 p-6 rounded-lg">
                                <h4 className="font-medium text-primary mb-3">Game Titles</h4>
                                <p className="text-gray-300 text-sm">
                                    Search for specific game titles like "Elden Ring", "Baldur's Gate", etc.
                                </p>
                            </div>
                            <div className="bg-secondary/30 p-6 rounded-lg">
                                <h4 className="font-medium text-primary mb-3">Topics</h4>
                                <p className="text-gray-300 text-sm">
                                    Look for discussions about strategies, reviews, news, or gameplay tips.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}