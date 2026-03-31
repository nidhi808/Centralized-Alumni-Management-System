import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ThemeToggle';
import { useState } from 'react';
import {
  FaHome, FaCalendarAlt, FaBriefcase, FaUserGraduate,
  FaComments, FaUser, FaCog, FaSignOutAlt, FaGraduationCap,
  FaBars, FaTimes, FaBullhorn, FaHeart
} from 'react-icons/fa';

const navItems = [
  { path: '/faculty/dashboard', name: 'Dashboard', icon: FaHome },
  { path: '/faculty/events', name: 'Event Hub', icon: FaCalendarAlt },
  { path: '/faculty/announcements', name: 'Announcements', icon: FaBullhorn },
  { path: '/faculty/jobs', name: 'Job Pipeline', icon: FaBriefcase },
  { path: '/faculty/alumni', name: 'Alumni Directory', icon: FaUserGraduate },
  { path: '/faculty/chat', name: 'Chat Hub', icon: FaComments },
  { path: '/faculty/profile', name: 'My Profile', icon: FaUser },
  { path: '/faculty/settings', name: 'Settings', icon: FaCog },
  { path: '/faculty/donate', name: 'Give Back', icon: FaHeart },
];

export default function FacultyLayout({ children }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Faculty';

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-gray-950 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-[#042a4a] text-white flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#086490] to-[#0a8fd4] flex items-center justify-center shadow-lg glow-icon">
                <FaGraduationCap className="text-white text-lg" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight">AlumniConnect</span>
                <span className="block text-[10px] text-blue-300 font-medium tracking-widest uppercase">Faculty Portal</span>
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

        {/* User Card */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#086490] to-cyan-400 flex items-center justify-center text-white font-bold text-sm shadow-inner">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate capitalize">Prof. {userName}</p>
              <p className="text-[11px] text-blue-300/70 truncate">{currentUser?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto py-2">
          <p className="px-3 py-2 text-[10px] font-bold text-blue-300/50 uppercase tracking-[0.15em]">Main Menu</p>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={() => {
                const isActive = location.pathname === item.path;
                return `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium
                  ${isActive
                    ? 'bg-[#086490] text-white shadow-lg shadow-[#086490]/30 glow-sidebar-active'
                    : 'text-blue-200/70 hover:bg-white/5 hover:text-white glow-sidebar'
                  }`;
              }}
            >
              <item.icon size={16} className="shrink-0" />
              <span>{item.name}</span>
              {isActiveIndicator(location.pathname, item.path)}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/10 space-y-2">
          <div className="px-4 py-2 flex items-center justify-between">
            <span className="text-xs font-medium text-blue-200/50">Theme</span>
            <ThemeToggle />
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-red-300 hover:bg-red-500/10 transition-colors text-sm font-medium"
          >
            <FaSignOutAlt size={16} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-8 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <FaBars size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-[#086490] dark:text-blue-400">
                {getPageTitle(location.pathname)}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#086490]/10 text-[#086490] dark:bg-blue-500/10 dark:text-blue-400 glow-live">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold">Live Sync</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#086490] flex items-center justify-center text-white font-bold text-sm shadow">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f8fafc] dark:bg-gray-950 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function isActiveIndicator(pathname, path) {
  if (pathname === path) {
    return <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />;
  }
  return null;
}

function getPageTitle(pathname) {
  const map = {
    '/faculty/dashboard': 'Faculty Dashboard',
    '/faculty/events': 'Event Hub',
    '/faculty/announcements': 'Announcements',
    '/faculty/jobs': 'Job / Internship Pipeline',
    '/faculty/alumni': 'Alumni Directory',
    '/faculty/chat': 'Chat Hub',
    '/faculty/profile': 'My Profile',
    '/faculty/settings': 'Settings',
    '/faculty/donate': 'Endowments & Giving',
  };
  return map[pathname] || 'Faculty Dashboard';
}
