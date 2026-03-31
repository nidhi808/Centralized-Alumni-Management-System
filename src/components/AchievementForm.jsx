import { useState } from 'react';
import { FaPaperPlane, FaImage, FaLink } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { addSuccessStory } from '../services/firestore';

export default function AchievementForm({ onSubmit }) {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { currentUser } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() || !currentUser) return;

        setIsSubmitting(true);
        try {
            await addSuccessStory(currentUser.uid, content);
            setContent('');
            if (onSubmit) {
                onSubmit(content);
            }
            // Trigger a page reload or event to refresh the feed if they are on the same page
            window.dispatchEvent(new Event('successStoryAdded'));
        } catch (error) {
            console.error("Error submitting achievement:", error);
            alert("Failed to post achievement.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-5 mb-6">
            <h3 className="font-bold text-text dark:text-white mb-4">Share an Achievement</h3>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's your latest success story? (e.g. New job, promotion, funding, award...)"
                    className="w-full h-24 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-surface dark:bg-gray-900 text-text dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none mb-3"
                ></textarea>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-text-muted dark:text-gray-400">
                        <button type="button" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Add Image">
                            <FaImage />
                        </button>
                        <button type="button" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Add Link">
                            <FaLink />
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={!content.trim() || isSubmitting}
                        className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaPaperPlane size={12} /> {isSubmitting ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </form>
        </div>
    );
}
