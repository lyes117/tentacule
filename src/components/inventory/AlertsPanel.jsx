import React from 'react';
import { inventoryService } from '../../lib/inventoryService';

export default function AlertsPanel({ alerts, onResolve }) {
  const handleResolve = async (alertId) => {
    try {
      await inventoryService.resolveAlert(alertId);
      onResolve();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'low_stock':
        return (
          <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'reorder':
        return (
          <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'low_stock':
        return 'bg-red-500/10 border-red-500/30';
      case 'reorder':
        return 'bg-yellow-500/10 border-yellow-500/30';
      default:
        return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 rounded-lg border ${getAlertColor(alert.alert_type)} flex items-center justify-between`}
        >
          <div className="flex items-center space-x-4">
            {getAlertIcon(alert.alert_type)}
            <div>
              <h3 className="text-white font-medium">
                {alert.item.name}
              </h3>
              <p className="text-sm text-gray-400">
                {alert.message} - Stock actuel: {alert.item.current_stock} {alert.item.unit}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleResolve(alert.id)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Marquer comme résolu
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
