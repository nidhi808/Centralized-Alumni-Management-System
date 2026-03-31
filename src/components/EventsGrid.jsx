import { useState } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import EventRegistrationModal from './EventRegistrationModal';

const events = [
    {
        id: 1,
        title: 'Class of 2014 - 10 Year Reunion',
        date: 'Oct 15, 2026',
        location: 'Main Campus',
        image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        attendees: 120,
        type: 'Reunion',
    },
    {
        id: 2,
        title: 'Tech Leaders Webinar: Future of AI',
        date: 'Nov 02, 2026',
        location: 'Virtual',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        attendees: 540,
        type: 'Webinar',
    },
    {
        id: 3,
        title: 'Annual Alumni Gala Dinner',
        date: 'Dec 10, 2026',
        location: 'Grand Hotel, Downtown',
        image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        attendees: 300,
        type: 'Gala',
    },
];

export default function EventsGrid() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [selectedEvent, setSelectedEvent] = useState(null);

    const handleRegisterClick = (event) => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setSelectedEvent(event);
    };

    return (
        <section className="pb-20 pt-20 md:pt-32 bg-surface dark:bg-gray-950">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-primary dark:text-blue-400">
                            Upcoming Events
                        </h2>
                        <p className="text-text-muted dark:text-gray-400 mt-2 text-lg">
                            Reunions, webinars, and networking opportunities.
                        </p>
                    </div>
                    <a href="/events" className="hidden md:inline-flex items-center text-accent hover:text-accent-light font-semibold transition-colors">
                        View all events
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((event) => (
                        <div key={event.id} className="bg-card dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 flex flex-col group">
                            <div className="relative h-48 overflow-hidden">
                                <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary dark:text-blue-400 uppercase tracking-wide">
                                    {event.type}
                                </div>
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-text dark:text-white mb-4 line-clamp-2">
                                    {event.title}
                                </h3>
                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center text-sm text-text-muted dark:text-gray-400">
                                        <FaCalendarAlt className="mr-3 text-accent" />
                                        {event.date}
                                    </div>
                                    <div className="flex items-center text-sm text-text-muted dark:text-gray-400">
                                        <FaMapMarkerAlt className="mr-3 text-accent" />
                                        {event.location}
                                    </div>
                                    <div className="flex items-center text-sm text-text-muted dark:text-gray-400">
                                        <FaUsers className="mr-3 text-accent" />
                                        {event.attendees} Attending
                                    </div>
                                </div>
                                <div className="mt-auto">
                                    <button 
                                        onClick={() => handleRegisterClick(event)}
                                        className="w-full py-3 rounded-xl font-semibold bg-primary/10 hover:bg-primary/20 text-primary dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 transition-colors"
                                    >
                                        Register Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Registration Modal Overlay */}
            <EventRegistrationModal 
                isOpen={!!selectedEvent} 
                onClose={() => setSelectedEvent(null)}
                event={selectedEvent} 
            />
        </section>
    );
}
