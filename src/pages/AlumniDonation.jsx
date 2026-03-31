import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { useToast } from '../components/ui/Toast';
import { submitDonation, subscribeToMyDonations } from '../services/donationService';
import { FaHeart, FaUniversity, FaMicroscope, FaBook, FaSpinner, FaCheckCircle, FaCrown, FaHistory, FaDownload, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';

const categories = [
  { id: 'scholarship', name: 'Student Scholarships', icon: FaBook, desc: 'Direct financial aid for deserving students.' },
  { id: 'infrastructure', name: 'Campus Infrastructure', icon: FaUniversity, desc: 'Building labs, libraries, and facilities.' },
  { id: 'research', name: 'Research & Innovation', icon: FaMicroscope, desc: 'Funding ground-breaking departmental research.' },
  { id: 'general', name: 'General Fund', icon: FaHeart, desc: 'Area of greatest need as determined by the department.' },
];

export default function AlumniDonation() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  
  const [amount, setAmount] = useState('5000');
  const [category, setCategory] = useState(categories[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  
  const [myDonations, setMyDonations] = useState([]);
  const [receiptModal, setReceiptModal] = useState(null); // null or a donation object

  // Fetch personal donation history
  useEffect(() => {
    if (currentUser?.uid) {
      const unsubscribe = subscribeToMyDonations(currentUser.uid, (donations) => {
        setMyDonations(donations);
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      addToast('Please enter a valid amount', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const donorName = anonymous ? 'Anonymous Alumni' : (currentUser?.email?.split('@')[0] || 'Alumni Member');
      const donationData = {
        donorId: currentUser?.uid,
        donorRole: 'alumni',
        donorName: donorName,
        amount: Number(amount),
        category: category,
        message: "Alumni contribution",
      };
      const id = await submitDonation(donationData);
      
      const receiptData = {
        id,
        ...donationData,
        date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };

      addToast('Thank you for your generous footprint! 🎉', 'success');
      setAmount('1000');
      
      // Open receipt modal automatically
      setReceiptModal(receiptData);
    } catch (error) {
      console.error(error);
      addToast('Failed to process donation. Try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadReceiptPDF = (donation) => {
    const doc = new jsPDF();
    const donorName = anonymous ? 'Anonymous Alumni' : (currentUser?.email?.split('@')[0] || 'Alumni Member');

    // Title
    doc.setFontSize(22);
    doc.setTextColor(8, 100, 144); // Primary color
    doc.text('AlumniConnect', 105, 20, null, null, 'center');
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Donation Receipt', 105, 30, null, null, 'center');

    // Divider
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    // Content
    doc.setFontSize(12);
    doc.text(`Transaction ID: ${donation.id.toUpperCase()}`, 20, 50);
    doc.text(`Date: ${donation.date}`, 20, 60);
    doc.text(`Donor Name: ${donorName}`, 20, 70);
    doc.text(`Donor Category: Alumni`, 20, 80);
    doc.text(`Donation Category: ${donation.category.charAt(0).toUpperCase() + donation.category.slice(1)}`, 20, 90);
    
    // Amount
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Amount Donated: INR ${Number(donation.amount).toLocaleString()}`, 20, 110);

    // Thank you message
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text('Thank you so much for your generous contribution!', 105, 130, null, null, 'center');
    doc.text('Your support empowers the next generation.', 105, 138, null, null, 'center');

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('This is a computer generated receipt.', 105, 280, null, null, 'center');

    doc.save(`AlumniConnect_Receipt_${donation.id.substring(0, 8)}.pdf`);
    addToast("Receipt downloaded successfully!", "success");
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <DashboardLayout role="alumni">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto py-8 space-y-12"
      >
        <motion.div variants={item} className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white mb-6 shadow-xl shadow-emerald-500/30">
            <FaHeart size={36} className="animate-pulse" />
          </div>
          <h2 className="text-4xl font-extrabold text-text dark:text-white tracking-tight">Leave a Legacy</h2>
          <p className="mt-4 text-lg text-text-muted dark:text-gray-400 leading-relaxed">
            Your generous contributions empower the next generation of students and elevate the institution on a global stage.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          {/* Form Side */}
          <motion.div variants={item} className="glow-card bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <h3 className="text-2xl font-bold text-text dark:text-white mb-8 relative z-10">
              Make a Donation
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-semibold text-text dark:text-gray-300 mb-4">
                  Select a Cause
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.map(cat => (
                    <div 
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`cursor-pointer rounded-2xl p-4 flex flex-col items-start gap-3 transition-all duration-300 ${
                        category === cat.id 
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/40 ring-2 ring-emerald-500 shadow-md' 
                          : 'border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800'
                      }`}
                    >
                      <cat.icon className={`text-2xl ${category === cat.id ? 'text-emerald-500' : 'text-gray-400'}`} />
                      <div>
                        <p className={`text-sm font-bold ${category === cat.id ? 'text-emerald-700 dark:text-emerald-300' : 'text-text dark:text-gray-300'}`}>
                          {cat.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amount Selection */}
              <div>
                <label className="block text-sm font-semibold text-text dark:text-gray-300 mb-4 flex justify-between">
                  <span>Investment Amount</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹{Number(amount).toLocaleString()}</span>
                </label>
                
                {/* Interactive scale */}
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 mb-6"
                />

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-bold text-lg">₹</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Custom amount"
                    className="w-full pl-10 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/80 dark:bg-gray-700/80 text-text dark:text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Anonymous Toggle */}
              <label className="flex items-center gap-3 cursor-pointer group bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <input 
                  type="checkbox" 
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500 border-gray-300 bg-white dark:bg-gray-900 cursor-pointer" 
                />
                <span className="text-sm font-medium text-text-muted dark:text-gray-300 group-hover:text-text dark:group-hover:text-white transition-colors">
                  Keep this contribution anonymous on the public feed
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="glow-btn w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/25 transition-all disabled:opacity-70 group"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <FaHeart className="group-hover:scale-110 transition-transform" /> Confirm Impact
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Info Side */}
          <motion.div variants={item} className="flex flex-col gap-8">
            <div className="glow-card bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-10 text-white shadow-xl relative overflow-hidden group">
               {/* Shimmer effect */}
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
               
               <div className="absolute -right-10 -bottom-10 opacity-10 transform group-hover:scale-110 transition-transform duration-700">
                 <FaUniversity size={240} />
               </div>
               <div className="relative z-10">
                 <h3 className="text-3xl font-bold mb-4">The Ripple Effect</h3>
                 <p className="text-emerald-100 leading-relaxed text-lg mb-8">
                   Every rupee you contribute echoes through the halls, funding dreams and birthing innovations that change the world.
                 </p>
                 <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-inner">
                    <p className="text-xs font-bold text-emerald-200 tracking-wider uppercase mb-2">Tax Exemption</p>
                    <p className="text-sm font-medium leading-relaxed">
                      All alumni donations are eligible for 80G tax deductions. Digital receipts and certificates are emailed instantly upon confirmation.
                    </p>
                 </div>
               </div>
            </div>

            <div className="glow-card bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
               <h4 className="font-bold text-text dark:text-white mb-6 text-sm uppercase tracking-wider flex items-center gap-2">
                 <FaCrown className="text-accent" /> Wall of Fame Spotlight
               </h4>
               <ul className="space-y-6">
                 <li className="flex gap-4 items-start group">
                   <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                     <FaCheckCircle size={18}/>
                   </div>
                   <div>
                     <p className="text-base font-bold text-text dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Start-up Incubation Center</p>
                     <p className="text-sm text-text-muted mt-1 leading-snug">Funded entirely by the collective contributions of the Class of 2015.</p>
                   </div>
                 </li>
                 <li className="flex gap-4 items-start group">
                   <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                     <FaCheckCircle size={18}/>
                   </div>
                   <div>
                     <p className="text-base font-bold text-text dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Global Exchange Program</p>
                     <p className="text-sm text-text-muted mt-1 leading-snug">Sponsored 5 top-performing students to study abroad in Fall 2025.</p>
                   </div>
                 </li>
               </ul>
            </div>
          </motion.div>
        </div>

        {/* Private Donation History */}
        <motion.div variants={item} className="pt-8 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-text dark:text-white flex items-center gap-3">
              <FaHistory className="text-primary" />
              My Donation History
            </h3>
          </div>
          
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {myDonations.length === 0 ? (
              <div className="p-10 text-center text-text-muted">
                <FaBook className="text-4xl mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>You haven't made any donations yet.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                    <th className="py-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider">Date</th>
                    <th className="py-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider">Category</th>
                    <th className="py-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider">Amount</th>
                    <th className="py-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {myDonations.map((donation) => (
                    <tr key={donation.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-6 text-sm text-text dark:text-gray-300 whitespace-nowrap">{donation.date}</td>
                      <td className="py-4 px-6 text-sm font-medium text-text dark:text-white capitalize truncate max-w-[200px]">
                        {donation.category}
                      </td>
                      <td className="py-4 px-6 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{Number(donation.amount).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => downloadReceiptPDF(donation)}
                          className="text-primary hover:text-primary-light transition-colors p-2 bg-primary/10 rounded-lg inline-flex items-center gap-2 text-sm font-semibold"
                        >
                          <FaDownload /> Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
        
      </motion.div>

      {/* Transaction Receipt Modal */}
      <AnimatePresence>
        {receiptModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800 relative"
            >
              <button 
                onClick={() => setReceiptModal(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                <FaTimes size={20} />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheckCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold text-text dark:text-white">Payment Receipt</h2>
                <p className="text-sm text-text-muted mt-1">Transaction Successful</p>
              </div>

              <div className="space-y-4 mb-8 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-muted">Transaction ID</span>
                  <span className="font-mono text-text dark:text-white font-medium">{receiptModal.id.substring(0, 12).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-muted">Date</span>
                  <span className="text-text dark:text-white font-medium">{receiptModal.date}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-muted">Category</span>
                  <span className="text-text dark:text-white font-medium capitalize">{receiptModal.category}</span>
                </div>
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <span className="font-bold text-text dark:text-white">Amount Paid</span>
                  <span className="font-black text-xl text-emerald-600 dark:text-emerald-400">
                    ₹{Number(receiptModal.amount).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    downloadReceiptPDF(receiptModal);
                    setReceiptModal(null);
                  }}
                  className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-light transition-colors"
                >
                  Download PDF
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
}
