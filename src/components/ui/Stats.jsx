import React from 'react';
import { Card } from './Card';

export function StatCard({ title, value, change, icon }) {
  const isPositive = change && parseFloat(change) > 0;
  
  return (
    <Card hover className="relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        </div>
        <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 text-purple-400">
          {icon}
        </div>
      </div>
      
      {change && (
        <div className="mt-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
            isPositive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
          }`}>
            {isPositive ? '↑' : '↓'} {change}
          </span>
        </div>
      )}
    </Card>
  );
}
