import { useParams, useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaGoogle, FaLinkedinIn, FaFacebookF, FaUserShield, FaChalkboardTeacher, FaUserGraduate, FaUsers } from 'react-icons/fa';
import { FiMail, FiLock, FiArrowLeft } from 'react-icons/fi';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const roleConfig = {
    admin: {
        label: 'Admin',
        icon: FaUserShield,
        gradient: 'from-rose-500 to-orange-500',
        accent: 'rose',
        bgAccent: 'bg-rose-500',
        textAccent: 'text-rose-600 dark:text-rose-400',
        ringAccent: 'focus:ring-rose-500',
        btnGradient: 'from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600',
    },
    faculty: {
        label: 'Faculty',
        icon: FaChalkboardTeacher,
        gradient: 'from-violet-500 to-purple-600',
        accent: 'violet',
        bgAccent: 'bg-violet-500',
        textAccent: 'text-violet-600 dark:text-violet-400',
        ringAccent: 'focus:ring-violet-500',
        btnGradient: 'from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700',
    },
    student: {
        label: 'Student',
        icon: FaUserGraduate,
        gradient: 'from-emerald-500 to-teal-500',
        accent: 'emerald',
        bgAccent: 'bg-emerald-500',
        textAccent: 'text-emerald-600 dark:text-emerald-400',
        ringAccent: 'focus:ring-emerald-500',
        btnGradient: 'from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
    },
    alumni: {
        label: 'Alumni',
        icon: FaUsers,
        gradient: 'from-blue-500 to-cyan-500',
        accent: 'blue',
        bgAccent: 'bg-blue-500',
        textAccent: 'text-blue-600 dark:text-blue-400',
        ringAccent: 'focus:ring-blue-500',
        btnGradient: 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
    },
};

const socialProviders = [
    { name: 'Google', icon: FaGoogle, bg: 'bg-white dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-600', text: 'text-gray-700 dark:text-gray-200', hoverBg: 'hover:bg-gray-50 dark:hover:bg-gray-700', iconColor: 'text-red-500' },
    { name: 'LinkedIn', icon: FaLinkedinIn, bg: 'bg-[#0077b5]', border: 'border-[#0077b5]', text: 'text-white', hoverBg: 'hover:bg-[#006199]', iconColor: 'text-white' },
    { name: 'Facebook', icon: FaFacebookF, bg: 'bg-[#1877f2]', border: 'border-[#1877f2]', text: 'text-white', hoverBg: 'hover:bg-[#1565c0]', iconColor: 'text-white' },
];

