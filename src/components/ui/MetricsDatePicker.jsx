import React from 'react';

export default function MetricsDatePicker({ startDate, endDate, onStartDateChange, onEndDateChange }) {
  return (
    <div className="flex items-center space-x-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          Date de début
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="cosmic-input px-3 py-2 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          Date de fin
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="cosmic-input px-3 py-2 rounded-lg"
        />
      </div>
    </div>
  );
}
