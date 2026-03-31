import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHandsHelping, FaCheckCircle, FaSpinner, FaExchangeAlt, FaUserGraduate, FaLightbulb, FaSearch } from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore';

const MOCK_MENTORS = [
  { id: '1', name: 'Dr. Anita Desai', role: 'Chief Data Scientist', company: 'Google', expertise: ['AI/ML', 'Career Transitions', 'System Design'], available: true, image: 'https://i.pravatar.cc/150?u=11' },
  { id: '2', name: 'Rahul Sharma', role: 'VP of Engineering', company: 'Stripe', expertise: ['Fintech', 'Leadership', 'Startups'], available: true, image: 'https://i.pravatar.cc/150?u=12' },
  { id: '3', name: 'Kabir Singh', role: 'Senior Product Manager', company: 'Atlassian', expertise: ['Product Strategy', 'Agile', 'UX Research'], available: false, image: 'https://i.pravatar.cc/150?u=13' },
];

export default function AlumniMentorship() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [isMentor, setIsMentor] = useState(false);
  const [activeTab, setActiveTab] = useState('find'); // find, requests, my-mentees
  const [requestingId, setRequestingId] = useState(null);
  const [incomingRequests, setIncomingRequests] = useState([]);

  useEffect(() => {
    if (!currentUser?.uid) return;

    // Fetch initial mentor status
    getDoc(doc(db, 'users', currentUser.uid)).then(snap => {
      if (snap.exists() && snap.data().allowStudentChat) {
        setIsMentor(true);
      }
    });

    const q = query(
      collection(db, 'connections'),
      where('toId', '==', currentUser.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      setIncomingRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [currentUser]);

  const toggleMentorship = async () => {
    const newVal = !isMentor;
    setIsMentor(newVal); // Optimistic update
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        allowStudentChat: newVal
      });
      addToast(
        newVal 
          ? "Awesome! You are now listed as a mentor. Thank you for giving back." 
          : "You are no longer listed as an available mentor.", 
        "success"
      );
    } catch (err) {
      console.error(err);
      setIsMentor(!newVal); // Revert
      addToast("Failed to update status", "error");
    }
  };

  const handleRequestMentorship = (id) => {
    setRequestingId(id);
    setTimeout(() => {
      setRequestingId(null);
      addToast("Mentorship request sent successfully!", "success");
    }, 1500);
  };

  const handleAcceptRequest = async (connectionId) => {
    try {
      await updateDoc(doc(db, 'connections', connectionId), { status: 'accepted' });
      addToast("Mentorship request accepted!", "success");
    } catch (error) {
      console.error(error);
      addToast("Failed to accept request", "error");
    }
  };

  const handleDeclineRequest = async (connectionId) => {
    try {
      await updateDoc(doc(db, 'connections', connectionId), { status: 'declined' });
      addToast("Mentorship request declined", "info");
    } catch (error) {
      console.error(error);
      addToast("Failed to decline request", "error");
    }
  };

  const pendingRequests = incomingRequests.filter(r => r.status === 'pending');
  const activeMentees = incomingRequests.filter(r => r.status === 'accepted');

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <DashboardLayout role="alumni">
      <div className="max-w-7xl mx-auto py-8 space-y-8">

        {/* Header & Opt-in Toggle */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 glow-card bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-text dark:text-white flex items-center gap-3">
              <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white shadow-md">
                <FaHandsHelping />
              </span>
              Mentorship Hub
            </h1>
            <p className="text-text-muted mt-3 max-w-2xl leading-relaxed">
              Guide the next generation or seek advice from industry veterans. Our community thrives on shared knowledge and mutual growth.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 bg-white/80 dark:bg-gray-900/80 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div>
              <p className="text-sm font-bold text-text dark:text-white">Available to Mentor?</p>
              <p className="text-xs text-text-muted">Let students know you're open.</p>
            </div>
            <button 
              onClick={toggleMentorship}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isMentor ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <span className="sr-only">Toggle mentorship availability</span>
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isMentor ? 'translate-x-7' : 'translate-x-1'} shadow-sm`} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'find', label: 'Find a Mentor', icon: FaSearch },
            { id: 'requests', label: 'Incoming Requests', icon: FaExchangeAlt, badge: pendingRequests.length > 0 ? pendingRequests.length : null },
            { id: 'my-mentees', label: 'My Mentees', icon: FaUserGraduate, badge: activeMentees.length > 0 ? activeMentees.length : null },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-all relative ${
                activeTab === tab.id 
                  ? 'text-primary dark:text-primary-light' 
                  : 'text-text-muted hover:text-text dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className={activeTab === tab.id ? 'animate-bounce-slow text-lg' : ''} />
              {tab.label}
              {tab.badge && (
                <span className="ml-2 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {tab.badge}
                </span>
              )}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeMentorshipTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'find' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-text dark:text-white flex items-center gap-2">
                    <FaLightbulb className="text-accent" /> Recommended Mentors
                  </h3>
                  <div className="relative w-64">
                     <input 
                       type="text" 
                       placeholder="Filter by expertise..."
                       className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                     />
                  </div>
                </div>
                
                <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {MOCK_MENTORS.map(mentor => (
                    <motion.div 
                      key={mentor.id} 
                      variants={item}
                      whileHover={{ y: -4 }}
                      className="glow-card bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-lg flex flex-col h-full group transition-all"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative">
                          <img src={mentor.image} alt={mentor.name} className="w-16 h-16 rounded-full object-cover shadow-sm border-2 border-white dark:border-gray-700" />
                          <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${mentor.available ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-text dark:text-white group-hover:text-primary transition-colors leading-tight">{mentor.name}</h4>
                          <p className="text-sm font-semibold text-text-muted mt-1">{mentor.role}</p>
                          <p className="text-xs text-text-muted">{mentor.company}</p>
                        </div>
                      </div>

                      <div className="mt-2 mb-6 flex-1">
                        <p className="text-xs font-bold text-text dark:text-white mb-2 uppercase tracking-wider">Expertise</p>
                        <div className="flex flex-wrap gap-2">
                          {mentor.expertise.map(skill => (
                             <span key={skill} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700/50 text-text-muted dark:text-gray-300 rounded-lg text-xs font-semibold">
                               {skill}
                             </span>
                          ))}
                        </div>
                      </div>

                      <button 
                        onClick={() => handleRequestMentorship(mentor.id)}
                        disabled={!mentor.available || requestingId === mentor.id}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                          mentor.available 
                            ? 'bg-gradient-to-r from-primary to-primary-light text-white hover:shadow-md' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {requestingId === mentor.id ? (
                          <><FaSpinner className="animate-spin" /> Requesting...</>
                        ) : mentor.available ? (
                          <><FaHandsHelping /> Request Mentorship</>
                        ) : (
                          'Currently Unavailable'
                        )}
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}

            {activeTab === 'requests' && (
               <div className="space-y-6">
                 <h3 className="text-xl font-bold text-text dark:text-white flex items-center gap-2 mb-6">
                    <FaExchangeAlt className="text-primary" /> Pending Requests
                 </h3>
                 
                 {pendingRequests.length === 0 ? (
                   <div className="text-center py-20 bg-white/40 dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-700">
                      <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                        <FaExchangeAlt size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-text dark:text-white mb-2">No incoming requests</h3>
                      <p className="text-text-muted max-w-md mx-auto">
                        When a student requests your mentorship, it will appear right here.
                      </p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {pendingRequests.map(req => (
                        <motion.div 
                          key={req.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between"
                        >
                          <div className="flex items-start gap-4 mb-6">
                             <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white font-bold shadow-md shrink-0">
                               {req.fromId?.charAt(0).toUpperCase() || 'S'}
                             </div>
                             <div>
                               <h4 className="font-bold text-lg text-text dark:text-white">Student {req.fromId?.slice(0, 6)}</h4>
                               <p className="text-sm text-text-muted mt-1">Requested your mentorship</p>
                               <span className="text-xs font-semibold px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full inline-block mt-3">Pending</span>
                             </div>
                          </div>
                          
                          <div className="flex gap-3">
                             <button 
                               onClick={() => handleAcceptRequest(req.id)}
                               className="flex-1 py-2.5 rounded-xl font-bold bg-primary text-white hover:bg-primary-dark transition-colors shadow-sm"
                             >
                               Accept
                             </button>
                             <button 
                               onClick={() => handleDeclineRequest(req.id)}
                               className="flex-1 py-2.5 rounded-xl font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                             >
                               Decline
                             </button>
                          </div>
                        </motion.div>
                     ))}
                   </div>
                 )}
               </div>
            )}

            {activeTab === 'my-mentees' && (
               <div className="space-y-6">
                 <h3 className="text-xl font-bold text-text dark:text-white flex items-center gap-2 mb-6">
                    <FaUserGraduate className="text-emerald-500" /> Active Mentees
                 </h3>
                 
                 {activeMentees.length === 0 ? (
                   <div className="text-center py-20 bg-white/40 dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-700">
                      <div className="w-20 h-20 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 text-emerald-500">
                        <FaUserGraduate size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-text dark:text-white mb-2">No active mentees</h3>
                      <p className="text-text-muted max-w-md mx-auto">
                        Accept pending requests to start mentoring students.
                      </p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {activeMentees.map(req => (
                        <motion.div 
                          key={req.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-900/30 shadow-sm flex items-center gap-4 border-l-4 border-l-emerald-500"
                        >
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold shadow-md shrink-0">
                             {req.fromId?.charAt(0).toUpperCase() || 'S'}
                          </div>
                          <div>
                             <h4 className="font-bold text-lg text-text dark:text-white">Student {req.fromId?.slice(0, 6)}</h4>
                             <p className="text-sm text-text-muted mt-1">Active Mentoring Connection</p>
                          </div>
                        </motion.div>
                     ))}
                   </div>
                 )}
               </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}
