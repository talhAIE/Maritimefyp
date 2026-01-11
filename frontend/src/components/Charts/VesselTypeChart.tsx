import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { VesselTypeData } from '../../types';

interface VesselTypeChartProps {
  data: VesselTypeData[];
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export default function VesselTypeChart({ data }: VesselTypeChartProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Vessel Type Distribution</h3>
        <p className="text-sm text-gray-600 mt-1">Breakdown by vessel category</p>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ typeName, percentage }) => `${typeName}: ${percentage.toFixed(1)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            formatter={(value: number, name: string, props: any) => [
              `${value.toLocaleString()} (${props.payload.percentage.toFixed(1)}%)`,
              props.payload.typeName
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}