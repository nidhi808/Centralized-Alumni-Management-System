import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { FaTimes, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from './ui/Toast';

export default function EventRegistrationModal({ isOpen, onClose, event }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [step, setStep] = useState(1); // 1: Form, 2: Success & QR Code
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'alumni', // default
  });

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        email: currentUser.email || '',
      }));
    }
  }, [currentUser]);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      // Save registration to Firestore
      const registrationRef = doc(collection(db, 'event_registrations'));
      await setDoc(registrationRef, {
        eventId: event.id,
        eventTitle: event.title,
        userId: currentUser.uid,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        registeredAt: serverTimestamp()
      });

      // Simulate sending email
      addToast(`Invitation sent to ${formData.email}`, 'info');

      // Move to success step
      setStep(2);
    } catch (error) {
      console.error('Registration failed', error);
      addToast('Failed to register for event', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  const qrValue = JSON.stringify({
    eventId: event.id,
    userEmail: formData.email,
    uid: currentUser?.uid
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {step === 1 ? 'Register for Event' : 'Registration Complete'}
          </h2>
          <button 
            onClick={handleClose}
            className="p-2 -m-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-6">
                <h3 className="font-semibold text-primary dark:text-blue-400 line-clamp-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary/50 text-blue-500"></span>
                  {event.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <span>📅 {event.date}</span>
                  <span>•</span>
                  <span>📍 {event.location}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  disabled={!!currentUser?.email}
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white outline-none cursor-not-allowed text-gray-500"
                />
                <p className="text-xs text-gray-400 mt-1">Ticket will be emailed here.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  I am a...
                </label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="student">Current Student</option>
                  <option value="alumni">Alumni</option>
                  <option value="faculty">Faculty</option>
                  <option value="guest">Guest</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2"><FaSpinner className="animate-spin" /> Processing...</span>
                  ) : (
                    'Confirm Registration'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4 flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <FaCheckCircle size={32} />
              </div>
              
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 inline-block mb-4 relative z-10 mx-auto">
                <QRCodeCanvas 
                  value={qrValue} 
                  size={160}
                  level="H"
                  includeMargin={true}
                  className="rounded-lg"
                />
              </div>

              <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
                You are in!! 🎉
              </h2>
              <p className="text-sm text-gray-500 max-w-[250px] mx-auto leading-relaxed mb-6">
                Your digital ticket has been generated. Please show this QR code at the entrance.
              </p>

              <button
                onClick={handleClose}
                className="px-8 py-2.5 rounded-full font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Close Window
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
