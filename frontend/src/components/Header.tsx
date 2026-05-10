import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Header = () => {
  return (
    <header className="h-20 px-8 flex items-center justify-between">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl leading-5 bg-transparent placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-white/10 transition-all sm:text-sm text-white"
            placeholder="Ask AI to schedule a task or find something..."
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4 ml-6">
        <button className="relative p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
          <BellIcon className="h-5 w-5 text-gray-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full"></span>
        </button>
        <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 text-primary font-medium hover:from-primary/30 hover:to-secondary/30 transition-all text-sm">
          + New Task
        </button>
      </div>
    </header>
  );
};

export default Header;
