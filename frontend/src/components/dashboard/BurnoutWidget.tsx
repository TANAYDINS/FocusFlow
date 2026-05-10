import { HeartIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const BurnoutWidget = () => {
  const riskScore = 25; // Out of 100

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <HeartIcon className="w-5 h-5 text-green-400" />
        <h2 className="text-lg font-semibold text-white">Wellness & Load</h2>
      </div>

      <div className="flex items-end gap-4 mb-6">
        <div className="text-3xl font-bold text-white">{riskScore}%</div>
        <div className="text-sm text-gray-400 pb-1">Burnout Risk</div>
      </div>

      <div className="w-full h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-green-400 to-yellow-400 rounded-full"
          style={{ width: `${riskScore}%` }}
        ></div>
      </div>

      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
        <p className="text-xs text-green-400 leading-relaxed">
          <strong>AI Insight:</strong> Your workload is balanced. Keep up the good pace, and remember to take a short walk after your presentation.
        </p>
      </div>
    </motion.div>
  );
};

export default BurnoutWidget;
