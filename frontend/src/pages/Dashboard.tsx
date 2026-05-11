import AIDailyBriefing from '../components/dashboard/AIDailyBriefing';
import PriorityTasks from '../components/dashboard/PriorityTasks';
import FocusTimeline from '../components/dashboard/FocusTimeline';
import KnowledgeHub from '../components/dashboard/KnowledgeHub';

interface DashboardProps {
  onStartFocus: (title: string, duration: number) => void;
}

const Dashboard = ({ onStartFocus }: DashboardProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AIDailyBriefing onStartFocus={onStartFocus} />
          <PriorityTasks onStartFocus={onStartFocus} />
          <KnowledgeHub />
        </div>

        <div className="lg:col-span-1">
          <FocusTimeline />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
