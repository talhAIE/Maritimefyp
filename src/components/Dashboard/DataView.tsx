import VesselsTable from '../Tables/VesselsTable';
import StatsGrid from '../Statistics/StatsGrid';
import { mockVessels, mockStatistics } from '../../data/mockData';
import { Database, FileText, Download } from 'lucide-react';

export default function DataView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Training Data</h2>
        <p className="text-gray-600">Dataset information and vessel records</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Training Dataset</p>
            <p className="text-2xl font-bold text-gray-900">5.06M</p>
            <p className="text-sm text-gray-500 mt-1">Total records</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Training Sequences</p>
            <p className="text-2xl font-bold text-gray-900">1.01M</p>
            <p className="text-sm text-gray-500 mt-1">Sequences generated</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Database className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Unique Vessels</p>
            <p className="text-2xl font-bold text-gray-900">912</p>
            <p className="text-sm text-gray-500 mt-1">Vessels tracked</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <StatsGrid statistics={mockStatistics} />
      </div>

      <VesselsTable vessels={mockVessels} maxVessels={100} />
    </div>
  );
}