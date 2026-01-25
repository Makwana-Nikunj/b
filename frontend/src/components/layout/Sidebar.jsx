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

function Sidebar({ isOpen }) {
    const { isAuthenticated } = useSelector((state) => state.auth)

    const navItems = isAuthenticated
        ? [...publicNavItems, ...privateNavItems]
        : publicNavItems

    return (
        <aside
            className={`fixed left-0 top-14 h-[calc(100vh-56px)] bg-[#0f0f0f] border-r border-gray-800 transition-all duration-300 overflow-y-auto ${isOpen ? 'w-60' : 'w-16'
                }`}
        >
            <nav className="py-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3 mx-2 rounded-lg transition-colors ${isActive
                                ? 'bg-gray-800 text-white'
                                : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                            }`
                        }
                    >
                        <item.icon className="w-6 h-6 flex-shrink-0" />
                        {isOpen && <span className="truncate">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {!isAuthenticated && isOpen && (
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
