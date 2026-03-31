import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import { subscribeToUsersByRole, updateUserStatus, deleteUser } from '../../services/adminService';
import { FaUserGraduate, FaChalkboardTeacher, FaUserTie, FaSearch, FaTimes, FaEye, FaTrash, FaBan, FaCheck } from 'react-icons/fa';

const TABS = [
  { key: 'alumni', label: 'Alumni', icon: FaUserGraduate, color: 'from-[#086490] to-[#0ea5e9]' },
  { key: 'faculty', label: 'Faculty', icon: FaChalkboardTeacher, color: 'from-purple-500 to-purple-700' },
  { key: 'student', label: 'Students', icon: FaUserTie, color: 'from-emerald-500 to-teal-600' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

function ProfileModal({ user, onClose }) {
  if (!user) return null;
  const initials = (user.name || user.email || '?').charAt(0).toUpperCase();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 w-full max-w-sm relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <FaTimes size={13} />
        </button>

        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white text-2xl font-extrabold shadow-xl"
            style={{ background: 'linear-gradient(135deg, #086490, #0ea5e9)' }}>
            {initials}
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{user.name || 'N/A'}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-[#086490]/10 text-[#086490] dark:text-blue-400 rounded-full text-xs font-semibold capitalize">{user.role}</span>
        </div>

        <div className="mt-5 space-y-2">
          {[
            ['Department', user.dept],
            ['Status', user.status || 'active'],
            ['Joined', user.createdAt?.toDate?.().toLocaleDateString() || 'N/A'],
            ['Phone', user.phone || 'N/A'],
            ['Company', user.company || 'N/A'],
          ].map(([label, val]) => val && (
            <div key={label} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white capitalize">{val}</span>
            </div>
          ))}
        </div>

        {user.idCardUrl && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-center">
             <a href={user.idCardUrl} target="_blank" rel="noreferrer" className="text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
               <FaEye /> View College ID
             </a>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState('alumni');
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const unsub = subscribeToUsersByRole(activeTab, (data) => {
      setUsers(data);
      setLoading(false);
    });
    return () => unsub();
  }, [activeTab]);

  const filtered = users.filter(u =>
    !search ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.dept?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSuspend = async (u) => {
    const newStatus = u.status === 'suspended' ? 'active' : 'suspended';
    try { await updateUserStatus(u.id, newStatus); } catch (e) {}
  };

  const handleApprove = async (u) => {
    try { await updateUserStatus(u.id, 'approved'); } catch (e) {}
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">User Directory</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage all platform users across roles</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {TABS.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <motion.button
                key={tab.key}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
                  ${isActive
                    ? 'bg-gradient-to-r ' + tab.color + ' text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-[#086490] dark:hover:border-blue-500'
                  }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder={`Search ${activeTab}s by name, email, or department...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#086490]/30 focus:border-[#086490] transition-all"
          />
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-[#086490]/30 border-t-[#086490] rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Loading users...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
                <FaUserGraduate className="text-gray-300 dark:text-gray-500" size={24} />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {search ? `No results for "${search}"` : `No ${activeTab}s registered yet.`}
              </p>
            </div>
          ) : (
            <>
              <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 border-b border-gray-100 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900/40">
                <div className="col-span-4">User</div>
                <div className="col-span-2">Dept</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Joined</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {filtered.map(user => {
                  const initials = (user.name || user.email || '?').charAt(0).toUpperCase();
                  const isPending = user.status === 'pending' || user.status === 'pending_admin_approval';
                  const suspended = user.status === 'suspended';
                  
                  let statusUI = { label: 'Active', bg: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' };
                  if (suspended) statusUI = { label: 'Suspended', bg: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' };
                  else if (isPending) statusUI = { label: 'Pending', bg: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' };

                  return (
                    <motion.div
                      key={user.id}
                      variants={rowVariants}
                      whileHover={{ backgroundColor: 'rgba(8,100,144,0.03)' }}
                      className="grid grid-cols-12 gap-3 px-5 py-3.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0 transition-colors items-center"
                    >
                      <div className="col-span-8 md:col-span-4 flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-sm"
                          style={{ background: 'linear-gradient(135deg, #086490, #0ea5e9)' }}>
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name || '—'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="hidden md:block col-span-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{user.dept || '—'}</span>
                      </div>
                      <div className="hidden md:block col-span-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusUI.bg}`}>
                          {statusUI.label}
                        </span>
                      </div>
                      <div className="hidden md:block col-span-2 text-xs text-gray-500 dark:text-gray-400">
                        {user.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}
                      </div>
                      <div className="col-span-4 md:col-span-2 flex items-center justify-end gap-1.5">
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSelectedUser(user)}
                          className="p-2 rounded-lg bg-[#086490]/10 text-[#086490] dark:text-blue-400 hover:bg-[#086490]/20 transition-colors">
                          <FaEye size={13} />
                        </motion.button>
                        
                        {isPending && (
                          <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleApprove(user)} title="Approve User"
                            className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 transition-colors">
                            <FaCheck size={13} />
                          </motion.button>
                        )}
                        
                        {!isPending && (
                          <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleSuspend(user)} title={suspended ? "Reactivate User" : "Suspend User"}
                            className={`p-2 rounded-lg transition-colors ${suspended
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400'
                              : 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400'}`}>
                            {suspended ? <FaCheck size={13} /> : <FaBan size={13} />}
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </>
          )}
        </div>

        <p className="text-right text-xs text-gray-400 dark:text-gray-500">{filtered.length} users shown</p>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {selectedUser && <ProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
      </AnimatePresence>
    </AdminLayout>
  );
}
