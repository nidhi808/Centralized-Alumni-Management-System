import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { ProfileProgress, MentorshipToggle } from '../../components/DashboardWidgets';
import ImpactStats from '../../components/alumni/ImpactStats';
import AnalyticsCharts from '../../components/alumni/AnalyticsCharts';
import VerticalSuccessFeed from '../../components/alumni/VerticalSuccessFeed';
import { motion } from 'framer-motion';

export default function AlumniDashboard() {
  const { currentUser } = useAuth();
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <DashboardLayout role="alumni">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto space-y-8 pb-12"
      >
        {/* Header Section */}
        <motion.div variants={item} className="relative z-10 w-full bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-text dark:text-white tracking-tight">
              Welcome back, <span className="text-primary dark:text-primary-light">{currentUser?.email?.split('@')[0] || 'Alum'}</span>!
            </h1>
            <p className="text-text-muted dark:text-gray-400 mt-2 text-lg">
              Here is your network overview and recent institutional impact.
            </p>
          </div>
          
          <div className="relative z-10 hidden md:block">
            <button className="glow-btn bg-white dark:bg-gray-800 text-primary dark:text-white font-semibold py-2.5 px-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all text-sm">
              View Public Profile
            </button>
          </div>
        </motion.div>

        {/* Top Level Stats */}
        <motion.div variants={item}>
          <ImpactStats />
        </motion.div>

        {/* Middle Level Grid (Charts & Tools) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10">
          <motion.div variants={item} className="xl:col-span-2 flex flex-col gap-8">
            <AnalyticsCharts />
          </motion.div>

          <motion.div variants={item} className="flex flex-col gap-6 mt-6">
             <div className="glow-card bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden h-full">
                <VerticalSuccessFeed />
             </div>
          </motion.div>
        </div>

        {/* Bottom Level Widgets */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
          <div className="glow-card bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-text dark:text-white mb-4">Profile Completeness</h3>
            <ProfileProgress percent={85} />
          </div>
          <div className="glow-card bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-text dark:text-white mb-4">Engagement Settings</h3>
            <MentorshipToggle />
          </div>
        </motion.div>

      </motion.div>
    </DashboardLayout>
  );
}
