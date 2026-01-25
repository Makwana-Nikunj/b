import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

/**
 * Centralized Axios instance with interceptors
 * - Automatically includes credentials (cookies)
 * - Handles 401 errors globally
 * - Provides consistent error handling
 */
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Required for cookie-based JWT auth
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // You can add auth headers here if needed
        // For cookie-based auth, the browser handles this automatically
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        // Return the data directly for successful responses
        return response.data
    },
    async (error) => {
        const originalRequest = error.config

        // List of public endpoints that don't require authentication
        const publicEndpoints = ['/videos', '/users/c/', '/users/channel/']
        const isPublicEndpoint = publicEndpoints.some(endpoint =>
            originalRequest.url?.includes(endpoint) &&
            originalRequest.method === 'get'
        )

        // Handle 401 Unauthorized - but not for public endpoints
        if (error.response?.status === 401 && !originalRequest._retry && !isPublicEndpoint) {
            originalRequest._retry = true

            try {
                // Try to refresh the token
                await axios.post(
                    `${API_BASE_URL}/users/refresh-token`,
                    {},
                    { withCredentials: true }
                )

                // Retry the original request
                return axiosInstance(originalRequest)
            } catch (refreshError) {
                // Refresh failed, redirect to login
                // We dispatch this through window event to avoid circular imports
                window.dispatchEvent(new CustomEvent('auth:logout'))

                // Don't show toast for 401 on /current-user (initial auth check)
                if (!originalRequest.url?.includes('current-user')) {
                    toast.error('Session expired. Please login again.')
                }

                return Promise.reject(refreshError)
            }
        }

        // For public endpoints with 401, just reject without token refresh attempt
        if (error.response?.status === 401 && isPublicEndpoint) {
            return Promise.reject({
                message: error.response?.data?.message || 'Unauthorized',
                status: 401,
                errors: [],
            })
        }

        // Handle other errors
        const errorMessage = error.response?.data?.message || error.message || 'Something went wrong'

        // Don't show toast for certain expected errors
        const silentErrors = ['current-user', 'refresh-token']
        const shouldShowToast = !silentErrors.some(path => originalRequest.url?.includes(path))

        if (shouldShowToast && error.response?.status !== 401) {
            toast.error(errorMessage)
        }

        return Promise.reject({
            message: errorMessage,
            status: error.response?.status,
            errors: error.response?.data?.errors || [],
        })
    }
)

export default axiosInstance
