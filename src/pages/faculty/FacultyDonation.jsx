import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import FacultyLayout from '../../components/faculty/FacultyLayout';
import { useToast } from '../../components/ui/Toast';
import { submitDonation, subscribeToMyDonations } from '../../services/donationService';
import { FaHeart, FaUniversity, FaMicroscope, FaBook, FaSpinner, FaCheckCircle, FaHistory, FaDownload, FaFileInvoiceDollar } from 'react-icons/fa';
import jsPDF from 'jspdf';

const categories = [
  { id: 'scholarship', name: 'Student Scholarships', icon: FaBook, desc: 'Direct financial aid for deserving students.' },
  { id: 'infrastructure', name: 'Campus Infrastructure', icon: FaUniversity, desc: 'Building labs, libraries, and facilities.' },
  { id: 'research', name: 'Research & Innovation', icon: FaMicroscope, desc: 'Funding ground-breaking departmental research.' },
  { id: 'general', name: 'General Fund', icon: FaHeart, desc: 'Area of greatest need as determined by the department.' },
];

export default function FacultyDonation() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [anonymous, setAnonymous] = useState(false);

  const [paymentMode, setPaymentMode] = useState('UPI');
  const [bankName, setBankName] = useState('');

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (currentUser?.uid) {
      const unsubscribe = subscribeToMyDonations(currentUser.uid, (data) => {
        setHistory(data);
        setLoadingHistory(false);
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  const generatePDF = (data) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(8, 100, 144);
    doc.text("Xavier Institute of Engineering", 105, 20, null, null, "center");
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Donation Receipt", 105, 30, null, null, "center");
    
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    // Details
    doc.setFontSize(12);
    doc.text(`Date & Time: ${new Date().toLocaleString()}`, 20, 45);
    doc.text(`Transaction ID: ${data.txId}`, 20, 55);
    
    doc.text("Donor Details:", 20, 70);
    doc.setFontSize(11);
    doc.text(`Name: ${data.donorName}`, 25, 80);
    doc.text(`Category: ${data.donorRole}`, 25, 90);
    
    doc.setFontSize(12);
    doc.text("Payment Details:", 20, 105);
    doc.setFontSize(11);
    doc.text(`Amount: Rs. ${data.amount.toLocaleString()}`, 25, 115);
    doc.text(`Fund Category: ${data.category}`, 25, 125);
    doc.text(`Payment Mode: ${data.paymentMode}`, 25, 135);
    if (data.bankName && data.bankName !== 'N/A') {
      doc.text(`Bank / Provider Name: ${data.bankName}`, 25, 145);
    }
    
    // Footer
    doc.setLineWidth(0.5);
    doc.line(20, 160, 190, 160);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("This is a computer-generated receipt and does not require a signature.", 105, 170, null, null, "center");
    doc.text("Thank you for your generous contribution to the institution!", 105, 176, null, null, "center");
    
    doc.save(`Donation_Receipt_${data.txId}.pdf`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!amount || numAmount <= 0) {
      addToast('Please enter a valid amount', 'error');
      return;
    }
    if (numAmount > 100000) {
      addToast('Maximum donation amount is ₹1,00,000 for faculty.', 'error');
      return;
    }
    if (!paymentMode) {
      addToast('Please select a payment mode', 'error');
      return;
    }
    if (paymentMode !== 'Cash' && !bankName.trim()) {
      addToast('Please enter your Bank or Provider Name', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const donorName = anonymous ? 'Anonymous Faculty' : (currentUser?.email?.split('@')[0] || 'Faculty Member');
      const finalBankName = paymentMode === 'Cash' ? 'N/A' : bankName;
      const categoryName = categories.find(c => c.id === category)?.name || category;

      const txId = await submitDonation({
        donorId: currentUser?.uid,
        donorRole: 'faculty',
        donorName: donorName,
        amount: numAmount,
        category: category,
        message: "Faculty contribution",
        paymentMode: paymentMode,
        bankName: finalBankName,
      });

      addToast('Thank you for your generous donation! ❤️', 'success');
      
      // Generate PDF
      generatePDF({
        txId,
        donorName,
        donorRole: 'Faculty Member',
        amount: numAmount,
        category: categoryName,
        paymentMode,
        bankName: finalBankName,
      });

      setAmount('');
      setBankName('');
    } catch (error) {
      console.error(error);
      addToast('Failed to process donation. Try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadOldPDF = (don) => {
    generatePDF({
      txId: don.id,
      donorName: don.donorName,
      donorRole: 'Faculty Member',
      amount: don.amount,
      category: categories.find(c => c.id === don.category)?.name || don.category,
      paymentMode: don.paymentMode || 'N/A',
      bankName: don.bankName || 'N/A',
    });
  };

  return (
    <FacultyLayout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 text-white mb-4 shadow-lg shadow-rose-500/30">
            <FaHeart size={28} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Give Back to the Department</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Your contributions directly shape the future of our students and facilities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Side */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
              Make a Donation
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Select a Cause
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map(cat => (
                    <div 
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`cursor-pointer border rounded-xl p-3 flex flex-col items-start gap-2 transition-all ${
                        category === cat.id 
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10 ring-1 ring-rose-500' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-rose-300 dark:hover:border-rose-500/50'
                      }`}
                    >
                      <cat.icon className={`text-xl ${category === cat.id ? 'text-rose-500' : 'text-gray-400'}`} />
                      <div>
                        <p className={`text-sm font-bold ${category === cat.id ? 'text-rose-700 dark:text-rose-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          {cat.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Donation Amount (₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-bold">₹</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1000"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white dark:focus:bg-gray-700 transition-all"
                  />
                </div>
                
                {/* Quick amounts */}
                <div className="flex gap-2 mt-3">
                  {[500, 1000, 5000, 10000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val.toString())}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all appearance-none"
                  >
                    <option value="UPI">UPI (GPay, PhonePe, etc.)</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Cash">Cash (Physical Deposit)</option>
                  </select>
                </div>
                {paymentMode !== 'Cash' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Bank / Provider Name
                    </label>
                    <input
                      type="text"
                      required
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder={paymentMode === 'UPI' ? "e.g., GPay, Paytm" : "e.g., HDFC, SBI"}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                    />
                  </div>
                )}
              </div>

              {/* Anonymous Toggle */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="w-5 h-5 rounded text-rose-500 focus:ring-rose-500 border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 cursor-pointer" 
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  Donate Anonymously
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/40 transition-all disabled:opacity-70"
              >
                {submitting ? <FaSpinner className="animate-spin" /> : <FaHeart />}
                {submitting ? 'Processing...' : 'Complete Donation'}
              </button>
            </form>
          </div>

          {/* Info Side */}
          <div className="flex flex-col gap-6">
            <div className="bg-gradient-to-br from-[#086490] to-cyan-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
               <div className="absolute -right-10 -top-10 text-white/10">
                 <FaUniversity size={160} />
               </div>
               <div className="relative z-10">
                 <h3 className="text-2xl font-bold mb-3">Your Impact</h3>
                 <p className="text-blue-100 leading-relaxed mb-6">
                   Every contribution helps build a better learning environment. 100% of your donation is routed directly to your selected cause within the Computer Science department.
                 </p>
                 <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                    <p className="text-xs font-bold text-blue-200 tracking-wider uppercase mb-1">Tax Exemption</p>
                    <p className="text-sm font-medium">All faculty donations are eligible for 80G tax deductions. Receipts will be emailed automatically.</p>
                 </div>
               </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[400px]">
               <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                 <FaHistory className="text-rose-500" /> Your Donation History
               </h4>
               
               <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                 {loadingHistory ? (
                   <div className="flex flex-col items-center justify-center h-full text-gray-400">
                     <FaSpinner className="animate-spin text-2xl text-rose-500 mb-2" />
                     <p className="text-xs">Loading history...</p>
                   </div>
                 ) : history.length === 0 ? (
                   <div className="text-center flex flex-col items-center justify-center h-full">
                     <FaFileInvoiceDollar className="text-4xl text-gray-300 dark:text-gray-600 mb-2" />
                     <p className="text-sm text-gray-500 dark:text-gray-400">No donations yet.</p>
                   </div>
                 ) : (
                   history.map(donation => (
                     <div key={donation.id} className="p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col gap-2 relative group hover:border-rose-200 dark:hover:border-rose-500/30 transition-colors">
                       <div className="flex justify-between items-start">
                         <div>
                           <p className="font-bold text-gray-900 dark:text-white text-sm">
                             ₹{donation.amount.toLocaleString()}
                           </p>
                           <p className="text-xs text-gray-500 dark:text-gray-400">
                             {categories.find(c => c.id === donation.category)?.name || donation.category}
                           </p>
                         </div>
                         <button 
                           onClick={() => handleDownloadOldPDF(donation)}
                           className="text-gray-400 hover:text-rose-500 bg-white dark:bg-gray-700 p-1.5 rounded-lg border border-gray-100 dark:border-gray-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                           title="Download Receipt"
                         >
                           <FaDownload size={12} />
                         </button>
                       </div>
                       <div className="text-[10px] text-gray-400 dark:text-gray-500 flex justify-between">
                         <span>{donation.date}</span>
                         <span className="font-medium">{donation.paymentMode || 'N/A'}</span>
                       </div>
                     </div>
                   ))
                 )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </FacultyLayout>
  );
}

// Add FaCheckCircle to imports up top
// Need to replace this small piece since it wasn't imported.
