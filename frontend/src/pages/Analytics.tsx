import { motion } from 'framer-motion';

const Analytics = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-bold text-white mb-6">Productivity Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Focus Hours', value: '32h', trend: '+2.5h' },
          { label: 'Tasks Completed', value: '45', trend: '+12' },
          { label: 'Burnout Risk', value: 'Low', trend: '-5%' },
          { label: 'AI Score', value: '92', trend: '+3' }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6">
            <h3 className="text-sm text-gray-400 mb-2">{stat.label}</h3>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-white">{stat.value}</span>
              <span className="text-xs text-green-400 mb-1">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 min-h-[300px] flex items-center justify-center flex-col">
          <p className="text-gray-400 mb-4">Focus Trends Chart Placeholder</p>
          <div className="w-full h-48 bg-white/5 rounded-xl border border-white/5 flex items-end px-4 gap-2 pb-4 pt-10">
            {/* Fake bar chart */}
            {[40, 70, 45, 90, 65, 30, 80].map((h, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-primary/20 to-primary rounded-t-sm" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">AI Observations</h2>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-secondary"></div>
              <p className="text-sm text-gray-300">You tend to postpone administrative tasks. Consider grouping them into a 30-minute block on Fridays.</p>
            </li>
            <li className="flex gap-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-primary"></div>
              <p className="text-sm text-gray-300">Your most productive day this month was Tuesday. You completed 3 High-Priority tasks.</p>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default Analytics;
