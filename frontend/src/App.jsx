import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getCurrentUser } from './store/slices/authSlice'

// Layouts (not lazy loaded - needed immediately)
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import LoadingSpinner from './components/ui/LoadingSpinner'

// Lazy loaded pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const VideoPage = lazy(() => import('./pages/VideoPage'))
const ChannelPage = lazy(() => import('./pages/ChannelPage'))
const UploadPage = lazy(() => import('./pages/UploadPage'))
const PlaylistPage = lazy(() => import('./pages/PlaylistPage'))
const PlaylistDetailPage = lazy(() => import('./pages/PlaylistDetailPage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
const LikedVideosPage = lazy(() => import('./pages/LikedVideosPage'))
const SubscriptionsPage = lazy(() => import('./pages/SubscriptionsPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const EditVideoPage = lazy(() => import('./pages/EditVideoPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const TweetsPage = lazy(() => import('./pages/TweetsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

// Loading fallback component
const PageLoader = () => (
    <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
    </div>
)

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
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
    )
}

export default App
