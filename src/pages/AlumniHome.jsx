import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { ProfileProgress, MentorshipToggle } from '../components/DashboardWidgets';
import AchievementForm from '../components/AchievementForm';
import SuccessFeed from '../components/SuccessFeed';

export default function AlumniHome() {
    const { currentUser } = useAuth();

    return (
        <DashboardLayout role="alumni">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text dark:text-white">Welcome back, {currentUser?.email?.split('@')[0] || 'Alum'}!</h1>
                <p className="text-text-muted dark:text-gray-400 mt-2">Here is your network overview and recent activity.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <ProfileProgress percent={85} />
                    <MentorshipToggle />
                </div>

                <div className="space-y-8">
                    <AchievementForm />
                    <div className="h-[500px]">
                        <SuccessFeed />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
