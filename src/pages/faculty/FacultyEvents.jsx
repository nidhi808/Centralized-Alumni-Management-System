import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import FacultyLayout from '../../components/faculty/FacultyLayout';
import Dialog from '../../components/ui/Dialog';
import { useToast } from '../../components/ui/Toast';
import { createEvent, subscribeToEvents, deleteEvent, subscribeToUserRSVPs, rsvpForEvent } from '../../services/facultyService';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import {
  FaPlus, FaCalendarAlt, FaMapMarkerAlt, FaTrash,
  FaUsers, FaVideo, FaChalkboardTeacher, FaSpinner,
  FaTicketAlt, FaDownload, FaCheckCircle
} from 'react-icons/fa';

const eventTypes = ['Webinar', 'Workshop', 'Seminar', 'Conference', 'Hackathon', 'Guest Lecture'];

export default function FacultyEvents() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myRsvps, setMyRsvps] = useState([]);
  const [downloadingTicket, setDownloadingTicket] = useState(null);

  const [form, setForm] = useState({
    title: '', description: '', type: 'Webinar',
    date: '', location: '', maxAttendees: 100,
  });

  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsubEvents = subscribeToEvents(currentUser.uid, (data) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date) {
      addToast('Please fill in title and date', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await createEvent({
        ...form,
        authorId: currentUser.uid,
        dept: 'Computer Science',
        attendees: 0,
      });
      addToast('Event created & announcement auto-published! 🎉', 'success');
      setDialogOpen(false);
      setForm({ title: '', description: '', type: 'Webinar', date: '', location: '', maxAttendees: 100 });
    } catch (err) {
      console.error(err);
      addToast('Failed to create event. Check Firestore rules.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEvent(id);
      addToast('Event deleted', 'info');
    } catch (err) {
      console.error(err);
      addToast('Failed to delete event', 'error');
    }
  };

  const typeIcons = {
    Webinar: FaVideo,
    Workshop: FaChalkboardTeacher,
    default: FaCalendarAlt,
  };

  return (
    <FacultyLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Event Hub</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create and manage departmental events. Auto-announcements are generated on creation.
          </p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#086490] hover:bg-[#065478] text-white font-semibold text-sm rounded-xl shadow-lg shadow-[#086490]/25 transition-all hover:-translate-y-0.5"
        >
          <FaPlus size={14} /> Create Event
        </button>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-20">
          <FaSpinner className="animate-spin text-3xl text-[#086490]" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center p-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <FaCalendarAlt className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-1">No Events Yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Create your first event to auto-generate announcements.</p>
          <button
            onClick={() => setDialogOpen(true)}
            className="px-5 py-2.5 bg-[#086490] text-white font-semibold text-sm rounded-xl hover:bg-[#065478] transition-colors"
          >
            Create First Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((event) => {
            const Icon = typeIcons[event.type] || typeIcons.default;
            return (
              <div key={event.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                <div className="h-2 bg-gradient-to-r from-[#086490] to-[#0aa4d4]" />
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
                    <div className="flex items-center gap-2">
                      <FaUsers size={12} className="text-[#086490]" />
                      Max {event.maxAttendees} attendees
                    </div>
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
                        className="flex items-center flex-1 justify-center gap-2 px-3 py-2 bg-[#086490] hover:bg-[#065478] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                      >
                        RSVP Now
                      </button>
                    )}
                    
                    {event.authorId === currentUser.uid && (
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="ml-3 p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors bg-gray-50 dark:bg-gray-700/50"
                        title="Delete Event"
                      >
                        <FaTrash size={14} />
                      </button>
                    )}
                  </div>

                  {/* Hidden Ticket for html2canvas */}
                  <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', zIndex: -1000, pointerEvents: 'none' }}>
                    <div id={`ticket-${event.id}`}>
                      <div className="w-[400px] p-8 bg-white text-center border-4 border-[#086490] rounded-3xl relative overflow-hidden font-sans">
                        {/* Decorative Background - Removed blur filters for html2canvas compatibility */}
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

      {/* Create Event Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Create New Event" maxWidth="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Event Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., AI Workshop: Introduction to LLMs"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#086490] focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#086490]"
              >
                {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#086490]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Room 305 or Virtual (Zoom)"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#086490]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Describe the event..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#086490] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Max Attendees</label>
            <input
              type="number"
              value={form.maxAttendees}
              onChange={(e) => setForm(prev => ({ ...prev, maxAttendees: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#086490]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDialogOpen(false)}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#086490] hover:bg-[#065478] text-white font-semibold text-sm rounded-xl shadow-lg shadow-[#086490]/25 transition-all disabled:opacity-50"
            >
              {submitting ? <FaSpinner className="animate-spin" /> : <FaPlus size={12} />}
              {submitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </Dialog>
    </FacultyLayout>
  );
}
