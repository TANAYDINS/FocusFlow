import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { scheduleApi, taskApi } from '../../api/client';

const FocusTimeline = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const firstLoad = useRef(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      // Generate (POST) on first load so schedule is always populated;
      // subsequent 30-second ticks just read (GET) without mutating.
      const schedPromise = firstLoad.current
        ? scheduleApi.generateSchedule()
        : scheduleApi.getSchedule();
      firstLoad.current = false;
      try {
        const [schedRes, tasksRes] = await Promise.all([
          schedPromise,
          taskApi.getTasks(),
        ]);
        const scheduleData = Array.isArray(schedRes.data) ? schedRes.data : [];
        const tasksList = Array.isArray(tasksRes.data) ? tasksRes.data : [];
        const tasksMap = tasksList.reduce((acc: any, task: any) => {
          acc[task.id] = task;
          return acc;
        }, {});

        const today = new Date();

        const formattedEvents = scheduleData
          .map((item: any) => {
            const task = tasksMap[item.task_id];
            const startDate = new Date(item.start_time);
            const isToday = startDate.toDateString() === today.toDateString();
            return {
              startDate,
              timeLabel: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              dateLabel: isToday
                ? null
                : startDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
              label: task ? task.title : 'Odak Seansı',
              type: task && task.priority_score > 70 ? 'focus' : 'task',
              status: task ? task.status : 'pending',
            };
          })
          .sort((a: any, b: any) => a.startDate.getTime() - b.startDate.getTime());

        setEvents(formattedEvents);
      } catch (error) {
        console.error("Error fetching timeline", error);
      }
      setLoading(false);
    };

    fetchTimeline();
    const interval = setInterval(fetchTimeline, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-6 h-full min-h-[400px]"
    >
      <h2 className="text-lg font-semibold text-anthracite mb-6">Bugünkü Akış</h2>

      {loading ? (
        <p className="text-sm text-gray-500">Akışınız hesaplanıyor...</p>
      ) : events.length > 0 ? (
        <div className="relative border-l border-primary/20 ml-3 space-y-8 pb-4">
          {events.map((event, idx) => (
            <div key={idx} className="relative pl-6">
              <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ${
                event.status === 'completed' ? 'bg-green-500' :
                event.type === 'focus' ? 'bg-secondary shadow-[0_0_10px_rgba(232,197,200,0.5)]' :
                'bg-primary'
              }`} />
              <div className="flex flex-col">
                {event.dateLabel && (
                  <span className="text-[10px] text-primary/70 font-medium mb-0.5">{event.dateLabel}</span>
                )}
                <span className="text-xs text-gray-400 mb-1">{event.timeLabel}</span>
                <span className={`text-sm font-medium ${
                  event.status === 'completed'
                    ? 'line-through text-anthracite/40'
                    : event.type === 'focus' ? 'text-anthracite' : 'text-anthracite/70'
                }`}>
                  {event.label}
                  {event.status === 'completed' && ' ✓'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">Bugün için planlanmış görev yok. Akışı görmek için görev ekleyin!</p>
      )}
    </motion.div>
  );
};

export default FocusTimeline;
