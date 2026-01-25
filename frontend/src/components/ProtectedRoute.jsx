import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

function ProtectedRoute() {
    const { isAuthenticated } = useSelector((state) => state.auth)
    const location = useLocation()

    if (!isAuthenticated) {
        // Redirect to login but save the attempted URL
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return <Outlet />
}

export default ProtectedRoute
