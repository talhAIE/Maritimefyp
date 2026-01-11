import StatsGrid from '../Statistics/StatsGrid';
import SpeedDistributionChart from '../Charts/SpeedDistributionChart';
import CourseDistributionChart from '../Charts/CourseDistributionChart';
import VesselTypeChart from '../Charts/VesselTypeChart';
import AnomalyTimelineChart from '../Charts/AnomalyTimelineChart';
import AlertsTable from '../Tables/AlertsTable';
import { 
  mockStatistics, 
  speedDistribution, 
  courseDistribution, 
  vesselTypeData, 
  timeSeriesData,
  mockAlerts 
} from '../../data/mockData';

export default function DashboardView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Real-time monitoring and statistics</p>
      </div>
      
      <StatsGrid statistics={mockStatistics} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpeedDistributionChart data={speedDistribution} />
        <CourseDistributionChart data={courseDistribution} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VesselTypeChart data={vesselTypeData} />
        <AnomalyTimelineChart data={timeSeriesData} />
      </div>
      
      <AlertsTable alerts={mockAlerts.slice(0, 10)} />
    </div>
  );
}