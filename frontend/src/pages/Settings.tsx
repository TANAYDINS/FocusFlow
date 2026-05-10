import { motion } from 'framer-motion';

const Settings = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl"
    >
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      <div className="space-y-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">AI Preferences</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Auto-schedule tasks</h3>
                <p className="text-sm text-gray-400">Let AI automatically assign times to new tasks</p>
              </div>
              <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                <div className="w-5 h-5 bg-background rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div>
                <h3 className="text-white font-medium">Burnout Prevention</h3>
                <p className="text-sm text-gray-400">Receive warnings when workload exceeds healthy limits</p>
              </div>
              <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                <div className="w-5 h-5 bg-background rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Integrations</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#229ED9] rounded-lg flex items-center justify-center text-white font-bold">TG</div>
                <div>
                  <h3 className="text-white font-medium">Telegram Bot</h3>
                  <p className="text-xs text-gray-400">Not connected</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors">
                Connect
              </button>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">n8n</div>
                <div>
                  <h3 className="text-white font-medium">n8n Automation</h3>
                  <p className="text-xs text-gray-400">Webhook Ready</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors">
                Configure
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
