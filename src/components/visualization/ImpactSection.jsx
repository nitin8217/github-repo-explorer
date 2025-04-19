import React from 'react';
import { Star, GitFork, Eye, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ImpactSection = ({ stars, forks, watchers, issues, contributors, similar }) => {
  const metrics = [
    { name: 'Stars', value: stars, icon: Star, color: '#FFB800' },
    { name: 'Forks', value: forks, icon: GitFork, color: '#0088FE' },
    { name: 'Watchers', value: watchers, icon: Eye, color: '#00C49F' },
    { name: 'Contributors', value: contributors, icon: Users, color: '#FF8042' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map(({ name, value, icon: Icon, color }) => (
          <div key={name} className="bg-white dark:bg-gray-800 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5" style={{ color }} />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {name}
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {value?.toLocaleString() || '0'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {similar?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Similar Repositories
          </h3>
          <div className="space-y-4">
            {similar.map(repo => (
              <a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white">
                  {repo.full_name}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {repo.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpactSection;