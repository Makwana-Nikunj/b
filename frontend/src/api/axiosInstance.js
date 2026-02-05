import axios from "axios";
import toast from "react-hot-toast";

/**
 * MUST point to backend, not frontend
 */
const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

// Track if user was ever authenticated (to avoid showing logout message on initial load)
let wasAuthenticated = false;

/**
 * Set authentication status (called from authSlice)
 */
export const setAuthStatus = (isAuthenticated) => {
    wasAuthenticated = isAuthenticated;
};

/**
 * Axios instance
 */
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // REQUIRED for cookie auth
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Response interceptor
 */
axiosInstance.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const originalRequest = error.config;

        // Prevent infinite loop
        if (originalRequest.url?.includes("/users/refresh-token")) {
            return Promise.reject(error);
        }

        // Public GET endpoints (no auth needed)
        const publicEndpoints = ["/videos", "/users/c/", "/users/channel/"];
        const isPublicEndpoint =
            originalRequest.method === "get" &&
            publicEndpoints.some((endpoint) =>
                originalRequest.url?.includes(endpoint)
            );

        // Handle 401
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isPublicEndpoint
        ) {
            originalRequest._retry = true;

            try {
                // Refresh token using SAME axios instance
                await axiosInstance.post("/users/refresh-token");

                // Retry original request
                return axiosInstance(originalRequest);
            } catch {
                // Only show "session expired" if user was previously authenticated
                // This prevents the message from showing during initial page load
                if (wasAuthenticated) {
                    toast.error("Session expired. Please login again.");
                }

                // Logout
                window.dispatchEvent(new CustomEvent("auth:logout"));
                wasAuthenticated = false;

                return Promise.reject(error);
            }
        }

        // Show error toast (except for 401s and getCurrentUser calls)
        const errorMessage =
            error.response?.data?.message || "Something went wrong";

        const isCurrentUserCheck = originalRequest.url?.includes("/users/current-user");

        if (error.response?.status !== 401 && !isCurrentUserCheck) {
            toast.error(errorMessage);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
