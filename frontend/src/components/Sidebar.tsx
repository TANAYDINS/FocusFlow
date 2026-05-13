import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  ClipboardDocumentCheckIcon,
  SparklesIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { name: 'Kontrol Paneli', path: '/', icon: HomeIcon },
  { name: 'Görevler', path: '/tasks', icon: ClipboardDocumentCheckIcon },
  { name: 'YZ Planlayıcı', path: '/planner', icon: SparklesIcon },
  { name: 'İş Dağılımı', path: '/workflow', icon: UserGroupIcon },
  { name: 'YZ Asistanı', path: '/assistant', icon: ChatBubbleLeftRightIcon },
  { name: 'Analiz', path: '/analytics', icon: ChartBarIcon },
  { name: 'Ayarlar', path: '/settings', icon: Cog6ToothIcon },
];

const Sidebar = () => (
  <aside className="w-60 bg-white border-r border-border flex flex-col h-screen sticky top-0 z-20">
    {/* Logo */}
    <div className="px-5 py-5 flex items-center gap-3 border-b border-border">
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10 flex-shrink-0">
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4F46E5"/>
            <stop offset="100%" stopColor="#7C3AED"/>
          </linearGradient>
        </defs>
        {/* Background */}
        <rect width="40" height="40" rx="11" fill="url(#logo-grad)"/>
        {/* Focus reticle — 4 corner brackets */}
        <path d="M12 17 L12 12 L17 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M23 12 L28 12 L28 17" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M12 23 L12 28 L17 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M23 28 L28 28 L28 23" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* Center dot */}
        <circle cx="20" cy="20" r="3" fill="white"/>
        {/* AI spark */}
        <circle cx="29" cy="11" r="2" fill="#F59E0B"/>
      </svg>
      <div>
        <span className="text-[15px] font-bold text-dark tracking-tight">FocusFlow</span>
        <span className="block text-[9px] font-bold text-primary tracking-[0.15em] uppercase mt-0.5">AI Asistan</span>
      </div>
    </div>

    {/* Nav */}
    <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
      {navItems.map(({ name, path, icon: Icon }) => (
        <NavLink key={path} to={path} end={path === '/'}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted hover:bg-slate-50 hover:text-dark'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-primary' : 'text-slate-400'}`} style={{width:'1.125rem',height:'1.125rem'}} />
              {name}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
