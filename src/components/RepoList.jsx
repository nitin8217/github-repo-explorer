import React from "react";
import { motion } from "framer-motion";

function RepoList({ repos, loading }) {
  if (loading) {
    // Skeleton Loader
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {[...Array(6)].map((_, idx) => (
          <div
            key={idx}
            className="animate-pulse bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
          >
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6 mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
      {repos.map((repo) => (
        <motion.div
          key={repo.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
            {repo.name}
          </h2>

          {repo.description && (
            <p className="text-gray-600 dark:text-gray-300 mb-3 overflow-hidden text-ellipsis line-clamp-3">
              {repo.description}
            </p>
          )}

          {repo.topics && repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {repo.topics.map((topic) => (
                <span
                  key={topic}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-gray-600 dark:text-gray-300">
            <span>⭐ {repo.stargazers_count}</span>
            <span>🍴 {repo.forks_count}</span>
            <span>💻 {repo.language || "N/A"}</span>
            <span>👀 {repo.watchers_count}</span>
            <span>👥 {repo.contributors_count || "N/A"} Contributors</span>
            <span>🐞 {repo.open_issues_count} Issues</span>
          </div>

          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-blue-500 hover:underline font-medium"
          >
            View Repo →
          </a>
        </motion.div>
      ))}
    </div>
  );
}

export default RepoList;
