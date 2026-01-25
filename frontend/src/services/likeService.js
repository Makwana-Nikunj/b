import axiosInstance from '../api/axiosInstance'

/**
 * Like Service - Handles all like-related API calls
 */
const likeService = {
    /**
     * Toggle like on a video
     * @param {string} videoId
     */
    toggleVideoLike: async (videoId) => {
        return axiosInstance.post(`/likes/toggle/v/${videoId}`)
    },

    /**
     * Toggle like on a comment
     * @param {string} commentId
     */
    toggleCommentLike: async (commentId) => {
        return axiosInstance.post(`/likes/toggle/c/${commentId}`)
    },

    /**
     * Toggle like on a tweet
     * @param {string} tweetId
     */
    toggleTweetLike: async (tweetId) => {
        return axiosInstance.post(`/likes/toggle/t/${tweetId}`)
    },

    /**
     * Get all liked videos of the current user
     */
    getLikedVideos: async () => {
        return axiosInstance.get('/likes/videos')
    },
}

export default likeService
