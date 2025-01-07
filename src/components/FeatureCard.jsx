import React from 'react';

export default function FeatureCard({ icon, title, description }) {
  return (
    <div className="cosmic-card p-6 rounded-2xl floating group">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-purple-500/20 group-hover:bg-purple-500/30 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}
