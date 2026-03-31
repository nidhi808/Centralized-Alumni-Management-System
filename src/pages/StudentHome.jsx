import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { ProfileProgress, JobBoardPreview } from '../components/DashboardWidgets';
import SuccessFeed from '../components/SuccessFeed';

export default function StudentHome() {
    const { currentUser } = useAuth();

    return (
        <DashboardLayout role="student">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text dark:text-white">Welcome back, {currentUser?.email?.split('@')[0] || 'Student'}!</h1>
                <p className="text-text-muted dark:text-gray-400 mt-2">Here's what's happening in your network today.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <ProfileProgress percent={45} />
                    <div className="bg-card dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-lg mb-4 text-text dark:text-white">Recommended Mentors</h3>
                        <p className="text-text-muted dark:text-gray-400 text-sm">Find alumni in your field of interest based on your profile.</p>
                        <div className="mt-4 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center">
                            <button className="text-primary dark:text-blue-400 font-medium text-sm hover:underline">Complete profile to see recommendations</button>
                        </div>
                    </div>
                    
                    <div className="h-[500px]">
                        <SuccessFeed />
                    </div>
                </div>

                <div className="space-y-8">
                    <JobBoardPreview />
                </div>
            </div>
        </DashboardLayout>
    );
}
