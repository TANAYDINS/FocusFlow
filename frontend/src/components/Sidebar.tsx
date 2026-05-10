import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  ClipboardDocumentCheckIcon, 
  SparklesIcon, 
  ChartBarIcon, 
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: HomeIcon },
    { name: 'Tasks', path: '/tasks', icon: ClipboardDocumentCheckIcon },
    { name: 'AI Planner', path: '/planner', icon: SparklesIcon },
    { name: 'Analytics', path: '/analytics', icon: ChartBarIcon },
    { name: 'Settings', path: '/settings', icon: Cog6ToothIcon },
  ];

  return (
    <aside className="w-64 glass-card m-4 mr-0 flex flex-col h-[calc(100vh-2rem)] relative z-10">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
          <SparklesIcon className="w-6 h-6 text-background" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-gradient">FocusFlow</h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden ${
                isActive ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent border-l-2 border-primary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                <item.icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-primary' : 'group-hover:text-primary transition-colors'}`} />
                <span className="font-medium relative z-10">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0"></div>
          <div>
            <p className="text-sm font-medium text-white">John Doe</p>
            <p className="text-xs text-gray-400">Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
