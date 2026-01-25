import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import videoService from '../../services/videoService'

// Initial state
const initialState = {
    videos: [],
    currentVideo: null,
    pagination: {
        page: 1,
        limit: 12,
        totalPages: 1,
        totalDocs: 0,
        hasNextPage: false,
        hasPrevPage: false,
    },
    isLoading: false,
    isVideoLoading: false,
    error: null,
}

// Async Thunks

/**
 * Get all videos with filters
 */
export const fetchVideos = createAsyncThunk(
    'videos/fetchVideos',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await videoService.getAllVideos(params)
            // API returns { data: { videos, pagination } }
            return response?.data || {}
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

/**
 * Get video by ID
 */
export const fetchVideoById = createAsyncThunk(
    'videos/fetchVideoById',
    async (videoId, { rejectWithValue }) => {
        try {
            const response = await videoService.getVideoById(videoId)
            return response?.data || null
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

/**
 * Publish a new video
 */
export const publishVideo = createAsyncThunk(
    'videos/publishVideo',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await videoService.publishVideo(formData)
            return response?.data || null
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

/**
 * Update video
 */
export const updateVideo = createAsyncThunk(
    'videos/updateVideo',
    async ({ videoId, formData }, { rejectWithValue }) => {
        try {
            const response = await videoService.updateVideo(videoId, formData)
            return response?.data || null
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

/**
 * Delete video
 */
export const deleteVideo = createAsyncThunk(
    'videos/deleteVideo',
    async (videoId, { rejectWithValue }) => {
        try {
            await videoService.deleteVideo(videoId)
            return videoId
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

/**
 * Toggle publish status
 */
export const togglePublishStatus = createAsyncThunk(
    'videos/togglePublishStatus',
    async (videoId, { rejectWithValue }) => {
        try {
            const response = await videoService.togglePublishStatus(videoId)
            // API returns { data: boolean (isPublished) }
            return { videoId, isPublished: response.data }
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

// Slice
const videoSlice = createSlice({
    name: 'videos',
    initialState,
    reducers: {
        clearCurrentVideo: (state) => {
            state.currentVideo = null
        },
        clearVideos: (state) => {
            state.videos = []
            state.pagination = initialState.pagination
        },
        clearError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Videos
            .addCase(fetchVideos.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchVideos.fulfilled, (state, action) => {
                state.isLoading = false
                // Handle different response structures
                // API returns { success, data: { videos, pagination }, message }
                const payload = action.payload?.data || action.payload

                if (Array.isArray(payload)) {
                    // Direct array response
                    state.videos = payload
                } else if (payload?.videos) {
                    // Backend response: { videos: [...], pagination: {...} }
                    state.videos = payload.videos
                    if (payload.pagination) {
                        state.pagination = {
                            page: payload.pagination.page || 1,
                            limit: payload.pagination.limit || 12,
                            totalPages: payload.pagination.totalPages || 1,
                            totalDocs: payload.pagination.totalVideos || 0,
                            hasNextPage: payload.pagination.page < payload.pagination.totalPages,
                            hasPrevPage: payload.pagination.page > 1,
                        }
                    }
                } else if (payload?.docs) {
                    // Mongoose paginate response
                    state.videos = payload.docs
                    state.pagination = {
                        page: payload.page || 1,
                        limit: payload.limit || 12,
                        totalPages: payload.totalPages || 1,
                        totalDocs: payload.totalDocs || 0,
                        hasNextPage: payload.hasNextPage || false,
                        hasPrevPage: payload.hasPrevPage || false,
                    }
                } else {
                    state.videos = []
                }
                state.error = null
            })
            .addCase(fetchVideos.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Fetch Video By ID
            .addCase(fetchVideoById.pending, (state) => {
                state.isVideoLoading = true
                state.error = null
            })
            .addCase(fetchVideoById.fulfilled, (state, action) => {
                state.isVideoLoading = false
                state.currentVideo = action.payload
                state.error = null
            })
            .addCase(fetchVideoById.rejected, (state, action) => {
                state.isVideoLoading = false
                state.error = action.payload
            })

            // Publish Video
            .addCase(publishVideo.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(publishVideo.fulfilled, (state, action) => {
                state.isLoading = false
                state.videos.unshift(action.payload)
                state.error = null
            })
            .addCase(publishVideo.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Update Video
            .addCase(updateVideo.pending, (state) => {
                state.isLoading = true
            })
            .addCase(updateVideo.fulfilled, (state, action) => {
                state.isLoading = false
                const index = state.videos.findIndex(v => v._id === action.payload._id)
                if (index !== -1) {
                    state.videos[index] = action.payload
                }
                if (state.currentVideo?._id === action.payload._id) {
                    state.currentVideo = action.payload
                }
                state.error = null
            })
            .addCase(updateVideo.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Delete Video
            .addCase(deleteVideo.pending, (state) => {
                state.isLoading = true
            })
            .addCase(deleteVideo.fulfilled, (state, action) => {
                state.isLoading = false
                state.videos = state.videos.filter(v => v._id !== action.payload)
                if (state.currentVideo?._id === action.payload) {
                    state.currentVideo = null
                }
                state.error = null
            })
            .addCase(deleteVideo.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Toggle Publish Status
            .addCase(togglePublishStatus.fulfilled, (state, action) => {
                const { videoId, isPublished } = action.payload
                const index = state.videos.findIndex(v => v._id === videoId)
                if (index !== -1) {
                    state.videos[index] = { ...state.videos[index], isPublished }
                }
                if (state.currentVideo?._id === videoId) {
                    state.currentVideo = { ...state.currentVideo, isPublished }
                }
            })
    },
})

export const { clearCurrentVideo, clearVideos, clearError } = videoSlice.actions
export default videoSlice.reducer
