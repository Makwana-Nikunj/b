import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import playlistService from '../../services/playlistService'

// Initial state
const initialState = {
    playlists: [],
    currentPlaylist: null,
    isLoading: false,
    error: null,
}

// Async Thunks

/**
 * Get user playlists
 */
export const fetchUserPlaylists = createAsyncThunk(
    'playlists/fetchUserPlaylists',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await playlistService.getUserPlaylists(userId)
            // API returns { data: playlists[] } - direct array
            return response?.data || []
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

/**
 * Get playlist by ID
 */
export const fetchPlaylistById = createAsyncThunk(
    'playlists/fetchPlaylistById',
    async (playlistId, { rejectWithValue }) => {
        try {
            const response = await playlistService.getPlaylistById(playlistId)
            return response?.data || null
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

/**
 * Create playlist
 */
export const createPlaylist = createAsyncThunk(
    'playlists/createPlaylist',
    async (data, { rejectWithValue }) => {
        try {
            const response = await playlistService.createPlaylist(data)
            return response?.data || null
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

/**
 * Update playlist
 */
export const updatePlaylist = createAsyncThunk(
    'playlists/updatePlaylist',
    async ({ playlistId, data }, { rejectWithValue }) => {
        try {
            const response = await playlistService.updatePlaylist(playlistId, data)
            return response?.data || null
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

/**
 * Delete playlist
 */
export const deletePlaylist = createAsyncThunk(
    'playlists/deletePlaylist',
    async (playlistId, { rejectWithValue }) => {
        try {
            await playlistService.deletePlaylist(playlistId)
            return playlistId
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

/**
 * Add video to playlist
 */
export const addVideoToPlaylist = createAsyncThunk(
    'playlists/addVideoToPlaylist',
    async ({ videoId, playlistId }, { rejectWithValue }) => {
        try {
            const response = await playlistService.addVideoToPlaylist(videoId, playlistId)
            return response?.data || null
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

/**
 * Remove video from playlist
 */
export const removeVideoFromPlaylist = createAsyncThunk(
    'playlists/removeVideoFromPlaylist',
    async ({ videoId, playlistId }, { rejectWithValue }) => {
        try {
            const response = await playlistService.removeVideoFromPlaylist(videoId, playlistId)
            return response?.data || null
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

// Slice
const playlistSlice = createSlice({
    name: 'playlists',
    initialState,
    reducers: {
        clearCurrentPlaylist: (state) => {
            state.currentPlaylist = null
        },
        clearPlaylists: (state) => {
            state.playlists = []
        },
        clearError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch User Playlists
            .addCase(fetchUserPlaylists.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchUserPlaylists.fulfilled, (state, action) => {
                state.isLoading = false
                state.playlists = Array.isArray(action.payload) ? action.payload : []
                state.error = null
            })
            .addCase(fetchUserPlaylists.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Fetch Playlist By ID
            .addCase(fetchPlaylistById.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchPlaylistById.fulfilled, (state, action) => {
                state.isLoading = false
                state.currentPlaylist = action.payload
                state.error = null
            })
            .addCase(fetchPlaylistById.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Create Playlist
            .addCase(createPlaylist.pending, (state) => {
                state.isLoading = true
            })
            .addCase(createPlaylist.fulfilled, (state, action) => {
                state.isLoading = false
                state.playlists.push(action.payload)
                state.error = null
            })
            .addCase(createPlaylist.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Update Playlist
            .addCase(updatePlaylist.pending, (state) => {
                state.isLoading = true
            })
            .addCase(updatePlaylist.fulfilled, (state, action) => {
                state.isLoading = false
                const index = state.playlists.findIndex(p => p._id === action.payload._id)
                if (index !== -1) {
                    state.playlists[index] = action.payload
                }
                if (state.currentPlaylist?._id === action.payload._id) {
                    state.currentPlaylist = action.payload
                }
                state.error = null
            })
            .addCase(updatePlaylist.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Delete Playlist
            .addCase(deletePlaylist.pending, (state) => {
                state.isLoading = true
            })
            .addCase(deletePlaylist.fulfilled, (state, action) => {
                state.isLoading = false
                state.playlists = state.playlists.filter(p => p._id !== action.payload)
                if (state.currentPlaylist?._id === action.payload) {
                    state.currentPlaylist = null
                }
                state.error = null
            })
            .addCase(deletePlaylist.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Add Video to Playlist
            .addCase(addVideoToPlaylist.fulfilled, (state, action) => {
                if (state.currentPlaylist?._id === action.payload._id) {
                    state.currentPlaylist = action.payload
                }
                const index = state.playlists.findIndex(p => p._id === action.payload._id)
                if (index !== -1) {
                    state.playlists[index] = action.payload
                }
            })

            // Remove Video from Playlist
            .addCase(removeVideoFromPlaylist.fulfilled, (state, action) => {
                if (state.currentPlaylist?._id === action.payload._id) {
                    state.currentPlaylist = action.payload
                }
                const index = state.playlists.findIndex(p => p._id === action.payload._id)
                if (index !== -1) {
                    state.playlists[index] = action.payload
                }
            })
    },
})

export const { clearCurrentPlaylist, clearPlaylists, clearError } = playlistSlice.actions
export default playlistSlice.reducer
