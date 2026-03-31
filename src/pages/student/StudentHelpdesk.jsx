import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { useToast } from '../../components/ui/Toast';
import { subscribeToApprovedEvents } from '../../services/studentService';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { FaBug, FaCommentAlt, FaSpinner } from 'react-icons/fa';

export default function StudentHelpdesk() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('feedback'); // 'feedback' or 'bug'
  const [events, setEvents] = useState([]);
  
  // Feedback Form State
  const [feedback, setFeedback] = useState({ eventId: '', rating: '5', comment: '' });
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  // Bug Report Form State
  const [bug, setBug] = useState({ title: '', description: '', steps: '' });
  const [loadingBug, setLoadingBug] = useState(false);

  useEffect(() => {
    const unsub = subscribeToApprovedEvents(setEvents);
    return () => unsub();
  }, []);

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!feedback.eventId || !feedback.comment) {
      return addToast('Please fill all required fields.', 'error');
    }
    setLoadingFeedback(true);
    try {
      await addDoc(collection(db, 'feedbacks'), {
        ...feedback,
        studentId: currentUser.uid,
        createdAt: serverTimestamp(),
      });
      addToast('Feedback submitted successfully!', 'success');
      setFeedback({ eventId: '', rating: '5', comment: '' });
    } catch (err) {
      console.error(err);
      addToast('Failed to submit feedback.', 'error');
    } finally {
      setLoadingFeedback(false);
    }
  };

  const submitBugMap = async (e) => {
    e.preventDefault();
    if (!bug.title || !bug.description) {
      return addToast('Please fill title and description.', 'error');
    }
    setLoadingBug(true);
    try {
      await addDoc(collection(db, 'bug_reports'), {
        ...bug,
        reporterId: currentUser.uid,
        status: 'open',
        createdAt: serverTimestamp(),
      });
      addToast('Bug report submitted. Thank you!', 'success');
      setBug({ title: '', description: '', steps: '' });
    } catch (err) {
      console.error(err);
      addToast('Failed to submit bug report.', 'error');
    } finally {
      setLoadingBug(false);
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Helpdesk & Feedback</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Share your thoughts on recent events or report issues with the portal.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'feedback' 
                ? 'bg-[#086490] text-white shadow-lg shadow-[#086490]/20' 
                : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <FaCommentAlt /> Event Feedback
          </button>
          <button
            onClick={() => setActiveTab('bug')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'bug' 
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' 
                : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <FaBug /> Report a Bug
          </button>
        </div>

        {/* Feedback Form */}
        {activeTab === 'feedback' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Submit Event Feedback</h2>
            <form onSubmit={submitFeedback} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Select Event *</label>
                <select 
                  value={feedback.eventId}
                  onChange={e => setFeedback({...feedback, eventId: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#086490] outline-none"
                  required
                >
                  <option value="">-- Choose an Event --</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Rating (1-5)</label>
                <input 
                  type="number" min="1" max="5" 
                  value={feedback.rating}
                  onChange={e => setFeedback({...feedback, rating: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#086490] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Comments *</label>
                <textarea 
                  rows="4" 
                  value={feedback.comment}
                  onChange={e => setFeedback({...feedback, comment: e.target.value})}
                  placeholder="What did you like? What could be improved?"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#086490] outline-none resize-none"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loadingFeedback}
                className="w-full py-3 bg-[#086490] hover:bg-[#065478] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
              >
                {loadingFeedback ? <FaSpinner className="animate-spin" /> : 'Submit Feedback'}
              </button>
            </form>
          </div>
        )}

        {/* Bug Report Form */}
        {activeTab === 'bug' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-red-100 dark:border-red-900/30 shadow-sm animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <FaBug className="text-red-500" /> Report an Issue
            </h2>
            <form onSubmit={submitBugMap} className="space-y-6 relative z-10">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Issue Title *</label>
                <input 
                  type="text" 
                  value={bug.title}
                  onChange={e => setBug({...bug, title: e.target.value})}
                  placeholder="E.g. Cannot download QR code"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description *</label>
                <textarea 
                  rows="3" 
                  value={bug.description}
                  onChange={e => setBug({...bug, description: e.target.value})}
                  placeholder="Describe what happened..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Steps to Reproduce (Optional)</label>
                <textarea 
                  rows="2" 
                  value={bug.steps}
                  onChange={e => setBug({...bug, steps: e.target.value})}
                  placeholder="1. Go to... 2. Click..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={loadingBug}
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-lg shadow-red-500/20"
              >
                {loadingBug ? <FaSpinner className="animate-spin" /> : 'Submit Bug Report'}
              </button>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
