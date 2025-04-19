import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Star, GitFork, Eye, Users, Bug, Image as ImageIcon, ExternalLink } from "lucide-react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import VisualizationModal from './VisualizationModal';


function RepoList({ repos, loading, onReadmeClick, octokit }) {
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
          className={`w-full h-40 object-cover transition-opacity duration-300 rounded-t-2xl ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onError={() => setImageError(true)}
          onLoad={() => setIsLoading(false)}
        />
      </>
    );
  };

  
  const [isVisualizationOpen, setIsVisualizationOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  const handleVisualizationToggle = useCallback(async (repo) => {
    try {
      // Fetch additional data if needed before showing visualization
      const [languages, commits] = await Promise.all([
        octokit.repos.listLanguages({ owner: repo.owner.login, repo: repo.name }),
        octokit.repos.listCommits({ owner: repo.owner.login, repo: repo.name })
      ]);

      setSelectedRepo({
        ...repo,
        languages: languages.data,
        commits: commits.data
      });
      setIsVisualizationOpen(true);
    } catch (error) {
      console.error('Error fetching repo data:', error);
      // Show modal anyway with basic data
      setSelectedRepo(repo);
      setIsVisualizationOpen(true);
    }
  }, [octokit]);

  console.log('Selected Repo:', selectedRepo);
  console.log('Modal Open:', isVisualizationOpen);

  const filteredRepos = selectedLanguages.length > 0
    ? repos.filter(repo => repo.language && selectedLanguages.includes(repo.language))
    : repos;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-7xl">
        {[...Array(6)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: index * 0.1 }}
            className="flex flex-col bg-white/70 dark:bg-gray-800/70 backdrop-blur p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 h-[550px]"
          >
            <div className="animate-pulse">
              <div className="h-40 -mx-6 -mt-6 mb-6 bg-gray-200 dark:bg-gray-700 rounded-t-2xl" />
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-5/6" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-4/6" />
                </div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
                </div>
                <div className="grid grid-cols-3 gap-3 mt-auto">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center space-y-2">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-12" />
                    </div>
                  ))}
                </div>
                <div className="space-y-3 mt-6">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <>
      


      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-7xl">
        {filteredRepos.map((repo, index) => (
          <motion.div
            key={repo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.1,
              ease: [0.645, 0.045, 0.355, 1.000]
            }}
            className="group flex flex-col bg-white/70 dark:bg-gray-800/70 backdrop-blur p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700 h-[550px]"
          >
            <div className="relative h-40 -mx-6 -mt-6 mb-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80 z-10 rounded-t-2xl" />
              <RepoImage repo={repo} />
              <h2 className="absolute bottom-4 left-6 right-6 text-xl font-bold text-white z-20 line-clamp-1">
                {repo.name}
              </h2>
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

              {repo.topics && repo.topics.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {repo.topics.slice(0, 4).map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
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
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{repo.stargazers_count}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Stars</span>
                </div>
                <div className="flex flex-col items-center">
                  <GitFork className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{repo.forks_count}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Forks</span>
                </div>
                <div className="flex flex-col items-center">
                  <Users className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{repo.contributors_count || "N/A"}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Contributors</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleVisualizationToggle(repo)}
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
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-800 text-white text-sm hover:bg-gray-900 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Repo
                  </a>
                  <button
                    onClick={() => onReadmeClick(repo.owner.login, repo.name)}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-600 text-white text-sm hover:bg-gray-700 transition"
                  >
                    <DocumentTextIcon className="h-4 w-4" />
                    README
                  </button>
                </div>

                {repo.homepage && (
                  <a
                    href={repo.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm hover:from-blue-600 hover:to-blue-700 transition"
                  >
                    <span className="text-lg">🚀</span>
                    Live Demo
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedRepo && (
        <VisualizationModal
          isOpen={isVisualizationOpen}
          onClose={() => {
            setIsVisualizationOpen(false);
            setSelectedRepo(null);
          }}
          repo={selectedRepo}
          octokit={octokit}
        />
      )}
    </>
  );
}

export default RepoList;
