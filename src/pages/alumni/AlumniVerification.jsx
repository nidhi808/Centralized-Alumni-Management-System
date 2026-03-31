import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaCheckCircle, FaHourglassHalf, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function AlumniVerification() {
  const { currentUser, userStatus, logout } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);

  // If they somehow get here but are approved, kick them to dashboard
  useEffect(() => {
    if (userStatus === 'approved') {
      navigate('/alumni/portal');
    }
  }, [userStatus, navigate]);

  // Simulate progress animation for visual effect
  useEffect(() => {
    const timer1 = setTimeout(() => setActiveStep(2), 1500);
    return () => clearTimeout(timer1);
  }, []);

  const handleDemoApprove = async () => {
    if (!currentUser?.uid) return;
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { status: 'approved' });
      window.location.reload();
    } catch (e) {
      console.error("Failed to auto-approve", e);
    }
  };

  const steps = [
    {
      id: 1,
      title: 'Registration Submitted',
      description: 'Your basic details have been received.',
      icon: FaCheckCircle,
      status: 'complete'
    },
    {
      id: 2,
      title: 'Admin Verification',
      description: 'The alumni cell is verifying your records.',
      icon: FaHourglassHalf,
      status: 'current'
    },
    {
      id: 3,
      title: 'Full Access Granted',
      description: 'Unlock networking, mentorship, and opportunities.',
      icon: FaShieldAlt,
      status: 'pending'
    }
  ];

  return (
    <div className="min-h-screen bg-surface dark:bg-gray-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-primary-light/20 rounded-full blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-xl w-full"
      >
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-10 border border-gray-200/50 dark:border-gray-800/50 shadow-2xl relative z-10">
          
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 mb-6"
            >
              <FaGraduationCap className="text-white text-4xl" />
            </motion.div>
            <h1 className="text-3xl font-bold text-text dark:text-white mb-3">Verification in Progress</h1>
            <p className="text-text-muted dark:text-gray-400">
              Welcome, <span className="font-semibold text-primary dark:text-primary-light">{currentUser?.email}</span>. We are currently verifying your alumni status with the institution records.
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800" />
            
            <div className="space-y-8 relative">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = step.id <= activeStep;
                const isCurrent = step.status === 'current';

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (index * 0.2) }}
                    className="flex gap-6 relative"
                  >
                    <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500 ${
                      isActive 
                        ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}>
                      <Icon className={isCurrent ? 'animate-pulse' : ''} />
                      {isActive && step.id !== activeStep && (
                         <motion.div 
                          layoutId="pulse"
                          className="absolute inset-0 rounded-full border-2 border-primary"
                          animate={{ scale: 1.5, opacity: 0 }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                         />
                      )}
                    </div>
                    
                    <div className="pt-2">
                      <h3 className={`font-semibold text-lg ${isActive ? 'text-text dark:text-white' : 'text-gray-400'}`}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-text-muted dark:text-gray-500 mt-1">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="mt-12 text-center border-t border-gray-100 dark:border-gray-800 pt-8">
            <p className="text-sm text-text-muted dark:text-gray-500 mb-6">
              This usually takes 1-2 business days. We will notify you via email once approved.
            </p>

            {/* DEMO BYPASS BUTTON */}
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl mb-6 shadow-sm">
              <p className="text-xs text-orange-600 dark:text-orange-400 mb-2 font-black uppercase tracking-wider">Developer Bypas</p>
              <button 
                onClick={handleDemoApprove}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all w-full sm:w-auto"
              >
                Approve My Account Now
              </button>
            </div>

            <button
              onClick={() => logout()}
              className="text-primary dark:text-primary-light font-medium hover:underline transition-colors"
            >
              Sign out for now
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
