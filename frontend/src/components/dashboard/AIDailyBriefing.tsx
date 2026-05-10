import { SparklesIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const AIDailyBriefing = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-primary/20 transition-all duration-500"></div>
      
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <SparklesIcon className="w-6 h-6 text-primary" />
        <h2 className="text-lg font-semibold text-white">AI Daily Briefing</h2>
      </div>
      
      <p className="text-gray-300 leading-relaxed relative z-10">
        Good morning! Today you have <span className="text-white font-medium">3 important tasks</span> and <span className="text-white font-medium">2 meetings</span>. 
        Your highest priority task is the <span className="text-primary font-medium">Customer Presentation</span>.
      </p>

      <div className="mt-6 flex gap-3 relative z-10">
        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border border-white/5">
          View Schedule
        </button>
        <button className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-sm font-medium transition-colors border border-primary/20">
          Start Focus Mode
        </button>
      </div>
    </motion.div>
  );
};

export default AIDailyBriefing;
