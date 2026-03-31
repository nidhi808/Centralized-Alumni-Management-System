import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import AdminDashboardCharts from '../components/admin/AdminDashboardCharts';

export default function AdminHome() {
    const { currentUser } = useAuth();

    return (
        <DashboardLayout role="admin">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text dark:text-white">Welcome, Admin {currentUser?.email?.split('@')[0]}</h1>
                <p className="text-text-muted dark:text-gray-400 mt-2">Manage users, approve content, review statistics, and oversee platform activity.</p>
            </div>

            <AdminDashboardCharts />

            <div className="bg-card dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center mt-8">
                <h3 className="text-lg font-bold text-text dark:text-white mb-2">Detailed Administrative Controls</h3>
                <p className="text-text-muted dark:text-gray-400">
                    Additional table-based data management and controls are currently under development. Use the sidebar to navigate specific areas.
                </p>
            </div>
        </DashboardLayout>
    );
}
