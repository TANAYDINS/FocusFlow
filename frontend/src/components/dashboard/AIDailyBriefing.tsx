import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  SparklesIcon, 
  ListBulletIcon, 
  EnvelopeIcon 
} from '@heroicons/react/24/outline';
import { dashboardApi } from '../../api/client';

interface BriefingData {
  message: string;
  top_tasks: any[];
  urgent_emails_count: number;
}

interface AIDailyBriefingProps {
  onStartFocus: (title: string, duration: number) => void;
}

const AIDailyBriefing = ({ onStartFocus }: AIDailyBriefingProps) => {
  const navigate = useNavigate();
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getBriefing()
      .then(res => setBriefing(res.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleStartFocus = () => {
    if (briefing?.top_tasks?.length) {
      const task = briefing.top_tasks[0];
      onStartFocus(task.title, task.estimated_duration);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 relative overflow-hidden"
    >
      {/* Aesthetic Background Element */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-2 bg-slate-100 rounded-lg">
          <SparklesIcon className="w-6 h-6 text-secondary" />
        </div>
        <h2 className="text-lg font-bold text-primary">Günlük Özet</h2>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-slate-100 rounded w-3/4" />
          <div className="h-4 bg-slate-100 rounded w-1/2" />
        </div>
      ) : briefing ? (
        <div className="relative z-10">
          <p className="text-slate-600 leading-relaxed mb-8 italic border-l-4 border-secondary/30 pl-4 text-sm">
            "{briefing.message}"
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <ListBulletIcon className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kritik Görev</span>
              </div>
              <p className="text-sm text-primary font-bold truncate">
                {briefing.top_tasks?.[0]?.title || 'Acil görev yok'}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <EnvelopeIcon className="w-4 h-4 text-rose-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">İletişim</span>
              </div>
              <p className="text-sm text-primary font-bold truncate">
                {briefing.urgent_emails_count} Kritik Madde
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/planner')}
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all text-slate-600 border border-slate-200"
            >
              Programı Analiz Et
            </button>
            <button 
              onClick={handleStartFocus}
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold transition-all shadow-md hover:bg-slate-800"
            >
              Odaklanmayı Başlat
            </button>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
};

export default AIDailyBriefing;
