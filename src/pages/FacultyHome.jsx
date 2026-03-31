import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import SuccessFeed from '../components/SuccessFeed';
import FacultyDashboardCharts from '../components/faculty/FacultyDashboardCharts';

export default function FacultyHome() {
    const { currentUser } = useAuth();

    return (
        <DashboardLayout role="faculty">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text dark:text-white">Welcome back, Professor {currentUser?.email?.split('@')[0] || ''}!</h1>
                <p className="text-text-muted dark:text-gray-400 mt-2">Manage your departmental outreach, track statistics, and student success stories.</p>
            </div>

            <FacultyDashboardCharts />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-center">
                    <h3 className="text-xl font-bold mb-2">Department Analytics</h3>
                    <p className="text-white/80 text-sm mb-6 max-w-sm">
                        Track career progressions of your recent graduates and download detailed PDF reports for accreditation purposes.
                    </p>
                    <button className="text-sm font-semibold bg-white text-violet-600 px-5 py-3 rounded-xl border-none shadow-sm cursor-pointer hover:bg-gray-50 transition-colors self-start">
                        Download Complete Report
                    </button>
                </div>

                <div className="h-[500px]">
                    <SuccessFeed />
                </div>
            </div>
        </DashboardLayout>
    );
}
