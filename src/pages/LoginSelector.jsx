import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { FaGraduationCap, FaUserShield, FaChalkboardTeacher, FaUserGraduate, FaUsers } from 'react-icons/fa';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';

const roles = [
    {
        key: 'admin',
        label: 'Admin',
        icon: FaUserShield,
        description: 'Manage users, content, and platform settings',
        gradient: 'from-rose-500 to-orange-500',
        lightBg: 'bg-rose-50 dark:bg-rose-500/10',
        textColor: 'text-rose-600 dark:text-rose-400',
    },
    {
        key: 'faculty',
        label: 'Faculty',
        icon: FaChalkboardTeacher,
        description: 'Access academic tools and student interactions',
        gradient: 'from-violet-500 to-purple-600',
        lightBg: 'bg-violet-50 dark:bg-violet-500/10',
        textColor: 'text-violet-600 dark:text-violet-400',
    },
    {
        key: 'student',
        label: 'Student',
        icon: FaUserGraduate,
        description: 'Connect with alumni and explore opportunities',
        gradient: 'from-emerald-500 to-teal-500',
        lightBg: 'bg-emerald-50 dark:bg-emerald-500/10',
        textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
        key: 'alumni',
        label: 'Alumni',
        icon: FaUsers,
        description: 'Reconnect with classmates and give back',
        gradient: 'from-blue-500 to-cyan-500',
        lightBg: 'bg-blue-50 dark:bg-blue-500/10',
        textColor: 'text-blue-600 dark:text-blue-400',
    },
];

    export default function LoginSelector() {
        const navigate = useNavigate();
        const { currentUser, userRole, loading } = useAuth();
    
        return (
            <div className="min-h-screen bg-surface dark:bg-gray-950 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4">
                <a href="/" className="flex items-center gap-2 group">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-md">
                        <FaGraduationCap className="text-white text-lg" />
                    </div>
                    <span className="text-lg font-bold text-primary dark:text-white">AlumniConnect</span>
                </a>
                <ThemeToggle />
            </div>

            {/* Main */}
            <div className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-3xl">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-text dark:text-white tracking-tight">
                            Welcome Back
                        </h1>
                        <p className="mt-2 text-text-muted dark:text-gray-400">
                            Choose how you'd like to sign in to AlumniConnect
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {roles.map((role) => (
                            <button
                                key={role.key}
                                onClick={() => navigate(`/login/${role.key}`)}
                                className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-left hover:shadow-xl hover:-translate-y-1 hover:border-transparent transition-all duration-300 overflow-hidden"
                            >
                                {/* Gradient accent line */}
                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${role.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                                <div className={`w-12 h-12 rounded-xl ${role.lightBg} flex items-center justify-center mb-4`}>
                                    <role.icon className={`text-xl ${role.textColor}`} />
                                </div>
                                <h3 className="text-lg font-bold text-text dark:text-white">
                                    {role.label}
                                </h3>
                                <p className="mt-1 text-sm text-text-muted dark:text-gray-400">
                                    {role.description}
                                </p>

                                {/* Arrow */}
                                <div className={`absolute bottom-5 right-5 w-8 h-8 rounded-full bg-gradient-to-r ${role.gradient} flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0`}>
                                    <span className="text-white text-sm font-bold">→</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <p className="text-center mt-8 text-sm text-text-muted dark:text-gray-500">
                        Don't have an account?{' '}
                        <a href="/register" className="text-primary dark:text-blue-400 font-semibold hover:underline">
                            Register here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
