import React,{useState} from "react";
import { motion } from "framer-motion";
import { Star, GitFork, Eye, Users, Bug, Image as ImageIcon } from "lucide-react";;
import { DocumentTextIcon } from "@heroicons/react/24/outline";
 
function RepoList({ repos, loading, onReadmeClick }) {
  const RepoImage = ({ repo }) => {
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {[...Array(6)].map((_, idx) => (
          <div
            key={idx}
            className="animate-pulse bg-white/70 dark:bg-gray-800/70 p-6 rounded-2xl shadow"
          >
            <div className="h-36 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6 mb-2"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
          </div>
        ))}
      </div>
    );
  }
  
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

    if (imageError) {
      return fallbackImage;
    }

    return (
      <>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
        )}
        <img
          src={`https://opengraph.githubassets.com/1/${repo.full_name}`}
          alt={repo.name}
          className={`rounded-lg w-full h-36 object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onError={() => setImageError(true)}
          onLoad={() => setIsLoading(false)}
        />
      </>
    );
  };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-6xl">
      {repos.map((repo) => (
        <motion.div
          key={repo.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
        >
          {/* Repo image */}
          <div className="relative mb-4">
            <RepoImage repo={repo} />
          </div>

          <h2 className="text-xl font-bold mb-1 text-gray-800 dark:text-white">
            {repo.name}
          </h2>

          <span className="text-xs text-gray-500">
            Updated: {new Date(repo.updated_at).toLocaleDateString()}
          </span>

          {/* Description */}
          {repo.description && (
            <p className="text-gray-600 dark:text-gray-300 mt-2 overflow-hidden text-ellipsis line-clamp-3">
              {repo.description}
            </p>
          )}

          {/* Topics */}
          {repo.topics && repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
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

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-gray-700 dark:text-gray-300">
            <span className="flex items-center gap-1">
              <Star size={16} /> {repo.stargazers_count}
            </span>
            <span className="flex items-center gap-1">
              <GitFork size={16} /> {repo.forks_count}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={16} /> {repo.watchers_count}
            </span>
            <span className="flex items-center gap-1">
              <Users size={16} /> {repo.contributors_count || "N/A"}
            </span>
            <span className="flex items-center gap-1">
              <Bug size={16} /> {repo.open_issues_count}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mt-5">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full bg-gray-800 text-white text-sm hover:bg-gray-900 transition"
            >
              View Repo
            </a>
            <button
              onClick={() => onReadmeClick(repo.owner.login, repo.name)}
              className="px-4 py-2 rounded-full bg-gray-600 text-white text-sm hover:bg-gray-700 transition flex items-center gap-2"
            >
              <DocumentTextIcon className="h-4 w-4" />
              README
            </button>
            {/* Live Demo Button */}
            {repo.homepage && (
              <a
                href={repo.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
              >
                🚀 Live Demo
              </a>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default RepoList;
