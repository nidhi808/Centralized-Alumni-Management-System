import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '../../components/ui/Toast';
import { subscribeToAllEvents, deleteEvent } from '../../services/adminService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCalendarAlt, FaMapMarkerAlt, FaTrash,
  FaUsers, FaVideo, FaChalkboardTeacher, FaCheck
} from 'react-icons/fa';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

const typeIcons = {
  Webinar: FaVideo,
  Workshop: FaChalkboardTeacher,
  default: FaCalendarAlt,
};

export default function AdminEvents() {
  const { addToast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAllEvents((data) => {
      setEvents(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this event?")) return;
    try {
      await deleteEvent(id);
      addToast('Event deleted successfully.', 'info');
    } catch (err) {
      console.error(err);
      addToast('Failed to delete event.', 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Event Management</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              View and manage all events created across the platform.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700 self-start sm:self-auto shrink-0">
            <span className="text-sm font-bold text-blue-700 dark:text-blue-400">{events.length} Total Events</span>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[250px] bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 mt-6"
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-blue-50 dark:bg-blue-900/20`}>
              <FaCalendarAlt className="text-blue-500" size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                No Events Found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                There are currently no events on the platform.
            </p>
          </motion.div>
        ) : (
          <motion.div
             variants={containerVariants}
             initial="hidden"
             animate="visible"
             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
             <AnimatePresence mode="popLayout">
                {events.map((event) => {
                  const Icon = typeIcons[event.type] || typeIcons.default;
                  return (
                    <motion.div
                       key={event.id}
                       layout
                       variants={cardVariants}
                       className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden relative group flex flex-col"
                    >
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="absolute z-10 top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                        title={'Delete Event permanently'}
                      >
                        <FaTrash size={14} />
                      </button>
                      <div className="h-2 shrink-0 bg-gradient-to-r from-[#086490] to-[#0aa4d4]" />
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-3 pr-8">
                          <div className="w-10 h-10 rounded-xl bg-[#086490]/10 flex items-center justify-center text-[#086490]">
                            <Icon size={18} />
                          </div>
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-[#086490] dark:text-blue-400 uppercase tracking-wider">
                            {event.type}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 line-clamp-2">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                          {event.description}
                        </p>

                        <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt size={12} className="text-[#086490]" />
                            <span className="font-medium text-gray-700 dark:text-gray-300">{event.date}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <FaMapMarkerAlt size={12} className="text-[#086490]" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <FaUsers size={12} className="text-[#086490]" />
                            <span>Max {event.maxAttendees} attendees</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
             </AnimatePresence>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}
