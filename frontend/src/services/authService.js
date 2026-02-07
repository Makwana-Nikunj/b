import axiosInstance from '../api/axiosInstance'

/**
 * Auth Service - Handles all authentication-related API calls
 */
const authService = {
    /**
     * Register a new user
     * @param {FormData} formData - Contains username, email, fullName, password, avatar, coverImage
     */
    register: async (formData) => {
        return axiosInstance.post('/users/register', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    },

    /**
     * Login user
     * @param {Object} credentials - { email, password } or { username, password }
     */
    login: async (credentials) => {
        return axiosInstance.post('/users/login', credentials)
    },

    /**
     * Logout current user
     */
    logout: async () => {
        return axiosInstance.post('/users/logout')
    },

    /**
     * Get current authenticated user
     */
    getCurrentUser: async () => {
        return axiosInstance.get('/users/current-user')
    },

    /**
     * Refresh access token
     */
    refreshToken: async () => {
        return axiosInstance.post('/users/refresh-token')
    },

    /**
     * Change user password
     * @param {Object} data - { oldPassword, newPassword }
     */
    changePassword: async (data) => {
        return axiosInstance.patch('/users/change-password', data)
    },

    /**
     * Update account details
     * @param {Object} data - { fullName, email }
     */
    updateAccount: async (data) => {
        return axiosInstance.patch('/users/update-account', data)
    },

    /**
     * Update user avatar
     * @param {FormData} formData - Contains avatar file
     */
    updateAvatar: async (formData) => {
        return axiosInstance.patch('/users/update-avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    },

    /**
     * Update user cover image
     * @param {FormData} formData - Contains coverImage file
     */
    updateCoverImage: async (formData) => {
        return axiosInstance.patch('/users/update-cover-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    },

    /**
     * Get user channel profile
     * @param {string} username
     */
    getChannelProfile: async (username) => {
        return axiosInstance.get(`/users/channel/${username}`)
    },

    /**
     * Get user watch history
     */
    getWatchHistory: async () => {
        return axiosInstance.get('/users/history')
    },

    /**
     * Delete user account
     */
    deleteAccount: async () => {
        return axiosInstance.delete('/users/delete-account')
    },

    /**
     * OAuth login using PKCE (Authorization Code flow)
     * Tokens are exchanged server-side for security
     * @param {string} code - Authorization code from provider
     * @param {string} codeVerifier - PKCE code verifier
     * @param {string} redirectUri - Redirect URI used in auth request
     * @param {string} provider - 'google' | 'facebook' | 'microsoft'
     */
    oauthLogin: async (code, codeVerifier, redirectUri, provider) => {
        return axiosInstance.post('/users/oauth', { code, codeVerifier, redirectUri, provider })
    },
}

export default authService
