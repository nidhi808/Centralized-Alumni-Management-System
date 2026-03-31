import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from 'recharts';

const networkData = [
  { name: 'Jan', users: 400, interactions: 240 },
  { name: 'Feb', users: 800, interactions: 498 },
  { name: 'Mar', users: 1200, interactions: 980 },
  { name: 'Apr', users: 1600, interactions: 1500 },
  { name: 'May', users: 2100, interactions: 2100 },
  { name: 'Jun', users: 2800, interactions: 2900 },
];

const deptData = [
  { name: 'Computer Eng', donations: 4000, referrals: 2400 },
  { name: 'IT', donations: 3000, referrals: 1398 },
  { name: 'Electronics', donations: 2000, referrals: 9800 },
  { name: 'Mechanical', donations: 2780, referrals: 3908 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl">
        <p className="font-semibold text-text dark:text-white mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsCharts() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6"
    >
      {/* Line Chart */}
      <motion.div variants={item} className="glow-card bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <h3 className="text-xl font-bold text-text dark:text-white mb-6 relative z-10">Network Growth</h3>
        <div className="h-72 w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={networkData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line type="monotone" dataKey="users" stroke="#086490" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, stroke: '#086490', strokeWidth: 2, fill: '#fff' }} animationDuration={1500} />
              <Line type="monotone" dataKey="interactions" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2, fill: '#fff' }} animationDuration={1500} delay={300} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Bar Chart */}
      <motion.div variants={item} className="glow-card bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
        <h3 className="text-xl font-bold text-text dark:text-white mb-6 relative z-10">Departmental Contributions</h3>
        <div className="h-72 w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(8, 100, 144, 0.05)' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="donations" fill="#086490" radius={[4, 4, 0, 0]} animationDuration={1500} />
              <Bar dataKey="referrals" fill="#0a8fd4" radius={[4, 4, 0, 0]} animationDuration={1500} delay={300} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  );
}
