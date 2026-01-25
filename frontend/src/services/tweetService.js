import axiosInstance from '../api/axiosInstance'

/**
 * Tweet Service - Handles all tweet-related API calls
 */
const tweetService = {
    /**
     * Create a new tweet
     * @param {Object} data - { content }
     */
    createTweet: async (data) => {
        return axiosInstance.post('/tweets', data)
    },

    /**
     * Get tweets by user ID
     * @param {string} userId
     */
    getUserTweets: async (userId) => {
        return axiosInstance.get(`/tweets/user/${userId}`)
    },

    /**
     * Update a tweet
     * @param {string} tweetId
     * @param {Object} data - { content }
     */
    updateTweet: async (tweetId, data) => {
        return axiosInstance.patch(`/tweets/${tweetId}`, data)
    },

    /**
     * Delete a tweet
     * @param {string} tweetId
     */
    deleteTweet: async (tweetId) => {
        return axiosInstance.delete(`/tweets/${tweetId}`)
    },
}

export default tweetService
