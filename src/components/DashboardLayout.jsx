import DashboardSidebar from './DashboardSidebar';
import { FaBars } from 'react-icons/fa';
import { useState } from 'react';

export default function DashboardLayout({ children, role }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-surface dark:bg-gray-950">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 w-64 bg-card dark:bg-gray-800 md:bg-transparent`}>
                <DashboardSidebar role={role} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile header */}
                <div className="md:hidden flex items-center justify-between p-4 bg-card dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 z-30 shadow-sm">
                    <span className="text-lg font-bold text-primary dark:text-white capitalize">{role} Dashboard</span>
                    <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary rounded-md">
                        <FaBars size={24} />
                    </button>
                </div>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-surface dark:bg-gray-950 p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
