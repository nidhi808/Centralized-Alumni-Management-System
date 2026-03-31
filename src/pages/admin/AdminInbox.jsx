import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import { subscribeToAdminMessages, sendAdminReply } from '../../services/adminService';
import { FaInbox, FaReply, FaTimes, FaPaperPlane, FaUserCircle } from 'react-icons/fa';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// Mock messages for demo
const MOCK_MESSAGES = [
  { id: 'm1', senderName: 'Raj Patel', senderEmail: 'raj.patel@alumni.xie.edu', type: 'alumni_support', text: 'I need help updating my profile. The changes are not saving correctly.', createdAt: { toDate: () => new Date('2026-03-15T10:30:00') }, read: false },
  { id: 'm2', senderName: 'Dr. Suresh Kumar', senderEmail: 'suresh.k@faculty.xie.edu', type: 'faculty_support', text: 'My posted job is still pending. Can you please review it?', createdAt: { toDate: () => new Date('2026-03-14T16:00:00') }, read: false },
  { id: 'm3', senderName: 'Priya Shah', senderEmail: 'priya.shah@alumni.xie.edu', type: 'alumni_support', text: 'How do I post a success story on the platform?', createdAt: { toDate: () => new Date('2026-03-13T09:15:00') }, read: true },
];

function MessageCard({ msg, onReply }) {
  const isAlumni = msg.type === 'alumni_support';
  const date = msg.createdAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || 'N/A';

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -2 }}
      className={`bg-white dark:bg-gray-800 rounded-2xl p-5 border shadow-sm transition-all ${msg.read ? 'border-gray-100 dark:border-gray-700' : 'border-[#086490]/30 dark:border-blue-500/30'}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white font-bold shadow-md ${isAlumni ? 'bg-gradient-to-br from-[#086490] to-[#0ea5e9]' : 'bg-gradient-to-br from-purple-500 to-indigo-600'}`}>
          {(msg.senderName || msg.senderEmail || '?').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-gray-900 dark:text-white">{msg.senderName || 'Unknown'}</p>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isAlumni ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'}`}>
              {isAlumni ? 'Alumni' : 'Faculty'}
            </span>
            {!msg.read && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{msg.senderEmail} · {date}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">{msg.text}</p>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onReply(msg)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#086490]/10 text-[#086490] dark:text-blue-400 text-sm font-semibold hover:bg-[#086490]/20 transition-colors"
        >
          <FaReply size={12} /> Reply
        </motion.button>
      </div>
    </motion.div>
  );
}

function ReplyModal({ msg, onClose, onSent }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await sendAdminReply(msg.id, text, msg.senderId);
      onSent();
    } catch (e) {}
    setSending(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Reply to {msg.senderName}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <FaTimes size={14} className="text-gray-500" />
          </button>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 mb-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Original message:</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{msg.text}</p>
        </div>
        <textarea
          rows={4}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type your reply..."
          className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#086490]/30 resize-none"
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#086490] to-[#0ea5e9] text-white font-semibold text-sm disabled:opacity-60 shadow-lg transition-all"
        >
          {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FaPaperPlane size={13} />}
          {sending ? 'Sending...' : 'Send Reply'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default function AdminInbox() {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [replyTarget, setReplyTarget] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sentToast, setSentToast] = useState(false);

  useEffect(() => {
    const unsub = subscribeToAdminMessages((data) => {
      if (data.length > 0) setMessages(data);
    });
    return () => unsub();
  }, []);

  const filtered = messages.filter(m =>
    filter === 'all' ? true :
    filter === 'alumni' ? m.type === 'alumni_support' :
    m.type === 'faculty_support'
  );

  const unread = messages.filter(m => !m.read).length;

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Admin Inbox</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Support messages from Alumni & Faculty</p>
          </div>
          {unread > 0 && (
            <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700">
              <span className="text-sm font-bold text-red-600 dark:text-red-400">{unread} Unread</span>
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {[['all', 'All'], ['alumni', 'Alumni'], ['faculty', 'Faculty']].map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === key
                ? 'bg-[#086490] text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-[#086490]'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Messages */}
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <FaInbox className="text-gray-300 dark:text-gray-600 mx-auto mb-3" size={40} />
            <p className="text-gray-500 dark:text-gray-400">No messages in this category.</p>
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
            {filtered.map(msg => (
              <MessageCard key={msg.id} msg={msg} onReply={setReplyTarget} />
            ))}
          </motion.div>
        )}
      </div>

      {/* Reply Modal */}
      <AnimatePresence>
        {replyTarget && (
          <ReplyModal
            msg={replyTarget}
            onClose={() => setReplyTarget(null)}
            onSent={() => { setSentToast(true); setTimeout(() => setSentToast(false), 3000); }}
          />
        )}
      </AnimatePresence>

      {/* Sent toast */}
      <AnimatePresence>
        {sentToast && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 right-6 z-[200] px-5 py-3 bg-emerald-500 text-white rounded-2xl shadow-2xl font-semibold text-sm">
            ✅ Reply sent successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
