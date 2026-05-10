import { motion } from 'framer-motion';
import { PlusIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { taskApi } from '../api/client';

const Tasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const response = await taskApi.getTasks();
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Tasks</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-background rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(69,243,255,0.4)]">
          <PlusIcon className="w-4 h-4" />
          Add Task
        </button>
      </div>

      <div className="glass-card p-6">
        <div className="space-y-4">
          {loading ? (
            <p className="text-gray-400">Loading tasks...</p>
          ) : tasks.length > 0 ? (
            tasks.map(task => (
              <div key={task.id} className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between group hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <button className="w-6 h-6 rounded-full border border-gray-500 flex items-center justify-center group-hover:border-primary transition-colors">
                    <CheckCircleIcon className="w-4 h-4 text-transparent group-hover:text-primary/50 transition-colors" />
                  </button>
                  <div>
                    <h3 className="text-white font-medium">{task.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">{task.estimated_duration}m</span>
                      {task.priority_score > 0 && (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-secondary/20 text-secondary border border-secondary/20">
                          AI Priority: {task.priority_score}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
             <p className="text-gray-400">No tasks found. Start by asking the AI Planner or adding one.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Tasks;
