import { UserGroupIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { taskApi } from '../../api/client';

const WorkflowTable = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await taskApi.getTasks();
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks for workflow', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card p-6 overflow-hidden">
      <div className="flex items-center gap-2 mb-6">
        <ClipboardDocumentListIcon className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-anthracite">İş Akışı ve Dağılımı</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-primary/20 text-anthracite/40 text-xs font-medium uppercase tracking-wider">
              <th className="pb-3 pl-2">Sorumlu</th>
              <th className="pb-3">Görev</th>
              <th className="pb-3">Süre</th>
              <th className="pb-3">Zamanlama</th>
              <th className="pb-3 pr-2 text-right">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10">
            {loading ? (
              <tr><td colSpan={5} className="py-10 text-center text-gray-500 text-sm">Yükleniyor...</td></tr>
            ) : tasks.length === 0 ? (
              <tr><td colSpan={5} className="py-10 text-center text-gray-500 text-sm">Kayıtlı görev bulunamadı.</td></tr>
            ) : (
              tasks.map((task) => {
                const deadline = task.deadline ? new Date(task.deadline) : null;
                const timeStr = deadline ? deadline.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '—';
                const dateStr = deadline ? deadline.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }) : '';
                return (
                  <tr key={task.id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${task.assigned_to ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'}`}>
                          <UserGroupIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-anthracite">{task.assigned_to || 'Siz'}</span>
                      </div>
                    </td>
                    <td className="py-4"><span className="text-sm text-anthracite/80">{task.title}</span></td>
                    <td className="py-4 text-xs text-gray-500">{task.estimated_duration} dk</td>
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-primary">{timeStr}</span>
                        {dateStr && <span className="text-[10px] text-gray-600">{dateStr}</span>}
                      </div>
                    </td>
                    <td className="py-4 pr-2 text-right">
                      {task.status === 'completed' ? (
                        <span className="text-green-500 text-[10px] font-bold">BİTTİ</span>
                      ) : (
                        <span className="text-yellow-500 text-[10px] font-bold">BEKLİYOR</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkflowTable;
