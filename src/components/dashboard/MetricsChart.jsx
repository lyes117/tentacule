import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { metricsService } from '../../lib/metricsService';

export default function MetricsChart({ category, title, metrics = [] }) {
  const [selectedMetric, setSelectedMetric] = useState(
    metrics.length > 0 ? metrics[0].metric_name : null
  );

  if (!metrics || metrics.length === 0) {
    return (
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-white mb-4">{title}</h3>
          <div className="h-48 flex items-center justify-center text-gray-400">
            Aucune donnée disponible
          </div>
        </div>
      </Card>
    );
  }

  const metricOptions = [...new Set(metrics.map(m => m.metric_name))];
  const selectedMetricData = metrics.filter(m => m.metric_name === selectedMetric);

  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-white">{title}</h3>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="cosmic-input px-3 py-1 rounded-lg text-sm"
          >
            {metricOptions.map(metric => (
              <option key={metric} value={metric}>
                {metrics.find(m => m.metric_name === metric)?.metrics_definitions?.display_name || metric}
              </option>
            ))}
          </select>
        </div>

        <div className="h-48">
          {selectedMetricData.length > 0 ? (
            <div className="relative h-full">
              {/* Implement your chart here using a library like Chart.js or Recharts */}
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {metricsService.formatMetricValue(
                      selectedMetricData[0].value,
                      selectedMetricData[0].metrics_definitions?.unit
                    )}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    {selectedMetricData[0].metrics_definitions?.display_name}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Aucune donnée disponible pour cette métrique
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
