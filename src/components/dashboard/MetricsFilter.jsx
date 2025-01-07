import React from 'react';

export default function MetricsFilter({ 
  period, 
  setPeriod, 
  category, 
  setCategory,
  categories 
}) {
  return (
    <div className="flex space-x-4 mb-6">
      <select
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
        className="cosmic-input px-3 py-2 rounded-lg text-sm"
      >
        <option value="daily">Quotidien</option>
        <option value="weekly">Hebdomadaire</option>
        <option value="monthly">Mensuel</option>
      </select>

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="cosmic-input px-3 py-2 rounded-lg text-sm"
      >
        {categories.map(cat => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>
    </div>
  );
}
