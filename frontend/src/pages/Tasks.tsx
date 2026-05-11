import { motion } from 'framer-motion';
import { PlusIcon, CheckCircleIcon, TrashIcon, CalendarIcon, BriefcaseIcon, UserIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { taskApi } from '../api/client';
import TaskModal from '../components/TaskModal';

const Tasks = ({ onStartFocus }: { onStartFocus: (title: string, duration: number) => void }) => {
  const location = useLocation();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await taskApi.getTasks();
      let allTasks = response.data;
      const params = new URLSearchParams(location.search);
      const search = params.get('search');
      if (search) {
        allTasks = allTasks.filter((t: any) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.description?.toLowerCase().includes(search.toLowerCase())
        );
      }
      setTasks(allTasks);
    } catch (error) {
      console.error('Error fetching tasks', error);
    }
    setLoading(false);
  };

  const toggleTask = async (id: number, currentStatus: string) => {
    try {
      await taskApi.updateTask(id, { status: currentStatus === 'completed' ? 'pending' : 'completed' });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task', error);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await taskApi.deleteTask(id);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [location.search]);

  const personalTasks = tasks.filter(t => !t.assigned_to);
  const assignedTasks = tasks.filter(t => !!t.assigned_to);

  const TaskItem = ({ task, isPersonal }: { task: any, isPersonal: boolean }) => (
    <div
      className={`p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-primary/20 transition-all ${
        task.status === 'completed' ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <button
          onClick={() => toggleTask(task.id, task.status)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
            task.status === 'completed'
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-slate-300 group-hover:border-primary'
          }`}
        >
          {task.status === 'completed' ? (
            <CheckCircleSolid className="w-5 h-5 text-emerald-500" />
          ) : (
            <CheckCircleIcon className="w-4 h-4 text-transparent group-hover:text-primary/50 transition-colors" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <h3 className={`text-primary font-bold truncate ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
            {task.title}
          </h3>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" />
              {new Date(task.created_at).toLocaleDateString('tr-TR')}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">{task.estimated_duration} dk</span>
            {task.deadline && (
              <span className="text-[10px] text-secondary font-bold">
                🕐 {new Date(task.deadline).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {task.assigned_to && (
              <span className="flex items-center gap-1 text-[10px] text-slate-500 italic">
                <UserIcon className="w-3 h-3" />
                {task.assigned_to}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isPersonal && (
          <button
            onClick={() => onStartFocus(task.title, task.estimated_duration)}
            className="px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-800 shadow-sm"
          >
            Odaklan
          </button>
        )}
        <button
          onClick={() => deleteTask(task.id)}
          className="p-2 rounded-lg bg-rose-50 text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-100"
          title="Sil"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-6xl mx-auto"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-anthracite">Görevlerim</h1>
          <p className="text-sm text-slate-500 mt-1">Güne odaklan ve işlerini yönet.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg"
        >
          <PlusIcon className="w-5 h-5" />
          Görev Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Sol: Görevlerim */}
        <div className="glass-card p-6 min-h-[500px] flex flex-col bg-white">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-primary">Kişisel</h2>
            </div>
            <span className="text-xs px-3 py-1 rounded-full font-bold bg-slate-100 text-slate-500">
              {personalTasks.length} Görev
            </span>
          </div>
          <div className="space-y-4 flex-1">
            {loading ? (
              <p className="text-slate-400 text-sm animate-pulse">Yükleniyor...</p>
            ) : personalTasks.length > 0 ? (
              personalTasks.map(t => <TaskItem key={t.id} task={t} isPersonal={true} />)
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                <CheckCircleIcon className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">Henüz kişisel bir görevin yok.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sağ: İşler */}
        <div className="glass-card p-6 min-h-[500px] flex flex-col bg-white">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <BriefcaseIcon className="w-6 h-6 text-secondary" />
              </div>
              <h2 className="text-lg font-bold text-primary">İş Akışı</h2>
            </div>
            <span className="text-xs px-3 py-1 rounded-full font-bold bg-slate-100 text-slate-500">
              {assignedTasks.length} Atama
            </span>
          </div>
          <div className="space-y-4 flex-1">
            {loading ? (
              <p className="text-slate-400 text-sm animate-pulse">Yükleniyor...</p>
            ) : assignedTasks.length > 0 ? (
              assignedTasks.map(t => <TaskItem key={t.id} task={t} isPersonal={false} />)
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                <BriefcaseIcon className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">Şu an atanmış bir iş görünmüyor.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskCreated={fetchTasks}
      />
    </motion.div>
  );
};

export default Tasks;
