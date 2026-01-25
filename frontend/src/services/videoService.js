import axiosInstance from '../api/axiosInstance'

/**
 * Video Service - Handles all video-related API calls
 */
const videoService = {
    /**
     * Get all videos with optional filters
     * @param {Object} params - { page, limit, query, sortBy, sortType, userId }
     */
    getAllVideos: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString()
        return axiosInstance.get(`/videos?${queryString}`)
    },

    /**
     * Get video by ID
     * @param {string} videoId
     */
    getVideoById: async (videoId) => {
        return axiosInstance.get(`/videos/${videoId}`)
    },

    /**
     * Upload/publish a new video
     * @param {FormData} formData - Contains videoFile, thumbnailImage, title, description
     */
    publishVideo: async (formData) => {
        return axiosInstance.post('/videos', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    },

    /**
     * Update video details
     * @param {string} videoId
     * @param {FormData} formData - Contains title, description, thumbnail (optional)
     */
    updateVideo: async (videoId, formData) => {
        return axiosInstance.patch(`/videos/${videoId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    },

    /**
     * Delete a video
     * @param {string} videoId
     */
    deleteVideo: async (videoId) => {
        return axiosInstance.delete(`/videos/${videoId}`)
    },

    /**
     * Toggle video publish status
     * @param {string} videoId
     */
    togglePublishStatus: async (videoId) => {
        return axiosInstance.patch(`/videos/toggle/publish/${videoId}`)
    },
}

export default videoService
