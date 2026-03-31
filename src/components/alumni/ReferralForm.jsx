import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBriefcase, FaBuilding, FaMapMarkerAlt, FaLink, FaPaperPlane, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ReferralForm() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    description: '',
    applyLink: ''
  });
  
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    
    try {
      await addDoc(collection(db, 'jobs'), {
        ...formData,
        postedBy: currentUser.uid,
        postedByEmail: currentUser.email,
        status: 'pending_admin_approval',
        createdAt: serverTimestamp()
      });
      
      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
        setFormData({
          title: '',
          company: '',
          location: '',
          type: 'Full-time',
          description: '',
          applyLink: ''
        });
      }, 3000);
    } catch (error) {
      console.error("Error submitting referral:", error);
      setStatus('error');
      setErrorMessage(error.message || 'Failed to submit referral.');
    }
  };

  return (
    <div className="glow-card bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-xl relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-light/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      
      <div className="relative z-10 flex items-center justify-between mb-8 pb-6 border-b border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-text dark:text-white flex items-center gap-3">
            <span className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FaBriefcase />
            </span>
            Refer a Junior
          </h2>
          <p className="text-text-muted mt-2">
            Share job opportunities at your company to help fellow alumni and students.
          </p>
        </div>
      </div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6"
              >
                <FaCheckCircle className="text-emerald-500 text-4xl" />
              </motion.div>
              <h3 className="text-2xl font-bold text-text dark:text-white mb-2">Referral Submitted!</h3>
              <p className="text-text-muted max-w-sm">
                Thank you for giving back. Your referral is now pending admin approval before it appears on the live feed.
              </p>
            </motion.div>
          ) : (
            <motion.form 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit} 
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-text dark:text-gray-300 mb-2">Job Title</label>
                  <div className="relative">
                    <FaBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" name="title" required value={formData.title} onChange={handleChange}
                      placeholder="Software Engineer"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text dark:text-gray-300 mb-2">Company</label>
                  <div className="relative">
                    <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" name="company" required value={formData.company} onChange={handleChange}
                      placeholder="Google"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text dark:text-gray-300 mb-2">Location</label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" name="location" required value={formData.location} onChange={handleChange}
                      placeholder="Remote / Bangalore"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text dark:text-gray-300 mb-2">Job Type</label>
                  <select 
                    name="type" value={formData.type} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Internship</option>
                    <option>Contract</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-text dark:text-gray-300 mb-2">Application Link or Contact Email</label>
                <div className="relative">
                  <FaLink className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" name="applyLink" required value={formData.applyLink} onChange={handleChange}
                    placeholder="https://careers.google.com/..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text dark:text-gray-300 mb-2">Brief Description</label>
                <textarea 
                  name="description" required value={formData.description} onChange={handleChange}
                  placeholder="Mention any specific requirements or referral hints..."
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-gray-400 resize-none"
                />
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800">
                  <FaExclamationCircle />
                  <span className="text-sm font-medium">{errorMessage}</span>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={status === 'loading'}
                  className="glow-btn flex items-center gap-3 bg-gradient-to-r from-primary to-primary-light text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {status === 'loading' ? (
                    'Submitting...'
                  ) : (
                    <>
                      Submit Referral
                      <FaPaperPlane className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
