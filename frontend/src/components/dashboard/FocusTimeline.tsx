import { motion } from 'framer-motion';

const FocusTimeline = () => {
  const events = [
    { time: '09:00', label: 'Presentation Work', type: 'focus' },
    { time: '11:00', label: 'Emails', type: 'task' },
    { time: '12:00', label: 'Lunch Break', type: 'break' },
    { time: '14:00', label: 'Team Meeting', type: 'meeting' },
    { time: '15:30', label: 'API Review', type: 'focus' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-6 h-full"
    >
      <h2 className="text-lg font-semibold text-white mb-6">Today's Flow</h2>
      
      <div className="relative border-l border-white/10 ml-3 space-y-8 pb-4">
        {events.map((event, idx) => (
          <div key={idx} className="relative pl-6">
            <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ${
              event.type === 'focus' ? 'bg-primary shadow-[0_0_10px_rgba(69,243,255,0.5)]' :
              event.type === 'meeting' ? 'bg-secondary' :
              event.type === 'break' ? 'bg-green-400' : 'bg-gray-400'
            }`}></div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 mb-1">{event.time}</span>
              <span className={`text-sm font-medium ${event.type === 'focus' ? 'text-white' : 'text-gray-300'}`}>
                {event.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default FocusTimeline;
