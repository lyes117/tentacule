import React from 'react';

export function Card({ children, className = '', hover = false }) {
  return (
    <div className={`
      cosmic-card p-6 rounded-xl backdrop-blur-lg
      bg-gradient-to-br from-gray-900/50 to-gray-800/50
      border border-gray-700/50
      ${hover ? 'hover:scale-102 hover:border-purple-500/30 transition-all duration-300' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children }) {
  return (
    <h3 className="text-lg font-medium text-white">
      {children}
    </h3>
  );
}
