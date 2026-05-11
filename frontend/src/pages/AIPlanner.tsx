import { motion } from 'framer-motion';
import { SparklesIcon, PlusIcon, CheckIcon, ClockIcon, CalendarDaysIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiApi, taskApi, scheduleApi } from '../api/client';

const AIPlanner = () => {
  const navigate = useNavigate();

  // --- Mevcut takvim (sayfa açılınca otomatik yükle) ---
  const [currentSchedule, setCurrentSchedule] = useState<any[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- AI analiz bölümü ---
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<any[]>([]);
  const [insights, setInsights] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const loadSchedule = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setScheduleLoading(true);
    try {
      // Always generate on AIPlanner so the left panel is never empty
      const [schedRes, tasksRes] = await Promise.all([
        scheduleApi.generateSchedule(),
        taskApi.getTasks(),
      ]);
      const scheduleData = Array.isArray(schedRes.data) ? schedRes.data : [];
      const allTasks = Array.isArray(tasksRes.data) ? tasksRes.data : [];
      const tasksMap = allTasks.reduce((acc: any, t: any) => { acc[t.id] = t; return acc; }, {});

      setCurrentSchedule(
        scheduleData
          .map((item: any) => ({
            ...item,
            title: tasksMap[item.task_id]?.title || 'Odak Seansı',
            status: tasksMap[item.task_id]?.status || 'pending',
          }))
          .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      );
    } catch (err) {
      console.error('Schedule load error', err);
    }
    setScheduleLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setAnalyzing(true);
    setSaved(false);
    setHasAnalyzed(false);
    try {
      const response = await aiApi.analyzeText(text, new Date().toISOString());
      setExtractedTasks(response.data.extracted_tasks || []);
      setInsights(response.data.insights || '');
    } catch (error) {
      console.error('Analyze error', error);
    }
    setHasAnalyzed(true);
    setAnalyzing(false);
  };

  const taskToPayload = (task: any) => {
    let deadline = null;
    if (task.deadline) {
      const d = new Date(task.deadline);
      if (!isNaN(d.getTime())) deadline = d.toISOString();
    }
    return {
      title: task.title,
      estimated_duration: task.estimated_duration ?? 45,
      deadline,
      stress_level: task.priority === 'High' ? 4 : task.priority === 'Medium' ? 3 : 2,
      assigned_to: task.assigned_to ?? null,
    };
  };

  const handleSaveOne = async (idx: number) => {
    try {
      await taskApi.createTasksBulk([taskToPayload(extractedTasks[idx])]);
      setExtractedTasks(prev => prev.filter((_, i) => i !== idx));
      if (extractedTasks.length === 1) await loadSchedule(true);
    } catch (error) {
      console.error('Save single error', error);
    }
  };

  const handleSaveAll = async () => {
    if (extractedTasks.length === 0 || saved) return;
    setSaving(true);
    try {
      await taskApi.createTasksBulk(extractedTasks.map(taskToPayload));
      setExtractedTasks([]);
      setInsights('');
      setText('');
      setSaved(false);
      setHasAnalyzed(false);
      await loadSchedule(true);
    } catch (error) {
      console.error('Save error', error);
    }
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Başlık */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4 shadow-sm">
          <SparklesIcon className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-anthracite mb-2">Yapay Zeka Planlayıcısı</h1>
        <p className="text-slate-500">Düşüncelerinizi uygulanabilir bir günlük plana dönüştürün.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
        {/* Sol: Mevcut Günlük Program (Genişlik: 2/5) */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="w-5 h-5 text-slate-400" />
              <h2 className="text-base font-semibold text-anthracite">Günlük Zaman Çizelgesi</h2>
            </div>
            <button
              onClick={() => loadSchedule(true)}
              disabled={refreshing}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-40"
              title="Yenile"
            >
              <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {scheduleLoading ? (
            <p className="text-sm text-gray-500 text-center py-8">Takvim yükleniyor...</p>
          ) : currentSchedule.length > 0 ? (
            <div className="relative pl-6 border-l border-primary/20 space-y-5 flex-1 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 28rem)', minHeight: '320px' }}>
              {currentSchedule.map((item, idx) => {
                const startDate = new Date(item.start_time);
                const endDate = new Date(item.end_time);
                const today = new Date();
                const isToday = startDate.toDateString() === today.toDateString();
                const timeStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateStr = isToday ? null : startDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                const durationMin = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
                return (
                  <div key={idx} className="relative">
                    <div className={`absolute -left-[29px] top-1.5 w-3 h-3 rounded-full border-2 border-background ${item.status === 'completed' ? 'bg-green-500' : 'bg-secondary shadow-[0_0_8px_rgba(255,148,69,0.5)]'
                      }`} />
                    <div className="mb-1">
                      {dateStr && <div className="text-[10px] text-primary/70 font-medium">{dateStr}</div>}
                      <div className="text-xs font-bold text-primary">{timeStr}</div>
                    </div>
                    <div className={`p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-primary/20 transition-all ${item.status === 'completed' ? 'opacity-50' : ''}`}>
                      <p className={`text-sm font-semibold ${item.status === 'completed' ? 'line-through text-slate-400' : 'text-primary'}`}>
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {durationMin} dk{item.status === 'completed' && ' · Tamamlandı ✓'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 space-y-3">
              <CalendarDaysIcon className="w-10 h-10 text-gray-600 mx-auto" />
              <p className="text-sm text-gray-500">Planlanmış görev yok.</p>
              <p className="text-xs text-gray-600">Sağdaki alana düşüncelerini yazarak görev ekle.</p>
            </div>
          )}
        </div>

        {/* Sağ: AI Analiz (Genişlik: 3/5) */}
        <div className="lg:col-span-3 space-y-4 flex flex-col h-full">
          <div className="glass-card p-6 flex-1 flex flex-col">
            <h2 className="text-base font-semibold text-anthracite mb-3 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-secondary" />
              Düşüncelerini Analiz Et
            </h2>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full flex-1 min-h-[180px] bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-anthracite placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 resize-none transition-all"
              placeholder="Örn: Bugün bitirmem gereken 3 rapor var. Sunum en acil olanı."
            />
            <button
              onClick={handleAnalyze}
              disabled={!text.trim() || analyzing}
              className="w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 shadow-md"
            >
              {analyzing ? 'Analiz Ediliyor...' : 'Görevleri Çıkar'}
            </button>
          </div>

          {/* Çıkarılan görevler */}
          {extractedTasks.length > 0 && (
            <div className="glass-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-anthracite">Çıkarılan Görevler</h3>
                <button
                  onClick={handleSaveAll}
                  disabled={saving || saved}
                  className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${saved ? 'bg-green-500 text-white' : 'bg-primary text-white hover:opacity-90'
                    }`}
                >
                  {saved
                    ? <><CheckIcon className="w-3 h-3" /> Eklendi!</>
                    : <><PlusIcon className="w-3 h-3" /> Tümünü Ekle</>}
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {extractedTasks.map((task, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-primary font-bold">{task.title}</p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-gray-500">⏱ {task.estimated_duration} dk</span>
                        {task.deadline && !isNaN(new Date(task.deadline).getTime()) && (
                          <span className="text-xs text-primary flex items-center gap-0.5">
                            <ClockIcon className="w-3 h-3" />
                            {new Date(task.deadline).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        {task.assigned_to ? (
                          <span className="text-xs text-secondary">👤 {task.assigned_to} · İşler</span>
                        ) : (
                          <span className="text-xs text-gray-600">Görevlerim</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSaveOne(idx)}
                      className="flex-shrink-0 px-2 py-1 text-[10px] font-bold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      + Ekle
                    </button>
                  </div>
                ))}
              </div>

              {insights && (
                <p className="text-xs text-gray-400 italic border-l-2 border-primary/30 pl-3 mt-2">
                  {insights}
                </p>
              )}

              {saved && (
                <button
                  onClick={() => navigate('/tasks')}
                  className="text-xs text-primary hover:underline font-bold w-full text-center"
                >
                  Tüm Görevleri Görüntüle →
                </button>
              )}
            </div>
          )}

          {hasAnalyzed && !analyzing && extractedTasks.length === 0 && (
            <div className="glass-card p-5 text-center">
              <p className="text-sm text-gray-400">Bu metinden görev çıkarılamadı. Daha detaylı yazmayı deneyin.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AIPlanner;
