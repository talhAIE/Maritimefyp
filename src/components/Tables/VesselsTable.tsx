import { Ship, Navigation, Gauge, Clock } from 'lucide-react';
import { Vessel } from '../../types';
import { format } from 'date-fns';

interface VesselsTableProps {
  vessels: Vessel[];
  maxVessels?: number;
}

const VESSEL_TYPE_NAMES: Record<number, string> = {
  30: 'Fishing',
  52: 'Tug',
  60: 'Passenger',
  70: 'Cargo',
  79: 'Cargo',
  80: 'Tanker',
  89: 'Tanker',
  36: 'Pleasure Craft',
  37: 'Pleasure Craft',
};

export default function VesselsTable({ vessels, maxVessels = 50 }: VesselsTableProps) {
  const displayVessels = vessels.slice(0, maxVessels);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Active Vessels</h3>
        <p className="text-sm text-gray-600 mt-1">Currently monitored vessels</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vessel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Speed
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Update
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayVessels.map((vessel) => (
              <tr key={vessel.mmsi} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Ship className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{vessel.mmsi}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {VESSEL_TYPE_NAMES[vessel.vesselType] || `Type ${vessel.vesselType}`}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    <div>{vessel.latitude.toFixed(4)}°N</div>
                    <div>{vessel.longitude.toFixed(4)}°W</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <Gauge className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{vessel.speed.toFixed(1)} kn</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <Navigation className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{vessel.course.toFixed(1)}°</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    vessel.status === 'anomaly'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-green-100 text-green-800 border border-green-200'
                  }`}>
                    {vessel.status === 'anomaly' ? 'ANOMALY' : 'NORMAL'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{format(new Date(vessel.timestamp), 'HH:mm:ss')}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing {displayVessels.length} of {vessels.length} vessels
          </span>
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View All Vessels →
          </button>
        </div>
      </div>
    </div>
  );
}