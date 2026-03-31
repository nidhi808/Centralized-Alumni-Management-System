import { useAuth } from '../../context/AuthContext';
import { FaClock, FaSignOutAlt } from 'react-icons/fa';
import ThemeToggle from '../../components/ThemeToggle';

export default function StudentWaitingRoom() {
    const { logout, currentUser } = useAuth();

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-[#086490] dark:text-blue-400">XIE Alumni Portal</span>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors"
                    >
                        <FaSignOutAlt />
                        Logout
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
                    <FaClock className="text-5xl text-[#086490] dark:text-blue-400 animate-pulse" />
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Verification in Progress
                </h1>
                
                <div className="max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
                        Hello {currentUser?.email?.split('@')[0] || 'Student'},
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Your account has been created successfully. However, as an <b>Enterprise-Grade Student Hub</b>, your College ID card must be manually verified by the Administrator before you can access the read-only dashboard.
                    </p>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-left">
                        <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-2 list-disc pl-4">
                            <li>We are reviewing the PDF ID card you submitted.</li>
                            <li>This process usually takes up to 24 hours.</li>
                            <li>Once approved, you will have access to jobs, events, and the alumni network.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
