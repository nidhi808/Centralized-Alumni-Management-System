import { motion, useAnimation, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { FaUserTie, FaHandsHelping, FaRupeeSign } from 'react-icons/fa';

// Custom hook for animated counter
function AnimatedCounter({ value, duration = 2, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
        // Ease out quad
        const easeProgress = progress * (2 - progress);
        setCount(Math.floor(easeProgress * value));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [inView, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

export default function ImpactStats() {
  const stats = [
    {
      id: 1,
      name: 'Jobs Referred',
      value: 124,
      icon: FaUserTie,
      suffix: '+',
      color: 'from-blue-500 to-primary',
      bgLight: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 2,
      name: 'Students Mentored',
      value: 85,
      icon: FaHandsHelping,
      color: 'from-emerald-400 to-teal-500',
      bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 3,
      name: 'Total Donations',
      value: 450,
      icon: FaRupeeSign,
      suffix: 'k+',
      prefix: '₹',
      color: 'from-accent-light to-accent',
      bgLight: 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.id}
          variants={item}
          whileHover={{ y: -5, scale: 1.02 }}
          className="glow-card bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-xl relative overflow-hidden group"
        >
          {/* Subtle gradient background shimmer */}
          <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className={`w-14 h-14 rounded-2xl ${stat.bgLight} flex items-center justify-center`}>
              <stat.icon className={`text-2xl ${stat.iconColor}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted dark:text-gray-400 mb-1">
                {stat.name}
              </p>
              <h3 className="text-3xl font-bold text-text dark:text-white tracking-tight">
                <AnimatedCounter 
                  value={stat.value} 
                  prefix={stat.prefix} 
                  suffix={stat.suffix} 
                />
              </h3>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
