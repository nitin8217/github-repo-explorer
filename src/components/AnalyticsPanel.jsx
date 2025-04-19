import React, { useEffect, useState } from 'react';
import { Clock, Users, Code, GitCommit, Eye, AlertTriangle, Award } from 'lucide-react';
import { analyzeCodeQuality, generateDocSuggestions } from '../utils/analytics';
import { motion } from 'framer-motion';

const ScoreCard = ({ score, rating, suggestions }) => {
  const getScoreColor = () => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          Repository Score
        </h3>
        <motion.div 
          className={`text-3xl font-bold ${getScoreColor()}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
        >
          {score}/100
        </motion.div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Rating:
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            rating === 'Excellent' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            rating === 'Good' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
            rating === 'Fair' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {rating}
          </span>
        </div>

        {suggestions.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Improvement Suggestions:
            </h4>
            <ul className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {suggestion}
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const AnalyticsPanel = ({ repo, octokit }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [contributors, participation, languages, issues] = await Promise.all([
          octokit.repos.listContributors({
            owner: repo.owner.login,
            repo: repo.name,
            per_page: 100
          }),
          octokit.repos.getParticipationStats({
            owner: repo.owner.login,
            repo: repo.name
          }),
          octokit.repos.listLanguages({
            owner: repo.owner.login,
            repo: repo.name
          }),
          octokit.issues.listForRepo({
            owner: repo.owner.login,
            repo: repo.name,
            state: 'open',
            per_page: 100
          })
        ]);

        setAnalytics({
          contributors: contributors.data.length,
          recentCommits: participation.data?.all?.slice(-4).reduce((a, b) => a + b, 0) || 0,
          languages: languages.data,
          openIssues: issues.data.length,
          activity: {
            commits: participation.data?.all || [],
            contributors: contributors.data.slice(0, 5)
          }
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [repo.owner.login, repo.name, octokit]);

  const repoScore = analyzeCodeQuality(repo);
  const docSuggestions = generateDocSuggestions(repo);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
        <p>Error loading analytics: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ScoreCard 
        score={repoScore.score}
        rating={repoScore.rating}
        suggestions={docSuggestions}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-500" />
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Contributors
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {analytics?.contributors}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <GitCommit className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Recent Commits
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {analytics?.recentCommits}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-purple-500" />
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Watchers
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {repo.watchers_count}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Open Issues
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {analytics?.openIssues}
              </div>
            </div>
          </div>
        </div>
      </div>

      {analytics?.activity?.contributors.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Top Contributors
          </h3>
          <div className="flex flex-wrap gap-3">
            {analytics.activity.contributors.map((contributor) => (
              <a
                key={contributor.id}
                href={contributor.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <img
                  src={contributor.avatar_url}
                  alt={contributor.login}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {contributor.login}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPanel;