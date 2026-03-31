import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import FacultyLayout from '../../components/faculty/FacultyLayout';
import { useToast } from '../../components/ui/Toast';
import {
  subscribeToDeptAlumniCount,
  subscribeToPendingVerifications,
  subscribeToTotalStudents,
  subscribeToTotalEvents
} from '../../services/facultyService';
import SuccessFeed from '../../components/SuccessFeed';
import { seedFirestoreCollections } from '../../services/firebaseSeed';
import {
  FaUserGraduate, FaClock, FaUsers, FaCalendarAlt,
  FaHeart, FaComment, FaShare, FaArrowUp, FaChartLine,
  FaBriefcase, FaSpinner, FaTrophy, FaDatabase
} from 'react-icons/fa';

export default function FacultyDashboard() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const dept = 'All'; // Default department

  const [stats, setStats] = useState({
    alumniCount: 0,
    pendingCount: 0,
    studentCount: 0,
    eventCount: 0,
  });

  const [seeding, setSeeding] = useState(false);

  const handleSeedDatabase = async () => {
    if (seeding) return;
    setSeeding(true);
    try {
      await seedFirestoreCollections(currentUser?.uid);
      addToast('🎉 Database seeded with sample data!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Seed failed — check Firestore rules in Firebase Console', 'error');
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    const unsubs = [];
    unsubs.push(subscribeToDeptAlumniCount(dept, (n) => setStats(prev => ({ ...prev, alumniCount: n }))));
    unsubs.push(subscribeToPendingVerifications(dept, (n) => setStats(prev => ({ ...prev, pendingCount: n }))));
    unsubs.push(subscribeToTotalStudents(dept, (n) => setStats(prev => ({ ...prev, studentCount: n }))));
    if (currentUser?.uid) {
      unsubs.push(subscribeToTotalEvents(currentUser.uid, (n) => setStats(prev => ({ ...prev, eventCount: n }))));
    }

    return () => unsubs.forEach(fn => fn());
  }, [currentUser, dept]);

  const userName = currentUser?.email?.split('@')[0] || 'Professor';

  const statCards = [
    {
      title: 'Dept Alumni',
      value: stats.alumniCount,
      icon: FaUserGraduate,
      color: 'from-[#086490] to-[#0aa4d4]',
      change: '+12%',
      desc: 'In your department',
    },
    {
      title: 'Pending Verifications',
      value: stats.pendingCount,
      icon: FaClock,
      color: 'from-amber-500 to-orange-500',
      change: 'Action needed',
      desc: 'Awaiting review',
    },
    {
      title: 'Students',
      value: stats.studentCount,
      icon: FaUsers,
      color: 'from-emerald-500 to-teal-500',
      change: '+5%',
      desc: 'Active students',
    },
    {
      title: 'Events Created',
      value: stats.eventCount,
      icon: FaCalendarAlt,
      color: 'from-violet-500 to-purple-600',
      change: 'This semester',
      desc: 'Workshops & webinars',
    },
  ];

  return (
    <FacultyLayout>
      {/* Welcome Banner */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-[#042a4a] via-[#086490] to-[#0a8fd4] rounded-2xl p-8 text-white relative overflow-hidden glow-banner">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 w-60 h-60 bg-cyan-400/10 rounded-full -mb-32 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-200 text-xs font-semibold mb-4 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Faculty Portal • Live
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 glow-text">
              Welcome back, Prof. <span className="capitalize">{userName}</span>! 👨‍🏫
            </h1>
            <p className="text-blue-100/80 max-w-xl text-sm md:text-base">
              Manage your department, review alumni verifications, create events, and bridge students with industry professionals.
            </p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="group bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 glow-stat"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                <card.icon className="text-white text-lg" />
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                <FaArrowUp size={8} />
                {card.change}
              </span>
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">{card.value}</h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions + Success Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="xl:col-span-1 space-y-5">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm glow-card">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <FaChartLine className="text-[#086490]" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Create Event', path: '/faculty/events', icon: FaCalendarAlt, color: 'text-violet-500 bg-violet-50 dark:bg-violet-500/10' },
                { label: 'Post Job', path: '/faculty/jobs', icon: FaBriefcase, color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' },
                { label: 'View Alumni', path: '/faculty/alumni', icon: FaUserGraduate, color: 'text-[#086490] bg-[#086490]/10' },
              ].map((action) => (
                <a
                  key={action.label}
                  href={action.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                  <div className={`w-9 h-9 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon size={16} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    {action.label}
                  </span>
                </a>
              ))}

              {/* Seed Database Button */}
              <button
                onClick={handleSeedDatabase}
                disabled={seeding}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors group w-full text-left"
              >
                <div className="w-9 h-9 rounded-lg text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                  {seeding ? <FaSpinner className="animate-spin" size={16} /> : <FaDatabase size={16} />}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 transition-colors">
                  {seeding ? 'Seeding...' : 'Seed Sample Data'}
                </span>
              </button>
            </div>
          </div>

          {/* Department Info Card */}
          <div className="bg-gradient-to-br from-[#086490] to-[#042a4a] rounded-2xl p-6 text-white">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-blue-200/70">Department</h3>
            <p className="text-xl font-bold mb-1">{dept}</p>
            <p className="text-blue-200/60 text-xs">Xavier Institute of Engineering</p>
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
              <div>
                <p className="text-2xl font-extrabold">{stats.alumniCount}</p>
                <p className="text-[11px] text-blue-200/50">Alumni</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold">{stats.studentCount}</p>
                <p className="text-[11px] text-blue-200/50">Students</p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Feed */}
        <div className="xl:col-span-2 h-[500px]">
          <SuccessFeed />
        </div>
      </div>
    </FacultyLayout>
  );
}
