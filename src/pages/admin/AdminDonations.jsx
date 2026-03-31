import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import { subscribeToDonations } from '../../services/donationService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { FaHandHoldingHeart, FaUserGraduate, FaChalkboardTeacher, FaRupeeSign } from 'react-icons/fa';

const PIE_COLORS = ['#f43f5e', '#ec4899', '#d946ef', '#8b5cf6'];
const BAR_COLORS = ['#10b981', '#0ea5e9']; // Alumni vs Faculty

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs mt-1" style={{ color: p.color }}>
            {p.name}: ₹{p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToDonations((data) => {
      setDonations(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Compute stats
  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
  const topDonor = [...donations].sort((a, b) => b.amount - a.amount)[0];
  const uniqueDonorsCount = new Set(donations.map(d => d.donorId)).size;

  // Compute Categories Pie Data
  const categoriesMap = {};
  donations.forEach(d => {
    const cat = d.category || 'general';
    categoriesMap[cat] = (categoriesMap[cat] || 0) + d.amount;
  });
  const pieData = Object.keys(categoriesMap).map(k => ({
    name: k,
    value: categoriesMap[k]
  }));

  // Compute Role Bar Data
  const roleMap = { alumni: 0, faculty: 0 };
  donations.forEach(d => {
    const role = d.donorRole || 'general';
    if(roleMap[role] !== undefined) {
      roleMap[role] += d.amount;
    }
  });
  const barData = [
    { name: 'Donations by Role', Alumni: roleMap.alumni, Faculty: roleMap.faculty }
  ];

  return (
    <AdminLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header Summary */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl p-6 md:p-8 text-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl"
          style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 60%, #8b5cf6 100%)' }}
        >
          <div className="absolute right-0 top-0 w-80 h-80 rounded-full opacity-10 bg-white" style={{ transform: 'translate(20%, -30%) blur(40px)' }} />
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold flex items-center gap-3">
              <FaHandHoldingHeart /> Total Endowments
            </h2>
            <p className="text-rose-100 text-sm mt-2 max-w-xl">
              Real-time monitoring of campus contributions, scholarships, and departmental funding from our proud alumni and faculty networks.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl">
            <div>
              <p className="text-xs text-rose-200 uppercase tracking-widest font-bold mb-1">Total Raised</p>
              <h3 className="text-4xl font-black">₹{totalAmount.toLocaleString()}</h3>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
              <FaUserGraduate size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total Donors</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{uniqueDonorsCount}</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <FaChalkboardTeacher size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Largest Single Gift</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{topDonor?.amount?.toLocaleString() || 0}</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
              <FaRupeeSign size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Avg. Donation</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{donations.length > 0 ? Math.round(totalAmount / donations.length).toLocaleString() : 0}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Categories Pie Chart */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Funding by Category</h3>
            <p className="text-sm text-gray-500 mb-6">Where allocations are primarily directed</p>
            <div className="h-64 flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                      {pieData.map((_, index) => <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
                    <Legend textStyle={{ fontSize: 13 }} className="capitalize" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400">No funding data available.</p>
              )}
            </div>
          </motion.div>

          {/* Role Bar Chart */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Contributions by Role</h3>
            <p className="text-sm text-gray-500 mb-6">Alumni vs Faculty financial engagement</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={false} axisLine={false} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Alumni" fill={BAR_COLORS[0]} radius={[6, 6, 0, 0]} barSize={50} />
                  <Bar dataKey="Faculty" fill={BAR_COLORS[1]} radius={[6, 6, 0, 0]} barSize={50} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Donation Records */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Donations</h3>
              <p className="text-sm text-gray-500">A live ledger of all financial gifts</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Live Sync
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
                  <th className="px-6 py-4">Donor Name</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">Loading records...</td>
                  </tr>
                ) : donations.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 flex flex-col items-center">
                      <FaHandHoldingHeart size={32} className="text-gray-300 mb-3" />
                      No donations have been made yet.
                    </td>
                  </tr>
                ) : (
                  donations.map(don => (
                    <tr key={don.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold
                            ${don.donorRole === 'alumni' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                            {don.donorName?.charAt(0) || '?'}
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">{don.donorName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold capitalize
                          ${don.donorRole === 'alumni' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                          {don.donorRole}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">{don.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-extrabold text-[#086490] dark:text-blue-400">₹{don.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-500">
                        {don.date}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
}
