import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import AIPlanner from './pages/AIPlanner';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Workflow from './pages/Workflow';
import AIAssistant from './pages/AIAssistant';
import FocusOverlay from './components/FocusOverlay';

function App() {
  const [focusMode, setFocusMode] = useState({ isOpen: false, taskTitle: '', duration: 25 });
  const startFocus = (title: string, duration = 25) => setFocusMode({ isOpen: true, taskTitle: title, duration });

  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/"          element={<Dashboard onStartFocus={startFocus} />} />
              <Route path="/tasks"     element={<Tasks onStartFocus={startFocus} />} />
              <Route path="/planner"   element={<AIPlanner />} />
              <Route path="/workflow"  element={<Workflow />} />
              <Route path="/assistant" element={<AIAssistant />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings"  element={<Settings />} />
            </Routes>
          </main>
        </div>
        <FocusOverlay
          isOpen={focusMode.isOpen}
          onClose={() => setFocusMode({ ...focusMode, isOpen: false })}
          taskTitle={focusMode.taskTitle}
          durationMinutes={focusMode.duration}
        />
      </div>
    </Router>
  );
}

export default App;
