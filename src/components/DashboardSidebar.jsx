import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaUser, FaBriefcase, FaCalendarAlt, FaHandsHelping, FaSignOutAlt, FaGraduationCap, FaHeart, FaUsers, FaComments } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function DashboardSidebar({ role }) {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    const alumniNavItems = [
        { path: '/alumni/portal', name: 'Dashboard', icon: FaHome },
        { path: '/alumni/mentorship', name: 'Mentorship', icon: FaHandsHelping },
        { path: '/alumni/chat', name: 'Mentorship Chat', icon: FaComments },
        { path: '/alumni/jobs', name: 'Job Board', icon: FaBriefcase },
        { path: '/alumni/network', name: 'Network Directory', icon: FaUser },
        { path: '/alumni/events', name: 'Events & Reunions', icon: FaCalendarAlt },
        { path: '/alumni/donate', name: 'Giving Back', icon: FaHeart },
        { path: '/alumni/profile', name: 'My Profile', icon: FaUser },
    ];

    const studentNavItems = [
        { path: '/student-dashboard', name: 'Dashboard', icon: FaHome },
        { path: '/student/events', name: 'Events & Workshops', icon: FaCalendarAlt },
        { path: '/student/network', name: 'Alumni Directory', icon: FaUsers },
        { path: '/student/chat', name: 'Mentorship Chat', icon: FaHandsHelping },
        { path: '/student/helpdesk', name: 'Helpdesk & Feedback', icon: FaBriefcase },
        { path: '/student/profile', name: 'My Profile', icon: FaUser },
    ];

    const defaultNavItems = [
        { path: `/${role}-dashboard`, name: 'Dashboard', icon: FaHome },
        { path: '/profile', name: 'My Profile', icon: FaUser },
        { path: '/jobs', name: 'Job Board', icon: FaBriefcase },
        { path: '/events', name: 'Events', icon: FaCalendarAlt },
        { path: '/student/network', name: 'Alumni Directory', icon: FaUsers },
        { path: '/mentorship', name: 'Mentorship', icon: FaHandsHelping },
        { path: `/${role}/donate`, name: 'Giving / Donations', icon: FaHeart },
    ];

    let navItems = defaultNavItems;
    if (role === 'alumni') navItems = alumniNavItems;
    if (role === 'student') navItems = studentNavItems;

    return (
        <aside className="w-64 bg-card dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 h-screen sticky top-0 flex flex-col hidden md:flex">
            <div className="p-6 pb-2">
                <a href="/" className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-md">
                        <FaGraduationCap className="text-white text-sm" />
                    </div>
                    <span className="text-lg font-bold text-primary dark:text-white">AlumniConnect</span>
                </a>

                <div className="flex items-center gap-3 px-2 py-4 border-b border-gray-100 dark:border-gray-700 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {role.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-text dark:text-white capitalize">{currentUser?.displayName || `${role} User`}</p>
                        <p className="text-xs text-text-muted dark:text-gray-400">View Profile</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto w-full">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                            ${isActive
                                ? 'bg-primary/10 text-primary dark:bg-gray-700 dark:text-blue-400 font-semibold'
                                : 'text-text-muted dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-text dark:hover:text-gray-200'
                            }`
                        }
                    >
                        <item.icon size={18} />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
                <div className="px-4 py-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-text-muted dark:text-gray-400">Theme</span>
                    <ThemeToggle />
                </div>
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium text-sm"
                >
                    <FaSignOutAlt size={18} />
                    Log Out
                </button>
            </div>
        </aside>
    );
}
