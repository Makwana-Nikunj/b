import axiosInstance from '../api/axiosInstance'

/**
 * Comment Service - Handles all comment-related API calls
 */
const commentService = {
    /**
     * Get comments for a video
     * @param {string} videoId
     * @param {Object} params - { page, limit }
     */
    getVideoComments: async (videoId, params = {}) => {
        const queryString = new URLSearchParams(params).toString()
        return axiosInstance.get(`/comments/${videoId}?${queryString}`)
    },

    /**
     * Add a comment to a video
     * @param {string} videoId
     * @param {Object} data - { content }
     */
    addComment: async (videoId, data) => {
        return axiosInstance.post(`/comments/${videoId}`, data)
    },

    /**
     * Update a comment
     * @param {string} commentId
     * @param {Object} data - { content }
     */
    updateComment: async (commentId, data) => {
        return axiosInstance.patch(`/comments/c/${commentId}`, data)
    },

    /**
     * Delete a comment
     * @param {string} commentId
     */
    deleteComment: async (commentId) => {
        return axiosInstance.delete(`/comments/c/${commentId}`)
    },
}

export default commentService
