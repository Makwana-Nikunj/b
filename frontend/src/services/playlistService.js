import axiosInstance from '../api/axiosInstance'

/**
 * Playlist Service - Handles all playlist-related API calls
 */
const playlistService = {
    /**
     * Create a new playlist
     * @param {Object} data - { name, description }
     */
    createPlaylist: async (data) => {
        return axiosInstance.post('/playlist', data)
    },

    /**
     * Get playlists by user ID
     * @param {string} userId
     */
    getUserPlaylists: async (userId) => {
        return axiosInstance.get(`/playlist/user/${userId}`)
    },

    /**
     * Get playlist by ID
     * @param {string} playlistId
     */
    getPlaylistById: async (playlistId) => {
        return axiosInstance.get(`/playlist/${playlistId}`)
    },

    /**
     * Update playlist details
     * @param {string} playlistId
     * @param {Object} data - { name, description }
     */
    updatePlaylist: async (playlistId, data) => {
        return axiosInstance.patch(`/playlist/${playlistId}`, data)
    },

    /**
     * Delete a playlist
     * @param {string} playlistId
     */
    deletePlaylist: async (playlistId) => {
        return axiosInstance.delete(`/playlist/${playlistId}`)
    },

    /**
     * Add video to playlist
     * @param {string} videoId
     * @param {string} playlistId
     */
    addVideoToPlaylist: async (videoId, playlistId) => {
        return axiosInstance.patch(`/playlist/add/${videoId}/${playlistId}`)
    },

    /**
     * Remove video from playlist
     * @param {string} videoId
     * @param {string} playlistId
     */
    removeVideoFromPlaylist: async (videoId, playlistId) => {
        return axiosInstance.patch(`/playlist/remove/${videoId}/${playlistId}`)
    },
}

export default playlistService
