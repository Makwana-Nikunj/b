import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
    HiHome,
    HiCollection,
    HiClock,
    HiThumbUp,
    HiUserGroup,
    HiChartBar,
    HiCog,
    HiAnnotation,
} from 'react-icons/hi'

const publicNavItems = [
    { path: '/', icon: HiHome, label: 'Home' },
]

const privateNavItems = [
    { path: '/subscriptions', icon: HiUserGroup, label: 'Subscriptions' },
    { path: '/playlists', icon: HiCollection, label: 'Playlists' },
    { path: '/history', icon: HiClock, label: 'History' },
    { path: '/liked-videos', icon: HiThumbUp, label: 'Liked videos' },
    { path: '/tweets', icon: HiAnnotation, label: 'Tweets' },
    { path: '/dashboard', icon: HiChartBar, label: 'Dashboard' },
    { path: '/settings', icon: HiCog, label: 'Settings' },
]

function Sidebar({ isOpen, isMobile = false }) {
    const { isAuthenticated, isInitialized } = useSelector((state) => state.auth)

    const navItems = isAuthenticated
        ? [...publicNavItems, ...privateNavItems]
        : publicNavItems

    // Mobile sidebar styles - slides in from left
    const mobileStyles = isMobile
        ? `fixed left-0 top-14 h-[calc(100vh-56px)] bg-[#0f0f0f] z-40 w-60 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'
        }`
        : `fixed left-0 top-14 h-[calc(100vh-56px)] bg-[#0f0f0f] border-r border-gray-800 transition-all duration-300 overflow-y-auto ${isOpen ? 'w-60' : 'w-16'
        }`

    return (
        <aside className={mobileStyles}>
            <nav className="py-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3 mx-2 rounded-lg transition-colors min-h-[48px] ${isActive
                                ? 'bg-gray-800 text-white'
                                : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                            }`
                        }
                    >
                        <item.icon className="w-6 h-6 flex-shrink-0" />
                        {(isOpen || isMobile) && <span className="truncate">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Only show sign-in message after auth check is complete AND user is not authenticated */}
            {isInitialized && !isAuthenticated && (isOpen || isMobile) && (
                <div className="mx-4 mt-4 p-4 border-t border-gray-800">
                    <p className="text-sm text-gray-400">
                        Sign in to like videos, comment, and subscribe.
                    </p>
                </div>
            )}
        </aside>
    )
}

export default Sidebar

