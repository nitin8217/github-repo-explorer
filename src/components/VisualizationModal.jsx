import React from 'react';
import Modal from 'react-modal';
import { XMarkIcon } from "@heroicons/react/24/outline";
import { motion } from 'framer-motion';
import TechStackSection from './visualization/TechStackSection';
import ImpactSection from './visualization/ImpactSection';
import ActivitySection from './visualization/ActivitySection';
import AnalyticsPanel from './AnalyticsPanel';

Modal.setAppElement('#root');

const VisualizationModal = ({ isOpen, onClose, repo, octokit }) => {
  if (!repo) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl focus:outline-none"
      overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-h-[85vh] overflow-y-auto"
      >
        <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {repo.name} - Analytics & Insights
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Analytics Panel */}
          <AnalyticsPanel repo={repo} octokit={octokit} />

          {/* Tech Stack Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Technology Stack
            </h3>
            <TechStackSection 
              languages={repo.languages}
              topics={repo.topics}
            />
          </div>

          {/* Impact Section */}
          <div className="space-y-6">
            
            <ImpactSection 
              stars={repo.stargazers_count}
              forks={repo.forks_count}
              watchers={repo.watchers_count}
              issues={repo.analytics?.openIssues}
              contributors={repo.analytics?.contributorCount}
            />
          </div>

          {/* Activity Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Repository Activity
            </h3>
            <ActivitySection 
              commitFrequency={repo.commits?.map(commit => 1)} // Fallback data
              participation={repo.participation} // Make sure this is being passed from API
              contributors={repo.contributors}
              recentCommits={repo.analytics?.recentCommits}
            />
          </div>
        </div>
      </motion.div>
    </Modal>
  );
};

export default VisualizationModal;