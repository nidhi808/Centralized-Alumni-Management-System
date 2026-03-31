import { useState, useEffect } from 'react';
import { FiCalendar } from 'react-icons/fi';
import { subscribeToPublicAnnouncements } from '../services/firestore';

export default function AnnouncementPanel() {
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        const unsubscribe = subscribeToPublicAnnouncements((data) => {
            setAnnouncements(data);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl h-full flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-primary to-primary-light">
                <h3 className="text-lg font-bold text-white tracking-tight">📢 Announcements</h3>
                <p className="text-xs text-blue-100 mt-0.5">Latest news & events</p>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[360px] lg:max-h-none">
                {announcements.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-text-muted dark:text-gray-400">
                        <p className="text-sm">No new announcements right now.</p>
                    </div>
                ) : (
                    announcements.map((item) => (
                        <article
                            key={item.id}
                            className="group p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md hover:border-primary/20 dark:hover:border-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                        >
                            <h4 className="text-sm font-semibold text-text dark:text-gray-100 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                                {item.title || "Announcement"}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-1.5 text-text-muted dark:text-gray-500">
                                <FiCalendar size={12} />
                                <span className="text-xs">{item.date}</span>
                            </div>
                            <p className="mt-2 text-xs text-text-muted dark:text-gray-400 leading-relaxed line-clamp-2">
                                {item.content || item.description}
                            </p>
                        </article>
                    ))
                )}
            </div>
        </div>
    );
}
