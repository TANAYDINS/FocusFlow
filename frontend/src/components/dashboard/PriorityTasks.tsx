import { FireIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const PriorityTasks = () => {
  const tasks = [
    { id: 1, title: 'Customer Presentation', duration: '2h', stress: 'High', deadline: 'Today, 2:00 PM', priority: 95 },
    { id: 2, title: 'Review API Specs', duration: '45m', stress: 'Medium', deadline: 'Today, 5:00 PM', priority: 82 },
    { id: 3, title: 'Team Sync', duration: '30m', stress: 'Low', deadline: 'Tomorrow, 10:00 AM', priority: 60 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FireIcon className="w-5 h-5 text-secondary" />
          <h2 className="text-lg font-semibold text-white">Priority Tasks</h2>
        </div>
        <button className="text-sm text-gray-400 hover:text-white transition-colors">View All</button>
      </div>

      <div className="space-y-3">
        {tasks.map((task, idx) => (
          <div key={task.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-white group-hover:text-primary transition-colors">{task.title}</h3>
              <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                task.priority > 90 ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 
                task.priority > 80 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' : 
                'bg-blue-500/20 text-blue-400 border border-blue-500/20'
              }`}>
                {task.priority} AI Score
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <ClockIcon className="w-3.5 h-3.5" />
                {task.duration}
              </div>
              <div className="flex items-center gap-1">
                <ExclamationCircleIcon className="w-3.5 h-3.5" />
                {task.deadline}
              </div>
              <div className="flex items-center gap-1 ml-auto">
                <span className={`w-2 h-2 rounded-full ${task.stress === 'High' ? 'bg-red-500' : task.stress === 'Medium' ? 'bg-orange-500' : 'bg-green-500'}`}></span>
                {task.stress} Stress
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default PriorityTasks;
