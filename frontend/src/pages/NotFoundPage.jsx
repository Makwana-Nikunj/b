import { Link } from 'react-router-dom'
import { Button } from '../components/ui'
import { HiHome } from 'react-icons/hi'

function NotFoundPage() {
    return (
        <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-gray-800">404</h1>
                <h2 className="text-2xl font-semibold text-white mt-4">Page not found</h2>
                <p className="text-gray-400 mt-2">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Link to="/" className="inline-block mt-6">
                    <Button>
                        <HiHome className="w-5 h-5" />
                        Go home
                    </Button>
                </Link>
            </div>
        </div>
    )
}

export default NotFoundPage
