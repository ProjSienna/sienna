import React from 'react';

const StatsCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600 text-sm">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </div>
  );
};

export default StatsCard; 