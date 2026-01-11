import SpeedDistributionChart from '../Charts/SpeedDistributionChart';
import CourseDistributionChart from '../Charts/CourseDistributionChart';
import VesselTypeChart from '../Charts/VesselTypeChart';
import AnomalyTimelineChart from '../Charts/AnomalyTimelineChart';
import { 
  speedDistribution, 
  courseDistribution, 
  vesselTypeData, 
  timeSeriesData 
} from '../../data/mockData';

export default function AnalyticsView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics & Insights</h2>
        <p className="text-gray-600">Detailed analysis of vessel behavior and patterns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpeedDistributionChart data={speedDistribution} />
        <CourseDistributionChart data={courseDistribution} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VesselTypeChart data={vesselTypeData} />
        <AnomalyTimelineChart data={timeSeriesData} />
      </div>
    </div>
  );
}