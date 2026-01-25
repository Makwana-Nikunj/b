import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '../../services/authService'

// Initial state
const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false, // Track if initial auth check is complete
    error: null,
}

// Async Thunks

/**
 * Get current user - Called on app load to restore auth
 */
export const getCurrentUser = createAsyncThunk(
    'auth/getCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authService.getCurrentUser()
            return response?.data || null
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

/**
 * Login user
 */
export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await authService.login(credentials)
            // API returns { data: { loginResponse, accessToken, refreshToken } }
            return response?.data?.loginResponse || response?.data?.user || null
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

/**
 * Register user
 */
export const register = createAsyncThunk(
    'auth/register',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await authService.register(formData)
            return response?.data || null
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

/**
 * Logout user
 */
export const logout = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await authService.logout()
            return null
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

/**
 * Update account details
 */
export const updateAccount = createAsyncThunk(
    'auth/updateAccount',
    async (data, { rejectWithValue }) => {
        try {
            const response = await authService.updateAccount(data)
            return response?.data || null
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

/**
 * Update avatar
 */
export const updateAvatar = createAsyncThunk(
    'auth/updateAvatar',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await authService.updateAvatar(formData)
            return response?.data || null
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

/**
 * Update cover image
 */
export const updateCoverImage = createAsyncThunk(
    'auth/updateCoverImage',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await authService.updateCoverImage(formData)
            return response?.data || null
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

/**
 * Change password
 */
export const changePassword = createAsyncThunk(
    'auth/changePassword',
    async (data, { rejectWithValue }) => {
        try {
            const response = await authService.changePassword(data)
            return response?.data || null
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

/**
 * Delete user account
 */
export const deleteAccount = createAsyncThunk(
    'auth/deleteAccount',
    async (_, { rejectWithValue }) => {
        try {
            await authService.deleteAccount()
            return null
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

// Slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        // Handle forced logout (e.g., from axios interceptor)
        logout: (state) => {
            state.user = null
            state.isAuthenticated = false
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Get Current User
            .addCase(getCurrentUser.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.isLoading = false
                state.isInitialized = true
                state.user = action.payload
                state.isAuthenticated = true
                state.error = null
            })
            .addCase(getCurrentUser.rejected, (state) => {
                state.isLoading = false
                state.isInitialized = true
                state.user = null
                state.isAuthenticated = false
            })

            // Login
            .addCase(login.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false
                state.user = action.payload
                state.isAuthenticated = true
                state.error = null
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Register
            .addCase(register.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(register.fulfilled, (state) => {
                state.isLoading = false
                state.error = null
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Logout
            .addCase(logout.pending, (state) => {
                state.isLoading = true
            })
            .addCase(logout.fulfilled, (state) => {
                state.isLoading = false
                state.user = null
                state.isAuthenticated = false
                state.error = null
            })
            .addCase(logout.rejected, (state) => {
                // Even if logout fails on server, clear local state
                state.isLoading = false
                state.user = null
                state.isAuthenticated = false
            })

            // Update Account
            .addCase(updateAccount.pending, (state) => {
                state.isLoading = true
            })
            .addCase(updateAccount.fulfilled, (state, action) => {
                state.isLoading = false
                state.user = action.payload
                state.error = null
            })
            .addCase(updateAccount.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Update Avatar
            .addCase(updateAvatar.pending, (state) => {
                state.isLoading = true
            })
            .addCase(updateAvatar.fulfilled, (state, action) => {
                state.isLoading = false
                state.user = action.payload
                state.error = null
            })
            .addCase(updateAvatar.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Update Cover Image
            .addCase(updateCoverImage.pending, (state) => {
                state.isLoading = true
            })
            .addCase(updateCoverImage.fulfilled, (state, action) => {
                state.isLoading = false
                state.user = action.payload
                state.error = null
            })
            .addCase(updateCoverImage.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Change Password
            .addCase(changePassword.pending, (state) => {
                state.isLoading = true
            })
            .addCase(changePassword.fulfilled, (state) => {
                state.isLoading = false
                state.error = null
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Delete Account
            .addCase(deleteAccount.pending, (state) => {
                state.isLoading = true
            })
            .addCase(deleteAccount.fulfilled, (state) => {
                state.isLoading = false
                state.user = null
                state.isAuthenticated = false
                state.error = null
            })
            .addCase(deleteAccount.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
    },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
