import axiosInstance from '../api/axiosInstance'

/**
 * Dashboard Service - Handles dashboard/analytics API calls
 */
const dashboardService = {
    /**
     * Get channel statistics
     * Returns: totalVideos, totalViews, totalSubscribers, totalLikes
     */
    getChannelStats: async () => {
        return axiosInstance.get('/dashboard/stats')
    },

    /**
     * Get all videos of the channel owner
     */
    getChannelVideos: async () => {
        return axiosInstance.get('/dashboard/videos')
    },
}

export default dashboardService
