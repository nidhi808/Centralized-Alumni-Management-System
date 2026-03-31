import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import { subscribeToAllJobs, approveJob, rejectJob, deleteJob } from '../../services/adminService';
import { FaBriefcase, FaCheck, FaTimes, FaBuilding, FaMapMarkerAlt, FaClock, FaUser, FaTrash } from 'react-icons/fa';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const cardVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, x: 80, scale: 0.95, transition: { duration: 0.3 } },
};

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: -60, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -60, scale: 0.9 }}
      className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border ${type === 'success'
        ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
        : type === 'info'
          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-300'
          : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300'}`}
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${type === 'success' ? 'bg-emerald-500' : type === 'info' ? 'bg-blue-500' : 'bg-red-500'}`}>
        {type === 'success' ? <FaCheck className="text-white text-xs" /> : <FaTimes className="text-white text-xs" />}
      </div>
      <span className="text-sm font-semibold">{message}</span>
    </motion.div>
  );
}

function JobCard({ job, onApprove, onReject, onDelete }) {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleApprove = async () => {
    setApproving(true);
    await onApprove(job);
    setApproving(false);
  };
  const handleReject = async () => {
    setRejecting(true);
    await onReject(job);
    setRejecting(false);
  };
   const handleDelete = async () => {
     setDeleting(true);
     await onDelete(job);
     setDeleting(false);
   }

  const typeColors = {
    full_time: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    internship: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
    part_time: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  };

  const isPending = job.status === 'pending_admin_approval';

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm relative group hover:shadow-lg transition-all duration-300"
    >
      {/* Absolute delete button for non-pending items */}
      {!isPending && (
          <button
              onClick={handleDelete}
              disabled={deleting}
              className="absolute top-3 right-3 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors opacity-0 group-hover:opacity-100"
              title="Delete Job permanently"
          >
              {deleting ? <div className="w-3 h-3 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" /> : <FaTrash size={12} />}
          </button>
      )}

      <div className="flex items-start gap-4 pr-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#086490] to-[#0ea5e9] flex items-center justify-center shrink-0 shadow-md">
          <FaBriefcase className="text-white" size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">{job.title || 'Untitled Job'}</h3>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${typeColors[job.type] || typeColors['full_time']}`}>
              {(job.type || 'full_time').replace('_', ' ')}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
            {job.company && (
              <span className="flex items-center gap-1"><FaBuilding size={10} /> {job.company}</span>
            )}
            {job.location && (
              <span className="flex items-center gap-1"><FaMapMarkerAlt size={10} /> {job.location}</span>
            )}
            {job.authorEmail && (
              <span className="flex items-center gap-1"><FaUser size={10} /> {job.authorEmail}</span>
            )}
          </div>

          {job.description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{job.description}</p>
          )}

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {job.salary && (
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-semibold">
                {job.salary}
              </span>
            )}
            {job.deadline && (
              <span className="flex items-center gap-1 px-3 py-1 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 rounded-full text-xs">
                <FaClock size={10} /> {job.deadline}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons (only if pending) */}
      {isPending && (
          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleApprove}
              disabled={approving || rejecting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold shadow-md hover:shadow-emerald-200 dark:hover:shadow-emerald-900/30 disabled:opacity-60 transition-all"
            >
              {approving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FaCheck size={13} />
              )}
              {approving ? 'Approving...' : 'Approve'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleReject}
              disabled={approving || rejecting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white dark:bg-gray-700 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60 transition-all"
            >
              {rejecting ? (
                <div className="w-4 h-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
              ) : (
                <FaTimes size={13} />
              )}
              {rejecting ? 'Rejecting...' : 'Reject'}
            </motion.button>
          </div>
      )}
    </div>
  );
}

export default function AdminJobApproval() {
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'approved', 'rejected'

  useEffect(() => {
    // Fetch ALL jobs instead of just pending ones
    const unsub = subscribeToAllJobs((data) => {
      setAllJobs(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const addToast = (message, type) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const handleApprove = async (job) => {
    try {
      await approveJob(job.id, job.authorId);
      addToast(`✅ "${job.title || 'Job'}" has been approved!`, 'success');
    } catch (e) {
      addToast('Failed to approve job. Please try again.', 'error');
    }
  };

  const handleReject = async (job) => {
    try {
      await rejectJob(job.id, job.authorId, 'Does not meet platform guidelines');
      addToast(`Job "${job.title || ''}" has been rejected.`, 'info');
    } catch (e) {
      addToast('Failed to reject job. Please try again.', 'error');
    }
  };

  const handleDelete = async (job) => {
      if(!window.confirm("Are you sure you want to permanently delete this job?")) return;
      try {
          // We need to implement deleteJob in adminService
          await deleteJob(job.id);
          addToast(`Job "${job.title || ''}" has been permanently deleted.`, 'info');
      } catch (e) {
          addToast("Failed to delete job.", "error");
      }
  }

  const { pendingJobs, approvedJobs, rejectedJobs } = useMemo(() => {
      return {
          pendingJobs: allJobs.filter(j => j.status === 'pending_admin_approval'),
          approvedJobs: allJobs.filter(j => j.status === 'approved'),
          rejectedJobs: allJobs.filter(j => j.status === 'rejected'),
      };
  }, [allJobs]);

  const displayedJobs = activeTab === 'pending' ? pendingJobs : activeTab === 'approved' ? approvedJobs : rejectedJobs;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Job Approval Center</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review and manage job posts</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700 self-start sm:self-auto shrink-0">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{pendingJobs.length} Pending</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
                onClick={() => setActiveTab('pending')}
                className={`pb-3 px-4 text-sm font-semibold transition-colors relative ${activeTab === 'pending' ? 'text-[#086490] dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
                Pending
                {pendingJobs.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px]">{pendingJobs.length}</span>
                )}
                {activeTab === 'pending' && <motion.div layoutId="jobtab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#086490] dark:bg-blue-400" />}
            </button>
            <button
                onClick={() => setActiveTab('approved')}
                className={`pb-3 px-4 text-sm font-semibold transition-colors relative ${activeTab === 'approved' ? 'text-[#086490] dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
                Approved ({approvedJobs.length})
                {activeTab === 'approved' && <motion.div layoutId="jobtab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#086490] dark:bg-blue-400" />}
            </button>
            <button
                onClick={() => setActiveTab('rejected')}
                className={`pb-3 px-4 text-sm font-semibold transition-colors relative ${activeTab === 'rejected' ? 'text-[#086490] dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
                Rejected ({rejectedJobs.length})
                {activeTab === 'rejected' && <motion.div layoutId="jobtab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#086490] dark:bg-blue-400" />}
            </button>
        </div>

        {/* Toast notifications */}
        <AnimatePresence>
          {toasts.map(t => (
            <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : displayedJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 mt-6"
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${activeTab === 'pending' ? 'bg-amber-50 dark:bg-amber-900/20' : activeTab === 'approved' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              {activeTab === 'pending' && <FaClock className="text-amber-500" size={24} />}
              {activeTab === 'approved' && <FaCheck className="text-emerald-500" size={24} />}
              {activeTab === 'rejected' && <FaTimes className="text-red-500" size={24} />}
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {activeTab === 'pending' ? 'All Clear!' : 'No Jobs Found'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {activeTab === 'pending' ? 'No jobs pending approval right now.' : `There are no ${activeTab} jobs.`}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
            {displayedJobs.map((job, index) => (
              <JobCard key={job.id || `pending-${index}`} job={job} onApprove={handleApprove} onReject={handleReject} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
