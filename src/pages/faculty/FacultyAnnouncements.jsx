import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import FacultyLayout from '../../components/faculty/FacultyLayout';
import Dialog from '../../components/ui/Dialog';
import { useToast } from '../../components/ui/Toast';
import { subscribeToAnnouncements, createAnnouncement, deleteAnnouncement } from '../../services/facultyService';
import {
  FaBullhorn, FaPlus, FaSpinner, FaCalendarAlt,
  FaUsers, FaInfoCircle, FaTrash
} from 'react-icons/fa';

export default function FacultyAnnouncements() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const dept = 'All';

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    content: '',
    targetAudience: 'department_alumni',
    type: 'general',
  });

  useEffect(() => {
    const unsub = subscribeToAnnouncements(dept, (data) => {
      setAnnouncements(data);
      setLoading(false);
    });
    return () => unsub();
  }, [dept]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      addToast('Title and content are required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await createAnnouncement({
        ...form,
        dept,
        authorId: currentUser.uid,
      });
      addToast('Announcement published! 📢', 'success');
      setDialogOpen(false);
      setForm({ title: '', content: '', targetAudience: 'department_alumni', type: 'general' });
    } catch (err) {
      console.error(err);
      addToast('Failed to publish announcement', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await deleteAnnouncement(id);
      addToast('Announcement deleted safely', 'info');
    } catch (err) {
      console.error(err);
      addToast('Failed to delete announcement', 'error');
    }
  };

  const typeColors = {
    event: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
    general: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    urgent: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
  };

  return (
    <FacultyLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Announcements</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Publish departmental news and updates for alumni.
          </p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#086490] hover:bg-[#065478] text-white font-semibold text-sm rounded-xl shadow-lg shadow-[#086490]/25 transition-all hover:-translate-y-0.5"
        >
          <FaPlus size={14} /> New Announcement
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <FaSpinner className="animate-spin text-3xl text-[#086490]" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center p-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <FaBullhorn className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-1">No Announcements</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Create your first announcement for department alumni.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#086490]/10 flex items-center justify-center text-[#086490]">
                    <FaBullhorn size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{item.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                      <FaCalendarAlt size={10} />
                      {item.createdAt?.toDate
                        ? item.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Just now'}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${typeColors[item.type] || typeColors.general}`}>
                  {item.type || 'General'}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed ml-[52px]">
                {item.content}
              </p>
              <div className="mt-3 ml-[52px] flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <FaUsers size={10} />
                  <span>Target: {item.targetAudience?.replace(/_/g, ' ') || 'All'}</span>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  title="Delete Announcement"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Announcement Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="New Announcement">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Department Seminar Series Kickoff"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#086490]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#086490]"
              >
                <option value="general">General</option>
                <option value="event">Event</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Audience</label>
              <select
                value={form.targetAudience}
                onChange={(e) => setForm(prev => ({ ...prev, targetAudience: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#086490]"
              >
                <option value="department_alumni">Department Alumni</option>
                <option value="all_alumni">All Alumni</option>
                <option value="students">Students</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Content *</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
              placeholder="Write your announcement..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#086490] resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDialogOpen(false)}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#086490] hover:bg-[#065478] text-white font-semibold text-sm rounded-xl shadow-lg shadow-[#086490]/25 transition-all disabled:opacity-50"
            >
              {submitting ? <FaSpinner className="animate-spin" /> : <FaBullhorn size={14} />}
              {submitting ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </form>
      </Dialog>
    </FacultyLayout>
  );
}
