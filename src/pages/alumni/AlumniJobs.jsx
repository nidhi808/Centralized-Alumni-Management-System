import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    FaBriefcase, FaBuilding, FaMapMarkerAlt, FaStar,
    FaSearch, FaCheckCircle, FaLightbulb, FaSpinner,
    FaPlus, FaClock, FaTimesCircle, FaTrash
} from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { subscribeToApprovedJobs } from '../../services/firestore';
import { createJob, subscribeToFacultyJobs, deleteJob } from '../../services/facultyService';
import Dialog from '../../components/ui/Dialog';
import { useToast } from '../../components/ui/Toast';

export default function AlumniJobs() {
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState('explore'); // 'explore' or 'applications'

    // Core state
    const [jobs, setJobs] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // My Postings state
    const [myPostings, setMyPostings] = useState([]);
    const [loadingPostings, setLoadingPostings] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({
        title: '', company: '', type: 'Internship',
        location: '', description: '', salary: '',
        experience: '', skills: '', requirements: ''
    });
    const jobTypes = ['Full-time', 'Part-time', 'Internship', 'Contract'];

    // Application state
    const [applyModalOpen, setApplyModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [appForm, setAppForm] = useState({ phone: '', resume: '', message: '' });

    // My Applications data
    const [myApplications, setMyApplications] = useState([]);
    const [loadingApps, setLoadingApps] = useState(true);

    // Fetch user profile for recommendation engine
    useEffect(() => {
        if (!currentUser?.uid) return;
        getDoc(doc(db, 'users', currentUser.uid)).then(snap => {
            if (snap.exists()) {
                setUserProfile(snap.data());
            }
        }).catch(err => console.error("Error fetching alumni profile:", err));
    }, [currentUser]);

    // Fetch My Applications
    useEffect(() => {
        if (!currentUser?.uid) return;
        const q = query(
            collection(db, 'job_applications'),
            where('applicantId', '==', currentUser.uid)
        );
        const unsub = onSnapshot(q, (snap) => {
            const apps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            apps.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
            setMyApplications(apps);
            setLoadingApps(false);
        });
        return () => unsub();
    }, [currentUser]);

    // Fetch My Postings
    useEffect(() => {
        if (!currentUser?.uid) return;
        const unsub = subscribeToFacultyJobs(currentUser.uid, (data) => {
            setMyPostings(data);
            setLoadingPostings(false);
        });
        return () => unsub();
    }, [currentUser]);

    // Fetch approved jobs
    useEffect(() => {
        const unsubscribe = subscribeToApprovedJobs((data) => {
            setJobs(data);
            setLoadingJobs(false);
        });
        return () => unsubscribe();
    }, []);

    // Recommendation Engine & Filtering
    const processedJobs = useMemo(() => {
        if (!jobs.length) return { recommended: [], others: [] };

        let filteredJobs = jobs;
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filteredJobs = jobs.filter(job =>
                job.title?.toLowerCase().includes(query) ||
                job.company?.toLowerCase().includes(query) ||
                job.description?.toLowerCase().includes(query)
            );
        }

        // Calculate relevance scores
        const scoredJobs = filteredJobs.map(job => {
            let score = 0;
            const jobText = `${job.title || ''} ${job.description || ''} ${job.company || ''} ${job.type || ''}`.toLowerCase();

            // Score based on skills match
            if (Array.isArray(userProfile?.skills) && userProfile.skills.length > 0) {
                userProfile.skills.forEach(skill => {
                    if (skill && typeof skill === 'string' && jobText.includes(skill.toLowerCase())) {
                        score += 3; // High weight for exact skill overlap
                    }
                });
            }

            // Score based on role/department match
            if (typeof userProfile?.role === 'string' && jobText.includes(userProfile.role.toLowerCase())) score += 2;
            if (typeof userProfile?.dept === 'string' && jobText.includes(userProfile.dept.toLowerCase())) score += 1;

            // Score based on experience match
            if (typeof userProfile?.experience === 'string' && jobText.includes(userProfile.experience.toLowerCase())) score += 2;

            return { ...job, matchScore: score };
        });

        // Sort by score
        scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

        // Split recommended (score > 0) and others
        // If user profile is empty or lacks skills, all fallback to 'others' automatically
        const recommended = scoredJobs.filter(job => job.matchScore > 0);
        const others = scoredJobs.filter(job => job.matchScore === 0);

        return { recommended, others };
    }, [jobs, userProfile, searchQuery]);

    const handleApplyClick = (job) => {
        setSelectedJob(job);
        setAppForm({ phone: userProfile?.phone || '', resume: '', message: '' });
        setApplyModalOpen(true);
    };

    const submitApplication = async (e) => {
        e.preventDefault();
        if (!appForm.resume) {
            addToast("Resume link is required", "error");
            return;
        }
        setSubmitting(true);
        try {
            await addDoc(collection(db, 'job_applications'), {
                jobId: selectedJob.id,
                jobTitle: selectedJob.title,
                jobCompany: selectedJob.company,
                applicantId: currentUser.uid,
                applicantName: userProfile?.name || currentUser.displayName || 'Applicant',
                applicantEmail: currentUser.email,
                phone: appForm.phone,
                resume: appForm.resume,
                message: appForm.message,
                status: 'submitted',
                createdAt: serverTimestamp()
            });
            addToast("Application submitted successfully!", "success");
            setApplyModalOpen(false);
            setActiveTab('applications');
        } catch (error) {
            console.error(error);
            addToast("Failed to submit application", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handlePostJob = async (e) => {
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
                dept: userProfile?.dept || 'General',
                authorRole: 'alumni'
            });
            addToast('Job posted! Pending admin approval 📋', 'success');
            setDialogOpen(false);
            setForm({ title: '', company: '', type: 'Internship', location: '', description: '', salary: '', experience: '', skills: '', requirements: '' });
            setActiveTab('my_postings');
        } catch (err) {
            console.error(err);
            addToast('Failed to post job. Check Firestore rules.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePosting = async (jobId) => {
        if (!window.confirm("Are you sure you want to delete this job posting?")) return;
        try {
            await deleteJob(jobId);
            addToast('Job deleted successfully', 'info');
        } catch (err) {
            console.error(err);
            addToast('Failed to delete job', 'error');
        }
    };

    const hasApplied = (jobId) => myApplications.some(app => app.jobId === jobId);

    const JobCard = ({ job, isRecommended }) => {
        const applied = hasApplied(job.id);
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                className={`glow-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border ${isRecommended ? 'border-primary dark:border-blue-900/50 relative overflow-hidden' : 'border-gray-100 dark:border-gray-700'}`}
            >
                {isRecommended && (
                    <div className="absolute top-0 right-0 py-1.5 px-4 bg-gradient-to-r from-primary to-primary-light text-white text-xs font-bold rounded-bl-xl shadow-sm flex items-center gap-1.5">
                        <FaStar /> High Match
                    </div>
                )}

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 shrink-0 ${isRecommended ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                    <FaBriefcase size={20} />
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{job.title}</h3>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span className="flex items-center gap-1.5"><FaBuilding size={14} /> {job.company}</span>
                    {job.location && (
                        <span className="flex items-center gap-1.5"><FaMapMarkerAlt size={14} /> {job.location}</span>
                    )}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                    {job.description || "No description provided."}
                </p>

                {(job.experience || job.skills || job.requirements) && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 mb-6 space-y-2 border border-gray-100 dark:border-gray-700/50">
                        {job.experience && (
                            <div className="text-xs flex items-start gap-2">
                                <span className="font-bold text-gray-700 dark:text-gray-300 min-w-[80px]">Experience:</span>
                                <span className="text-gray-600 dark:text-gray-400">{job.experience}</span>
                            </div>
                        )}
                        {job.skills && (
                            <div className="text-xs flex items-start gap-2">
                                <span className="font-bold text-gray-700 dark:text-gray-300 min-w-[80px]">Key Skills:</span>
                                <div className="flex flex-wrap gap-1">
                                    {job.skills.split(',').map((skill, index) => (
                                        <span key={index} className="px-2 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-600 dark:text-gray-400">
                                            {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {job.requirements && (
                            <div className="text-xs flex items-start gap-2">
                                <span className="font-bold text-gray-700 dark:text-gray-300 min-w-[80px]">Requires:</span>
                                <span className="text-gray-600 dark:text-gray-400 line-clamp-2">{job.requirements}</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4 mt-auto">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 uppercase tracking-widest border border-gray-100 dark:border-gray-800">
                        {job.type || 'Full-time'}
                    </span>

                    {job.salary && (
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {job.salary}
                        </span>
                    )}
                </div>

                {/* Apply button */}
                <button
                    disabled={applied}
                    onClick={() => handleApplyClick(job)}
                    className={`w-full mt-5 py-2.5 rounded-xl font-bold transition-all ${applied
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 cursor-not-allowed border border-emerald-200 dark:border-emerald-800'
                            : isRecommended
                                ? 'bg-[#086490] hover:bg-[#065478] text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                >
                    {applied ? (
                        <span className="flex items-center justify-center gap-2"><FaCheckCircle /> Applied</span>
                    ) : 'Apply Now'}
                </button>
            </motion.div>
        )
    };

    return (
        <DashboardLayout role="alumni">
            <div className="max-w-7xl mx-auto py-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                            <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                <FaLightbulb />
                            </span>
                            Career Opportunities
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">
                            Explore active job listings. Jobs labeled with <FaStar className="inline text-amber-400 mb-0.5 mx-0.5" /> are recommended specifically based on the skills and experience on your alumni profile.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search roles, companies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
                            />
                        </div>
                        <button
                            onClick={() => setDialogOpen(true)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold text-sm rounded-xl shadow-lg transition-all hover:-translate-y-0.5 shrink-0"
                        >
                            <FaPlus size={14} /> Post Job
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-8 overflow-x-auto pb-px">
                    <button
                        onClick={() => setActiveTab('explore')}
                        className={`pb-3 px-4 text-sm font-semibold transition-colors relative whitespace-nowrap ${activeTab === 'explore' ? 'text-primary dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    >
                        Explore Jobs
                        {activeTab === 'explore' && <motion.div layoutId="alumnijobtab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary dark:bg-blue-400" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`pb-3 px-4 text-sm font-semibold transition-colors relative flex items-center gap-2 whitespace-nowrap ${activeTab === 'applications' ? 'text-primary dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    >
                        My Applications
                        {myApplications.length > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                                {myApplications.length}
                            </span>
                        )}
                        {activeTab === 'applications' && <motion.div layoutId="alumnijobtab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary dark:bg-blue-400" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('my_postings')}
                        className={`pb-3 px-4 text-sm font-semibold transition-colors relative whitespace-nowrap ${activeTab === 'my_postings' ? 'text-primary dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    >
                        My Postings
                        {myPostings.length > 0 && (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                                {myPostings.length}
                            </span>
                        )}
                        {activeTab === 'my_postings' && <motion.div layoutId="alumnijobtab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary dark:bg-blue-400" />}
                    </button>
                </div>

                {activeTab === 'my_postings' && (
                    <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
                        <FaClock className="text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                            <strong>Approval Workflow:</strong> All new jobs you post are saved as <code className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-xs font-mono">pending_admin_approval</code>. They will be visible to everyone once an admin approves them.
                        </p>
                    </div>
                )}

                {activeTab === 'explore' ? (
                    loadingJobs ? (
                        <div className="flex flex-col items-center justify-center p-20 gap-4">
                            <FaSpinner className="animate-spin text-4xl text-primary" />
                            <p className="text-gray-500 font-medium">Analyzing opportunities...</p>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="text-center p-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaBriefcase className="text-4xl text-gray-300 dark:text-gray-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No active jobs found</h2>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                Check back later! Faculty members and administrators regularly post new opportunities for alumni.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {/* Recommended Section */}
                            {processedJobs.recommended.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-3 mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recommended for You</h2>
                                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
                                            {processedJobs.recommended.length} Matches
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {processedJobs.recommended.map(job => (
                                            <JobCard key={job.id} job={job} isRecommended={true} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* No Matching Search Results State */}
                            {processedJobs.recommended.length === 0 && processedJobs.others.length === 0 && (
                                <div className="text-center p-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
                                    <FaSearch className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No results found</h2>
                                    <p className="text-gray-500">We couldn't find any job postings matching "{searchQuery}". Try different keywords.</p>
                                </div>
                            )}

                            {/* Divider if both sections exist */}
                            {processedJobs.recommended.length > 0 && processedJobs.others.length > 0 && (
                                <div className="border-t border-gray-200 dark:border-gray-800" />
                            )}

                            {/* Other Opportunities Section */}
                            {processedJobs.others.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                        {processedJobs.recommended.length > 0 ? 'Other Opportunities' : 'All Opportunities'}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {processedJobs.others.map(job => (
                                            <JobCard key={job.id} job={job} isRecommended={false} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Empty search results check */}
                            {processedJobs.recommended.length === 0 && processedJobs.others.length === 0 && searchQuery !== '' && (
                                <div className="text-center p-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No matches for "{searchQuery}"</h3>
                                    <p className="text-gray-500">Try adjusting your search terms.</p>
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="mt-4 text-primary font-semibold hover:underline"
                                    >
                                        Clear Search
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                ) : activeTab === 'applications' ? (
                    /* My Applications Tab */
                    loadingApps ? (
                        <div className="flex justify-center p-20"><FaSpinner className="animate-spin text-3xl text-primary" /></div>
                    ) : myApplications.length === 0 ? (
                        <div className="text-center p-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No applications yet</h2>
                            <p className="text-gray-500 mb-6">You haven't applied to any jobs on the platform.</p>
                            <button onClick={() => setActiveTab('explore')} className="px-6 py-2 bg-[#086490] text-white rounded-xl font-semibold hover:bg-[#065478]">
                                Explore Opportunities
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-left text-xs uppercase tracking-wider text-gray-500 font-bold">
                                        <th className="px-6 py-4">Position</th>
                                        <th className="px-6 py-4">Company</th>
                                        <th className="px-6 py-4">Applied On</th>
                                        <th className="px-6 py-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {myApplications.map(app => (
                                        <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{app.jobTitle}</td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300 flex items-center gap-2"><FaBuilding className="text-gray-400" /> {app.jobCompany}</td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">{app.createdAt ? app.createdAt.toDate().toLocaleDateString() : 'Just now'}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200">
                                                    {app.status || 'Submitted'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    /* My Postings Tab */
                    loadingPostings ? (
                        <div className="flex justify-center p-20"><FaSpinner className="animate-spin text-3xl text-primary" /></div>
                    ) : myPostings.length === 0 ? (
                        <div className="text-center p-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No jobs posted</h2>
                            <p className="text-gray-500 mb-6">You haven't posted any job opportunities yet.</p>
                            <button onClick={() => setDialogOpen(true)} className="px-6 py-2 bg-[#086490] text-white rounded-xl font-semibold hover:bg-[#065478]">
                                Post an Opportunity
                            </button>
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
                                            <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3.5 text-right text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                        {myPostings.map((job) => (
                                            <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
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
                                                <td className="px-6 py-4">
                                                    {job.status === 'pending_admin_approval' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                            <FaClock size={10} /> Pending
                                                        </span>
                                                    ) : job.status === 'approved' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                            <FaCheckCircle size={10} /> Approved
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400">
                                                            <FaTimesCircle size={10} /> {job.status}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button
                                                            onClick={() => handleDeletePosting(job.id)}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                            title="Delete Job"
                                                        >
                                                            <FaTrash size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                )}
            </div>

            {/* Application Modal */}
            <Dialog open={applyModalOpen} onClose={() => setApplyModalOpen(false)} title={`Apply: ${selectedJob?.title}`} maxWidth="max-w-lg">
                <form onSubmit={submitApplication} className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-xl text-sm font-medium flex gap-2">
                        <FaBuilding className="mt-0.5 shrink-0" /> Applying to {selectedJob?.company}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                            <input type="text" disabled value={userProfile?.name || currentUser.displayName || ''} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl cursor-not-allowed text-gray-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                            <input type="text" disabled value={currentUser.email || ''} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl cursor-not-allowed text-gray-500" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Phone Number</label>
                        <input type="text" value={appForm.phone} onChange={e => setAppForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 9876543210" className="w-full px-4 py-2 focus:ring-2 focus:ring-[#086490] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Resume / Portfolio Link *</label>
                        <input type="url" required value={appForm.resume} onChange={e => setAppForm(p => ({ ...p, resume: e.target.value }))} placeholder="https://drive.google.com/... or portfolio URL" className="w-full px-4 py-2 focus:ring-2 focus:ring-[#086490] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Cover Letter / Note</label>
                        <textarea rows={3} value={appForm.message} onChange={e => setAppForm(p => ({ ...p, message: e.target.value }))} placeholder="Why are you a great fit?" className="w-full px-4 py-2 focus:ring-2 focus:ring-[#086490] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 resize-none" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button type="button" onClick={() => setApplyModalOpen(false)} className="px-5 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold">Cancel</button>
                        <button type="submit" disabled={submitting} className="px-6 py-2 flex items-center gap-2 rounded-xl bg-[#086490] text-white hover:bg-[#065478] font-bold shadow-md disabled:opacity-50">
                            {submitting ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />} Submit
                        </button>
                    </div>
                </form>
            </Dialog>
        </DashboardLayout>
    );
}
