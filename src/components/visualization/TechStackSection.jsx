import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Code } from 'lucide-react';

const TechStackSection = ({ languages, topics }) => {
  // Format language data and calculate percentages
  const languageData = useMemo(() => {
    if (!languages) return [];
    
    const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
    return Object.entries(languages)
      .map(([name, bytes]) => ({
        name,
        value: bytes,
        percentage: ((bytes / total) * 100).toFixed(1)
      }))
      .sort((a, b) => b.value - a.value); // Sort by size descending
  }, [languages]);

  const COLORS = [
    '#3b82f6', // blue
    '#22c55e', // green
    '#f59e0b', // yellow
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
    '#6366f1', // indigo
    '#84cc16'  // lime
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">{data.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {data.percentage}% ({(data.value / 1024).toFixed(2)} KB)
          </p>
        </div>
      );
    }
    return null;
  };

  if (languageData.length === 0 && (!topics || topics.length === 0)) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl">
        <div className="flex flex-col items-center justify-center py-12">
          <Code className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Tech Stack Data
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
            This repository doesn't have any language or topic information available.
            The repository might be empty or the data is still being analyzed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {languageData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Languages
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={languageData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    labelLine={true}
                  >
                    {languageData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center">
              <div className="space-y-2">
                {languageData.map((lang, index) => (
                  <div key={lang.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {lang.name}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                      {lang.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {topics?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {topics.map(topic => (
              <span
                key={topic}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TechStackSection;