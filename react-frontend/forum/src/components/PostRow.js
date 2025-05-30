'use client';

import Link from 'next/link';

export default function PostRow({ post, formatRelativeTime }) {
    // Get author display name - prefer nickname over username
    const getAuthorDisplayName = (author) => {
        if (typeof author === 'object') {
            return author.nickname || author.username || 'Anonymous';
        }
        return author || 'Anonymous';
    };

    return (
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-primary/10 hover:bg-primary/5 transition-colors">
            {/* Title Column */}
            <div className="col-span-6">
                <Link
                    href={`/posts/${post.id}`}
                    className="text-white hover:text-primary transition-colors font-medium text-sm leading-relaxed"
                >
                    {post.title}
                </Link>

                {/* Content Preview */}
                {post.content && (
                    <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                        {post.content.length > 100 ?
                            `${post.content.substring(0, 100)}...` :
                            post.content
                        }
                    </p>
                )}
            </div>

            {/* Author Column */}
            <div className="col-span-2 text-center flex flex-col justify-center">
                <div className="flex items-center justify-center space-x-2">
                    {/* Author Avatar */}
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                            {getAuthorDisplayName(post.author).charAt(0).toUpperCase()}
                        </span>
                    </div>

                    {/* Author Name */}
                    <span className="text-gray-300 text-sm truncate">
                        {getAuthorDisplayName(post.author)}
                    </span>
                </div>
            </div>

            {/* Upvotes Column */}
            <div className="col-span-1 text-center flex flex-col justify-center">
                <div className="flex items-center justify-center space-x-1">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                        />
                    </svg>
                    <span className="text-white text-sm font-medium">
                        {post.upvotes_count || 0}
                    </span>
                </div>
            </div>

            {/* Last Reply Column */}
            <div className="col-span-2 text-center flex flex-col justify-center">
                <span className="text-gray-300 text-sm">
                    {formatRelativeTime(post.last_replied_at)}
                </span>
                {post.last_replied_at && (
                    <span className="text-gray-500 text-xs">
                        {new Date(post.last_replied_at).toLocaleDateString()}
                    </span>
                )}
            </div>

            {/* Created Column */}
            <div className="col-span-1 text-center flex flex-col justify-center">
                <span className="text-gray-300 text-sm">
                    {formatRelativeTime(post.created_at)}
                </span>
                {post.created_at && (
                    <span className="text-gray-500 text-xs">
                        {new Date(post.created_at).toLocaleDateString()}
                    </span>
                )}
            </div>
        </div>
    );
}