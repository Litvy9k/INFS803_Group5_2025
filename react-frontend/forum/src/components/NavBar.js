'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthModal from './AuthModal';
import { userAPI } from '@/app/services/apiService';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Check if user is logged in on component mount
    useEffect(() => {
        const checkAuthStatus = async () => {
            const token = localStorage.getItem('auth_token');

            if (token) {
                try {
                    setUser(await userAPI.getProfile());
                } catch (error) {
                    console.error('Error parsing user data:', error);
                    // Clear invalid data
                    localStorage.removeItem('user_data');
                }
            }
        };

        checkAuthStatus();

        // Listen for storage changes (when user logs in/out in another tab)
        window.addEventListener('storage', checkAuthStatus);

        return () => {
            window.removeEventListener('storage', checkAuthStatus);
        };
    }, []);

    const handleLogout = async () => {
        await userAPI.logout();
        setUser(null);
        setIsUserMenuOpen(false);
        window.location.reload();
    };

    return (
        <header className="bg-background border-b border-primary/30 sticky top-0 z-50 backdrop-blur-sm bg-background/95">
            <div className="container-custom py-4">
                <div className="flex items-center justify-between w-full">
                    <div className="hidden md:flex items-center space-x-8 flex-1 justify-center max-w-4xl mx-auto">
                        {/* Posts Link  */}
                        <Link
                            href="/posts"
                            className="nav-link font-semibold text-lg text-gray-300 hover:text-primary transition-colors duration-200 whitespace-nowrap hover:scale-105 transform"
                        >
                            Posts
                        </Link>

                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-3 mx-8">
                            <img src="logo.png" alt="logo" className='w-40' />

                        </Link>

                        {/* Search Field */}
                        <div className="relative flex-shrink-0">
                            <input
                                type="text"
                                placeholder="Search forums..."
                                className="bg-secondary/60 border border-primary/40 rounded-full py-3 px-5 pl-12 text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-all duration-200 w-80 shadow-lg"
                            />
                            <svg
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
                        </div>
                    </div>

                    {/* Right side - User Actions */}
                    <div className="hidden md:flex items-center space-x-4 flex-shrink-0 ml-8">
                        {user ? (
                            /* Logged in user */
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center space-x-3 bg-secondary/30 hover:bg-secondary/50 rounded-full py-2 px-4 transition-all duration-200 border border-primary/20 hover:border-primary/40"
                                >
                                    <img
                                        src={user.avatar}
                                        alt="User Avatar"
                                        className="w-8 h-8 rounded-full ring-2 ring-primary/30"
                                    />
                                    <span className="text-white font-medium">
                                        {user.nickname || user.username || 'User'}
                                    </span>
                                    <svg
                                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''
                                            }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>

                                {/* User Dropdown Menu */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-secondary border border-primary/30 rounded-lg shadow-xl z-50 bg-[#1f1e33]">
                                        <div className="py-2">
                                            <Link
                                                href="/profile"
                                                className="block px-4 py-2 text-sm text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                Your Profile
                                            </Link>
                                            <Link
                                                href="/posted-topics"
                                                className="block px-4 py-2 text-sm text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                My Topics
                                            </Link>
                                            <Link
                                                href="/my-replies"
                                                className="block px-4 py-2 text-sm text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                Replied Posts
                                            </Link>
                                            <div className="border-t border-primary/20 mt-1">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-200"
                                                >
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Not logged in */
                            <button
                                className="btn-primary bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white px-8 py-3 rounded-full font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-primary/30 transform hover:scale-105"
                                onClick={() => setIsAuthModalOpen(true)}
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {/* Close user menu when clicking outside */}
            {isUserMenuOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                ></div>
            )}

            {/* Auth Modal */}
            <AuthModal
                open={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </header>
    );
};

export default Navbar;