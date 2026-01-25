import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useState, useRef, useEffect } from 'react'
import { HiMenu, HiSearch, HiPlus, HiBell } from 'react-icons/hi'
import { logout } from '../../store/slices/authSlice'
import Avatar from '../ui/Avatar'

function Navbar({ onMenuClick }) {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user, isAuthenticated } = useSelector((state) => state.auth)

    const [searchQuery, setSearchQuery] = useState('')
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
        }
    }

    const handleLogout = async () => {
        await dispatch(logout())
        setShowDropdown(false)
        navigate('/login')
    }

    return (
        <nav className="fixed top-0 left-0 right-0 h-14 bg-[#0f0f0f] border-b border-gray-800 z-50">
            <div className="h-full px-4 flex items-center justify-between">
                {/* Left section */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                        aria-label="Toggle sidebar"
                    >
                        <HiMenu className="w-6 h-6 text-white" />
                    </button>

                    <Link to="/" className="flex items-center gap-2">
                        <img src="/logo.svg" alt="VidPlay" className="h-8" />
                    </Link>
                </div>

                {/* Center section - Search */}
                <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
                    <div className="flex">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search"
                            className="flex-1 bg-[#121212] border border-gray-700 rounded-l-full px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                        />
                        <button
                            type="submit"
                            className="bg-gray-800 border border-l-0 border-gray-700 rounded-r-full px-6 hover:bg-gray-700 transition-colors"
                            aria-label="Search"
                        >
                            <HiSearch className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </form>

                {/* Right section */}
                <div className="flex items-center gap-2">
                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/upload"
                                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-full transition-colors"
                            >
                                <HiPlus className="w-5 h-5" />
                                <span className="hidden sm:block">Upload</span>
                            </Link>

                            <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                                <HiBell className="w-6 h-6 text-white" />
                            </button>

                            {/* User dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center"
                                >
                                    <Avatar
                                        src={user?.avatar}
                                        alt={user?.fullName}
                                        size="sm"
                                    />
                                </button>

                                {showDropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-[#282828] rounded-lg shadow-lg border border-gray-700 py-2">
                                        <div className="px-4 py-2 border-b border-gray-700">
                                            <p className="text-white font-medium truncate">{user?.fullName}</p>
                                            <p className="text-gray-400 text-sm truncate">@{user?.username}</p>
                                        </div>

                                        {user?.username && (
                                            <Link
                                                to={`/channel/${user.username}`}
                                                onClick={() => setShowDropdown(false)}
                                                className="block px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                                            >
                                                Your channel
                                            </Link>
                                        )}
                                        <Link
                                            to="/dashboard"
                                            onClick={() => setShowDropdown(false)}
                                            className="block px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            to="/settings"
                                            onClick={() => setShowDropdown(false)}
                                            className="block px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                                        >
                                            Settings
                                        </Link>

                                        <hr className="border-gray-700 my-2" />

                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="flex items-center gap-2 border border-blue-500 text-blue-500 hover:bg-blue-500/10 px-4 py-2 rounded-full transition-colors"
                        >
                            Sign in
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar
