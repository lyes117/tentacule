import React from 'react';
import { Card } from '../ui/Card';
import { metricsService } from '../../lib/metricsService';

export default function MetricsTable({ metrics }) {
  if (!metrics || metrics.length === 0) {
    return (
      <Card>
        <div className="p-4 text-center text-gray-400">
          Aucune donnée disponible
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Métrique
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Valeur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {metrics.map((metric) => (
              <tr key={metric.id} className="hover:bg-gray-800/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-white">
                    {metric.metrics_definitions.display_name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-white">
                    {metricsService.formatMetricValue(
                      metric.value,
                      metric.metrics_definitions.unit
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-400">
                    {new Date(metric.timestamp).toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
