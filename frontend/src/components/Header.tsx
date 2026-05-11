import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import TaskModal from './TaskModal';

const Header = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/tasks?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <header className="h-16 px-6 bg-white border-b border-border flex items-center justify-between gap-4 sticky top-0 z-10">
      <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Görev ara…"
          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-border rounded-xl text-sm text-dark placeholder-slate-400 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
        />
      </form>

      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-primary/20 whitespace-nowrap"
      >
        <PlusIcon className="w-4 h-4" />
        Yeni Görev
      </button>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskCreated={() => navigate('/tasks')}
      />
    </header>
  );
};

export default Header;
