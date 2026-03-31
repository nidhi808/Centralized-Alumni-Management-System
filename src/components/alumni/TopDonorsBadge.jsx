import { motion } from 'framer-motion';
import { FaCrown, FaMedal } from 'react-icons/fa';

export default function TopDonorsBadge({ large = false }) {
  const donors = [
    { name: 'Dr. A. Sharma', amount: '₹1.5M', batch: '2010', type: 'gold', color: 'from-yellow-400 to-amber-600' },
    { name: 'R. K. Gupta', amount: '₹850k', batch: '2015', type: 'silver', color: 'from-gray-300 to-gray-500' },
    { name: 'N. Desai', amount: '₹500k', batch: '2018', type: 'bronze', color: 'from-orange-400 to-amber-700' },
  ];

  return (
    <div className={`grid grid-cols-1 ${large ? 'md:grid-cols-3' : ''} gap-4`}>
      {donors.map((donor, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.15, type: 'spring', stiffness: 300 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="relative group p-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-md flex items-center gap-4 overflow-hidden"
        >
          {/* Subtle animated border glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
          
          <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${donor.color} shadow-lg shrink-0 relative z-10`}>
            {donor.type === 'gold' ? (
              <FaCrown className="text-white text-xl" />
            ) : (
              <FaMedal className="text-white text-xl" />
            )}
          </div>
          
          <div className="relative z-10">
            <h4 className="font-bold text-text dark:text-white leading-tight">{donor.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300">
                Class of {donor.batch}
              </span>
              <span className={`text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r ${donor.color}`}>
                {donor.amount}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
