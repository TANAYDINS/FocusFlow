import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { taskApi } from '../api/client';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
}

const TaskModal = ({ isOpen, onClose, onTaskCreated }: TaskModalProps) => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await taskApi.createTask({ title, estimated_duration: duration });
      onTaskCreated();
      onClose();
      setTitle('');
      setDuration(30);
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-primary">Yeni Görev Ekle</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
            <XMarkIcon className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Görev Başlığı</label>
            <input
              autoFocus
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all"
              placeholder="Örn: Raporu bitir"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tahmini Süre (dk)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full py-4 mt-6 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? 'Oluşturuluyor...' : 'Görev Oluştur'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
