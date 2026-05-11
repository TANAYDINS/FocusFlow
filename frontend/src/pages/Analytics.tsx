import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { dashboardApi } from '../api/client';
import {
  ClockIcon,
  CheckCircleIcon,
  FireIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const Analytics = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    dashboardApi.getAnalytics()
      .then(res => setData(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text/50 animate-pulse">Analiz verileri yükleniyor...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <ExclamationTriangleIcon className="w-10 h-10 text-secondary" />
        <p className="text-text/60">Analiz verileri yüklenemedi. Backend çalışıyor mu?</p>
      </div>
    );
  }

  const totalTasks = (data.completed_tasks || 0) + (data.pending_tasks || 0);
  const completionRate = totalTasks > 0 ? Math.round((data.completed_tasks / totalTasks) * 100) : 0;
  const dailyStats: { day: string; hours: number }[] = data.daily_stats || [];
  const maxHours = Math.max(...dailyStats.map((d: any) => d.hours), 1);
  const dayNames: Record<string, string> = {
    Mon: 'Pzt', Tue: 'Sal', Wed: 'Çar', Thu: 'Per', Fri: 'Cum', Sat: 'Cmt', Sun: 'Paz',
  };

  const observations = [];
  if (completionRate >= 50) {
    observations.push({
      color: 'bg-primary',
      glow: 'shadow-[0_0_8px_rgba(69,243,255,0.6)]',
      title: 'Güçlü Tamamlama Oranı',
      desc: `Görevlerin %${completionRate}'ini tamamladın. Bu hafta oldukça verimli bir süreç geçiriyorsun.`,
    });
  } else if (data.pending_tasks > 0) {
    observations.push({
      color: 'bg-yellow-400',
      glow: 'shadow-[0_0_8px_rgba(250,204,21,0.6)]',
      title: 'Bekleyen Görevler Var',
      desc: `${data.pending_tasks} görevin hâlâ bekliyor. Öncelikli olanları planlayıcıdan takvime ekle.`,
    });
  }

  if (data.focus_hours > 0) {
    observations.push({
      color: 'bg-secondary',
      glow: 'shadow-[0_0_8px_rgba(255,148,69,0.6)]',
      title: 'Odaklanma Süresi',
      desc: `Toplam ${data.focus_hours} saat odaklanma süresi kaydedildi. Hedefin günde 4+ saat derin çalışma.`,
    });
  }

  if (observations.length === 0) {
    observations.push({
      color: 'bg-gray-400',
      glow: '',
      title: 'Veri Bekleniyor',
      desc: 'Analiz için daha fazla görev tamamla. AI gözlemleri otomatik güncellenir.',
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      <h1 className="text-3xl font-bold text-anthracite">Verimlilik Analizi</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <ClockIcon className="w-5 h-5" />, label: 'Odak Saati', value: `${data.focus_hours}s`, color: 'text-primary' },
          { icon: <CheckCircleIcon className="w-5 h-5" />, label: 'Tamamlanan', value: data.completed_tasks, color: 'text-emerald-500' },
          { icon: <FireIcon className="w-5 h-5" />, label: 'Bekleyen', value: data.pending_tasks, color: 'text-rose-500' },
          { icon: <SparklesIcon className="w-5 h-5" />, label: 'Verimlilik', value: `${data.productivity_score || 0}`, color: 'text-secondary' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
          >
            <div className={`${stat.color} mb-3`}>{stat.icon}</div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-primary">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Daily bar chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-lg font-bold text-primary mb-8">Haftalık Odaklanma</h2>
        {dailyStats.length > 0 ? (
          <div className="flex items-end gap-4 h-48">
            {dailyStats.map((d: any, i: number) => {
              const pct = (d.hours / maxHours) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold text-primary">{d.hours}s</span>
                  <div className="w-full rounded-xl bg-slate-50 relative" style={{ height: '120px' }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${pct}%` }}
                      transition={{ delay: i * 0.08, duration: 0.5 }}
                      className="absolute bottom-0 left-0 right-0 rounded-xl bg-primary shadow-sm"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{dayNames[d.day] || d.day}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-12 italic">Veriler işleniyor...</p>
        )}
      </div>

      {/* Tamamlanma oranı */}
      <div className="glass-card p-6 space-y-3">
        <div className="flex justify-between text-sm text-anthracite/60">
          <span>Tamamlanma Oranı</span>
          <span className="text-green-500 font-bold">%{completionRate}</span>
          <span className="text-primary font-bold">%{completionRate}</span>
        </div>
        <div className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
      completionRate > 0 ? 'bg-primary' : 'bg-slate-200'
    }`}></div>
        <div className="flex gap-6 text-xs text-text/40 pt-1">
          <span>Toplam: <span className="text-anthracite font-medium">{totalTasks}</span></span>
          <span>Tamamlanan: <span className="text-emerald-500 font-medium">{data.completed_tasks}</span></span>
          <span>Bekleyen: <span className="text-secondary font-medium">{data.pending_tasks}</span></span>
        </div>
      </div>

      {/* AI Observations */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-base font-semibold text-anthracite">AI Gözlemleri</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {observations.map((obs, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10 hover:bg-primary/10 transition-colors"
            >
              <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${obs.color} ${obs.glow || ''}`} />
              <div>
                <p className="text-sm text-anthracite font-bold mb-1">{obs.title}</p>
                <p className="text-xs text-anthracite/60">{obs.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-8">
           <h2 className="text-lg font-bold text-primary mb-6">AI Tercihleri</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <h3 className="text-primary font-bold">Otomatik Planlama</h3>
                <p className="text-xs text-slate-500 mt-0.5">AI yeni görevlere otomatik zaman atar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Analytics;
