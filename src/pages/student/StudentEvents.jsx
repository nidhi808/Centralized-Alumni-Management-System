import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { useToast } from '../../components/ui/Toast';
import { subscribeToApprovedEvents, subscribeToUserRSVPs, rsvpForEvent } from '../../services/studentService';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import {
  FaCalendarAlt, FaMapMarkerAlt,
  FaUsers, FaVideo, FaChalkboardTeacher, FaSpinner,
  FaTicketAlt, FaDownload, FaCheckCircle
} from 'react-icons/fa';

const typeIcons = {
  Webinar: FaVideo,
  Workshop: FaChalkboardTeacher,
  default: FaCalendarAlt,
};

export default function StudentEvents() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
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
      addToast("RSVP Successful! You're in! 🎉", 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to RSVP', 'error');
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

  return (
    <DashboardLayout role="student">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Upcoming Events</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse and RSVP for approved department events and workshops.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <FaSpinner className="animate-spin text-3xl text-[#086490]" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center p-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <FaCalendarAlt className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-1">No Upcoming Events</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Check back later for new workshops and webinars.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((event) => {
            const Icon = typeIcons[event.type] || typeIcons.default;
            return (
              <div key={event.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                <div className="h-2 bg-gradient-to-r from-[#086490] to-blue-400" />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#086490]/10 flex items-center justify-center text-[#086490]">
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-[#086490] dark:text-blue-400 uppercase tracking-wider">
                      {event.type}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {event.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                    {event.description}
                  </p>

                  <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt size={12} className="text-[#086490]" />
                      {event.date}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt size={12} className="text-[#086490]" />
                        {event.location}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    {myRsvps.includes(event.id) ? (
                      <button 
                        onClick={() => downloadTicket(event)}
                        disabled={downloadingTicket === event.id}
                        className="flex items-center flex-1 justify-center gap-2 px-3 py-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors"
                      >
                        {downloadingTicket === event.id ? <FaSpinner className="animate-spin" /> : <FaTicketAlt />}
                        Download Ticket
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRSVP(event.id)}
                        className="flex flex-1 justify-center items-center gap-2 px-3 py-2 bg-[#086490] hover:bg-[#065478] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                      >
                        RSVP Now
                      </button>
                    )}
                  </div>

                  {/* Hidden Ticket for html2canvas */}
                  <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', zIndex: -1000, pointerEvents: 'none' }}>
                    <div id={`ticket-${event.id}`}>
                      <div className="w-[400px] p-8 bg-white text-center border-4 border-[#086490] rounded-3xl relative overflow-hidden font-sans">
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
