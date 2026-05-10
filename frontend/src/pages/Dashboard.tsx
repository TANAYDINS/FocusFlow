import AIDailyBriefing from '../components/dashboard/AIDailyBriefing';
import PriorityTasks from '../components/dashboard/PriorityTasks';
import FocusTimeline from '../components/dashboard/FocusTimeline';
import BurnoutWidget from '../components/dashboard/BurnoutWidget';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AIDailyBriefing />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PriorityTasks />
            <BurnoutWidget />
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <FocusTimeline />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