export default function RoleLogin() {
    const { role } = useParams();
    const navigate = useNavigate();
    const config = roleConfig[role] || roleConfig.alumni;
    const RoleIcon = config.icon;
    const [showEmail, setShowEmail] = useState(false);

    // Auth logic
    const { login, loginWithGoogle } = useAuth();
    const [email, setEmail] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await login(email, password);
            // Navigation will be handled by ProtectedRoute or we can do it here. 
            // But since we want to redirect to SPECIFIC dashboard based on role, 
            // and the role is in the URL (e.g. login/student), we should probably 
            // check if the logged in user actually has that role?
            // For now, let's just let the AuthContext/App routing handle it, 
            // or manually redirect here.

            // Simple redirect for now based on the URL role, assuming the user knows what they are doing.
            // Verification step in real app would check "is this user actually a student".
            // We'll rely on the ProtectedRoute to kick them out if they are wrong.

            if (role === 'student') navigate('/student-dashboard');
            else if (role === 'faculty') navigate('/faculty-dashboard');
            else if (role === 'alumni') navigate('/alumni-dashboard');
            else if (role === 'admin') navigate('/admin-dashboard');
            else navigate('/');

        } catch (err) {
            setError('Failed to log in: ' + err.message);
        }
        setLoading(false);
    }

    async function handleGoogleLogin() {
        try {
            setError('');
            setLoading(true);
            await loginWithGoogle(role);
            if (role === 'student') navigate('/student-dashboard');
            else if (role === 'faculty') navigate('/faculty-dashboard');
            else if (role === 'alumni') navigate('/alumni-dashboard');
            else if (role === 'admin') navigate('/admin-dashboard');
            else navigate('/');
        } catch (err) {
            setError('Failed to log in with Google: ' + err.message);
        }
        setLoading(false);
    }


    return (
        <div className="min-h-screen bg-surface dark:bg-gray-950 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4">
                <a href="/" className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-md">
                        <FaGraduationCap className="text-white text-lg" />
                    </div>
                    <span className="text-lg font-bold text-primary dark:text-white">AlumniConnect</span>
                </a>
                <ThemeToggle />
            </div>

            {/* Main */}
            <div className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md">
                    {/* Back button */}
                    <button
                        onClick={() => navigate('/login')}
                        className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 mb-6 transition-colors"
                    >
                        <FiArrowLeft size={16} />
                        Back to role selection
                    </button>

                    {/* Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        {/* Gradient header */}
                        <div className={`bg-gradient-to-r ${config.gradient} px-8 py-8 text-center`}>
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
                                <RoleIcon className="text-white text-2xl" />
                            </div>
                            <h1 className="text-2xl font-bold text-white">
                                {config.label} Login
                            </h1>
                            <p className="text-white/80 text-sm mt-1">
                                Sign in to your {config.label.toLowerCase()} account
                            </p>
                        </div>

                        <div className="px-8 py-8">
                            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded relative" role="alert">{error}</div>}
                            {/* Social buttons */}
                            <div className="space-y-3">
                                {socialProviders.map((provider) => (
                                    <button
                                        key={provider.name}
                                        onClick={provider.name === 'Google' ? handleGoogleLogin : undefined}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border ${provider.bg} ${provider.border} ${provider.text} ${provider.hoverBg} transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md`}
                                    >
                                        <provider.icon size={18} className={provider.iconColor} />
                                        Continue with {provider.name}
                                    </button>
                                ))}
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-4 my-6">
                                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                                <span className="text-xs text-text-muted dark:text-gray-500 font-medium uppercase tracking-wider">or</span>
                                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                            </div>

                            {/* Email toggle */}
                            {!showEmail ? (
                                <button
                                    onClick={() => setShowEmail(true)}
                                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all text-sm font-medium shadow-sm hover:shadow-md`}
                                >
                                    <FiMail size={18} />
                                    Continue with Email
                                </button>
                            ) : (
                                <form onSubmit={handleLogin} className="space-y-4 animate-fadeIn">
                                    <div>
                                        <label className="block text-sm font-medium text-text dark:text-gray-300 mb-1.5">Email address</label>
                                        <div className="relative">
                                            <FiMail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-500" />
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="you@university.edu"
                                                className={`w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-text dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm ${config.ringAccent} focus:ring-2 focus:border-transparent outline-none transition-all`}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text dark:text-gray-300 mb-1.5">Institute Roll Number</label>
                                        <div className="relative">
                                            <FaGraduationCap size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-500" />
                                            <input
                                                type="text"
                                                value={rollNumber}
                                                onChange={(e) => setRollNumber(e.target.value)}
                                                placeholder="e.g. 21BCE1023 (Optional for some roles)"
                                                className={`w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-text dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm ${config.ringAccent} focus:ring-2 focus:border-transparent outline-none transition-all`}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text dark:text-gray-300 mb-1.5">Password</label>
                                        <div className="relative">
                                            <FiLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-500" />
                                            <input
                                                type="password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className={`w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-text dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm ${config.ringAccent} focus:ring-2 focus:border-transparent outline-none transition-all`}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-400 cursor-pointer">
                                            <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600" />
                                            Remember me
                                        </label>
                                        <a href="#" className={`text-sm font-medium ${config.textAccent} hover:underline`}>
                                            Forgot password?
                                        </a>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${config.btnGradient} shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50`}
                                    >
                                        {loading ? 'Signing In...' : `Sign In as ${config.label}`}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    <p className="text-center mt-6 text-sm text-text-muted dark:text-gray-500">
                        Don't have an account?{' '}
                        <button onClick={() => navigate('/register', { state: { role: role } })} className={`font-semibold ${config.textAccent} hover:underline`}>
                            Register as {config.label}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
