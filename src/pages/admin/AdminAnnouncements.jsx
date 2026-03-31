import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  createGlobalAnnouncement, subscribeToGlobalAnnouncements, deleteAnnouncement
} from '../../services/adminService';
import { FaBullhorn, FaPlus, FaTimes, FaTrash, FaEye, FaPaperPlane } from 'react-icons/fa';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const CATEGORIES = ['General', 'Placement', 'Event', 'Alumni', 'Academic', 'Policy'];

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'General', priority: 'normal' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const unsub = subscribeToGlobalAnnouncements(setAnnouncements);
    return () => unsub();
  }, []);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      await createGlobalAnnouncement({ ...form, authorRole: 'admin' });
      setForm({ title: '', content: '', category: 'General', priority: 'normal' });
      setShowForm(false);
      setPreviewMode(false);
      setToast('📢 Announcement broadcast to all users!');
      setTimeout(() => setToast(''), 3500);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try { await deleteAnnouncement(id); } catch (e) {}
  };

  const priorityColors = {
    high: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700',
    normal: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700',
    low: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-700/30 dark:text-gray-400 dark:border-gray-600',
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Global Announcements</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Broadcast news & updates to all platform users</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#086490] to-[#0ea5e9] text-white text-sm font-semibold shadow-lg"
          >
            <FaPlus size={12} /> New Announcement
          </motion.button>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }}
              className="fixed top-6 right-6 z-[200] px-5 py-3 bg-[#086490] text-white rounded-2xl shadow-2xl font-semibold text-sm">
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#086490]/20 shadow-lg p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {previewMode ? '👁 Preview' : '✏️ Compose Announcement'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPreviewMode(!previewMode)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${previewMode ? 'bg-[#086490] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                      <FaEye size={11} /> {previewMode ? 'Edit' : 'Preview'}
                    </button>
                    <button onClick={() => { setShowForm(false); setPreviewMode(false); }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
                      <FaTimes size={14} />
                    </button>
                  </div>
                </div>

                {previewMode ? (
                  <div className="bg-gradient-to-br from-[#042a4a] to-[#086490] rounded-xl p-5 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/20`}>{form.category}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${form.priority === 'high' ? 'bg-red-500' : 'bg-blue-400'}`}>{form.priority}</span>
                    </div>
                    <h2 className="text-lg font-bold">{form.title || 'Announcement Title'}</h2>
                    <p className="mt-2 text-blue-100 text-sm leading-relaxed">{form.content || 'Announcement content will appear here...'}</p>
                    <p className="mt-3 text-xs text-blue-200/50">Posted by Admin · {new Date().toLocaleDateString()}</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Category</label>
                        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#086490]/30">
                          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Priority</label>
                        <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#086490]/30">
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High Priority</option>
                        </select>
                      </div>
                    </div>
                    <input type="text" placeholder="Announcement title..."
                      value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#086490]/30" />
                    <textarea rows={4} placeholder="Write your announcement..."
                      value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#086490]/30 resize-none" />
                  </>
                )}

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit} disabled={saving || !form.title.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#086490] to-[#0ea5e9] text-white font-semibold text-sm disabled:opacity-60 shadow-lg">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FaPaperPlane size={13} />}
                  {saving ? 'Broadcasting...' : 'Broadcast to All Users'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Announcements List */}
        {announcements.length === 0 ? (
          <div className="py-20 text-center">
            <FaBullhorn className="text-gray-300 dark:text-gray-600 mx-auto mb-3" size={36} />
            <p className="text-gray-500 dark:text-gray-400">No announcements yet. Create your first broadcast!</p>
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
            {announcements.map(ann => (
              <motion.div key={ann.id} variants={itemVariants} whileHover={{ y: -1 }}
                className={`bg-white dark:bg-gray-800 rounded-2xl p-5 border shadow-sm ${priorityColors[ann.priority] || priorityColors['normal']}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {ann.category && <span className="px-2.5 py-1 bg-white/60 dark:bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider">{ann.category}</span>}
                      {ann.priority === 'high' && <span className="px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-[10px] font-bold uppercase">🔴 High</span>}
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{ann.title}</h3>
                    <p className="text-sm mt-1 text-gray-600 dark:text-gray-400 line-clamp-2">{ann.content}</p>
                    <p className="text-xs mt-2 opacity-60">
                      {ann.createdAt?.toDate?.().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || 'Just now'}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(ann.id)}
                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400 hover:text-red-600 transition-colors shrink-0">
                    <FaTrash size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}
