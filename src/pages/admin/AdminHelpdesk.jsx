import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import { subscribeToFeedbacks, subscribeToBugReports } from '../../services/adminService';
import { FaBug, FaCommentAlt, FaStar, FaCalendarAlt } from 'react-icons/fa';

export default function AdminHelpdesk() {
  const [activeTab, setActiveTab] = useState('feedback');
  const [feedbacks, setFeedbacks] = useState([]);
  const [bugs, setBugs] = useState([]);

  useEffect(() => {
    const unsubFeedbacks = subscribeToFeedbacks(setFeedbacks);
    const unsubBugs = subscribeToBugReports(setBugs);
    return () => {
      unsubFeedbacks();
      unsubBugs();
    };
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Student Helpdesk & Feedback</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review event ratings and portal bug reports submitted by students.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex items-center gap-2 px-6 py-3 font-bold transition-all relative ${
              activeTab === 'feedback' 
                ? 'text-[#086490] dark:text-blue-400' 
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg'
            }`}
          >
            <FaCommentAlt /> Event Feedbacks
            {activeTab === 'feedback' && (
              <motion.div layoutId="helpdesk-tab" className="absolute bottom-0 left-0 w-full h-1 bg-[#086490] rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('bug')}
            className={`flex items-center gap-2 px-6 py-3 font-bold transition-all relative ${
              activeTab === 'bug' 
                ? 'text-red-500' 
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg'
            }`}
          >
            <FaBug /> Bug Reports
            {activeTab === 'bug' && (
              <motion.div layoutId="helpdesk-tab" className="absolute bottom-0 left-0 w-full h-1 bg-red-500 rounded-t-full" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-4">
          {activeTab === 'feedback' && (
            feedbacks.length === 0 ? (
              <div className="py-20 text-center text-gray-400">No event feedbacks found.</div>
            ) : (
              feedbacks.map(f => (
                <div key={f.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FaCalendarAlt className="text-[#086490]" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Event ID: {f.eventId}</span>
                      </div>
                      <p className="text-xs text-gray-500">Student ID: {f.studentId} • {f.createdAt?.toDate?.()?.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 px-3 py-1 rounded-full font-bold">
                      <FaStar /> {f.rating}/5
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl text-sm text-gray-800 dark:text-gray-200">
                    "{f.comment}"
                  </div>
                </div>
              ))
            )
          )}

          {activeTab === 'bug' && (
            bugs.length === 0 ? (
              <div className="py-20 text-center text-gray-400">No bug reports found.</div>
            ) : (
              bugs.map(b => (
                <div key={b.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-l-4 border-l-red-500 border-y border-r border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{b.title}</h3>
                      <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 text-xs font-bold rounded-full uppercase">
                        {b.status || 'Open'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Reporter ID: {b.reporterId} • {b.createdAt?.toDate?.()?.toLocaleString()}</p>
                  </div>
                  <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    <p className="font-semibold mb-1">Description:</p>
                    <p className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">{b.description}</p>
                    {b.steps && (
                      <div className="mt-3">
                        <p className="font-semibold mb-1 text-xs uppercase text-gray-500">Steps to reproduce:</p>
                        <p className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl text-xs whitespace-pre-wrap">{b.steps}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
