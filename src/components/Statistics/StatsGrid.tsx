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
        subtitle="Currently monitored"
        icon={Activity}
        iconColor="text-green-600"
        trend={{ value: 5.2, label: "vs last hour", isPositive: true }}
      />
      <StatsCard
        title="Anomalies Detected"
        value={statistics.anomaliesDetected}
        subtitle="Flagged today"
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
        title="Training Data"
        value={`${(statistics.totalRecords / 1000000).toFixed(1)}M`}
        subtitle={`${statistics.trainingSequences.toLocaleString()} sequences`}
        icon={Database}
        iconColor="text-gray-600"
      />
    </div>
  );
}