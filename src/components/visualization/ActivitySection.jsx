import React, { useMemo, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ActivitySection = ({ commitFrequency, recentCommits, contributors, participation }) => {
  // Add debug logging
  useEffect(() => {
    console.log('Participation:', participation);
    console.log('Commit Frequency:', commitFrequency);
  }, [participation, commitFrequency]);

  // Format commit data with better scaling and processing
  const commitData = useMemo(() => {
    // First try participation data
    if (participation?.all?.length > 0) {
      const maxCommits = Math.max(...participation.all);
      const scaleFactor = maxCommits < 10 ? 50 : maxCommits < 50 ? 20 : 10;
      
      return participation.all.map((count, index) => {
        const owner = participation.owner?.[index] || 0;
        const community = count - owner;
        
        return {
          week: `W${index + 1}`,
          total: count * scaleFactor,
          owner: owner * scaleFactor,
          community: community * scaleFactor,
          originalTotal: count,
          originalOwner: owner,
          originalCommunity: community
        };
      });
    }
    // Fallback to commit frequency if participation is not available
    else if (commitFrequency?.length > 0) {
      return commitFrequency.map((count, index) => ({
        week: `W${index + 1}`,
        total: count * 10,
        community: count * 10,
        originalTotal: count,
        originalCommunity: count
      }));
    }
    
    // If no data is available, return empty array
    return [];
  }, [participation, commitFrequency]);

  if (commitData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Commit Activity
        </h3>
        <p className="text-gray-500 dark:text-gray-400">No commit data available</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white mb-2">Week {label}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {payload[0].payload.originalTotal} commits
              </span>
            </div>
            {payload[0].payload.originalOwner !== undefined && (
              <>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-blue-600 dark:text-blue-400">Owner:</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {payload[0].payload.originalOwner} commits
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-green-600 dark:text-green-400">Community:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {payload[0].payload.originalCommunity} commits
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const totalCommits = commitData.reduce((sum, week) => sum + week.originalTotal, 0);
  const activeWeeks = commitData.filter(week => week.originalTotal > 0).length;
  const avgWeeklyCommits = Math.round(totalCommits / activeWeeks);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Commit Activity (Last {commitData.length} Weeks)
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={commitData}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorOwner" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="colorCommunity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="week"
                interval={4}
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#9CA3AF' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#9CA3AF' }}
                label={{ 
                  value: 'Commits', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: '#6B7280' }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36}
                wrapperStyle={{ paddingBottom: '20px' }}
              />
              <Area
                type="monotone"
                dataKey="community"
                stackId="1"
                stroke="#22c55e"
                fill="url(#colorCommunity)"
                name="Community Commits"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="owner"
                stackId="1"
                stroke="#3b82f6"
                fill="url(#colorOwner)"
                name="Owner Commits"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Commits</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
              {totalCommits.toLocaleString()}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400">Active Weeks</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
              {activeWeeks}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Weekly</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
              {avgWeeklyCommits}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitySection;