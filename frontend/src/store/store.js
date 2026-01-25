import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import videoReducer from './slices/videoSlice'
import playlistReducer from './slices/playlistSlice'
import subscriptionReducer from './slices/subscriptionSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        videos: videoReducer,
        playlists: playlistReducer,
        subscriptions: subscriptionReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
    devTools: import.meta.env.DEV,
})

// Listen for logout events from axios interceptor
window.addEventListener('auth:logout', () => {
    store.dispatch({ type: 'auth/logout' })
})

export default store
