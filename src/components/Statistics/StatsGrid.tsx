import { Ship, Activity, AlertTriangle, Target, TrendingUp, Database } from 'lucide-react';
import StatsCard from './StatsCard';
import { Statistics } from '../../types';

interface StatsGridProps {
  statistics: Statistics;
}

export default function StatsGrid({ statistics }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <StatsCard
        title="Total Vessels"
        value={statistics.totalVessels.toLocaleString()}
        subtitle="Tracked in system"
        icon={Ship}
        iconColor="text-blue-600"
      />
      <StatsCard
        title="Active Vessels"
        value={statistics.activeVessels}
        subtitle="Pings in the last 24h of the dataset"
        icon={Activity}
        iconColor="text-green-600"
      />
      <StatsCard
        title="Anomalies Detected"
        value={statistics.anomaliesDetected}
        subtitle="Vessels above MSE threshold (last window)"
        icon={AlertTriangle}
        iconColor="text-red-600"
      />
      <StatsCard
        title="Model Accuracy"
        value={`${statistics.accuracy}%`}
        subtitle="Detection accuracy"
        icon={Target}
        iconColor="text-purple-600"
      />
      <StatsCard
        title="Precision"
        value={`${statistics.precision}%`}
        subtitle="True positive rate"
        icon={TrendingUp}
        iconColor="text-indigo-600"
      />
      <StatsCard
        title="Recall"
        value={`${statistics.recall}%`}
        subtitle="Detection rate"
        icon={Target}
        iconColor="text-cyan-600"
      />
      <StatsCard
        title="F1-Score"
        value={`${statistics.f1Score}%`}
        subtitle="Overall performance"
        icon={TrendingUp}
        iconColor="text-teal-600"
      />
      <StatsCard
        title="AIS ping rows"
        value={
          statistics.totalRecords >= 1_000_000
            ? `${(statistics.totalRecords / 1_000_000).toFixed(2)}M`
            : statistics.totalRecords.toLocaleString()
        }
        subtitle={`${statistics.trainingSequences.toLocaleString()} windows (len 30, stride 5)`}
        icon={Database}
        iconColor="text-gray-600"
      />
    </div>
  );
}