import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useState, useRef, useEffect } from 'react'
import { HiMenu, HiSearch, HiPlus, HiBell, HiX, HiArrowLeft } from 'react-icons/hi'
import { logout } from '../../store/slices/authSlice'
import Avatar from '../ui/Avatar'

function Navbar({ onMenuClick }) {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user, isAuthenticated } = useSelector((state) => state.auth)

    const [searchQuery, setSearchQuery] = useState('')
    const [showDropdown, setShowDropdown] = useState(false)
    const [showMobileSearch, setShowMobileSearch] = useState(false)
    const dropdownRef = useRef(null)
    const searchInputRef = useRef(null)

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

    // Focus search input when mobile search opens
    useEffect(() => {
        if (showMobileSearch && searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }, [showMobileSearch])

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
            setShowMobileSearch(false)
            setSearchQuery('')
        }
    }

    const handleLogout = async () => {
        await dispatch(logout())
        setShowDropdown(false)
        navigate('/login')
    }

    // Full-screen mobile search overlay
    if (showMobileSearch) {
        return (
            <nav className="fixed top-0 left-0 right-0 h-14 bg-[#0f0f0f] z-50">
                <form
                    onSubmit={handleSearch}
                    className="h-full flex items-center gap-2 px-2"
                >
                    {/* Back button */}
                    <button
                        type="button"
                        onClick={() => setShowMobileSearch(false)}
                        className="p-2 hover:bg-gray-800 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="Close search"
                    >
                        <HiArrowLeft className="w-5 h-5 text-white" />
                    </button>

                    {/* Search input - full width */}
                    <div className="flex-1 relative">
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search videos..."
                            className="w-full bg-[#121212] border border-gray-700 rounded-full px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none text-base"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded-full"
                            >
                                <HiX className="w-4 h-4 text-gray-400" />
                            </button>
                        )}
                    </div>

                    {/* Search submit button */}
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="Search"
                    >
                        <HiSearch className="w-5 h-5" />
                    </button>
                </form>
            </nav>
        )
    }

    return (
        <nav className="fixed top-0 left-0 right-0 h-14 bg-[#0f0f0f] border-b border-gray-800 z-50">
            <div className="h-full px-2 sm:px-4 flex items-center justify-between gap-2">
                {/* Left section */}
                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    <button
                        onClick={onMenuClick}
                        className="p-2 hover:bg-gray-800 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="Toggle sidebar"
                    >
                        <HiMenu className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </button>

                    <Link to="/" className="flex items-center">
                        <img src="/logo.svg" alt="VidPlay" className="h-6 sm:h-8" />
                    </Link>
                </div>

                {/* Center section - Search (hidden on mobile) */}
                <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4">
                    <div className="flex w-full">
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
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    {/* Mobile search button */}
                    <button
                        onClick={() => setShowMobileSearch(true)}
                        className="md:hidden p-2 hover:bg-gray-800 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="Search"
                    >
                        <HiSearch className="w-5 h-5 text-white" />
                    </button>

                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/upload"
                                className="hidden sm:flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-full transition-colors"
                            >
                                <HiPlus className="w-5 h-5" />
                                <span className="hidden lg:inline">Upload</span>
                            </Link>

                            <button className="hidden sm:flex p-2 hover:bg-gray-800 rounded-full transition-colors min-w-[44px] min-h-[44px] items-center justify-center">
                                <HiBell className="w-5 h-5 text-white" />
                            </button>

                            {/* User dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center min-w-[44px] min-h-[44px] justify-center"
                                >
                                    <Avatar
                                        src={user?.avatar}
                                        alt={user?.fullName}
                                        size="sm"
                                    />
                                </button>

                                {showDropdown && (
                                    <div className="absolute right-0 mt-2 w-56 bg-[#282828] rounded-xl shadow-lg py-2 border border-gray-700">
                                        <div className="px-4 py-3 border-b border-gray-700">
                                            <p className="text-white font-medium truncate">{user?.fullName}</p>
                                            <p className="text-gray-400 text-sm truncate">@{user?.username}</p>
                                        </div>

                                        <div className="py-2">
                                            {user?.username && (
                                                <Link
                                                    to={`/channel/${user.username}`}
                                                    onClick={() => setShowDropdown(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-white hover:bg-gray-700 transition-colors min-h-[44px]"
                                                >
                                                    Your channel
                                                </Link>
                                            )}
                                            <Link
                                                to="/upload"
                                                onClick={() => setShowDropdown(false)}
                                                className="flex sm:hidden items-center gap-3 px-4 py-2.5 text-white hover:bg-gray-700 transition-colors min-h-[44px]"
                                            >
                                                Upload video
                                            </Link>
                                            <Link
                                                to="/dashboard"
                                                onClick={() => setShowDropdown(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-white hover:bg-gray-700 transition-colors min-h-[44px]"
                                            >
                                                Dashboard
                                            </Link>
                                            <Link
                                                to="/settings"
                                                onClick={() => setShowDropdown(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-white hover:bg-gray-700 transition-colors min-h-[44px]"
                                            >
                                                Settings
                                            </Link>
                                        </div>

                                        <div className="border-t border-gray-700 pt-2">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2.5 text-white hover:bg-gray-700 transition-colors min-h-[44px]"
                                            >
                                                Sign out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="flex items-center gap-2 border border-blue-500 text-blue-500 hover:bg-blue-500/10 px-4 py-2 rounded-full transition-colors text-sm whitespace-nowrap min-h-[44px]"
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
