import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}

export default function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  iconColor = 'text-primary-600',
  trend 
}: StatsCardProps) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm shadow-slate-900/5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
          <p className="mt-1 truncate text-3xl font-semibold tabular-nums tracking-tight text-slate-900">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs leading-snug text-slate-500">{subtitle}</p>
          )}
          {trend && (
            <div className={`mt-3 flex items-center gap-1 text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{trend.value}%</span>
              <span className="text-gray-500 font-normal">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={`shrink-0 rounded-xl bg-slate-50 p-3 ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}