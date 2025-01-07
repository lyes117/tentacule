import React from 'react';
import { Card } from '../ui/Card';
import { metricsService } from '../../lib/metricsService';

export default function MetricsOverview({ metrics }) {
  if (!metrics) return null;

  const metricCards = [
    {
      title: "Chiffre d'affaires",
      value: metrics.revenue?.value || 0,
      unit: 'EUR',
      change: metrics.revenue?.change,
      trend: metrics.revenue?.trend,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Clients actifs",
      value: metrics.active_clients?.value || 0,
      unit: 'count',
      change: metrics.active_clients?.change,
      trend: metrics.active_clients?.trend,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      title: "Tâches en cours",
      value: metrics.pending_tasks?.value || 0,
      unit: 'count',
      change: metrics.pending_tasks?.change,
      trend: metrics.pending_tasks?.trend,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    {
      title: "Factures impayées",
      value: metrics.pending_invoices?.value || 0,
      unit: 'EUR',
      change: metrics.pending_invoices?.change,
      trend: metrics.pending_invoices?.trend,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((card, index) => (
        <Card key={index} className="p-6 hover:border-purple-500/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-400">{card.title}</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {metricsService.formatMetricValue(card.value, card.unit)}
              </p>
              {card.change && (
                <p className={`mt-2 flex items-center text-sm ${
                  card.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  <span>{card.trend === 'up' ? '↑' : '↓'}</span>
                  <span className="ml-1">{Math.abs(card.change)}%</span>
                </p>
              )}
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 text-purple-400">
              {card.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
