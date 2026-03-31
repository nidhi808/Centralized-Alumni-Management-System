import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaClock, FaCheckCircle, FaDownload, FaTicketAlt, FaSpinner } from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';
import { subscribeToApprovedEvents, rsvpForEvent, subscribeToUserRSVPs } from '../../services/studentService';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';

export default function AlumniEvents() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [myRsvps, setMyRsvps] = useState([]);
  const [downloadingTicket, setDownloadingTicket] = useState(null);

  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsubEvents = subscribeToApprovedEvents((data) => {
      setEvents(data);
      setLoading(false);
    });
    const unsubRsvps = subscribeToUserRSVPs(currentUser.uid, (data) => {
      setMyRsvps(data);
    });
    return () => { unsubEvents(); unsubRsvps(); };
  }, [currentUser]);

  const handleRSVP = async (eventId) => {
    try {
      await rsvpForEvent(eventId, currentUser.uid);
      addToast("RSVP Confirmed! You're in! 🎉", "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to RSVP", "error");
    }
  };

  const downloadTicket = async (event) => {
    setDownloadingTicket(event.id);
    const element = document.getElementById(`ticket-${event.id}`);
    if (element) {
      try {
        const dataUrl = await toPng(element, { cacheBust: true, pixelRatio: 2, backgroundColor: '#ffffff' });
        const link = document.createElement('a');
        link.download = `Ticket_${event.title.replace(/\s+/g, '_')}.png`;
        link.href = dataUrl;
        link.click();
        addToast('Ticket downloaded successfully!', 'success');
      } catch (err) {
        console.error('Ticket generation error:', err);
        addToast(`Failed to generate ticket: ${err.message || 'Unknown error'}`, 'error');
      }
    }
    setDownloadingTicket(null);
  };

  const filteredEvents = filter === 'All' 
    ? events 
    : events.filter(e => e.type === filter);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <DashboardLayout role="alumni">
      <div className="max-w-7xl mx-auto py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-text dark:text-white flex items-center gap-3">
              <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-xl shadow-primary/30">
                <FaCalendarAlt size={28} />
              </span>
              Events & Reunions
            </h1>
            <p className="text-text-muted mt-3 text-lg">Discover upcoming gatherings and secure your spot.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {['All', 'Webinar', 'Workshop', 'Seminar', 'Conference'].map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
                  filter === t 
                    ? 'bg-text text-white dark:bg-white dark:text-gray-900' 
                    : 'bg-white dark:bg-gray-800 text-text-muted hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <FaSpinner className="animate-spin text-4xl text-primary" />
          </div>
        ) : (
          <>
            {/* Events Grid */}
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredEvents.map(event => (
                  <motion.div
                    layout
                    key={event.id}
                    variants={item}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group glow-card bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden flex flex-col sm:flex-row transition-all hover:shadow-2xl relative"
                  >
                    {/* Event Image Fallback (Since real events might lack image, use gradient) */}
                    <div className="sm:w-2/5 h-48 sm:h-auto relative overflow-hidden bg-gradient-to-br from-[#086490] to-teal-500">
                      <div className="absolute inset-0 bg-primary/20 mix-blend-overlay z-10" />
                      {event.image ? (
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-white/50 group-hover:scale-105 transition-transform duration-700">
                          <FaCalendarAlt size={48} className="drop-shadow-lg opacity-30" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-black tracking-wider uppercase text-[#086490] dark:text-blue-400 shadow-sm">
                        {event.type}
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="p-6 sm:w-3/5 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-2 group-hover:text-[#086490] transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                          {event.description}
                        </p>

                        <div className="space-y-2 mb-6">
                          <div className="flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center shrink-0">
                              <FaCalendarAlt />
                            </div>
                            {event.date}
                          </div>
                          <div className="flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center shrink-0">
                              <FaMapMarkerAlt />
                            </div>
                            <span className="truncate">{event.location || 'TBA'}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-500 flex items-center justify-center shrink-0">
                              <FaUsers />
                            </div>
                            Max {event.maxAttendees} Attending
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {myRsvps.includes(event.id) ? (
                          <button 
                            onClick={() => downloadTicket(event)}
                            disabled={downloadingTicket === event.id}
                            className="flex-1 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
                          >
                            {downloadingTicket === event.id ? <FaSpinner className="animate-spin" /> : <FaTicketAlt />}
                            Download Ticket
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleRSVP(event.id)}
                            className="flex-1 bg-gradient-to-r from-primary to-primary-light text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm"
                          >
                            Reserve Spot
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Hidden Ticket for html2canvas */}
                    <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', zIndex: -1000, pointerEvents: 'none' }}>
                      <div id={`ticket-${event.id}`}>
                        <div className="w-[400px] p-8 bg-white text-center border-4 border-[#086490] rounded-3xl relative overflow-hidden font-sans">
                          {/* Decorative Background */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-[#086490]/10 rounded-full -mr-10 -mt-10 pointer-events-none" />
                          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full -ml-10 -mb-10 pointer-events-none" />
                          
                          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-500 mb-4 border-4 border-white shadow-sm">
                            <FaCheckCircle size={32} />
                          </div>
                          
                          <h2 className="text-xl font-bold text-[#086490] mb-2">{event.title}</h2>
                          <div className="h-1 w-20 bg-[#086490] mx-auto rounded-full mb-4"></div>
                          
                          <p className="text-gray-500 font-medium mb-1">{event.date} • {event.location || 'TBA'}</p>
                          <p className="text-xs text-gray-400 mb-4 uppercase tracking-widest font-bold">Xavier Institute of Engineering</p>
                          
                          {/* Attendee Name */}
                          <div className="mb-6">
                              <p className="text-xs text-gray-400 uppercase font-semibold">Admit One</p>
                              <h3 className="text-2xl font-bold text-gray-900">{currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Attendee'}</h3>
                          </div>

                          <div className="bg-white p-4 inline-block rounded-2xl shadow-lg border border-gray-100 mb-4">
                            <QRCodeSVG value={`EVENT:${event.id}|USER:${currentUser.uid}`} size={160} level="H" includeMargin={true} />
                          </div>
                          
                          <h1 className="text-3xl font-extrabold text-emerald-500 mb-2 uppercase tracking-tight">You are in! 🎉</h1>
                          
                          <p className="text-[10px] text-gray-400 mt-2 tracking-wide">
                            Present this QR ticket at the venue entry.
                          </p>
                        </div>
                      </div>
                    </div>

                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
            
            {filteredEvents.length === 0 && (
              <div className="text-center py-20 bg-white/50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700 mt-8">
                <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 text-gray-400">
                  <FaCalendarAlt size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No events found</h3>
                <p className="text-gray-500 dark:text-gray-400">There are no upcoming {filter.toLowerCase()} events right now.</p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
