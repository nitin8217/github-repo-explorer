import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  analyzeCodeQuality, 
  getSimilarRepos, 
  prioritizeIssues,
  generateDocSuggestions,
  analyzePerformance 
} from '../utils/analytics';

const AnalyticsPanel = ({ repo, octokit }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // First, check if we have the required props
        if (!repo || !octokit) {
          throw new Error('Missing required props: repo or octokit client');
        }

        // Set initial analytics with code quality and doc suggestions
        // these don't require API calls
        setAnalytics({
          codeQuality: analyzeCodeQuality(repo),
          docSuggestions: generateDocSuggestions(repo),
          similarRepos: [],
          issues: [],
          performance: {
            commitFrequency: [],
            codeChanges: [],
            suggestions: []
          }
        });

        // Then fetch the rest of the data
        const [similar, issues, performance] = await Promise.all([
          getSimilarRepos(octokit, repo).catch(() => []),
          prioritizeIssues(octokit, repo.owner.login, repo.name).catch(() => []),
          analyzePerformance(octokit, repo.owner.login, repo.name).catch(() => ({
            commitFrequency: [],
            codeChanges: [],
            suggestions: []
          }))
        ]);

        setAnalytics(prev => ({
          ...prev,
          similarRepos: similar,
          issues: issues,
          performance: performance
        }));
      } catch (err) {
        setError(err.message);
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [repo, octokit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4"
      >
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
          Code Quality Score
        </h3>
        <div className="flex items-center gap-2">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {analytics.codeQuality.score}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {analytics.codeQuality.rating}
          </div>
        </div>
      </motion.div>

      {analytics.similarRepos.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4"
        >
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
            Similar Repositories
          </h3>
          <ul className="space-y-2">
            {analytics.similarRepos.map(repo => (
              <li key={repo.id} className="text-sm">
                <a 
                  href={repo.html_url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  {repo.full_name}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {analytics.docSuggestions.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4"
        >
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
            Documentation Suggestions
          </h3>
          <ul className="space-y-2">
            {analytics.docSuggestions.map((suggestion, i) => (
              <li key={i} className="text-sm text-gray-600 dark:text-gray-300">
                • {suggestion}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {analytics.performance.suggestions.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4"
        >
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
            Performance Suggestions
          </h3>
          <ul className="space-y-2">
            {analytics.performance.suggestions.map((suggestion, i) => (
              <li key={i} className="text-sm text-gray-600 dark:text-gray-300">
                • {suggestion}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
};

export default AnalyticsPanel;