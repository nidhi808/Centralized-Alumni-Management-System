import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  subscribeToTotalAlumni, subscribeToTotalStudents, subscribeToTotalFaculty,
  subscribeToPendingJobs, subscribeToEventsThisMonth, getDepartmentStats
} from '../../services/adminService';
import { FaUserGraduate, FaBriefcase, FaCalendarAlt, FaTrophy, FaMedal, FaUserFriends } from 'react-icons/fa';

// Animated counter hook
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const frameRef = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);
  return count;
}

const PIE_COLORS = ['#086490', '#0ea5e9', '#6366f1'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

function StatCard({ icon: Icon, label, value, color, gradient, suffix = '' }) {
  const count = useCountUp(value);
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm cursor-default"
    >
      <div className="absolute inset-0 opacity-5" style={{ background: gradient }} />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: gradient }}
          >
            <Icon className="text-white" size={18} />
          </div>
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
            <span>↑ Live</span>
          </div>
        </div>
        <div className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {count.toLocaleString()}{suffix}
        </div>
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{label}</div>
      </div>
    </motion.div>
  );
}

const BADGE_CONFIG = [
  { rank: 1, icon: FaTrophy, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', label: 'Gold' },
  { rank: 2, icon: FaMedal, color: 'text-gray-400', bg: 'bg-gray-50 dark:bg-gray-700/30', label: 'Silver' },
  { rank: 3, icon: FaMedal, color: 'text-amber-700', bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'Bronze' },
];

const mockLeaderboard = [
  { name: 'Raj Patel', role: 'Alumni', score: 243, dept: 'CS' },
  { name: 'Dr. Suresh Kumar', role: 'Faculty', score: 189, dept: 'EE' },
  { name: 'Priya Shah', role: 'Alumni', score: 156, dept: 'ME' },
  { name: 'Amit Desai', role: 'Alumni', score: 134, dept: 'CS' },
  { name: 'Dr. Anjali Singh', role: 'Faculty', score: 112, dept: 'CE' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-sm font-bold text-gray-900 dark:text-white">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs mt-1" style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [alumni, setAlumni] = useState(0);
  const [students, setStudents] = useState(0);
  const [faculty, setFaculty] = useState(0);
  const [pendingJobs, setPendingJobs] = useState(0);
  const [events, setEvents] = useState(0);
  const [deptData, setDeptData] = useState([]);

  useEffect(() => {
    const u1 = subscribeToTotalAlumni(setAlumni);
    const u2 = subscribeToTotalStudents(setStudents);
    const u3 = subscribeToTotalFaculty(setFaculty);
    const u4 = subscribeToPendingJobs(setPendingJobs);
    const u5 = subscribeToEventsThisMonth(setEvents);
    getDepartmentStats().then(setDeptData);
    return () => { u1(); u2(); u3(); u4(); u5(); };
  }, []);

  const pieData = [
    { name: 'Alumni', value: alumni || 1 },
    { name: 'Students', value: students || 1 },
    { name: 'Faculty', value: faculty || 1 },
  ];

  const totalUsers = alumni + students + faculty;

  return (
    <AdminLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Welcome banner */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-6 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #042a4a 0%, #086490 60%, #0ea5e9 100%)' }}
        >
          <div className="absolute right-0 top-0 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
          <h2 className="text-2xl font-extrabold">Welcome back, Admin 👋</h2>
          <p className="text-blue-200 text-sm mt-1">Here's your real-time platform overview for today.</p>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <p className="text-xs text-blue-200">Total Users</p>
              <p className="text-xl font-bold">{(totalUsers).toLocaleString()}</p>
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <p className="text-xs text-blue-200">Pending Approvals</p>
              <p className="text-xl font-bold text-amber-300">{pendingJobs}</p>
            </div>
          </div>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FaUserGraduate} label="Total Alumni" value={alumni}
            gradient="linear-gradient(135deg, #086490, #0ea5e9)" />
          <StatCard icon={FaBriefcase} label="Pending Jobs" value={pendingJobs}
            gradient="linear-gradient(135deg, #f59e0b, #ef4444)" />
          <StatCard icon={FaCalendarAlt} label="Events This Month" value={events}
            gradient="linear-gradient(135deg, #6366f1, #8b5cf6)" />
          <StatCard icon={FaUserFriends} label="Active Students" value={students}
            gradient="linear-gradient(135deg, #10b981, #059669)" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Bar Chart */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Department Performance</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Alumni & job placements by department</p>
              </div>
              <span className="px-3 py-1 bg-[#086490]/10 text-[#086490] dark:text-blue-400 text-xs font-semibold rounded-full">Live</span>
            </div>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData.length > 0 ? deptData : [
                  { dept: 'CS', alumni: 142, placements: 89 },
                  { dept: 'EE', alumni: 98, placements: 54 },
                  { dept: 'ME', alumni: 75, placements: 41 },
                  { dept: 'CE', alumni: 63, placements: 28 },
                  { dept: 'CH', alumni: 45, placements: 19 },
                ]} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="dept" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="alumni" name="Alumni" fill="#086490" radius={[6, 6, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="placements" name="Placements" fill="#0ea5e9" radius={[6, 6, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Pie Chart */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm"
          >
            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">User Distribution</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Platform breakdown</p>
            </div>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    paddingAngle={4} dataKey="value"
                    animationBegin={200} animationDuration={800}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val, name) => [val, name]} />
                  <Legend formatter={(val) => <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{val}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Leaderboard */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">🏆 Top Performers</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Most active Alumni &amp; Faculty</p>
            </div>
          </div>
          <div className="space-y-2">
            {mockLeaderboard.map((person, idx) => {
              const cfg = BADGE_CONFIG[idx] || { color: 'text-gray-400', bg: 'bg-gray-50 dark:bg-gray-700/20' };
              return (
                <motion.div
                  key={person.name}
                  variants={itemVariants}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f0f7ff] dark:hover:bg-gray-700/30 transition-colors cursor-default"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                    {idx < 3
                      ? <cfg.icon size={14} className={cfg.color} />
                      : <span className="text-xs font-bold text-gray-500 dark:text-gray-400">#{idx + 1}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{person.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{person.role} • {person.dept}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#086490] dark:text-blue-400">{person.score}</p>
                    <p className="text-[10px] text-gray-400">points</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
}
