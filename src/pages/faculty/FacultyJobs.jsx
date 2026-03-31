import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import FacultyLayout from '../../components/faculty/FacultyLayout';
import Dialog from '../../components/ui/Dialog';
import { useToast } from '../../components/ui/Toast';
import { createJob, subscribeToFacultyJobs, approveJob, deleteJob } from '../../services/facultyService';
import { subscribeToApprovedJobs } from '../../services/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPlus, FaBriefcase, FaSpinner, FaClock, FaCheckCircle,
  FaTimesCircle, FaBuilding, FaMapMarkerAlt, FaDollarSign, FaTrash
} from 'react-icons/fa';

const jobTypes = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Research'];

export default function FacultyJobs() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('my_postings'); // 'my_postings' or 'job_board'

  // Data state
  const [myJobs, setMyJobs] = useState([]);
  const [loadingMyJobs, setLoadingMyJobs] = useState(true);
  
  const [jobBoard, setJobBoard] = useState([]);
  const [loadingJobBoard, setLoadingJobBoard] = useState(true);

  // Form state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '', company: '', type: 'Internship',
    location: '', description: '', salary: '',
    experience: '', skills: '', requirements: ''
  });

  // Fetch My Postings
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsub = subscribeToFacultyJobs(currentUser.uid, (data) => {
      setMyJobs(data);
      setLoadingMyJobs(false);
    });
    return () => unsub();
  }, [currentUser]);

  // Fetch Job Board (Approved Jobs)
  useEffect(() => {
     const unsub = subscribeToApprovedJobs((data) => {
         setJobBoard(data);
         setLoadingJobBoard(false);
     });
     return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.company) {
      addToast('Title and company are required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await createJob({
        ...form,
        authorId: currentUser.uid,
        dept: 'Computer Science', // Assuming standard faculty dept
      });
      addToast('Job posted! Pending admin approval 📋', 'success');
      setDialogOpen(false);
      setForm({ title: '', company: '', type: 'Internship', location: '', description: '', salary: '', experience: '', skills: '', requirements: '' });
      setActiveTab('my_postings'); // Switch to my postings to see it
    } catch (err) {
      console.error(err);
      addToast('Failed to post job. Check Firestore rules.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job posting?")) return;
    try {
      await deleteJob(jobId);
      addToast('Job deleted successfully', 'info');
    } catch (err) {
      console.error(err);
      addToast('Failed to delete job', 'error');
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'pending_admin_approval':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <FaClock size={10} /> Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <FaCheckCircle size={10} /> Approved
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400">
            <FaTimesCircle size={10} /> {status}
          </span>
        );
    }
  };
  
  const displayJobs = activeTab === 'my_postings' ? myJobs : jobBoard;
  const isLoading = activeTab === 'my_postings' ? loadingMyJobs : loadingJobBoard;

  return (
    <FacultyLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Job / Internship Pipeline</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Post opportunities for students or explore approved listings.
          </p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#086490] hover:bg-[#065478] text-white font-semibold text-sm rounded-xl shadow-lg shadow-[#086490]/25 transition-all hover:-translate-y-0.5 shrink-0"
        >
          <FaPlus size={14} /> Post Opportunity
        </button>
      </div>

       {/* Tabs */}
       <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-6">
            <button
                onClick={() => setActiveTab('my_postings')}
                className={`pb-3 px-4 text-sm font-semibold transition-colors relative ${activeTab === 'my_postings' ? 'text-[#086490] dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
                My Postings
                {activeTab === 'my_postings' && <motion.div layoutId="facultyjobtab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#086490] dark:bg-blue-400" />}
            </button>
            <button
                onClick={() => setActiveTab('job_board')}
                className={`pb-3 px-4 text-sm font-semibold transition-colors relative ${activeTab === 'job_board' ? 'text-[#086490] dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
                Job Board (All Approved)
                {activeTab === 'job_board' && <motion.div layoutId="facultyjobtab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#086490] dark:bg-blue-400" />}
            </button>
        </div>


      {/* Info Banner for My Postings */}
      {activeTab === 'my_postings' && (
          <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <FaClock className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              <strong>Approval Workflow:</strong> All new jobs are saved as <code className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-xs font-mono">pending_admin_approval</code>. They remain hidden from students until an admin approves them.
            </p>
          </div>
      )}

      {/* Jobs Table */}
      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <FaSpinner className="animate-spin text-3xl text-[#086490]" />
        </div>
      ) : displayJobs.length === 0 ? (
        <div className="text-center p-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <FaBriefcase className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-1">
              {activeTab === 'my_postings' ? 'No Jobs Posted' : 'No Approved Jobs Found'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {activeTab === 'my_postings' ? 'Post an opportunity for your department\'s students.' : 'There are no active jobs on the platform right now.'}
          </p>
          {activeTab === 'my_postings' && (
              <button
                onClick={() => setDialogOpen(true)}
                className="px-5 py-2.5 bg-[#086490] text-white font-semibold text-sm rounded-xl hover:bg-[#065478] transition-colors"
              >
                Post First Job
              </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  {activeTab === 'my_postings' && (
                    <>
                        <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3.5 text-right text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                    </>
                  )}
                  {activeTab === 'job_board' && (
                      <th className="px-6 py-3.5 text-right text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Salary/Stipend</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {displayJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#086490]/10 flex items-center justify-center text-[#086490]">
                          <FaBriefcase size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{job.title}</p>
                          {job.location && (
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <FaMapMarkerAlt size={9} /> {job.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaBuilding size={12} className="text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{job.company}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        {job.type}
                      </span>
                    </td>
                    
                    {activeTab === 'my_postings' && (
                        <>
                            <td className="px-6 py-4">{statusBadge(job.status)}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <button
                                  onClick={() => handleDelete(job.id)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                  title="Delete Job"
                                >
                                  <FaTrash size={14} />
                                </button>
                              </div>
                            </td>
                        </>
                    )}

                    {activeTab === 'job_board' && (
                        <td className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {job.salary || 'Unspecified'}
                        </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Job Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Post Job / Internship" maxWidth="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Job Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Machine Learning Intern"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#086490] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Company *</label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => setForm(prev => ({ ...prev, company: e.target.value }))}
                placeholder="e.g., Google"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#086490]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#086490]"
              >
                {jobTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Remote / Bangalore"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#086490]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Salary / Stipend</label>
              <input
                type="text"
                value={form.salary}
                onChange={(e) => setForm(prev => ({ ...prev, salary: e.target.value }))}
                placeholder="e.g., ₹25,000/month"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#086490]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Required Experience</label>
              <input
                type="text"
                value={form.experience}
                onChange={(e) => setForm(prev => ({ ...prev, experience: e.target.value }))}
                placeholder="e.g., 2+ years"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#086490]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Key Skills</label>
              <input
                type="text"
                value={form.skills}
                onChange={(e) => setForm(prev => ({ ...prev, skills: e.target.value }))}
                placeholder="e.g., React, Python (Comma separated)"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#086490]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description & Role Overview</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Describe the role requirements..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#086490] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Additional Requirements</label>
            <textarea
              value={form.requirements}
              onChange={(e) => setForm(prev => ({ ...prev, requirements: e.target.value }))}
              rows={2}
              placeholder="Any specific degrees, certifications, or expectations..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#086490] resize-none"
            />
          </div>

          <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-lg p-3">
            <p className="text-xs text-amber-700 dark:text-amber-300">
              ⚠️ This job will be saved with status <strong>pending_admin_approval</strong> and hidden from students until an admin approves it.
            </p>
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
              {submitting ? <FaSpinner className="animate-spin" /> : <FaBriefcase size={14} />}
              {submitting ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </Dialog>
    </FacultyLayout>
  );
}
