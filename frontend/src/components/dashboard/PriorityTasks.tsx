import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FireIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ChevronRightIcon 
} from '@heroicons/react/24/outline';
import { taskApi } from '../../api/client';

interface Task {
  id: number;
  title: string;
  priority_score: number;
  estimated_duration: number;
  status: string;
  assigned_to?: string | null;
}

interface PriorityTasksProps {
  onStartFocus: (title: string, duration: number) => void;
}

const PriorityTasks = ({ onStartFocus }: PriorityTasksProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await taskApi.getTasks();
      const pending = res.data
        .filter((t: Task) => t.status === 'pending' && !t.assigned_to)
        .slice(0, 4);
      setTasks(pending);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const toggleTask = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await taskApi.updateTask(id, { status: 'completed' });
      setTasks(tasks.filter(t => t.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FireIcon className="w-5 h-5 text-rose-500" />
          <h2 className="text-lg font-semibold text-primary">Öncelikli Görevler</h2>
        </div>
        <button 
          onClick={() => window.location.href = '/tasks'}
          className="text-xs font-medium text-slate-400 hover:text-primary transition-colors flex items-center gap-1"
        >
          Tümünü Gör <ChevronRightIcon className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-xs text-slate-400 animate-pulse">Görevler yükleniyor...</p>
        ) : tasks.length > 0 ? (
          tasks.map((task) => (
            <div 
              key={task.id}
              onClick={() => onStartFocus(task.title, task.estimated_duration)}
              className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all cursor-pointer group flex items-start gap-4"
            >
              <button 
                onClick={(e) => toggleTask(e, task.id)}
                className="mt-0.5 w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center hover:border-primary transition-colors flex-shrink-0"
              >
                <CheckCircleIcon className="w-4 h-4 text-transparent group-hover:text-primary/50" />
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-primary group-hover:text-anthracite transition-colors truncate">{task.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold flex-shrink-0 ${
                    task.priority_score > 70 ? 'bg-rose-100 text-rose-600' :
                    task.priority_score > 40 ? 'bg-amber-100 text-amber-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {task.priority_score > 70 ? 'Önemli' : task.priority_score > 40 ? 'Orta' : 'Düşük'}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-[10px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    {task.estimated_duration}m
                  </div>
                  <div className="flex items-center gap-1 text-primary/60 font-medium">
                    Programla →
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-400">Tebrikler! Kritik görev kalmadı.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PriorityTasks;
