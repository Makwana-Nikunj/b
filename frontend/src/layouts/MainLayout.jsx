import { Outlet } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import { useState } from 'react'

function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen)
    }

    return (
        <div className="min-h-screen bg-[#0f0f0f]">
            <Navbar onMenuClick={toggleSidebar} />

            <div className="flex pt-14">
                <Sidebar isOpen={sidebarOpen} />

                <main
                    className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'
                        }`}
                >
                    <div className="p-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default MainLayout
