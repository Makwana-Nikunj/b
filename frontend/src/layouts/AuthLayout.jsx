import { Outlet, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

function AuthLayout() {
    const { isAuthenticated } = useSelector((state) => state.auth)

    // Redirect to home if already authenticated
    if (isAuthenticated) {
        return <Navigate to="/" replace />
    }

    return (
        <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <img src="/logo.svg" alt="VidPlay" className="h-10 mx-auto" />
                    <p className="text-gray-400 mt-2">Share your videos with the world</p>
                </div>
                <Outlet />
            </div>
        </div>
    )
}

export default AuthLayout
