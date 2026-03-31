import { useState, useEffect } from 'react';
import { FaHeart, FaComment, FaShare, FaSpinner } from 'react-icons/fa';
import { getSuccessStories } from '../services/firestore';
// Fallback mock data in case DB is failing initially, optionally can be removed entirely
// import { successStories } from '../data/mockData';

export default function SuccessFeed() {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStories = async () => {
        try {
            setLoading(true);
            const data = await getSuccessStories();
            setStories(data);
        } catch (error) {
            console.error("Error fetching stories:", error);
            // Optionally set mock data as fallback
            // setStories(successStories);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStories();

        // Listen for new stories added by this user in the same session
        const handleNewStory = () => fetchStories();
        window.addEventListener('successStoryAdded', handleNewStory);
        
        return () => window.removeEventListener('successStoryAdded', handleNewStory);
    }, []);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-emerald-500 to-teal-500">
                <h3 className="text-lg font-bold text-white tracking-tight">🌟 Success Feed</h3>
                <p className="text-xs text-white/80 mt-0.5">Celebrate alumni achievements</p>
            </div>

            {/* Scrollable Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px] lg:max-h-none">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-8 text-text-muted">
                        <FaSpinner className="animate-spin text-2xl text-emerald-500 mb-2" />
                        <p>Loading achievements...</p>
                    </div>
                ) : stories.length === 0 ? (
                    <div className="text-center p-8 text-text-muted">
                        No success stories yet. Be the first to post!
                    </div>
                ) : (
                    stories.map((story) => (
                        <article
                            key={story.id}
                            className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-surface dark:bg-gray-950 hover:shadow-md transition-shadow"
                        >
                            {/* Author Info */}
                            <div className="flex items-center gap-3 mb-3">
                                {story.avatar ? (
                                    <img src={story.avatar} alt={story.authorName} className="w-10 h-10 rounded-full" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold shrink-0">
                                        {story.authorName?.charAt(0) || '?'}
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-sm font-bold text-text dark:text-white leading-tight">
                                        {story.authorName}
                                    </h4>
                                    <p className="text-xs text-text-muted dark:text-gray-400">
                                        {story.authorRole} • {story.timestamp}
                                    </p>
                                </div>
                            </div>

                            {/* Content */}
                            <p className="text-sm text-text dark:text-gray-300 mb-3 leading-relaxed">
                                {story.content}
                            </p>

                            {/* Tags */}
                            {story.tags && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {story.tags.map(tag => (
                                        <span key={tag} className="text-xs font-semibold px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Interactions */}
                            <div className="flex items-center gap-6 pt-3 border-t border-gray-100 dark:border-gray-800 text-text-muted dark:text-gray-500">
                                <button className="flex items-center gap-1.5 text-xs font-medium hover:text-emerald-500 transition-colors">
                                    <FaHeart /> {story.likes || 0}
                                </button>
                                <button className="flex items-center gap-1.5 text-xs font-medium hover:text-blue-500 transition-colors">
                                    <FaComment /> {story.comments || 0}
                                </button>
                                <button className="flex items-center gap-1.5 text-xs font-medium hover:text-text dark:hover:text-gray-300 transition-colors">
                                    <FaShare /> Share
                                </button>
                            </div>
                        </article>
                    ))
                )}
            </div>
        </div>
    );
}
