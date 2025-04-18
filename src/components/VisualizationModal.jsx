import React from 'react';
import Modal from 'react-modal';
import { XMarkIcon } from "@heroicons/react/24/outline";
import RepoVisualizations from './RepoVisualizations';

Modal.setAppElement('#root');

const VisualizationModal = ({ isOpen, onClose, repo }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
      className="max-w-4xl w-11/12 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl outline-none"
      overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {repo?.name} - Repository Analytics
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <RepoVisualizations repo={repo} />
      </div>
    </Modal>
  );
};

export default VisualizationModal;