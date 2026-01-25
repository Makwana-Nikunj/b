import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import subscriptionService from '../../services/subscriptionService'

// Initial state
const initialState = {
    subscribedChannels: [],
    channelSubscribers: [],
    isLoading: false,
    error: null,
}

// Async Thunks

/**
 * Get subscribed channels
 */
export const fetchSubscribedChannels = createAsyncThunk(
    'subscriptions/fetchSubscribedChannels',
    async (channelId, { rejectWithValue }) => {
        try {
            const response = await subscriptionService.getSubscribedChannels(channelId)
            // API returns { data: { channels: [], pagination: {} } }
            const channels = response?.data?.channels || response?.data || []
            return Array.isArray(channels) ? channels : []
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

/**
 * Get channel subscribers
 */
export const fetchChannelSubscribers = createAsyncThunk(
    'subscriptions/fetchChannelSubscribers',
    async (subscriberId, { rejectWithValue }) => {
        try {
            const response = await subscriptionService.getChannelSubscribers(subscriberId)
            // API returns { data: subscribers[] } - direct array
            const data = response?.data || []
            return Array.isArray(data) ? data : []
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

/**
 * Toggle subscription
 */
export const toggleSubscription = createAsyncThunk(
    'subscriptions/toggleSubscription',
    async (channelId, { rejectWithValue }) => {
        try {
            const response = await subscriptionService.toggleSubscription(channelId)
            return { channelId, data: response.data }
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

// Slice
const subscriptionSlice = createSlice({
    name: 'subscriptions',
    initialState,
    reducers: {
        clearSubscriptions: (state) => {
            state.subscribedChannels = []
            state.channelSubscribers = []
        },
        clearError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Subscribed Channels
            .addCase(fetchSubscribedChannels.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchSubscribedChannels.fulfilled, (state, action) => {
                state.isLoading = false
                state.subscribedChannels = action.payload
                state.error = null
            })
            .addCase(fetchSubscribedChannels.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Fetch Channel Subscribers
            .addCase(fetchChannelSubscribers.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchChannelSubscribers.fulfilled, (state, action) => {
                state.isLoading = false
                state.channelSubscribers = action.payload
                state.error = null
            })
            .addCase(fetchChannelSubscribers.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Toggle Subscription
            .addCase(toggleSubscription.pending, (state) => {
                state.isLoading = true
            })
            .addCase(toggleSubscription.fulfilled, (state, action) => {
                state.isLoading = false
                // Update subscription list if needed
                const { channelId } = action.payload
                const existingIndex = state.subscribedChannels.findIndex(
                    sub => sub.channel?._id === channelId || sub._id === channelId
                )
                if (existingIndex !== -1) {
                    // Was subscribed, now unsubscribed
                    state.subscribedChannels.splice(existingIndex, 1)
                }
                // Note: If newly subscribed, the list will be refreshed by the component
                state.error = null
            })
            .addCase(toggleSubscription.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
    },
})

export const { clearSubscriptions, clearError } = subscriptionSlice.actions
export default subscriptionSlice.reducer
