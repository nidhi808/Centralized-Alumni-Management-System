import { useState, useEffect } from 'react';
import { FaBullhorn } from 'react-icons/fa';
import { subscribeToPublicAnnouncements } from '../services/firestore';

export default function AnnouncementsTicker() {
    const [announcements, setAnnouncements] = useState([
        { title: "🚀 Loading announcements..." }
    ]);

    useEffect(() => {
        const unsubscribe = subscribeToPublicAnnouncements((data) => {
            if (data && data.length > 0) {
                setAnnouncements(data);
            } else {
                setAnnouncements([{ title: "No new announcements at this time." }]);
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="bg-primary-light dark:bg-blue-900 border-b border-white/10 text-white overflow-hidden py-3 relative z-40">
            <div className="container mx-auto px-4 flex items-center">
                <div className="flex items-center whitespace-nowrap mr-4 px-3 py-1 bg-white/20 rounded-md font-semibold text-sm">
                    <FaBullhorn className="mr-2 text-accent" />
                    Updates
                </div>
                <div className="flex-1 overflow-hidden relative">
                    {/* CSS Marquee */}
                    <div className="flex whitespace-nowrap animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused]">
                        {announcements.map((item, idx) => (
                            <span key={item.id || idx} className="mx-8 text-sm md:text-base font-medium opacity-90">
                                • {item.title || item.content}
                            </span>
                        ))}
                        {announcements.map((item, idx) => (
                            <span key={`dup-${item.id || idx}`} className="mx-8 text-sm md:text-base font-medium opacity-90">
                                • {item.title || item.content}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}
