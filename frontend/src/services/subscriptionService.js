import axiosInstance from '../api/axiosInstance'

/**
 * Subscription Service - Handles all subscription-related API calls
 */
const subscriptionService = {
    /**
     * Toggle subscription to a channel
     * @param {string} channelId
     */
    toggleSubscription: async (channelId) => {
        return axiosInstance.post(`/subscriptions/c/${channelId}`)
    },

    /**
     * Get channels that a user is subscribed to
     * @param {string} channelId - The channel/user ID to get subscriptions for
     */
    getSubscribedChannels: async (channelId) => {
        return axiosInstance.get(`/subscriptions/c/${channelId}`)
    },

    /**
     * Get subscribers of a channel
     * @param {string} subscriberId
     */
    getChannelSubscribers: async (subscriberId) => {
        return axiosInstance.get(`/subscriptions/u/${subscriberId}`)
    },
}

export default subscriptionService
