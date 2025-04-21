import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, GitFork, Eye, Users, Image as ImageIcon, ExternalLink, Sparkles } from "lucide-react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import RepoInsights from './RepoInsights';

const RepoImage = ({ repo }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fallbackImage = (
    <div className="flex items-center justify-center w-full h-36 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <div className="text-center">
        <ImageIcon className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {repo.name}
        </span>
      </div>
    </div>
  );

  if (imageError) return fallbackImage;

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
      )}
      <img
        src={`https://opengraph.githubassets.com/1/${repo.full_name}`}
        alt={repo.name}
        className={`w-full h-40 object-cover transition-opacity duration-300 rounded-t-2xl ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onError={() => setImageError(true)}
        onLoad={() => setIsLoading(false)}
      />
    </>
  );
};

const RepoCard = ({ repo, onReadmeClick, onVisualizationClick }) => {
  const [showInsights, setShowInsights] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4,
        ease: [0.645, 0.045, 0.355, 1.000]
      }}
      className="group flex flex-col bg-white/70 dark:bg-gray-800/70 backdrop-blur p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700 h-[550px]"
    >
      <div className="relative h-40 -mx-6 -mt-6 mb-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80 z-10 rounded-t-2xl" />
        <RepoImage repo={repo} />
        <div className="absolute bottom-4 left-6 right-6 z-20 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white line-clamp-1">
            {repo.name}
          </h2>
          <button
            onClick={() => setShowInsights(true)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
            title="View AI Insights"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
            {repo.language || 'Unknown'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Updated {new Date(repo.updated_at).toLocaleDateString()}
          </span>
        </div>

        {repo.description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed overflow-hidden text-ellipsis line-clamp-3">
            {repo.description}
          </p>
        )}

        {repo.topics?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {repo.topics.slice(0, 4).map((topic) => (
              <span
                key={topic}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full"
              >
                {topic}
              </span>
            ))}
            {repo.topics.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full">
                +{repo.topics.length - 4} more
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mt-auto mb-6 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div className="flex flex-col items-center">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {repo.stargazers_count}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Stars</span>
          </div>
          <div className="flex flex-col items-center">
            <GitFork className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {repo.forks_count}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Forks</span>
          </div>
          <div className="flex flex-col items-center">
            <Users className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {repo.contributors_count || "N/A"}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Contributors</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => onVisualizationClick?.(repo)}
            className="w-full px-4 py-2 text-sm font-medium rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Analytics
          </button>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-800 text-white text-sm hover:bg-gray-900 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Repo
            </a>
            <button
              onClick={() => onReadmeClick(repo.owner.login, repo.name)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            >
              <DocumentTextIcon className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
              README
            </button>
          </div>

          {repo.homepage && (
            <a
              href={repo.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl 
                bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600
                text-white text-sm font-medium shadow-lg hover:shadow-xl
                transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 
                group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />
              <div className="relative flex items-center gap-2">
                <svg 
                  className="w-4 h-4 animate-pulse" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                    fill="currentColor"
                  />
                </svg>
                <span>Live Demo</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          )}
        </div>
      </div>

      <RepoInsights
        repo={repo}
        isOpen={showInsights}
        onClose={() => setShowInsights(false)}
      />
    </motion.div>
  );
};

export default RepoCard;