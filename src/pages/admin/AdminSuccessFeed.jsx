import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import { addSuccessFeedItem, deleteSuccessFeedItem } from '../../services/adminService';
import { FaStar, FaPlus, FaTimes, FaTrash, FaTrophy, FaLink } from 'react-icons/fa';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.25 } },
};

export default function AdminSuccessFeed() {
  const [adminItems, setAdminItems] = useState([]);
  const [userItems, setUserItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', achievement: '', company: '', role: '', dept: '', imageUrl: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    // 1. Listen to admin curated feed
    const adminQ = query(collection(db, 'success_feed'), orderBy('createdAt', 'desc'));
    const unsubAdmin = onSnapshot(adminQ, (snap) => {
      const items = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          isUserStory: false,
          ...data,
          timestamp: data.createdAt ? data.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now',
          rawTime: data.createdAt?.toMillis?.() || 0
        };
      });
      setAdminItems(items);
    }, (err) => {
      console.warn("Admin fallback sorting", err);
      const fallbackQ = query(collection(db, 'success_feed'));
      onSnapshot(fallbackQ, (fSnap) => {
        const items = fSnap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            isUserStory: false,
            ...data,
            timestamp: data.createdAt ? data.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now',
            rawTime: data.createdAt?.toMillis?.() || 0
          };
        });
        setAdminItems(items);
      });
    });

    // 2. Listen to alumni posted success stories
    const userQ = query(collection(db, 'success_stories'), orderBy('timestamp', 'desc'));
    const unsubUser = onSnapshot(userQ, (snap) => {
      const items = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          isUserStory: true,
          name: data.authorName || 'Alumni',
          dept: data.authorRole || 'Alumni',
          achievement: data.content,
          company: data.tags && data.tags.length ? data.tags[0] : '',
          role: data.type || 'Achievement',
          timestamp: data.timestamp ? data.timestamp.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now',
          rawTime: data.timestamp?.toMillis?.() || 0
        };
      });
      setUserItems(items);
    }, (err) => {
      console.warn("User fallback sorting", err);
      const fallbackQ = query(collection(db, 'success_stories'));
      onSnapshot(fallbackQ, (fSnap) => {
        const items = fSnap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            isUserStory: true,
            name: data.authorName || 'Alumni',
            dept: data.authorRole || 'Alumni',
            achievement: data.content,
            company: data.tags && data.tags.length ? data.tags[0] : '',
            role: data.type || 'Achievement',
            timestamp: data.timestamp ? data.timestamp.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now',
            rawTime: data.timestamp?.toMillis?.() || 0
          };
        });
        setUserItems(items);
      });
    });

    return () => { unsubAdmin(); unsubUser(); };
  }, []);

  const items = [...adminItems, ...userItems].sort((a, b) => b.rawTime - a.rawTime);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.achievement.trim()) return;
    setSaving(true);
    try {
      await addSuccessFeedItem(form);
      setForm({ name: '', achievement: '', company: '', role: '', dept: '', imageUrl: '' });
      setShowForm(false);
      setToast('🌟 Success story added to the feed!');
      setTimeout(() => setToast(''), 3500);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleDelete = async (id, isUserStory) => {
    if (!window.confirm("Are you sure you want to delete this success story?")) return;
    try {
      if (isUserStory) {
        await deleteDoc(doc(db, 'success_stories', id));
      } else {
        await deleteSuccessFeedItem(id);
      }
      setToast('🗑️ Story deleted!');
      setTimeout(() => setToast(''), 3500);
    } catch (e) { console.error(e); }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Success Feed Manager</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Curate placement wins & alumni achievements</p>
          </div>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold shadow-lg">
            <FaPlus size={12} /> Add Story
          </motion.button>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="fixed top-6 right-6 z-[200] px-5 py-3 bg-amber-500 text-white rounded-2xl shadow-2xl font-semibold text-sm">
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-amber-200 dark:border-amber-700 shadow-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">✏️ New Success Story</h3>
                  <button onClick={() => setShowForm(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                    <FaTimes size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    ['name', 'Alumni Name *', 'e.g. Priya Shah'],
                    ['achievement', 'Achievement *', 'e.g. Placed at Google as SWE'],
                    ['company', 'Company', 'e.g. Google'],
                    ['role', 'Role/Position', 'e.g. Software Engineer'],
                    ['dept', 'Department', 'e.g. CS'],
                    ['imageUrl', 'Photo URL (optional)', 'https://...'],
                  ].map(([key, label, placeholder]) => (
                    <div key={key} className={key === 'achievement' ? 'sm:col-span-2' : ''}>
                      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">{label}</label>
                      <input type="text" placeholder={placeholder} value={form[key]}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400" />
                    </div>
                  ))}
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit} disabled={saving || !form.name.trim() || !form.achievement.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm disabled:opacity-60 shadow-lg">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FaStar size={13} />}
                  {saving ? 'Publishing...' : 'Publish to Success Feed'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feed Items */}
        {items.length === 0 ? (
          <div className="py-20 text-center">
            <FaTrophy className="text-yellow-300 dark:text-yellow-600 mx-auto mb-3" size={40} />
            <p className="text-gray-500 dark:text-gray-400">No success stories yet. Add your first one!</p>
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {items.map(item => (
                <motion.div key={item.id} variants={itemVariants} layout exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -3, boxShadow: '0 12px 30px rgba(245,158,11,0.15)' }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${item.isUserStory ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : 'bg-gradient-to-r from-amber-400 to-orange-400'}`} />
                  <button onClick={() => handleDelete(item.id, item.isUserStory)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400 hover:text-red-600 transition-colors">
                    <FaTrash size={11} />
                  </button>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 w-full">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-md shrink-0 ${item.isUserStory ? 'bg-gradient-to-br from-emerald-400 to-teal-500' : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}>
                        {item.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.dept || 'Alumni'}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed max-w-full break-words">{item.achievement}</p>
                  {(item.company || item.role) && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.company && item.company !== 'New' && <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs rounded-lg font-medium">{item.company}</span>}
                      {item.role && <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs rounded-lg font-medium">{item.role}</span>}
                      {item.isUserStory && <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-lg font-medium flex items-center gap-1"><FaStar size={8} /> User Posted</span>}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">{item.timestamp}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}
