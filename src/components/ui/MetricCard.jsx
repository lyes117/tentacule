import React from 'react';
import { Card } from './Card';
import { metricsService } from '../../lib/metricsService';

export default function MetricCard({
  title,
  value,
  unit,
  change,
  trend,
  icon,
  loading = false
}) {
  if (loading) {
    return (
      <Card>
        <div className="animate-pulse p-6">
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-700 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 hover:border-purple-500/30 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-400">{title}</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-white">
              {metricsService.formatMetricValue(value, unit)}
            </p>
            {change && (
              <p className={`ml-2 flex items-center text-sm ${
                trend === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                <span>{trend === 'up' ? '↑' : '↓'}</span>
                <span className="ml-1">{Math.abs(change)}%</span>
              </p>
            )}
          </div>
        </div>
        {icon && (
          <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 text-purple-400">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
