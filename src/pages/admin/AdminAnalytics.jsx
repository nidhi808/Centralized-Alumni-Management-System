import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { getDepartmentStats, subscribeToTotalAlumni, subscribeToTotalStudents, subscribeToTotalFaculty } from '../../services/adminService';
import { FaChartBar, FaChartLine } from 'react-icons/fa';

const PIE_COLORS = ['#086490', '#0ea5e9', '#6366f1', '#f59e0b', '#10b981'];

const monthlyData = [
  { month: 'Oct', registrations: 12, placements: 8 },
  { month: 'Nov', registrations: 18, placements: 11 },
  { month: 'Dec', registrations: 8, placements: 5 },
  { month: 'Jan', registrations: 25, placements: 14 },
  { month: 'Feb', registrations: 32, placements: 19 },
  { month: 'Mar', registrations: 21, placements: 16 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{label}</p>
        {payload.map((p, i) => <p key={i} className="text-xs" style={{ color: p.color }}>{p.name}: {p.value}</p>)}
      </div>
    );
  }
  return null;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function AdminAnalytics() {
  const [alumni, setAlumni] = useState(0);
  const [students, setStudents] = useState(0);
  const [faculty, setFaculty] = useState(0);
  const [deptData, setDeptData] = useState([]);

  useEffect(() => {
    const u1 = subscribeToTotalAlumni(setAlumni);
    const u2 = subscribeToTotalStudents(setStudents);
    const u3 = subscribeToTotalFaculty(setFaculty);
    getDepartmentStats().then(setDeptData);
    return () => { u1(); u2(); u3(); };
  }, []);

  const pieData = [
    { name: 'Alumni', value: alumni || 5 },
    { name: 'Students', value: students || 8 },
    { name: 'Faculty', value: faculty || 2 },
  ];

  return (
    <AdminLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Analytics</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Platform growth and engagement metrics</p>
        </motion.div>

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Alumni', value: alumni, color: 'from-[#086490] to-[#0ea5e9]' },
            { label: 'Students', value: students, color: 'from-emerald-500 to-teal-500' },
            { label: 'Faculty', value: faculty, color: 'from-purple-500 to-indigo-500' },
          ].map(({ label, value, color }) => (
            <motion.div key={label} variants={itemVariants}
              className={`bg-gradient-to-br ${color} text-white rounded-2xl p-4 text-center shadow-lg`}>
              <p className="text-3xl font-extrabold">{value}</p>
              <p className="text-xs font-semibold text-white/80 mt-1">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Monthly trends */}
        <motion.div variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FaChartLine className="text-[#086490] dark:text-blue-400" size={16} />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Monthly Trends</h3>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#086490" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#086490" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="registrations" name="Registrations" stroke="#086490" fill="url(#grad1)" strokeWidth={2} dot={{ r: 4, fill: '#086490' }} />
                <Area type="monotone" dataKey="placements" name="Placements" stroke="#10b981" fill="url(#grad2)" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Dept chart + Pie */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <motion.div variants={itemVariants}
            className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FaChartBar className="text-[#086490] dark:text-blue-400" size={16} />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Department Placements</h3>
            </div>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData.length ? deptData : [
                  { dept: 'CS', placements: 89 }, { dept: 'EE', placements: 54 },
                  { dept: 'ME', placements: 41 }, { dept: 'CE', placements: 28 }, { dept: 'CH', placements: 19 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="dept" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="placements" name="Placements" fill="#086490" radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">User Split</h3>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                    animationBegin={100} animationDuration={800}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend formatter={(v) => <span className="text-xs font-medium">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
