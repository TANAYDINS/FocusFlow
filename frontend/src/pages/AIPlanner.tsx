import { motion } from 'framer-motion';
import { SparklesIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { aiApi } from '../api/client';

const AIPlanner = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);

  const handleGenerate = async () => {
    if (!text) return;
    setLoading(true);
    try {
      const response = await aiApi.analyzeText(text);
      setTasks(response.data.extracted_tasks || []);
    } catch (error) {
      console.error("Error analyzing text", error);
    }
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 shadow-[0_0_30px_rgba(69,243,255,0.2)]">
          <SparklesIcon className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">AI Planner</h1>
        <p className="text-gray-400">Let FocusFlow AI organize your day based on your energy levels and deadlines.</p>
      </div>

      <div className="glass-card p-6 mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">What's on your mind?</label>
        <div className="relative">
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-32 bg-background/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            placeholder="E.g., I need to finish the presentation before Friday and prepare for the client meeting. Also, remind me to call John..."
          ></textarea>
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className={`absolute bottom-4 right-4 px-4 py-2 ${loading ? 'bg-gray-500' : 'bg-gradient-to-r from-primary to-secondary hover:opacity-90'} text-background font-medium rounded-lg shadow-lg transition-opacity`}
          >
            {loading ? 'Analyzing...' : 'Generate Schedule'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDaysIcon className="w-5 h-5 text-secondary" />
            <h2 className="text-lg font-semibold text-white">Suggested Flow</h2>
          </div>
          <div className="space-y-4">
            {tasks.length > 0 ? (
              tasks.map((task, idx) => (
                <div key={idx} className={`p-3 bg-white/5 rounded-lg border border-white/10 border-l-2 ${idx % 2 === 0 ? 'border-l-primary' : 'border-l-secondary'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs ${idx % 2 === 0 ? 'text-primary' : 'text-secondary'}`}>
                      {task.priority} Priority
                    </span>
                    <span className="text-xs text-gray-400">{task.estimated_duration} min</span>
                  </div>
                  <span className="text-sm text-white">{task.title}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">Enter your thoughts above to generate a schedule.</p>
            )}
          </div>
        </div>

        <div className="glass-card p-6 bg-gradient-to-b from-surface to-background/80">
          <h2 className="text-lg font-semibold text-white mb-2">AI Insights</h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            {tasks.length > 0 
              ? `I found ${tasks.length} tasks in your text. Based on your stress levels and deadlines, I've organized them to maximize your focus.` 
              : "I will analyze your workload and suggest the best times to tackle your tasks."}
          </p>
          <button className="text-sm text-primary hover:text-primary/80 transition-colors">
            Adjust preferences →
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AIPlanner;
