import React from 'react';
import { Card } from '../ui/Card';
import { metricsService } from '../../lib/metricsService';

export default function MetricsSummary({ metrics, category }) {
  if (!metrics || metrics.length === 0) {
    return null;
  }

  const latestMetrics = metrics.reduce((acc, metric) => {
    if (!acc[metric.metric_name] || new Date(metric.timestamp) > new Date(acc[metric.metric_name].timestamp)) {
      acc[metric.metric_name] = metric;
    }
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.values(latestMetrics).map((metric) => (
        <Card key={metric.metric_name} className="p-4">
          <h4 className="text-sm font-medium text-gray-400">
            {metric.metrics_definitions.display_name}
          </h4>
          <p className="mt-2 text-xl font-semibold text-white">
            {metricsService.formatMetricValue(
              metric.value,
              metric.metrics_definitions.unit
            )}
          </p>
        </Card>
      ))}
    </div>
  );
}
