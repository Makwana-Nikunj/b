import { Outlet } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import PageTransition from '../components/ui/PageTransition'
import { useState, useEffect } from 'react'

function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [isMobile, setIsMobile] = useState(false)

    // Detect mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)
            // Auto-close sidebar on mobile
            if (mobile) {
                setSidebarOpen(false)
            }
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen)
    }

    // Close sidebar when clicking outside on mobile
    const handleOverlayClick = () => {
        if (isMobile && sidebarOpen) {
            setSidebarOpen(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0f0f0f]">
            <Navbar onMenuClick={toggleSidebar} />

            <div className="flex pt-14">
                {/* Mobile overlay */}
                {isMobile && sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30"
                        onClick={handleOverlayClick}
                    />
                )}

                <Sidebar isOpen={sidebarOpen} isMobile={isMobile} />

                <main
                    className={`flex-1 transition-all duration-300 ${isMobile
                        ? 'ml-0'
                        : sidebarOpen
                            ? 'ml-60'
                            : 'ml-16'
                        }`}
                >
                    <div className="p-3 sm:p-4 md:p-6">
                        <PageTransition>
                            <Outlet />
                        </PageTransition>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default MainLayout
