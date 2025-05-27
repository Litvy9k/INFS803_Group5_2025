'use client';

import { useState, useEffect } from 'react';
import PostCard, { PostCardSkeleton } from '@/components/Card';
import { postsAPI } from '@/app/services/apiService';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('latest'); // 'latest' or 'popular'
  const [loggedIn, setloggedIn] = useState(false)

  // Fetch posts from backend
  const fetchPosts = async (sort = 'latest') => {
    setIsLoading(true);
    setError(null);

    try {
      let params = {};

      // Set ordering parameter based on sort type
      if (sort === 'popular') {
        params.ordering = '-upvotes_count'; // Most upvoted first
      } else {
        params.ordering = '-latest_reply_time'; // Most recent replied first
      }

      const data = await postsAPI.getPosts(params);
      setPosts(data.results);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sort change
  const handleSortChange = (newSortOrder) => {
    setSortOrder(newSortOrder);
    fetchPosts(newSortOrder);
  };

  // Fetch posts when component mounts
  useEffect(() => {
    fetchPosts(sortOrder);
    if (localStorage.getItem('auth_token')) setloggedIn(true)
  }, []);

  return (
    <>
      {/* Hero Section */}
      {loggedIn ? <></> :
        <section className="bg-background py-16">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Join the Ultimate Gaming Community
              </h1>
              <p className="text-gray-300 text-lg mb-8">
                Connect with gamers worldwide, share strategies, discuss your favorite titles, and stay updated with the latest gaming news.
              </p>
              <div className="w-24 h-1 bg-[#1b9f67] mx-auto mt-4" />
            </div>
          </div>
        </section>}

      {/* Main Content */}
      <section className="py-12 bg-background">
        <div className="container-custom">
          <div className="max-w-7xl mx-auto">
            {/* Header with Sort Options */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">
                {isLoading ? 'Loading...' : sortOrder === 'latest' ? 'Latest Posts' : 'Popular Posts'}
              </h2>

              <div className="flex space-x-2">
                <button
                  className={`flex items-center space-x-2 text-sm py-2 px-4 rounded-full transition-all duration-200 ${sortOrder === 'latest'
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-secondary/50 text-gray-300 hover:bg-secondary/80 hover:text-white'
                    }`}
                  onClick={() => handleSortChange('latest')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Latest</span>
                </button>

                <button
                  className={`flex items-center space-x-2 text-sm py-2 px-4 rounded-full transition-all duration-200 ${sortOrder === 'popular'
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-secondary/50 text-gray-300 hover:bg-secondary/80 hover:text-white'
                    }`}
                  onClick={() => handleSortChange('popular')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>Popular</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-lg mb-8 flex items-center">
                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium">Error loading posts</p>
                  <p className="text-sm text-red-200">{error}</p>
                  <button
                    onClick={() => fetchPosts(sortOrder)}
                    className="text-sm underline hover:no-underline mt-1"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 6 }, (_, index) => (
                  <PostCardSkeleton key={index} />
                ))
              ) : posts.length === 0 ? (
                // Empty state
                <div className="col-span-full text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-300 mb-2">No posts found</h3>
                  <p className="text-gray-400 mb-4">Be the first to start a discussion!</p>
                  <button className="btn-primary">
                    Create Post
                  </button>
                </div>
              ) : (
                // Posts
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    id={post.id}
                    title={post.title}
                    content={post.content}
                    upvotes={post.upvotes_count || post.upvotes || 0}
                    reply_count={post.reply_count || 0}
                    author={post.author}
                    created_at={post.created_at}
                    latest_reply_time={post.latest_reply_time}
                    user_has_upvoted={post.user_has_upvoted || false}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}