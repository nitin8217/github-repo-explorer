import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import RepoCard from './RepoCard';
import VisualizationModal from './VisualizationModal';
import { analyzeCodeQuality, generateDocSuggestions, getSimilarRepos } from '../utils/analytics';

export default function InfiniteRepoList({ 
  repos, 
  hasNextPage, 
  fetchNextPage, 
  isFetchingNextPage,
  loading,
  onReadmeClick,
  octokit 
}) {
  const [isVisualizationOpen, setIsVisualizationOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(null);

  const observerRef = useRef();
  const loadMoreRef = useRef();

  const handleVisualizationClick = async (repo) => {
    try {
      setIsVisualizationOpen(true);
      
      // Fetch participation stats specifically
      const [participation, commits, contributors] = await Promise.all([
        octokit.repos.getParticipationStats({
          owner: repo.owner.login,
          repo: repo.name
        }),
        octokit.repos.listCommits({
          owner: repo.owner.login,
          repo: repo.name,
          per_page: 100
        }),
        octokit.repos.listContributors({
          owner: repo.owner.login,
          repo: repo.name,
          per_page: 100
        })
      ]);

      setSelectedRepo({
        ...repo,
        participation: participation.data,
        commits: commits.data,
        contributors: contributors.data,
        analytics: {
          contributorCount: contributors.data.length,
          recentCommits: commits.data.length
        }
      });
    } catch (error) {
      console.error('Error fetching repo data:', error);
      setSelectedRepo(repo);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mt-8">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl h-64"
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-7xl mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repos.map((repo, index) => (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <RepoCard 
                repo={repo} 
                onReadmeClick={onReadmeClick} 
                onVisualizationClick={handleVisualizationClick} 
              />
            </motion.div>
          ))}
        </div>

        <div ref={loadMoreRef} className="h-20 flex items-center justify-center mt-8">
          {isFetchingNextPage && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
              <span className="text-gray-600 dark:text-gray-400">Loading more...</span>
            </div>
          )}
        </div>
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