import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { subscribeToPendingApprovals } from '../../services/adminService';
import {
  FaHome, FaBriefcase, FaUsers, FaInbox, FaBullhorn,
  FaStar, FaCog, FaSignOutAlt, FaGraduationCap, FaBars,
  FaTimes, FaBell, FaChartBar, FaHandHoldingHeart, FaCalendarAlt, FaBug
} from 'react-icons/fa';

const navItems = [
  { path: '/admin/dashboard', name: 'Dashboard', icon: FaHome },
  { path: '/admin/jobs', name: 'Job Approvals', icon: FaBriefcase, badge: true },
  { path: '/admin/users', name: 'User Directory', icon: FaUsers },
  { path: '/admin/analytics', name: 'Analytics', icon: FaChartBar },
  { path: '/admin/events', name: 'Event Management', icon: FaCalendarAlt },
  { path: '/admin/inbox', name: 'Admin Inbox', icon: FaInbox },
  { path: '/admin/helpdesk', name: 'Helpdesk & Feedback', icon: FaBug },
  { path: '/admin/announcements', name: 'Announcements', icon: FaBullhorn },
  { path: '/admin/success-feed', name: 'Success Feed', icon: FaStar },
  { path: '/admin/donations', name: 'Donations Overview', icon: FaHandHoldingHeart },
  { path: '/admin/settings', name: 'Settings', icon: FaCog },
];

const getPageTitle = (pathname) => {
  const map = {
    '/admin/dashboard': 'Admin Dashboard',
    '/admin/jobs': 'Job Approval Center',
    '/admin/users': 'User Directory',
    '/admin/analytics': 'Analytics',
    '/admin/events': 'Event Management',
    '/admin/inbox': 'Admin Inbox',
    '/admin/helpdesk': 'Student Helpdesk & Feedback',
    '/admin/announcements': 'Global Announcements',
    '/admin/success-feed': 'Success Feed Manager',
    '/admin/donations': 'Global Donations & Endowments',
    '/admin/settings': 'Settings & Config',
  };
  return map[pathname] || 'Admin Panel';
};

export default function AdminLayout({ children }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [bellJiggle, setBellJiggle] = useState(false);
  const prevPendingRef = useRef(0);

  useEffect(() => {
    const unsub = subscribeToPendingApprovals((count) => {
      setPendingCount(count);
      if (count > prevPendingRef.current) {
        setBellJiggle(true);
        setTimeout(() => setBellJiggle(false), 1000);
      }
      prevPendingRef.current = count;
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Admin';

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-gray-950 overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        className={`fixed inset-y-0 left-0 z-50 w-[270px] flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0`}
        style={{
          background: 'linear-gradient(160deg, #042a4a 0%, #064a7a 50%, #086490 100%)',
        }}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg backdrop-blur-sm">
                <FaGraduationCap className="text-white text-lg" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-white">XIE Alumni</span>
                <span className="block text-[10px] text-blue-300 font-bold tracking-widest uppercase">Admin Panel</span>
              </div>
            </a>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/60 hover:text-white transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Admin Card */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate capitalize">{userName}</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[11px] text-amber-300/80 font-semibold">Super Admin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto py-2">
          <p className="px-3 py-2 text-[10px] font-bold text-blue-300/50 uppercase tracking-[0.15em]">Navigation</p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const showBadge = item.badge && pendingCount > 0;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={() =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium relative
                  ${isActive
                    ? 'bg-white/15 text-white shadow-md border border-white/20'
                    : 'text-blue-200/70 hover:bg-white/8 hover:text-white'
                  }`
                }
              >
                <item.icon size={15} className="shrink-0" />
                <span className="flex-1">{item.name}</span>
                {showBadge && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-amber-400 text-gray-900 text-[10px] font-bold flex items-center justify-center"
                  >
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </motion.span>
                )}
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white shrink-0" />}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/10 space-y-1">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-red-300 hover:bg-red-500/10 transition-colors text-sm font-medium"
          >
            <FaSignOutAlt size={15} />
            Log Out
          </button>
        </div>
      </motion.aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <FaBars size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-[#086490] dark:text-blue-400">
                {getPageTitle(location.pathname)}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold">Live</span>
            </div>

            {/* Notification bell */}
            <div className="relative">
              <motion.button
                animate={bellJiggle ? {
                  rotate: [0, -15, 15, -15, 15, -10, 10, 0],
                  transition: { duration: 0.6 }
                } : {}}
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-[#086490]/10 dark:hover:bg-blue-500/10 transition-all text-gray-600 dark:text-gray-400"
              >
                <FaBell size={18} />
                {pendingCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
                  >
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </motion.span>
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-800 dark:text-white">Pending Actions</h3>
                      <button onClick={() => setShowNotifDropdown(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <FaTimes size={14} />
                      </button>
                    </div>
                    {pendingCount > 0 ? (
                      <div className="p-4">
                        <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-800 flex items-center justify-center">
                            <FaBriefcase className="text-amber-600 dark:text-amber-300" size={15} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-white">{pendingCount} Job{pendingCount !== 1 ? 's' : ''} Pending</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Awaiting your approval</p>
                          </div>
                        </div>
                        <button
                          onClick={() => { navigate('/admin/jobs'); setShowNotifDropdown(false); }}
                          className="mt-3 w-full py-2 rounded-xl bg-[#086490] text-white text-sm font-semibold hover:bg-[#065a82] transition-colors"
                        >
                          Review Now
                        </button>
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">All caught up! ✅</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
              onClick={() => navigate('/admin/settings')}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f8fafc] dark:bg-gray-950">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="p-4 lg:p-6 min-h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
