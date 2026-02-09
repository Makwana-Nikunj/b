import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getCurrentUser } from './store/slices/authSlice'

// Layouts (not lazy loaded - needed immediately)
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import { PageLoadingSkeleton } from './components/ui/Skeleton'

// Lazy loaded pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const InitiateRegisterPage = lazy(() => import('./pages/InitiateRegisterPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
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

const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const OAuthCallback = lazy(() => import('./pages/OAuthCallback'))

// Loading fallback component - generic for all pages (code chunk loading)
// Each page handles its own data loading skeleton
const PageLoader = () => (
    <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-full max-w-4xl px-4 space-y-6">
            <div className="space-y-3">
                <div className="h-8 skeleton-shimmer rounded-lg w-48" />
                <div className="h-4 skeleton-shimmer rounded w-32" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="animate-fadeIn" style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}>
                        <div className="skeleton-shimmer aspect-video rounded-xl" />
                        <div className="flex gap-3 mt-3">
                            <div className="w-10 h-10 skeleton-shimmer rounded-full flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 skeleton-shimmer rounded w-full" />
                                <div className="h-3 skeleton-shimmer rounded w-2/3" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
)

function App() {
    const dispatch = useDispatch()
    const { isLoading, isInitialized } = useSelector((state) => state.auth)

    useEffect(() => {
        dispatch(getCurrentUser())
    }, [dispatch])

    // Show loading skeleton while checking auth status
    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-dark-100 flex items-center justify-center">
                <PageLoadingSkeleton />
            </div>
        )
    }

    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* Auth routes */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/initiate-register" element={<InitiateRegisterPage />} />
                    <Route path="/register/:token" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                </Route>

                {/* OAuth callback (outside layouts - minimal page for popup) */}
                <Route path="/oauth/callback" element={<OAuthCallback />} />

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

                    </Route>
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    )
}

export default App
