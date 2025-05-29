import { getDomain } from "@/backendDomain";

// Base URL for API calls - update this with your actual API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || getDomain();

// Default headers for API requests
const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
};

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/user/login/refresh/`, {
            method: 'POST',
            headers: DEFAULT_HEADERS,
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
            throw new Error('Token refresh failed');
        }

        const data = await response.json();

        // Store the new access token
        localStorage.setItem('auth_token', data.access);

        // If a new refresh token is provided, update it too
        if (data.refresh) {
            localStorage.setItem('refresh_token', data.refresh);
        }

        return data.access;
    } catch (error) {
        // Clear tokens if refresh fails
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');

        // Redirect to login (you might want to emit an event instead)
        window.location.href = '/login';
        throw error;
    }
}

/**
 * Helper method for making API requests with automatic token refresh
 * 
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Fetch options (method, headers, body)
 * @returns {Promise} - Response data or error
 */
async function fetchAPI(endpoint, options = {}) {
    const makeRequest = async (token = null) => {
        const headers = { ...DEFAULT_HEADERS, ...options.headers };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        return response;
    };

    try {
        // Get current token
        const token = localStorage.getItem('auth_token');

        // Make the initial request
        let response = await makeRequest(token);

        // If we get a 401 (Unauthorized) and we have a token, try to refresh
        if (response.status === 401 && token) {
            console.log('Token expired, attempting refresh...');

            try {
                const newToken = await refreshAccessToken();
                console.log('Token refreshed successfully, retrying request...');

                // Retry the request with the new token
                response = await makeRequest(newToken);
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                throw new Error('Session expired. Please log in again.');
            }
        }

        // Handle other unsuccessful responses
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `API error: ${response.status} ${response.statusText}`);
        }

        // Parse response as JSON
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

/**
 * Posts API Methods
 */
export const postsAPI = {
    /**
     * Get a list of posts 
     * Available query strings: 
     *      ordering=upvotes_count||-upvotes_count||reply_count||-reply_count||latest_reply_time||-latest_reply_time
     *      
     * 
     * @param {Object} params - Query parameters
     * @returns {Promise} - Paginated list of posts
     */
    getPosts: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/api/main/post/sorted/?${queryString}` : '/api/main/post/';
        return fetchAPI(endpoint);
    },

    /**
         * Get a list search results
         * Available query strings: 
         *      search=<query>
         *      
         * 
         * @param {Object} params - Query parameters
         * @returns {Promise} - Paginated list of posts
         */
    getSearch: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/api/main/post/search/?${queryString}`
        return fetchAPI(endpoint);
    },

    /**
     * Get a single post by ID
     * 
     * @param {number} postId - Post ID
     * @returns {Promise} - Post details
     */
    getPost: (postId) => {
        return fetchAPI(`/api/main/post/${postId}/`);
    },

    /**
     * Get a post's replies
     * 
     * @param {number} postId - Post ID
     * @returns {Promise} - List of replies
     */
    getReplies: (postId) => {
        return fetchAPI(`/api/main/post/${postId}/reply`);
    },

    /**
     * Create a new post
     * 
     * @param {Object} postData - New post data
     * @param {string} postData.title - Post title
     * @param {string} postData.content - Post content
     * @returns {Promise} - Created post
     */
    createPost: (postData) => {
        return fetchAPI('/api/main/post/create/', {
            method: 'POST',
            body: JSON.stringify(postData),
        });
    },

    /**
     * Create a new reply in regard to a post
     * 
     * @param {Object} replyData - New reply data
     * @param {string} replyData.content - Reply content
     * @param {number} replyData.postId - Reply Post ID
     * @returns {Promise} - Created reply
     */
    createPostReply: (replyData) => {
        return fetchAPI(`/api/main/post/${replyData.postId}/reply/create/`, {
            method: 'POST',
            body: JSON.stringify(replyData),
        });
    },

    /**
     * Create a new reply in regard to a reply
     * 
     * @param {Object} replyData - New reply data
     * @param {string} replyData.content - Reply content
     * @param {number} replyData.postId - Reply Post ID
     * @param {number} replyData.replyId - Reply Reply ID
     * @returns {Promise} - Created reply
     */
    createReplyReply: (replyData) => {
        return fetchAPI(`/api/main/post/${replyData.postId}/reply/create/${replyData.replyId}/`, {
            method: 'POST',
            body: JSON.stringify(replyData),
        });
    },

    /**
     * Update an existing post
     * 
     * @param {number} postId - Post ID
     * @param {Object} postData - Updated post data
     * @returns {Promise} - Updated post
     */
    updatePost: (postId, postData) => {
        return fetchAPI(`/api/main/post/${postId}/`, {
            method: 'PUT',
            body: JSON.stringify(postData),
        });
    },

    /**
     * Partially update an existing post
     * 
     * @param {number} postId - Post ID
     * @param {Object} postData - Partial post data to update
     * @returns {Promise} - Updated post
     */
    patchPost: (postId, postData) => {
        return fetchAPI(`/api/main/post/${postId}/`, {
            method: 'PATCH',
            body: JSON.stringify(postData),
        });
    },

    /**
     * Delete a post
     * 
     * @param {number} postId - Post ID
     * @returns {Promise} - Deletion confirmation
     */
    deletePost: (postId) => {
        return fetchAPI(`/api/main/post/${postId}/`, {
            method: 'DELETE',
        });
    },

    /**
     * Upvote a post
     * 
     * @param {number} postId - Post ID
     * @returns {Promise} - Updated post with new upvote count
     */
    upvotePost: (postId) => {
        return fetchAPI(`/api/main/post/upvote/${postId}/`, {
            method: 'POST',
        });
    },

    /**
     * Upvote a reply
     * 
     * @param {number} replyId - Reply ID
     * @returns {Promise} - Updated reply with new upvote count
     */
    upvoteReply: (replyId) => {
        return fetchAPI(`/api/main/post/reply/upvote/${replyId}/`, {
            method: 'POST',
        });
    },

}




/**
 * User API Methods
 */
export const userAPI = {
    /**
     * Register a new user
     * 
     * @param {Object} userData - User registration data
     * @returns {Promise} - User data and token
     */
    register: (userData) => {
        return fetchAPI(`/api/user/register/`, {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    /**
     * Log in a user - Updated to handle JWT tokens properly
     * 
     * @param {Object} credentials - Login credentials
     * @returns {Promise} - User data and tokens
     */
    login: async (credentials) => {
        try {
            // Use direct fetch for login to avoid auth headers
            const response = await fetch(`${API_BASE_URL}/api/user/login/`, {
                method: 'POST',
                headers: DEFAULT_HEADERS,
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Login failed');
            }

            const data = await response.json();

            // Store both tokens
            if (data.access) {
                localStorage.setItem('auth_token', data.access);
            }
            if (data.refresh) {
                localStorage.setItem('refresh_token', data.refresh);
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    /**
     * Get current user profile
     * 
     * @returns {Promise} - User profile data
     */
    getProfile: () => {
        return fetchAPI('/api/user/current/');
    },

    /**
     * Update user profile
     * 
     * @param {Object} profileData - Updated profile data
     * @returns {Promise} - Updated user profile
     */
    updateProfile: (profileData) => {
        return fetchAPI('/api/user/update/', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    },

    /**
     * Check selected user profile
     * 
     * @param {number} userID - Selected user ID
     * @returns {Promise} - Selected user profile data
     */
    checkProfile: (userID) => {
        return fetchAPI(`/api/user/get/${userID}/`);
    },

    /**
     * Logout user
     * 
     * @returns {Promise} - Logout message
     */
    logout: async () => {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            const accessToken = localStorage.getItem('auth_token');

            // Call server to blacklist the refresh token 
            if (refreshToken && accessToken) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/user/logout/`, {
                        method: 'POST',
                        headers: {
                            ...DEFAULT_HEADERS,
                            'Authorization': `Bearer ${accessToken}`
                        },
                        body: JSON.stringify({ refresh: refreshToken }),
                    });


                } catch (serverError) {
                }
            }

            // Always clear tokens locally (even if server call fails)
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_data');

        } catch (error) {
            // Even if there's an error, ensure tokens are cleared
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_data');
        }
    },
};

// Export all API services
const apiService = {
    posts: postsAPI,
    user: userAPI,
};

export default apiService;