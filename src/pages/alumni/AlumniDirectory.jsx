import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaMapMarkerAlt, FaBriefcase, FaGraduationCap, FaSpinner, FaUsers } from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';

const mockAlumni = [
  { id: '1', name: 'Arun Kumar', batch: '2015', department: 'Computer Engineering', company: 'Google', location: 'Bangalore', role: 'Senior Engineer', image: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Priya Verma', batch: '2018', department: 'Information Tech', company: 'Microsoft', location: 'Hyderabad', role: 'Product Manager', image: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Rohan Desai', batch: '2012', department: 'Electronics', company: 'Intel', location: 'Pune', role: 'Hardware Engineer', image: 'https://i.pravatar.cc/150?u=3' },
  { id: '4', name: 'Sneha Patil', batch: '2020', department: 'Computer Engineering', company: 'Amazon', location: 'Seattle, WA', role: 'SDE II', image: 'https://i.pravatar.cc/150?u=4' },
  { id: '5', name: 'Vikram Singh', batch: '2014', department: 'Mechanical', company: 'Tata Motors', location: 'Mumbai', role: 'Design Lead', image: 'https://i.pravatar.cc/150?u=5' },
  { id: '6', name: 'Neha Gupta', batch: '2019', department: 'Information Tech', company: 'Cisco', location: 'Bangalore', role: 'Network Engineer', image: 'https://i.pravatar.cc/150?u=6' },
];

export default function AlumniDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [connectingId, setConnectingId] = useState(null);
  const navigate = useNavigate();

  const handleConnect = (id) => {
    setConnectingId(id);
    // Simulate API call to create a chat room
    setTimeout(() => {
      setConnectingId(null);
      navigate('/alumni/chat');
    }, 1500);
  };

  const filteredAlumni = mockAlumni.filter(alum => 
    alum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alum.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alum.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alum.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <DashboardLayout role="alumni">
      <div className="max-w-7xl mx-auto py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-text dark:text-white flex items-center gap-3">
              <span className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <FaUsers />
              </span>
              Network Directory
            </h1>
            <p className="text-text-muted mt-2">Connect with fellow alumni across the globe.</p>
          </div>

          <div className="relative w-full md:w-96">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, company, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Directory Grid */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredAlumni.map((alum) => (
              <motion.div
                key={alum.id}
                variants={item}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -4 }}
                className="glow-card bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-lg relative overflow-hidden group"
              >
                {/* Decorative blob */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                
                <div className="flex items-start gap-4 mb-4 relative z-10">
                  <img src={alum.image} alt={alum.name} className="w-16 h-16 rounded-full border-2 border-white dark:border-gray-700 shadow-md object-cover" />
                  <div>
                    <h3 className="font-bold text-lg text-text dark:text-white leading-tight group-hover:text-primary transition-colors">{alum.name}</h3>
                    <p className="text-sm text-text-muted dark:text-gray-400 mt-0.5">{alum.role}</p>
                    <p className="text-xs font-semibold text-primary dark:text-primary-light mt-1">Class of {alum.batch}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-6 relative z-10">
                  <div className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-400">
                    <FaBriefcase className="text-gray-400 shrink-0" />
                    <span className="truncate">{alum.company}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-400">
                    <FaMapMarkerAlt className="text-gray-400 shrink-0" />
                    <span className="truncate">{alum.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-400">
                    <FaGraduationCap className="text-gray-400 shrink-0" />
                    <span className="truncate">{alum.department}</span>
                  </div>
                </div>

                <div className="relative z-10 border-t border-gray-100 dark:border-gray-700/50 pt-4">
                  <button
                    onClick={() => handleConnect(alum.id)}
                    disabled={connectingId === alum.id}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-white dark:bg-primary/20 dark:hover:bg-primary transition-colors disabled:opacity-70 disabled:cursor-not-allowed group-hover:shadow-md"
                  >
                    {connectingId === alum.id ? (
                      <><FaSpinner className="animate-spin" /> Connecting...</>
                    ) : (
                      'Connect'
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {filteredAlumni.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <FaSearch size={24} />
            </div>
            <h3 className="text-lg font-bold text-text dark:text-white mb-2">No alumni found</h3>
            <p className="text-text-muted">Try adjusting your search terms.</p>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
