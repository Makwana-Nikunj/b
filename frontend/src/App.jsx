import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getCurrentUser } from './store/slices/authSlice'

// Layouts
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VideoPage from './pages/VideoPage'
import ChannelPage from './pages/ChannelPage'
import UploadPage from './pages/UploadPage'
import PlaylistPage from './pages/PlaylistPage'
import PlaylistDetailPage from './pages/PlaylistDetailPage'
import HistoryPage from './pages/HistoryPage'
import LikedVideosPage from './pages/LikedVideosPage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import DashboardPage from './pages/DashboardPage'
import EditVideoPage from './pages/EditVideoPage'
import SearchPage from './pages/SearchPage'
import SettingsPage from './pages/SettingsPage'
import TweetsPage from './pages/TweetsPage'
import NotFoundPage from './pages/NotFoundPage'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import LoadingSpinner from './components/ui/LoadingSpinner'

function App() {
    const dispatch = useDispatch()
    const { isLoading, isInitialized } = useSelector((state) => state.auth)

    useEffect(() => {
        dispatch(getCurrentUser())
    }, [dispatch])

    // Show loading spinner while checking auth status
    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-dark-100 flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        )
    }



    return (
        <Routes>
            {/* Auth routes */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Main app routes */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/video/:videoId" element={<VideoPage />} />
                <Route path="/channel/:username" element={<ChannelPage />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/video/:videoId/edit" element={<EditVideoPage />} />
                    <Route path="/playlists" element={<PlaylistPage />} />
                    <Route path="/playlist/:playlistId" element={<PlaylistDetailPage />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/liked-videos" element={<LikedVideosPage />} />
                    <Route path="/subscriptions" element={<SubscriptionsPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/tweets" element={<TweetsPage />} />
                </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    )
}

export default App
