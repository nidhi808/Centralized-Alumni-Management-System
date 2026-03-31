import { FaCheckCircle, FaBriefcase, FaGraduationCap } from 'react-icons/fa';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useToast } from './ui/Toast';

export function ProfileProgress({ percent = 65 }) {
    return (
        <div className="bg-gradient-to-br from-primary to-primary-light rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl pointer-events-none"></div>

            <h3 className="text-xl font-bold mb-2">Complete your profile</h3>
            <p className="text-white/80 text-sm mb-6 max-w-sm">
                Alumni with complete profiles are 4x more likely to find mentorship opportunities and reconnect.
            </p>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{percent}% Complete</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/20">Intermediate</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-accent h-2 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
            </div>
            <div className="mt-6 flex justify-end">
                <button className="text-sm font-semibold bg-white text-primary px-5 py-2 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                    Update Profile
                </button>
            </div>
        </div>
    );
}

export function MentorshipToggle() {
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const [isAvailable, setIsAvailable] = useState(false);

    useEffect(() => {
        if (currentUser?.uid) {
            getDoc(doc(db, 'users', currentUser.uid)).then(snap => {
                if (snap.exists() && snap.data().allowStudentChat) {
                    setIsAvailable(true);
                }
            });
        }
    }, [currentUser]);

    const toggleAvailability = async () => {
        const newVal = !isAvailable;
        setIsAvailable(newVal); // Optimistic update
        try {
            await updateDoc(doc(db, 'users', currentUser.uid), {
                allowStudentChat: newVal
            });
            addToast(newVal ? "You're now listed as open to mentoring!" : "You've hidden your mentorship availability.", "success");
        } catch (error) {
            console.error(error);
            setIsAvailable(!newVal); // Revert
            addToast("Failed to update status", "error");
        }
    };

    return (
        <div className="bg-card dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-all hover:shadow-md">
            <div>
                <h3 className="font-bold text-text dark:text-white flex items-center gap-2">
                    <FaCheckCircle className={isAvailable ? "text-accent" : "text-gray-300 dark:text-gray-600"} />
                    Mentorship Status
                </h3>
                <p className="text-sm text-text-muted dark:text-gray-400 mt-1">
                    {isAvailable ? "You are open to mentoring students." : "You are currently busy."}
                </p>
            </div>
            <button
                onClick={toggleAvailability}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${isAvailable ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isAvailable ? 'translate-x-7' : 'translate-x-1'} shadow-sm`} />
            </button>
        </div>
    );
}

import { useEffect } from 'react';
import { subscribeToApprovedJobs } from '../services/firestore';

export function JobBoardPreview() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToApprovedJobs((data) => {
            setJobs(data.slice(0, 5)); // Preview up to 5 jobs
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="bg-card dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-text dark:text-white flex items-center gap-2">
                    <FaBriefcase className="text-accent" />
                    Latest Opportunities
                </h3>
                <a href="#" className="text-sm text-primary dark:text-blue-400 font-semibold hover:underline">View all</a>
            </div>
            
            {loading ? (
                <div className="flex justify-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
            ) : jobs.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No new opportunities available right now.</p>
            ) : (
                <div className="space-y-5">
                    {jobs.map((job) => (
                        <div key={job.id} className="flex justify-between items-start border-b border-gray-50 dark:border-gray-700/50 pb-4 last:border-0 last:pb-0">
                            <div>
                                <h4 className="font-semibold text-text dark:text-gray-200 text-sm hover:text-primary dark:hover:text-blue-400 cursor-pointer transition-colors max-w-[200px] truncate">{job.title}</h4>
                                <p className="text-xs text-text-muted dark:text-gray-500 mt-1">{job.company} • {job.location}</p>
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase tracking-widest shrink-0">
                                {job.type}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
