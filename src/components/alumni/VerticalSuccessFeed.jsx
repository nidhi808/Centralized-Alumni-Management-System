import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaBriefcase, FaGraduationCap, FaPlus, FaSpinner } from 'react-icons/fa';
import Dialog from '../ui/Dialog';
import AchievementForm from '../AchievementForm';
import { getSuccessStories } from '../../services/firestore';

export default function VerticalSuccessFeed() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStories = async () => {
      try {
          setLoading(true);
          const data = await getSuccessStories();
          setStories(data);
      } catch (error) {
          console.error("Error fetching stories:", error);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchStories();

      const handleNewStory = () => fetchStories();
      window.addEventListener('successStoryAdded', handleNewStory);
      
      return () => window.removeEventListener('successStoryAdded', handleNewStory);
  }, []);

  const getIconForType = (type, tags) => {
      const contentStr = ((type || '') + ' ' + (tags || []).join(' ')).toLowerCase();
      if (contentStr.includes('job') || contentStr.includes('career') || contentStr.includes('hired')) {
          return { icon: FaBriefcase, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30' };
      }
      if (contentStr.includes('mentor') || contentStr.includes('guide')) {
          return { icon: FaGraduationCap, color: 'text-emerald-500', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' };
      }
      return { icon: FaTrophy, color: 'text-amber-500', bgColor: 'bg-amber-100 dark:bg-amber-900/30' };
  };

  return (
    <div className="glow-card bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-xl h-[400px] flex flex-col relative overflow-hidden">
      <div className="glow-feed pb-4 mb-4 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center z-20">
        <div>
          <h3 className="text-xl font-bold text-text dark:text-white flex items-center gap-2">
            <FaTrophy className="text-accent" /> Institutional Wins
          </h3>
          <p className="text-xs text-text-muted mt-1">Live updates from the network.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="p-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm group"
          title="Share Success"
        >
          <FaPlus size={14} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {/* Top Fade */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white dark:from-gray-800/90 to-transparent z-10 pointer-events-none" />
        
        <div className="h-full overflow-hidden hover:overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
             <div className="flex flex-col items-center justify-center p-8 text-text-muted h-full">
                 <FaSpinner className="animate-spin text-2xl text-emerald-500 mb-2" />
             </div>
          ) : stories.length === 0 ? (
             <div className="text-center p-8 text-text-muted text-sm mt-10">
                 No success stories yet. Be the first to share one!
             </div>
          ) : (
            <motion.div
              animate={stories.length > 2 ? { y: ["0%", "-50%"] } : { y: 0 }}
              transition={{
                duration: Math.max(stories.length * 4, 15),
                ease: "linear",
                repeat: Infinity,
              }}
              className="flex flex-col gap-6 hover:[animation-play-state:paused]"
            >
              {[...stories, ...(stories.length > 2 ? stories : [])].map((item, index) => {
                const style = getIconForType(item.type, item.tags || [item.company].filter(Boolean));
                const Icon = style.icon;
                return (
                  <div key={`${item.id}-${index}`} className="flex gap-4 group cursor-pointer">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${style.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={style.color} size={16} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text dark:text-white text-sm group-hover:text-primary transition-colors">
                        {item.authorName || 'Alumni'} {item.company ? `at ${item.company}` : ''}
                      </h4>
                      <p className="text-sm text-text-muted dark:text-gray-400 mt-1 leading-snug line-clamp-2">
                        {item.content || "Achieved a new milestone!"}
                      </p>
                      <span className="text-xs text-gray-400 dark:text-gray-500 mt-2 block font-medium">
                        {item.timestamp || 'Just now'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </div>
        
        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white dark:from-gray-800/90 to-transparent z-10 pointer-events-none" />
      </div>

      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Share an Achievement" maxWidth="max-w-xl">
          <AchievementForm onSubmit={() => setIsModalOpen(false)} />
      </Dialog>
    </div>
  );
}
