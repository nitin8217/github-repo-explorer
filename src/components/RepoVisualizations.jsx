import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  LineChart, 
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  Legend,
  Bar,
  BarChart
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const RepoVisualizations = ({ repo }) => {
  const [activeTab, setActiveTab] = useState('tech');
  const [techData, setTechData] = useState([]);
  const [activityData, setActivityData] = useState([]);

  useEffect(() => {
    // Transform languages data
    if (repo.languages) {
      const languagesData = Object.entries(repo.languages).map(([name, value]) => ({
        name,
        value
      }));
      setTechData(languagesData);
    }

    // Transform activity data
    if (repo.commits) {
      const commitsByMonth = repo.commits.reduce((acc, commit) => {
        const date = new Date(commit.commit.author.date);
        const monthKey = date.toLocaleString('default', { month: 'short' });
        acc[monthKey] = (acc[monthKey] || 0) + 1;
        return acc;
      }, {});

      const activityDataArray = Object.entries(commitsByMonth).map(([name, commits]) => ({
        name,
        commits
      }));
      setActivityData(activityDataArray);
    }
  }, [repo]);

  const tabs = [
    { id: 'tech', label: 'Tech Stack' },
    { id: 'activity', label: 'Activity' },
    { id: 'impact', label: 'Impact' }
  ];

  const renderChart = () => {
    switch (activeTab) {
      case 'tech':
        return techData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={techData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {techData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${(value / 1000).toFixed(1)}k lines`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
            No language data available
          </div>
        );

      case 'activity':
        return activityData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="commits" 
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
            No activity data available
          </div>
        );

      case 'impact':
        if (!repo.impact) {
          return (
            <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
              No impact data available
            </div>
          );
        }
        
        const impactData = [
          { name: 'Stars', value: repo.impact.metrics.stars },
          { name: 'Forks', value: repo.impact.metrics.forks },
          { name: 'Watchers', value: repo.impact.metrics.watchers },
          { name: 'Issues', value: repo.impact.metrics.issues }
        ];

        return (
          <div className="h-[300px] space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
                Impact Score
              </span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {repo.impact.score}
              </span>
            </div>
            
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={impactData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="value" 
                  fill="#3B82F6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 shadow-lg">
      <div className="flex space-x-2 mb-4 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderChart()}
    </div>
  );
};

export default RepoVisualizations;